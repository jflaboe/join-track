import unittest
from data_interface import *

class TestDataInterface(unittest.TestCase):
    
    def test_add_remove_admin(self):

        db = DataInterface(test=True)

        #admin actions
        admin1 = 'mikeluvin@u.northwestern.edu'
        admin2 = 'johnlaboe@u.northwestern.edu'
        admin3 = 'adamforrest@u.northwestern.edu'
        db.add_admin(admin1)
        self.assertTrue(admin1 in db.list_admin())
        self.assertFalse(admin2 in db.list_admin())
        self.assertFalse(admin3 in db.list_admin())

        db.add_admin(admin2)
        self.assertTrue(admin1 in db.list_admin())
        self.assertTrue(admin2 in db.list_admin())
        self.assertFalse(admin3 in db.list_admin())

        db.remove_admin(admin2)
        db.remove_admin(admin1)
        self.assertFalse(admin1 in db.list_admin())
        self.assertFalse(admin2 in db.list_admin())
        self.assertFalse(admin3 in db.list_admin())
        return

    def test_add_event(self):
        db = DataInterface(test=True)

        admin1 = 'mikeluvin@u.northwestern.edu'
        admin2 = 'johnlaboe@u.northwestern.edu'

        #add events
        db.add_event(admin1, 12345)
        db.add_event(admin2, 67890)
        print(db.list_events())
        return
    
    def test_blacklist_actions(self):
        db = DataInterface(test=True)

        #blacklist actions
        blist1 = 'mattschilling@u.northwestern.edu' 
        blist2 = 'ianwallace@u.northwestern.edu'
        blist3 = 'hi'

        admin1 = 'mikeluvin@u.northwestern.edu'

        db.add_to_blacklist(blist1)
        db.add_to_blacklist(blist2, "email")
        db.add_to_blacklist(blist3, 'other')
        print(db.list_blacklist())
        self.assertTrue(db.is_blacklisted(blist1))
        self.assertFalse(db.is_blacklisted(blist3))
        self.assertTrue(db.is_blacklisted(blist3, 'other'))
        self.assertFalse(db.is_blacklisted(admin1))
        self.assertTrue(db.is_blacklisted(blist2, "email"))

        #remove from blacklist
        db.remove_from_blacklist(blist2)
        self.assertFalse(db.is_blacklisted(blist2))
        db.remove_from_blacklist(blist3)
        self.assertFalse(db.is_blacklisted(blist3))
        db.remove_from_blacklist(admin1)
        self.assertFalse(db.is_blacklisted(admin1))
        return

unittest.main()
