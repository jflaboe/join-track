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

    def test_add_event

unittest.main()

#add events
"""
testing.add_event(admin1, 12345)
testing.add_event(admin2, 67890)
print(testing.list_events())

#blacklist actions
blist1 = 'mattschilling@u.northwestern.edu' 
blist2 = 'ianwallace@u.northwestern.edu'
blist3 = 'hi'
testing.add_to_blacklist(blist1)
testing.add_to_blacklist(blist2)
testing.add_to_blacklist(blist3, 'other')
print(testing.list_blacklist())
print(testing.is_blacklisted(blist1))
print(testing.is_blacklisted(blist3))
print(testing.is_blacklisted(blist3, 'other'))
print(testing.is_blacklisted(admin1))
testing.remove_from_blacklist(blist2)
testing.remove_from_blacklist(blist3)
testing.remove_from_blacklist(admin1)
print(testing.list_blacklist())"""