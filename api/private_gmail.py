from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import base64
from email.mime.audio import MIMEAudio
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import mimetypes
import os
from google.auth.credentials import Credentials
import json


APP_CREDENTIALS = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/gmail.compose']

def set_credentials(token, refresh_token, id_token):
    config = json.load(APP_CREDENTIALS)
    creds = Credentials(
        token,
        id_token=id_token,
        refresh_token=refresh_token,
        token_uri=config['web']["token_uri"],
        client_secret=config['web']['client_secret'],
        client_id=config['web']['client_id'],
        scopes=SCOPES
    )

    with open('token.pickle', 'wb') as tokenfile:
        pickle.dump(creds, tokenfile)

def refresh_credentials():
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    creds.refresh(Request())
    with open('token.pickle', 'wb') as tokenfile:
        pickle.dump(creds, tokenfile)


def create_message(sender, to, subject, message_text):
    """Create a message for an email.

    Args:
    sender: Email address of the sender.
    to: Email address of the receiver.
    subject: The subject of the email message.
    message_text: The text of the email message.

    Returns:
    An object containing a base64url encoded email object.
    """
    print('ok')
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    
    return {'raw': base64.urlsafe_b64encode(message.as_string().encode()).decode()}

def send_message(service, user_id, message):
    """Send an email message.

    Args:
        service: Authorized Gmail API service instance.
        user_id: User's email address. The special value "me"
        can be used to indicate the authenticated user.
        message: Message to be sent.

    Returns:
        Sent Message.
    """
    try:
        message = (service.users().messages().send(userId=user_id, body=message)
                .execute())
        print('Message Id: %s' % message['id'])
        return message
    except Exception as error:
        print('An error occurred: %s' % error)
        return None

# If modifying these scopes, delete the file token.pickle.


def send_email(user_email, user_first, user_last):
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    print(creds)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=3030)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('gmail', 'v1', credentials=creds)

    # Call the Gmail API
    
    my_address = "johnlaboe2020@u.northwestern.edu"
    email = create_message(my_address, "listserv@listserv.it.northwestern.edu", "", "ADD TRACK {} {} {}".format(user_email, user_first, user_last))
    print('hi')
    result = send_message(service, "me", email)
    return result


