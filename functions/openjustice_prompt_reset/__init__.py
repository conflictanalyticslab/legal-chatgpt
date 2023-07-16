import datetime
import logging

import azure.functions as func

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials


    # [START firestore_setup_dataset_read]
def main(mytimer: func.TimerRequest) -> None:
    utc_timestamp = datetime.datetime.utcnow().replace(
        tzinfo=datetime.timezone.utc).isoformat()

    if mytimer.past_due:
        logging.info('The timer is past due!')

        cred = credentials.Certificate("./legal-gpt-firebase-adminsdk-yjo2f-4ea23414b3.json")
        app = firebase_admin.initialize_app(cred)

        db = firestore.Client()
        
        users_ref = db.collection("users")
        docs = users_ref.stream()

        for doc in docs:
            allowed = doc.to_dict()['prompts_allowed']
            doc.update({'prompts_left': allowed})
            print(f"{doc.id} => {doc.to_dict()}")

    logging.info('Python timer trigger function ran at %s', utc_timestamp)
