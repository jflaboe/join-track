import sqlite3
from sqlite3 import Error
import json
import datetime

DATABASE_FILE = "jointrack.db"

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
            GM_ID TEXT NOT NULL,
            ADD_DATE INTEGER NOT NULL
        );"""
        c = self.conn.cursor()
        c.execute(query)
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
        result = self.conn.cursor().execute(query).fetchall()
        return [list(r) for r in result]

    #returns True if the user email belongs to an admin
    def is_admin(self, user_email):
        return False

    #adds an entry to user_added. Time is the unix timestamp in seconds
    def add_event(self, email_address, groupme_id):
        return


    def add_admin(self, email_address):
        return

    def remove_admin(self, email_address):
        return

    def list_admin(self):
        return []

    def list_blacklist(self):
        return []

    def add_to_blacklist(self, user_id, ban_type="email"):
        return

    def remove_from_blacklist(self, user_id):
        return

    def is_blacklisted(self, user_id, ban_type="email"):
        return False