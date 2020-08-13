#!/usr/bin/env python
from threading import Lock
from flask import Flask, render_template, session, request, \
    copy_current_request_context, redirect, g, url_for
from flask_session import Session
from functools import wraps
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
from flask_pymongo import pymongo
from flask_cors import CORS, cross_origin
from flask_mail import Mail, Message

from bson.json_util import loads, dumps
import uuid
import os, sys, time

# Local Imports
from form_setup import *
from helpers.auth import register

sys.path.append(os.path.abspath('./helpers'))

# # Set this variable to "threading", "eventlet" or "gevent" to test the
# # different async modes, or leave it set to None for the application to choose
# # the best option based on installed packages.
# async_mode = None

# Create the app
app = Flask(__name__)
CORS(app)
app.debug = False  # debugger mode
app.config['SECRET_KEY'] = 'secret!'
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

# Home Page or smth for redirects
@app.route('/', methods = ["GET", "POST"])
def home():
    # Temp set to index.html. Change to home.html once homepage made
    return "Home Page Lol. Anyone can see this"

# Home Page or smth for redirects
@app.route('/dashboard', methods = ["GET", "POST"])
def dashboard():
    # Temp set to index.html. Change to home.html once homepage made
    return "Pretend this is the dashboard lol. You should only see this when logged in."

# Login, Logout, Registration
@app.route('/login', methods = ["GET", "POST"])
def login():
    # TODO: change to taking json data 
    # Verify not logged in
    if not request.cookies.get('login_info'):
        log_form = LoginForm()
        if log_form.validate_on_submit():
            res = make_response(("Welcome Back, {}").format(log_form.username.data))
            res.set_cookie("login_info", value=str(log_form.username.data), max_age=None)
            return res
        # TODO: change to react pages
        return render_template("login.html", form = log_form)
    # Already logged in. Redirect to home page
    else:
        return redirect(url_for('dashboard'))

@app.route('/logout', methods = ["GET"])
def logout():
    # Already Logged out
    if not request.cookies.get('login_info'):
        return redirect(url_for('home'))
    # Logging out. Redirect to home
    res = make_response(redirect(url_for('home')))
    # Removing cookies by setting their max_age to zero
    res.set_cookie("login_info", '', max_age=0)
    res.set_cookie("room_id", '', max_age=0)
    return res

@app.route('/register', methods = ["GET", "POST"])
def register():
    # Verify not already logged in 
    if not request.cookies.get('login_info'):
        reg_form = RegistrationForm()
        if reg_form.validate_on_submit():
            #registered_info = cookie('login_info', value=reg_form.username.data, max_age=None)
            return helpers.auth.register(reg_form.email.data, reg_form.username.data, reg_form.password.data)
        # TODO: change register.html to accept json instead of form and react pages
        return render_template("register.html", form = reg_form)
    return redirect(url_for('dashboard'))
    
@app.route('/register/<num>')
@cross_origin(supports_credentials=True)
def verify(num):
    user = request.args.get('user').lower()
    verify = auth.verify(num, user)
    if(verify[0] != "I"):
        session["user_info"] = verify
        return session["user_info"]
    return verify

@app.route('/fetchuserdata')
def fetch_user_data():
    return session["user_info"]

@app.route('/summary', methods=["POST"])
@cross_origin(supports_credentials=True)
def send_summary(): 
    body = request.form.get('body')
    topic = request.form.get('topic')
    email = loads(session["user_info"])
    msg = Message(subject="Your summary from " + topic, sender=app.config.get("MAIL_USERNAME"), recipients=[email])
    msg.html = render_template("email.html", content=body)
    mail.send(msg)
    return "DONE"

@app.route('/create_topic', methods=["POST"])
@cross_origin(supports_credentials=True)
def new(topic, subject):
    topic = request.form.get('topic').lower()
    subject = request.form.get('subject').lower()
    topics.create_topic(topic, subject)
    return "DONE"

@app.route('/get_subjects')
@cross_origin(supports_credentials=True)
def get_subjects():
    return subjects.get_subjects()

# CHAT FUNCTION HERE
@app.route('/messages/make_room')
def make_room():
    
    # If logged out and trying to troll
    if not request.cookies.get('login_info'):
        return redirect(url_for('home'))
    else:
        #Generate Room ID
        # random_room_id = "temp"
        random_room_id = uuid.uuid4().hex # access the _id of subjects instead of rng 
        res = make_response(redirect(url_for('sessions', room_id = random_room_id)))
        res.set_cookie("room_id", value=random_room_id, max_age=None)
        return res

@app.route('/messages/<room_id>')
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
    socketio.send({"msg": data["from_username"] + " has joined the room " + data["room"]}, room = data["room"])

@socketio.on('leave')
def on_leave(data):
    leave_room(data["room"])
    socketio.send({"msg": data["from_username"] + " has left the room " + data["room"]}, room = data["room"])

if __name__ == '__main__':
    socketio.run(app, debug=True)

# Unused code
'''
@app.route('/')
def index():
    session.clear()
    return render_template('index.html', async_mode=socketio.async_mode)

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