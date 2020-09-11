import requests
import json
from gmail import get_email_address, verify_nu_email_address
from data_interface import *
from flask import Flask, request, make_response

app = Flask(__name__)

DATABASE = DataInterface(test=True)

@app.route('/verifyadmin', methods = ['POST', 'OPTIONS'])
def verifyAdmin():
    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    try:
        user_id = req_data['userId']
        goog_access_token = req_data['googleAccessToken']
    except:
        resp = make_response("The following fields are required: userId, googleAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    email_address = get_email_address(user_id, goog_access_token)
    is_admin = DATABASE.is_admin(email_address)
    print(is_admin)
    resp = make_response(json.dumps(is_admin), 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

##need to make flask endpoints for all the methods!
@app.route('/viewadmin', methods = ['GET'])
def viewAdmin():
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
        user_email = req_data['userEmail']
    except:
        resp = make_response("The following fields are required: userEmail", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    #first verify that the email is a valid nu email
    if not verify_nu_email_address(user_email):
        resp = make_response("Admins must have a @u.northwestern.edu email", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    DATABASE.add_admin(user_email)
    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/viewblacklist', methods = ['GET'])
def viewBlacklist():
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
        user_id = req_data['userID']
        id_type = req_data['idType']
    except:
        resp = make_response("The following fields are required: userID, idType", 400)
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
        user_id = req_data['userID']
    except:
        resp = make_response("The following fields are required: userID", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    DATABASE.remove_from_blacklist(user_id)
    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    app.run(host='localhost', port=3001)