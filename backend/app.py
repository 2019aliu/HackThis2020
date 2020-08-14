#!/usr/bin/env python
from threading import Lock
from flask import Flask, render_template, session, request, \
    copy_current_request_context, redirect, g, url_for, Response, make_response, request, jsonify
import requests
from flask_session import Session
from functools import wraps
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
from flask_pymongo import pymongo
from flask_cors import CORS, cross_origin
from flask_mail import Mail, Message

from bson.json_util import loads, dumps, ObjectId
import uuid
import os, sys, time

from form_setup import *
sys.path.append(os.path.abspath('./helpers'))
# Local Imports
import auth
import db
import search
import topics
index_subject = "subject"
index_topic = "topic"
import linkScraper
import wikipediaSummary

# # Set this variable to "threading", "eventlet" or "gevent" to test the
# # different async modes, or leave it set to None for the application to choose
# # the best option based on installed packages.
# async_mode = None

# Create the app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)
# app.config.update(
#     SESSION_COOKIE_SAMESITE='Lax',
# )
app.debug = True  # debugger mode
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

socketio = SocketIO(app, cors_allowed_origins="*")
thread = None
thread_lock = Lock()

# Mailing
app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'hackthiswinningteam@gmail.com'
app.config['MAIL_DEFAULT_SENDER'] = 'hackthiswinningteam@gmail.com'
app.config['MAIL_PASSWORD'] = 'a1secret'
mail = Mail(app)

def _proxy(*args, **kwargs):
    resp = requests.request(
        method=request.method,
        url=request.url.replace(request.host_url, 'localhost:3000'),
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False)

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    response = Response(resp.content, resp.status_code, headers)
    return response

# Home Page or smth for redirects
@app.route('/')
def index():
    return app.send_static_file('index.html')

# Home Page or smth for redirects
@app.route('/dashboard', methods = ["GET", "POST"])
def dashboard():
    # Temp set to index.html. Change to home.html once homepage made
    return "Pretend this is the dashboard lol. You should only see this when logged in."

@app.route('/login', methods=["POST"])
# @cross_origin(supports_credentials=True)
def login():
    req = request.get_json()
    print('Login request JSON: %s' % req)
    username = req['username'].lower()
    password = req['password']
    info = auth.login(username, password)
    if(info[0] == "I"):
        return jsonify({'response': info })
    interest_string = ""
    for subject in loads(info)["interests"]:
        interest_string += subject + ","
        print(subject)
    print(interest_string)
    res = make_response(jsonify({"result":"DONE"}))
    res.set_cookie("username", value=str(username), max_age=None)
    res.set_cookie("interests", value=str(interest_string), max_age=None)
    return res

@app.route('/logout', methods = ["GET"])
def logout():
    res = make_response(jsonify({ 'response': 'DONE' }))
    res.set_cookie("username", '', max_age=0)
    res.set_cookie("interests", '', max_age=0)
    res.set_cookie("room_id", '', max_age=0)
    return res
 
@app.route('/register', methods=["POST"])
# @cross_origin(supports_credentials=True)
def register():
    req = request.get_json()
    username = req['username'].lower()
    password = req['password']
    email = req['email']
    interests = req['interests']
    msg_string = auth.register(email, username, password, interests)
    if(msg_string[0] == 'P'):
        msg = Message(subject="Verify your email", sender=app.config.get("MAIL_USERNAME"), recipients=[email], body=msg_string)
        mail.send(msg)
        return "DONE"
    return msg_string

@app.route('/register/<num>')
# @cross_origin(supports_credentials=True)
def verify_registration(num):
    user = request.args.get('user').lower()
    info = auth.verify(num, user)
    if(info[0] != "I"):
        interest_string = ""
        for subject in loads(info)["interests"]:
            interest_string += subject + ","
        res = make_response(redirect('http://localhost:3000/dashboard'))
        res.set_cookie("username", value=str(loads(info)["user"]), max_age=None, samesite='Lax')
        res.set_cookie("interests", value=str(interest_string), max_age=None, samesite='Lax')
        return res
    return info

@app.route('/fetchuserdata')
def fetch_user_data():
    return session["user_info"]

@app.route('/summary', methods=["POST"])
# @cross_origin(supports_credentials=True)
def send_summary(): 
    body = request.form.get('body')
    topic = request.form.get('topic')
    email = loads(session["user_info"])
    msg = Message(subject="Your summary from " + topic, sender=app.config.get("MAIL_USERNAME"), recipients=[email])
    msg.html = render_template("email.html", content=body)
    mail.send(msg)
    topic = req['topic'].lower()
    subject = req['subject'].lower()
    topics.create_topic(topic, subject)
    search.populateSubjectTopic()
    return "DONE"

@app.route('/remove_topic', methods=["POST"])
def delete_topic():
    req = request.get_json()
    topic = req['topic'].lower()
    db.db.topics.delete_one({"title":topic})
    search.populateSubjectTopic()
    return "DONE"

@app.route('/get_subjects')
# @cross_origin(supports_credentials=True)
def get_subjects():
    return dumps(db.db.subjects.find({}))

@app.route('/get_topics')
def get_topics():
    return dumps(db.db.topics.find({}))

# create a new topic
@app.route('/create_topic', methods=['POST'])
def createTopic():
    title = request.get_json()['topic']
    subject = request.get_json()['subject']
    result = topics.create_topic(title, subject)
    search.populateSubjectTopic()
    return (' ', 201)

# Search functionality
@app.route('/search')
def searchSubjectTopic():
    search.populateSubjectTopic()
    searchTerm = request.args.get('q')
    return dumps(search.searchTopic(searchTerm))

# Link scraper
@app.route('/getGoogleLinks')
def GoogleLinks():
    searchTerm = request.args.get('q')
    return dumps(linkScraper.GoogleLinkScraper(searchTerm))

# Summarization function
@app.route('/getWikipediaSummary')
def makeWikipediaSummary():
    searchTerm = request.args.get('searchTerm')
    return dumps(wikipediaSummary.generateWikipediaSummary(searchTerm));

# CHAT FUNCTION HERE
@app.route('/messages/join_room', methods=["POST"])
def make_room():
    req = request.get_json()
    topic = req["topic"]
    room_id = hash(topic)
    res = make_response("DONE")
    print(room_id)
    res.set_cookie("room_id", value=str(room_id), max_age=None)
    res.set_cookie("topic", value=str(topic), max_age=None)
    return res

@app.route('/messages/leave_room')
def leave_room():
    res = make_response("DONE")
    res.set_cookie("room_id", value="bye", max_age=0)
    res.set_cookie("topic", value="bye", max_age=0)
    return res

'''@app.route('/messages/<room_id>')
def sessions(room_id):
    username = request.cookies.get('login_info')
    room = request.cookies.get('room_id')
    return render_template('message.html', username = username, room = room)
    # If logged out and trying to troll
    #if not request.cookies.get('login_info'):
        #return redirect(url_for('home'))
    # If logged in
    #else:
        #username = request.cookies.get('login_info')
        #room = request.cookies.get('room_id')
        #return render_template('message.html', username = username, room = room)
'''
def messageReceived(methods=['GET', 'POST']):
    print('Message Received') 

@socketio.on('message')
def message(data):
    msg = data["msg"]
    username = data["from_username"]
    room = data["room"]
    # Return epoch time so it won't return some random time in a server in Germany lmao
    time_stamp = time.time()
    #time_stamp = time.strftime('%b-%d %I:%M%p', time.localtime())
    socketio.send({"msg": msg, "from_username": username, "time_stamp": time_stamp}, room = room)

@socketio.on('join')
def on_join(data):
    join_room(data["room"])
    socketio.send({"msg": data["from_username"] + " has joined the room"}, room = data["room"])

@socketio.on('leave')
def on_leave(data):
    leave_room()
    socketio.send({"msg": data["from_username"] + " has left the room"}, room = data["room"])

@app.after_request
def middleware_for_response(response):
    # Allowing the credentials in the response.
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

if __name__ == '__main__':
    search.initializeIndexSubject()
    search.populateSubjectTopic()
    socketio.run(app, debug=True)

# Unused code
'''
@app.route('/login', methods=["POST"])
@cross_origin(supports_credentials=True)
def login():
    req = request.get_json()
    print(req)
    username = req['username'].lower()
    password = req['password']
    session["user_info"] = auth.login(username, password)
    return session["user_info"]
@app.route('/register', methods=["POST"])
@cross_origin(supports_credentials=True)
def register():
    req = request.get_json()
    username = req['username'].lower()
    password = req['password']
    email = req['email']
    interests = req['interests']
    msg_string = auth.register(email, username, password, interests)
    if(msg_string[0] == 'P'):
        msg = Message(subject="Verify your email", sender=app.config.get("MAIL_USERNAME"), recipients=[email], body=msg_string)
        mail.send(msg)
        return "DONE"
    return msg_string
'''
