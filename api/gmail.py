import requests
import json

def get_email_address(user_id, access_token):
    resp = requests.get("https://www.googleapis.com/gmail/v1/users/{}/profile".format(user_id), headers={Authorization: "Bearer ".format(access_token)})
    return json.loads(resp.content)['emailAddress']