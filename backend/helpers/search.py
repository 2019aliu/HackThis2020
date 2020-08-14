from datetime import datetime
from elasticsearch import Elasticsearch
import json

from db import db, subjects, topics, users

# cloud endpoint:
# https://05955f1348b44e3fb0a8f21277c0c9f7.us-east4.gcp.elastic-cloud.com:9243
cloudID = "HackThis_2020:dXMtZWFzdDQuZ2NwLmVsYXN0aWMtY2xvdWQuY29tJDA1OTU1ZjEzNDhiNDRlM2ZiMGE4ZjIxMjc3YzBjOWY3JGJlMzUyMzQ1M2FmZjRiYjliYzQ0N2Y4ZGI3MTc5ZWZh"
password = "HxgFov2WW6bCoJD8gwbglwuK"
es = Elasticsearch(cloud_id=cloudID, http_auth=('elastic',password))

index_subject = "subject"
index_topic = "topic"

def initializeIndexSubject():
    if (es.indices.exists(index=index_subject)):
        es.indices.delete(index=index_subject)

    es.indices.create(index=index_subject, body={"settings": {
        "analysis": {
        "analyzer": {
            "my_analyzer": {
            "tokenizer": "my_tokenizer"
            }
        },
        "tokenizer": {
            "my_tokenizer": {
            "type": "edge_ngram",
            "min_gram": 3,
            "max_gram": 20,
            "token_chars": [
                "letter"
            ]
            }
        }
        }
    }})

def populateSubjectTopic():
    es.indices.delete(index='*', ignore=[400, 404])
    # populate subjects
    subjectIDCount = 0
    for doc in subjects.find({}):
        convertedBody = {
            'title': doc['title']
        }
        es.index(index=index_subject, id=subjectIDCount, body=convertedBody, params={

        })
        subjectIDCount += 1
    
    # populate topics
    topicIDCount = 0
    for doc in topics.find({}):
        convertedBody = {
            'title': doc['title'],
            'subject': subjects.find_one({"_id": doc['subject_id']})["title"],
            'test': 'test',
            'objectid': str(doc['_id'])
        }
        es.index(index=index_topic, id=topicIDCount, body=convertedBody)
        topicIDCount += 1

def searchSubject(searchTerm):
    res = es.search(index=index_subject, body={"query": {
        "fuzzy": {
            "title": {
                "value": searchTerm,
                "fuzziness": "AUTO",
                "transpositions": True,
                "max_expansions": 50
            }
        }
    }})

    resultList = []
    for entry in res['hits']['hits']:
        resultList.append(entry['_source']['title'])
    
    return resultList


def searchTopic(searchTerm):
    search_arr = []
    # req_head
    search_arr.append({'index': index_topic})
    # req_body
    search_arr.append({"query": {
        "fuzzy": {
            "title": {
                "value": searchTerm,
                "fuzziness": "AUTO",
                "transpositions": True,
                "max_expansions": 50
            }
        }
    }})

    # req_head
    search_arr.append({'index': index_topic})
    # req_body
    # search_arr.append({"query": {"match_all" : {}}});
    search_arr.append({"query": {
        "fuzzy": {
            "subject": {
                "value": searchTerm,
                "fuzziness": "AUTO",
                "transpositions": True,
                "max_expansions": 50
            }
        }
    }})

    request = ''
    for each in search_arr:
        request += '%s \n' %json.dumps(each)

    # as you can see, you just need to feed the <body> parameter,
    # and don't need to specify the <index> and <doc_type> as usual 
    res = es.msearch(body = request)

    resultList = {}

    for queryResult in res['responses']:
        for entry in queryResult['hits']['hits']:
            resultList[entry['_source']['objectid']] = {
                'topic': entry['_source']['title'],
                'subject': entry['_source']['subject']
            }
            
    return resultList

# initializeIndexSubject()
# populateSubjectTopic()
# print(searchTopic("physics"))
