import boto3
import json
import datetime

DYNAMO_TABLE = "jointrack-db"
TEST_SUFFIX = "-test"

dynamo = boto3.client("dynamodb", region_name="us-east-2")


def dynamo_to_dict(dynamo_response):
    def unmarshal(dynamo_map):
        result = {}
        for k, v in dynamo_map.items():
            if 'M' in v:
                result[k] = unmarshal(v['M'])
            elif 'S' in v:
                result[k] = v['S']
            elif 'N' in v:
                result[k] = int(v['N'])
            elif 'BOOL' in v:
                result[k] = v['BOOL']
            elif 'SS' in v:
                result[k] = list(v['SS'])
            elif 'L' in v:
                l = []
                print(v['L'])
                for item in v['L']:
                    l.append(item['S'])
                result[k]=l

        return result
    
    return unmarshal(dynamo_response['Item'])

class DataInterface:
    def __init__(self, test=False):
        self.is_test = test
        if test is True:
            self.db = DYNAMO_TABLE + TEST_SUFFIX
        else:
            self.db = DYNAMO_TABLE
        
    def list_events(self):
        resp = dynamo.get_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'events'
                }
            }
        )
        
        events = dynamo_to_dict(resp)
        print(events)
        for i in range(len(events['eventlist'])):
            events['eventlist'][i] = json.loads(events['eventlist'][i])
        return events['eventlist']

    #returns True if the user email belongs to an admin
    def is_admin(self, user_email):
        resp = dynamo.get_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'admins'
                }
            }
        )
        data = dynamo_to_dict(resp)
        if user_email in data['admins']:
            return True

        return False

    #adds an entry to user_added. Time is the unix timestamp in seconds
    def add_event(self, email_address, groupme_id):
        #uhh so i looked up a unix time converter and this seems to be
        #a few hours ahead? idk
        curr_time = datetime.datetime.utcnow().timestamp()

        event = {'email': email_address, 'gm_id': groupme_id, 'time': curr_time}
        #create request
        update_expression = "SET eventlist = list_append(eventlist, :e)"
        expression_attribute_values = {
            ":e": {
                "L": [
                    {"S": json.dumps(event)}
                ]
            }
        }
        dynamo.update_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'events'
                }
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values)


    def add_admin(self, email_address):
        update_expression = "ADD admins :a"
        expression_attribute_values = {
            ":a": {
                "SS": [email_address]
            }
        }
        dynamo.update_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'admins'
                }
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values)

    def remove_admin(self, email_address):
        update_expression = "DELETE admins :a"
        expression_attribute_values = {
            ":a": {
                "SS": [email_address]
            }
        }
        dynamo.update_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'admins'
                }
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values)


    def list_admin(self):
        resp = dynamo.get_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'admins'
                }
            }
        )
        data = dynamo_to_dict(resp)
        return data['admins']

    def list_blacklist(self):
        resp = dynamo.get_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'blacklist'
                }
            }
        )
        data = dynamo_to_dict(resp)
        return data['blacklist']

    def add_to_blacklist(self, user_id, ban_type="email"):
        update_expression = "ADD blacklist :a"
        expression_attribute_values = {
            ":a": {
                "SS": [user_id]
            }
        }
        dynamo.update_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'blacklist'
                }
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values)

    def remove_from_blacklist(self, user_id):
        update_expression = "DELETE blacklist :a"
        expression_attribute_values = {
            ":a": {
                "SS": [user_id]
            }
        }
        dynamo.update_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'blacklist'
                }
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values)

    def is_blacklisted(self, user_id, ban_type="email"):
        resp = dynamo.get_item(
            TableName=self.db,
            Key={
                'field': {
                    'S': 'blacklist'
                }
            }
        )
        data = dynamo_to_dict(resp)
        if user_id in data['blacklist']:
            return True

        return False

