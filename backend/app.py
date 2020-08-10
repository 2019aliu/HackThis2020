#!/usr/bin/env python
from threading import Lock
from flask import Flask, render_template, session, request, \
    copy_current_request_context, make_response
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
from flask_pymongo import pymongo
from bson.json_util import loads, dumps
from flask_mail import Mail, Message
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
app.debug = False  # debugger mode
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
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
    return "Home Page Lol"

# Cookies
def delete_cookie(key):
    res = make_response("Cookie Removed")
    res.set_cookie(key, '', max_age=0)
    return res

# Login, Logout, Registration
@app.route('/login', methods = ["GET", "POST"])
def login():
    # If haven't logged in (Normal Case)
    if not request.cookies.get('login_info'):
        log_form = LoginForm()
        if log_form.validate_on_submit():
            res = make_response(("Welcome Back, {}").format(log_form.username.data))
            res.set_cookie("login_info", value=str(log_form.username.data), max_age=None)
            return res
        return render_template("login.html", form = log_form)
    # If already logged in and trying to troll
    else:
        return redirect(url_for('home'))

@app.route('/logout', methods = ["GET"])
def logout():
    if not request.cookies.get('login_info'):
         return "Huh? Trying to exit when you haven't even signed in?? Smh."
    # Return home when logged out or w/e
    res = make_response(redirect(url_for('home')))
    res.set_cookie("login_info", '', max_age=0)
    res.set_cookie("room_id", '', max_age=0)
    return res

@app.route('/register', methods = ["GET", "POST"])
def register():
    reg_form = RegistrationForm()
    if reg_form.validate_on_submit():
        #registered_info = cookie('login_info', value=reg_form.username.data, max_age=None)
        return helpers.auth.register(reg_form.email.data, reg_form.username.data, reg_form.password.data)
    return render_template("register.html", form = reg_form)
    
@app.route('/register/<num>')
def verify(num):
    email = request.args.get('email').lower()
    print(num)
    return auth.verify(num, email)

@app.route('/create_topic/<topic>/<subject>')
def new(topic, subject):
    topics.create_topic(topic, subject)
    return "DONE"

@app.route('/get_subjects')
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
        random_room_id = "temp"
        #random_room_id = uuid.uuid4().hex
        res = make_response(redirect(url_for('sessions', room_id = random_room_id)))
        res.set_cookie("room_id", value=random_room_id, max_age=None)
        return res

@app.route('/messages/<room_id>')
def sessions(room_id):
    # If logged out and trying to troll
    if not request.cookies.get('login_info'):
        return redirect(url_for('home'))
    # If logged in
    else:
        username = request.cookies.get('login_info')
        room = request.cookies.get('room_id')
        return render_template('message.html', username = username, room = room)

def messageReceived(methods=['GET', 'POST']):
    print('Message Received') 

@socketio.on('message')
def message(data):
    msg = data["msg"]
    username = data["from_username"]
    room = data["room"]
    time_stamp = time.strftime('%b-%d %I:%M%p', time.localtime())
    socketio.send({"msg": msg, "from_username": username, "time_stamp": time_stamp}, room = room)

@socketio.on('join')
def on_join(data):
    join_room(data["room"])
    send({"msg": data["from_username"] + " has joined the room " + data["room"]}, room = data["room"])

@socketio.on('leave')
def on_leave(data):
    leave_room(data["room"])
    send({"msg": "F: " + data["from_username"] + " has left the room " + data["room"]}, room = data["room"])

if __name__ == '__main__':
    socketio.run(app, debug=True)
