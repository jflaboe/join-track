import requests
import json
from flask import Flask, request, make_response

app = Flask(__name__)

#how to run on localhost:3001
#python -m flask run -h 'localhost' -p 3001

def get_email_address(user_id, access_token):
    resp = requests.get("https://www.googleapis.com/gmail/v1/users/{}/profile".format(user_id), headers={"Authorization": "Bearer {}".format(access_token)})
    content = json.loads(resp.content)
    print(content)
    return content['emailAddress']
    

def verify_nu_email_address(user_email):
    return user_email.endswith("@u.northwestern.edu")

@app.route('/addtogroupme', methods = ['POST', 'OPTIONS'])
def post_js_gm():

    if request.method == 'OPTIONS':
        resp = make_response("Proceed", 200)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp

    print(json.loads(request.data))
    
    req_data = json.loads(request.data)
    #req_data is None for some reason...JSON stuff not being sent/received i guess
    try:
        user_id = req_data['userId']
        goog_access_token = req_data['googleAccessToken']
        gm_access_token = req_data['gmAccessToken']
    except:
        resp = make_response("The following fields are required: userId, googleAccessToken, gmAccessToken", 400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    
    
    email_address = get_email_address(user_id, goog_access_token)

    
    if not verify_nu_email_address(email_address):
        #return a 400 level error
        resp = make_response("A @northwestern.edu email address is required", 400)
        resp.headers['Access-Control-Allow-Origin'] = "*"
        return resp


    #get user info
    user_info = requests.get("https://api.groupme.com/v3/users/me?token={}".format(gm_access_token)).json()['response']
    #should prob check to make sure we get valid info
    print(user_info)
    user_name = user_info['name']
    gm_id = user_info['id']

    #add to the groupme
    add_obj = {
        "members": [
            {
                "nickname": user_name,
                "user_id": gm_id
            }
        ]
    }
    r2 = requests.post("https://api.groupme.com/v3/groups/60786308/members/add?token=81074000d5b4013710310a666913ee8d", data=add_obj)

    resp = make_response("Success", 200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


if __name__ == '__main__':
    app.run(host='localhost', port=3001)