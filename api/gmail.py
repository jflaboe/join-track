import requests
import json
from flask import Flask, request, make_response
import private_gmail
from data_interface import *

app = Flask(__name__)

DATABASE = DataInterface()

def get_email_address(access_token):
    resp = requests.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", headers={"Authorization": "Bearer {}".format(access_token)})
    content = json.loads(resp.content)
    print(content)
    return content['email']
    

def verify_nu_email_address(user_email):
    return user_email.endswith("@u.northwestern.edu")


@app.route('/addtolistserv', methods = ['POST', 'OPTIONS'])
def add_to_listserv():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp
    print(json.loads(request.data))
    req_data = json.loads(request.data)

    
    

    try:
        access_token = req_data['access_token']
        first = req_data['first']
        last = req_data['last']

        email = get_email_address(access_token)
        if verify_nu_email_address(email) is False:
            raise Exception("Not a northwestern email")

        if DATABASE.is_blacklisted(email):
            resp = make_response("You are not authorized to use this page due to past behavior", 403)
            resp.headers['Access-Control-Allow-Origin'] = "*"
            return resp

        result = private_gmail.send_email(email, first, last)
        if result is None:
            raise Exception('failed to send message')

        resp = make_response("Email success", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp
    
    except Exception as e:
        print(e)
        resp = make_response("Auth failed", 404)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp



@app.route('/addtogroupme', methods = ['POST', 'OPTIONS'])
def add_to_gm():

    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    #req_data is None for some reason...JSON stuff not being sent/received i guess
    try:
        goog_access_token = req_data['googleAccessToken']
        gm_access_token = req_data['gmAccessToken']
    except:
        resp = make_response("The following fields are required: googleAccessToken, gmAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    email_address = get_email_address(goog_access_token)
    if not verify_nu_email_address(email_address):
        #return a 400 level error
        resp = make_response("A @u.northwestern.edu email address is required", 400)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp


    #get user info
    user_info = requests.get("https://api.groupme.com/v3/users/me?token={}".format(gm_access_token)).json()['response']
    #should prob check to make sure we get valid info
    print(user_info)
    user_name = user_info['name']
    gm_id = user_info['id']

    if DATABASE.is_blacklisted(email_address) or DATABASE.is_blacklisted(gm_id):
        resp = make_response("You are not authorized to use this page due to past behavior", 403)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    #add to the groupme
    add_obj = {
        "members": [
            {
                "nickname": user_name,
                "user_id": gm_id
            }
        ]
    }
    r2 = requests.post("https://api.groupme.com/v3/groups/60786308/members/add?token=81074000d5b4013710310a666913ee8d", data=json.dumps(add_obj))

    print(r2)
    print(r2.content)

    DATABASE.add_event(email_address, gm_id)
    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/verifyadmin', methods = ['POST', 'OPTIONS'])
def verifyAdmin():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        goog__token = req_data['googleAccessToken']
    except:
        resp = make_response("The following fields are required: googleAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    email_address = get_email_address(goog__token)
    is_admin = DATABASE.is_admin(email_address)
    print(is_admin)
    resp = make_response(json.dumps(is_admin), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

##below are all admin actions
@app.route('/viewadmin', methods = ['POST', 'OPTIONS'])
def viewAdmin():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        goog_token = req_data['googleAccessToken']
    except:
        resp = make_response("The following fields are required: googleAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        resp = make_response("You are not authorized to perform this action", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    admin = DATABASE.list_admin()
    resp = make_response(json.dumps(admin), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/addadmin', methods = ['POST', 'OPTIONS'])
def addAdmin():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        goog_token = req_data['googleAccessToken']
        user_email = req_data['userEmail']
    except:
        resp = make_response("The following fields are required: googleAccessToken, userEmail", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    #first verify that the email is a valid nu email
    if not verify_nu_email_address(user_email):
        resp = make_response("Admins must have a @u.northwestern.edu email", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        resp = make_response("You are not authorized to perform this action", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    DATABASE.add_admin(user_email)
    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/viewblacklist', methods = ['POST', 'OPTIONS'])
def viewBlacklist():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        goog_token = req_data['googleAccessToken']
    except:
        resp = make_response("The following fields are required: googleAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        resp = make_response("You are not authorized to perform this action", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    blacklist = DATABASE.list_blacklist()
    resp = make_response(json.dumps(blacklist), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/addtoblacklist', methods = ['POST', 'OPTIONS'])
def addToBlacklist():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        goog_token = req_data['googleAccessToken']
        user_id = req_data['userID']
        id_type = req_data['idType']
    except:
        resp = make_response("The following fields are required: googleAccessToken, userID, idType", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        resp = make_response("You are not authorized to perform this action", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    DATABASE.add_to_blacklist(user_id, id_type)
    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/remfromblacklist', methods = ['POST', 'OPTIONS'])
def remFromBlacklist():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        goog_token = req_data['googleAccessToken']
        user_id = req_data['userID']
    except:
        resp = make_response("The following fields are required: googleAccessToken, userID", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        resp = make_response("You are not authorized to perform this action", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    DATABASE.remove_from_blacklist(user_id)
    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/listevents', methods = ['POST', 'OPTIONS'])
def listEvents():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp
    
    print(json.loads(request.data))
    req_data = json.loads(request.data)
    try:
        goog_token = req_data['googleAccessToken']
    except:
        resp = make_response("The following fields are required: googleAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    admin_email = get_email_address(goog_token)
    if DATABASE.is_admin(admin_email) is False:
        resp = make_response("You are not authorized to perform this action", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    events = DATABASE.list_events()
    resp = make_response(json.dumps(events), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


if __name__ == '__main__':
    app.run(host='localhost', port=3001)