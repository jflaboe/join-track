import sqlite3
from sqlite3 import Error
import json
import datetime

DATABASE_FILE = "jointrack.db"

class DataInterface:
    def __init__(self, test=False):
        self.is_connected = False
        if test is True:
            self.db = ":memory:"
        else:
            self.db = DATABASE_FILE
        try:
            #connects to the database
            #had to add the check_same_thread to get this to work
            self.conn = sqlite3.connect(self.db, check_same_thread=False)
            self.is_connected = True
            self.create_db()
        except Exception as e:
            print(e)

    
    def create_db(self):
        query = """CREATE TABLE IF NOT EXISTS user_added (
            EMAIL TEXT NOT NULL,
            GM_ID TEXT NOT NULL,
            ADD_DATE INTEGER NOT NULL
        );"""
        c = self.conn.cursor()
        c.execute(query)
        #commits the changes to the database
        self.conn.commit()
        
        query = """CREATE TABLE IF NOT EXISTS admin (
            EMAIL TEXT NOT NULL
        );"""
        c = self.conn.cursor()
        c.execute(query)
        self.conn.commit()

        query = """CREATE TABLE IF NOT EXISTS blacklist (
            ID TEXT NOT NULL,
            ID_TYPE TEXT NOT NULL
        );"""
        c = self.conn.cursor()
        c.execute(query)
        self.conn.commit()

    def list_events(self):
        query = """SELECT * FROM user_added;"""
        #fetchall returns a list of tuples
        result = self.conn.cursor().execute(query).fetchall()
        return [list(r) for r in result]

    #returns True if the user email belongs to an admin
    def is_admin(self, user_email):
        query = """SELECT * FROM admin
            WHERE EMAIL = :email;"""
        #the cursor() allows us to invoke methods that execute SQLite statements
        #.fetchone() should return None if the email is not found.
        result = self.conn.cursor().execute(query, {'email': user_email}).fetchone()
        ##
        #****for testing purposes i put my email, have to remember to remove this
        ##
        return result is not None or user_email == "michaelluvin2022@u.northwestern.edu"

    #adds an entry to user_added. Time is the unix timestamp in seconds
    def add_event(self, email_address, groupme_id):
        #uhh so i looked up a unix time converter and this seems to be
        #a few hours ahead? idk
        curr_time = datetime.datetime.utcnow().timestamp()
        query = """INSERT INTO user_added (EMAIL, GM_ID, ADD_DATE)
            VALUES (:email, :gm_id, :time);"""
        c = self.conn.cursor()
        c.execute(query, {'email': email_address, 'gm_id': groupme_id, 'time': curr_time})
        self.conn.commit()
        return

    def add_admin(self, email_address):
        with self.conn: #within the context manager, so don't need to commit afterwards
            query = """INSERT INTO admin VALUES (:email);"""
            c = self.conn.cursor()
            c.execute(query, {'email': email_address})
            #self.conn.commit()
        return

    def remove_admin(self, email_address):
        with self.conn:
            query = """DELETE FROM admin WHERE EMAIL = :email;"""
            c = self.conn.cursor()
            c.execute(query, {'email': email_address})
        return

    def list_admin(self):
        query = """SELECT * FROM admin;"""
        result = self.conn.cursor().execute(query).fetchall()
        #fetcall returns a list of tuples. convert them to lists, then
        ##make it into a regular list since there's only one field (email)
        return [list(r)[0] for r in result]

    def list_blacklist(self):
        query = """SELECT * FROM blacklist;"""
        result = self.conn.cursor().execute(query).fetchall()
        return [list(r) for r in result]

    def add_to_blacklist(self, user_id, ban_type="email"):
        with self.conn: #within the context manager, so don't need to commit afterwards
            query = """INSERT INTO blacklist (ID, ID_TYPE) 
                VALUES (:id, :id_type);"""
            c = self.conn.cursor()
            c.execute(query, {'id': user_id, 'id_type': ban_type})
        return

    def remove_from_blacklist(self, user_id):
        with self.conn:
            query = """DELETE FROM blacklist WHERE ID = :id;"""
            c = self.conn.cursor()
            c.execute(query, {'id': user_id})
        return

    def is_blacklisted(self, user_id, ban_type="email"):
        query = """SELECT * FROM blacklist WHERE ID = :id AND ID_TYPE = :id_type;"""
        result = self.conn.cursor().execute(query, {'id': user_id, 'id_type': ban_type}).fetchone()
        return result is not None

