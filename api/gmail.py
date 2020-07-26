import requests
import json
from flask import Flask, request

app = Flask(__name__)

#how to run on localhost:3001
#python -m flask run -h 'localhost' -p 3001

def get_email_address(user_id, access_token):
    resp = requests.get("https://www.googleapis.com/gmail/v1/users/{}/profile".format(user_id), headers={"Authorization": "Bearer {}"})
    return json.loads(resp.content)['emailAddress']

def verify_nu_email_address(user_email):
    return user_email.endswith("@u.northwestern.edu")

@app.route('/addtogroupme', methods = ['POST'])
def post_js_gm():
    req_data = request.get_json()
    #req_data is None for some reason...JSON stuff not being sent/received i guess
    user_id = req_data['userId']
    goog_access_token = req_data['googleAccessToken']
    gm_access_token = req_data['gmAccessToken']
    email_address = get_email_address(user_id, goog_access_token)

    if not verify_nu_email_address(email_address):
        #return a 400 level error
        return "idk" #idk what i'm supposed to return
    
    #get user info
    user_info = requests.get("https://api.groupme.com/v3/groups?token={}/users/me".format(gm_access_token)).json()
    #should prob check to make sure we get valid info
    user_name = user_info['name']
    gm_id = user_info[id]

    #add to the groupme
    add_obj = {
        "members": [
            {
                "nickname": user_name,
                "user_id": gm_id
            }
        ]
    }
    r2 = requests.post("https://api.groupme.com/v3/groups?token=81074000d5b4013710310a666913ee8d/groups/60786308/members/add", data=add_obj)

    return "idk"

    