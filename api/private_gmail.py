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
import boto3


APP_CREDENTIALS = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/gmail.compose']
CREDENTIALS_BUCKET = os.environ.get("JOINTRACK_CREDENTIALS_BUCKET")
CREDENTIALS_KEY = os.environ.get("JOINTRACK_CREDENTIALS_KEY")

s3 = boto3.client("s3")

def get_creds():
    try:
        resp = s3.get_object(Bucket=CREDENTIALS_BUCKET, Key=CREDENTIALS_KEY)
        if not 'Body' in resp:
            raise Exception("Object does not exist")
        creds = pickle.loads(resp['Body'].read())
    except Exception as e:
        return None

    if not creds.valid and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        set_creds(creds)

    return creds

def set_creds(creds):
    s3.put_object(
            Bucket=CREDENTIALS_BUCKET,
            Key=CREDENTIALS_KEY,
            Body=pickle.dumps(creds))

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
    creds = get_creds()

    # If there are no (valid) credentials available, let the user log in.
    print(creds)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                APP_CREDENTIALS, SCOPES)
            creds = flow.run_local_server(port=3030)
        # Save the credentials for the next run
        set_creds(creds)

    service = build('gmail', 'v1', credentials=creds)

    # Call the Gmail API
    
    my_address = "johnlaboe2020@u.northwestern.edu"
    email = create_message(my_address, "listserv@listserv.it.northwestern.edu", "", "ADD TRACK {} {} {}".format(user_email, user_first, user_last))
    print('hi')
    result = send_message(service, "me", email)
    print(result)
    return result


