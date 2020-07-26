import sqlite3
from sqlite3 import Error
import json
import datetime

DATABASE_FILE = "se_points.db"

class DataInterface:
    def __init__(self):
        self.is_connected = False
        try:
            self.conn = sqlite3.connect(DATABASE_FILE)
            self.is_connected = True
            self.create_db()
        except Exception as e:
            print(e)

    
    def create_db(self):
        query = """CREATE TABLE IF NOT EXISTS user_added (
            EMAIL TEXT NOT NULL,
            GM_ID TEXT NOT NULL
        );"""
        c = self.conn.cursor()
        c.execute(query)
        self.conn.commit()
        
        query = """CREATE TABLE IF NOT EXISTS points_now (
            USERNAME TEXT NOT NULL,
            XPOINTS INTEGER NOT NULL
        );"""
        c = self.conn.cursor()
        c.execute(query)
        self.conn.commit()

        query = """CREATE UNIQUE INDEX usernames ON points_now (USERNAME);"""
        c = self.conn.cursor()
        c.execute(query)
        self.conn.commit()

    def get_most_recent(self, before=None):
        max_date = self.get_max_date(before=before)
        query = """SELECT * FROM points_on_date
        WHERE SNAPSHOT_DATE = (SELECT MAX(SNAPSHOT_DATE) FROM points_on_date WHERE SNAPSHOT_DATE <= {});
        """.format(max_date)
        return self.conn.cursor().execute(query).fetchall()
    
    def get_time_series(self, before=None, after=None):
        max_date = self.get_max_date(before=before)
        min_date = self.get_min_date(after=after)
        query = """SELECT USERNAME, POINTS, SNAPSHOT_DATE
        FROM points_on_date
        WHERE SNAPSHOT_DATE >= {} AND SNAPSHOT_DATE <= {}
        ORDER BY USERNAME, SNAPSHOT_DATE ASC;
        """.format(min_date, max_date)

        data = self.conn.cursor().execute(query).fetchall()
        out = {}
        current = None
        i = 0
        while i < len(data):
            if not current == data[i][0]:
                current = data[i][0]
                out[current] = []
            
            out[current].append([data[i][2], data[i][1]])
            i += 1
        
        return out

    def get_date_events(self):
        out = self.conn.cursor().execute("SELECT DISTINCT SNAPSHOT_DATE, EVENT FROM points_on_date ORDER BY SNAPSHOT_DATE DESC").fetchall()
        return [list(a) for a in out]
    def get_snapshot_dates(self):
        out = self.conn.cursor().execute("SELECT DISTINCT SNAPSHOT_DATE FROM points_on_date ORDER BY SNAPSHOT_DATE DESC").fetchall()
        return [data[0] for data in out]

    def get_min_date(self, after=None):
        q_string = "SELECT MIN(SNAPSHOT_DATE) FROM points_on_date"
        if not after is None:
            q_string += " WHERE SNAPSHOT_DATE >= " + str(after)
        return self.conn.cursor().execute(q_string + ";").fetchone()[0]

    def get_max_date(self, before=None):
        q_string = "SELECT MAX(SNAPSHOT_DATE) FROM points_on_date"
        if not before is None:
            q_string += " WHERE SNAPSHOT_DATE <= " + str(before)
        return self.conn.cursor().execute(q_string + ";").fetchone()[0]

    def get_points_diff(self, after=None, before=None):
        max_date = self.get_max_date(before=before)
        min_date = self.get_min_date(after=after)
        query = """SELECT a.USERNAME, IFNULL(a.POINTS - b.POINTS, a.POINTS) as DIFF, IFNULL(b.SNAPSHOT_DATE, {}), a.SNAPSHOT_DATE 
        FROM (SELECT * FROM points_on_date WHERE SNAPSHOT_DATE = {}) a
        LEFT JOIN (SELECT * FROM points_on_date WHERE SNAPSHOT_DATE = {}) b ON a.USERNAME = b.USERNAME
        ORDER BY b.POINTS - a.POINTS;
        """.format(min_date, max_date, min_date)

        return [list(a) for a in self.conn.cursor().execute(query).fetchall()]

    def get_stream_dates(self, after=None, before=None):
        max_date = self.get_max_date(before=before)
        min_date = self.get_min_date(after=after)
        query = """
        SELECT DISTINCT(SNAPSHOT_DATE)
        FROM points_on_date
        WHERE SNAPSHOT_DATE >= {} AND SNAPSHOT_DATE <= {} AND EVENT = 'stream_start';
        """.format(min_date, max_date)
        start_dates = [a[0] for a in self.conn.cursor().execute(query).fetchall()]
        
        if len(start_dates) == 0:
            return []
        min_date = start_dates[0] + 1
        query = """
        SELECT DISTINCT(SNAPSHOT_DATE)
        FROM points_on_date
        WHERE SNAPSHOT_DATE >= {} AND SNAPSHOT_DATE <= {} AND EVENT = 'stream_end';
        """.format(min_date, max_date)
        end_dates = [a[0] for a in self.conn.cursor().execute(query).fetchall()]
        
        return [[start_dates[i], end_dates[i]] for i in range(len(end_dates))]
    
    def update_event_type(self, t, e):
        query = """
        UPDATE points_on_date
        SET EVENT = '{}'
        WHERE SNAPSHOT_DATE = {};
        """.format(e, t)
        self.conn.cursor().execute(query)
        self.conn.commit()
    def get_points_since(self, after=None):
        if after == None:
            after = self.get_min_date()
        
        scraped = 0
        t = int(datetime.datetime.now(datetime.timezone.utc).timestamp())

        while scraped % 1000 == 0:
            
            data = json.loads(requests.get(API_URL + "&offset=" + str(scraped)).content)
            scraped += len(data['users'])
            
            if scraped == 0:
                return
            data_chunks = [data['users'][i*500: min(i*500 + 500, len(data['users']))] for i in range(int((len(data['users']) - 1) / 500) + 1)]
            
            for data_chunk in data_chunks:
                data_values = ",".join(["(" + ",".join(['"' + user_data['username'] + '"', str(user_data['points'])])+")" for user_data in data_chunk])
                query = "REPLACE INTO points_now (USERNAME,XPOINTS) VALUES " + data_values + ";"
                c = self.conn.cursor()
                c.execute(query)
            self.conn.commit()
        query = """
        SELECT USERNAME, POINTS as POINTS
        FROM points_on_date
        WHERE SNAPSHOT_DATE = {}
        """.format(after)
        
        query = """
        SELECT c.USERNAME, IFNULL(c.XPOINTS - a.POINTS, c.XPOINTS)
        FROM points_now c 
        LEFT JOIN (
            SELECT a.USERNAME, a.POINTS as POINTS
            FROM points_on_date a, (
                SELECT MIN(SNAPSHOT_DATE) as SNAPSHOT_DATE
                FROM points_on_date
                WHERE SNAPSHOT_DATE >= {}
            ) b
            WHERE a.SNAPSHOT_DATE = b.SNAPSHOT_DATE
        ) a on c.USERNAME = a.USERNAME
        ORDER BY IFNULL(c.XPOINTS - a.POINTS, c.XPOINTS) DESC
        """.format(after)
        

        return [list(a) for a in self.conn.cursor().execute(query).fetchall()]
        
    def get_recent_stream_start(self):
        scraped = 0
        t = int(datetime.datetime.now(datetime.timezone.utc).timestamp())

        while scraped % 1000 == 0:
            
            data = json.loads(requests.get(API_URL + "&offset=" + str(scraped)).content)
            scraped += len(data['users'])
            
            if scraped == 0:
                return
            data_chunks = [data['users'][i*500: min(i*500 + 500, len(data['users']))] for i in range(int((len(data['users']) - 1) / 500) + 1)]
            
            for data_chunk in data_chunks:
                data_values = ",".join(["(" + ",".join(['"' + user_data['username'] + '"', str(user_data['points'])])+")" for user_data in data_chunk])
                query = "REPLACE INTO points_now (USERNAME,XPOINTS) VALUES " + data_values + ";"
                c = self.conn.cursor()
                c.execute(query)
            self.conn.commit()
        query = """
        SELECT c.USERNAME, IFNULL(c.XPOINTS - a.POINTS, c.XPOINTS)
        FROM points_now c 
        LEFT JOIN (
            SELECT alpha.USERNAME, alpha.POINTS as POINTS
            FROM points_on_date alpha, (
                SELECT MAX(SNAPSHOT_DATE) as SNAPSHOT_DATE
                FROM points_on_date
                WHERE EVENT = 'stream_start'
            ) b
            WHERE alpha.SNAPSHOT_DATE = b.SNAPSHOT_DATE
        ) a on c.USERNAME = a.USERNAME
        ORDER BY IFNULL(c.XPOINTS - a.POINTS, c.XPOINTS) DESC
        """
        
        return [list(a) for a in self.conn.cursor().execute(query).fetchall()]