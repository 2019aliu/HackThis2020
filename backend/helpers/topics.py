#!/usr/bin/env python
from flask_pymongo import pymongo
from bson.json_util import loads, dumps

import db

def create_topic(title, subject_name):
    print("Topic: %s, Subject: %s" % (title, subject_name))
    subject = db.db.subjects.find_one({"title":subject_name})
    # only get one subject
    id = subject['_id']

    # for record in subject:
    #     id = record['_id']
    return db.db.topics.insert_one({"title":title, "subject_id":id})

def delete_topic(id):
    return db.db.subjects.delete_one({"_id":id})
