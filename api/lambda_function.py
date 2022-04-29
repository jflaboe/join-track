import requests
import json
from . import private_gmail
from . import data_interface

DATABASE = data_interface.DataInterface()


def lambda_handler(event, context):
    result = {}
    print(event)
    if is_options_request(event):
        result = {
            "code": 200
        }
    elif is_post_request(event):
        path = get_path(event)
        data = get_request_data(event)

        try:
            result = PATH_TO_ACTION_MAP[path](data)
        except Exception as e:
            print(e)
            result = {
                "code": 500,
                "body": "Invalid Path"
            }
    print(result)
    print(result_with_headers(result))
    return result_with_headers(result)
        
#addtolistserv POST,OPTIONS
def add_to_listserv(req_data):
    try:
        access_token = req_data['access_token']
        first = req_data['first']
        last = req_data['last']

        email = get_email_address(access_token)
        if verify_nu_email_address(email) is False:
            raise Exception("Not a northwestern email")

        if DATABASE.is_blacklisted(email):
            return {
                "code": 403,
                "body": "You are not authorized to use this page due to past behavior"
            }

        result = private_gmail.send_email(email, first, last)
        if result is None:
            print("hello")
            raise Exception('failed to send message')
        print("RETURN")
        return {
            "code": 200,
            "body": "Email success"
        }
    
    except Exception as e:
        print(e)
        return {
            "code": 404,
            "body": "Auth failed"
        }

#addtogroupme POST, OPTIONS
def add_to_gm(req_data):
    #req_data is None for some reason...JSON stuff not being sent/received i guess
    try:
        goog_access_token = req_data['googleAccessToken']
        gm_access_token = req_data['gmAccessToken']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken, gmAccessToken"
        }

    email_address = get_email_address(goog_access_token)
    if not verify_nu_email_address(email_address):
        return {
            "code": 400,
            "body": "A @u.northwestern.edu email address is required"
        }


    #get user info
    user_info = requests.get("https://api.groupme.com/v3/users/me?token={}".format(gm_access_token)).json()['response']
    #should prob check to make sure we get valid info
    user_name = user_info['name']
    gm_id = user_info['id']
    email = user_info['email']

    if DATABASE.is_blacklisted(email_address) or DATABASE.is_blacklisted(gm_id):
        return {
            "code": 403,
            "body": "You are not authorized to use this page due to past behavior"
        }

    #add to the groupme
    add_obj = {
        "members": [
            {
                "nickname": user_name,
                "email": email
            }
        ]
    }
    r2 = requests.post("https://api.groupme.com/v3/groups/60786308/members/add?token=81074000d5b4013710310a666913ee8d", data=json.dumps(add_obj))

    print(r2)
    print(r2.content)

    DATABASE.add_event(email_address, gm_id)
    return {
            "code": 200,
            "body": "Success"
        }

#verifyadmin POST,OPTIONS
def verify_admin(req_data):
    try:
        goog__token = req_data['googleAccessToken']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken"
        }

    email_address = get_email_address(goog__token)
    is_admin = DATABASE.is_admin(email_address)

    return {
            "code": 200,
            "body": json.dumps(is_admin)
        }

##below are all admin actions
#viewadmin POST,OPTIONS
def view_admin(req_data):
    try:
        goog__token = req_data['googleAccessToken']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken"
        }

    admin_email = get_email_address(goog__token)
    if DATABASE.is_admin(admin_email) is False:
        return {
            "code": 400,
            "body": "You are not authorized to perform this action"
        }

    admin = DATABASE.list_admin()
    return {
            "code": 200,
            "body": json.dumps(admin)
        }

#addadmin POST,OPTIONS
def add_admin(req_data):
    try:
        goog_token = req_data['googleAccessToken']
        user_email = req_data['userEmail']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken, userEmail"
        }

    #first verify that the email is a valid nu email
    if not verify_nu_email_address(user_email):
        return {
            "code": 400,
            "body": "Admins must have a @u.northwestern.edu email"
        }

    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        return {
            "code": 400,
            "body": "You are not authorized to perform this action"
        }
    
    DATABASE.add_admin(user_email)
    return {
        "code": 200,
        "body": "Success"
    }

#viewblacklist POST, OPTIONS
def view_blacklist(req_data):
    try:
        goog_token = req_data['googleAccessToken']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken"
        }
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        return {
            "code": 400,
            "body": "You are not authorized to perform this action"
        }

    blacklist = DATABASE.list_blacklist()
    return {
            "code": 200,
            "body": json.dumps(blacklist)
        }

#addtoblacklist POST,OPTIONS
def add_to_blacklist(req_data):
    try:
        goog_token = req_data['googleAccessToken']
        user_id = req_data['userID']
        id_type = req_data['idType']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken, userID, idType"
        }

    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        return {
            "code": 400,
            "body": "You are not authorized to perform this action"
        }

    DATABASE.add_to_blacklist(user_id, id_type)
    return {
            "code": 200,
            "body": "Success"
        }

#remfromblacklist POST,OPTIONS
def rem_from_blacklist(req_data):
    try:
        goog_token = req_data['googleAccessToken']
        user_id = req_data['userID']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken, userId"
        }
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        return {
            "code": 400,
            "body": "You are not authorized to perform this action"
        }
    
    DATABASE.remove_from_blacklist(user_id)
    return {
            "code": 200,
            "body": "Success"
        }

#listevents POST,OPTIONS
def list_events(req_data):
    try:
        goog_token = req_data['googleAccessToken']
    except:
        return {
            "code": 400,
            "body": "The following fields are required: googleAccessToken, userEmail"
        }
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        return {
            "code": 400,
            "body": "You are not authorized to perform this action"
        }
    
    events = DATABASE.list_events()
    return {
            "code": 200,
            "body": json.dumps(events)
        }

def get_email_address(access_token):
    resp = requests.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", headers={"Authorization": "Bearer {}".format(access_token)})
    content = json.loads(resp.content)
    print(content)
    return content['email']
    
def verify_nu_email_address(user_email):
    return user_email.endswith("@u.northwestern.edu")

def is_post_request(event):
    return event['requestContext']['http']['method'] == "POST"

def is_options_request(event):
    return event['requestContext']['http']['method'] == "OPTIONS"

def get_request_data(event):
    return json.loads(event['body'])

def get_path(event):
    return event['requestContext']['http']['path'][1:]

def result_with_headers(result):
    result["headers"] = {
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*"
    }
    return result

PATH_TO_ACTION_MAP = {
    "addtolistserv": add_to_listserv,
    "addtogroupme": add_to_gm,
    "verifyadmin": verify_admin,
    "viewadmin": view_admin,
    "addadmin": add_admin,
    "viewblacklist": view_blacklist,
    "addtoblacklist": add_to_blacklist,
    "remfromblacklist": rem_from_blacklist,
    "listevents": list_events
}