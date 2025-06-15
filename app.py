# importing flask, database, and classes/tables
from flask import Flask, render_template, request, jsonify, redirect, render_template, session, url_for
from models import db, User, PracticeLog
from datetime import datetime

# password hashing
from werkzeug.security import generate_password_hash, check_password_hash

# for secret key deployment
from dotenv import load_dotenv
import os

app = Flask(__name__)

# config
# makes project path absolute, so everything comes frmo \practice-tracker\ (mainly for db loading)
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'instance', 'practice.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.environ.get('SECRET_KEY')


# initialize db
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    print("Loaded secret key:", app.secret_key)
    return render_template("index.html")

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() # grabs json from front-end
    username = data.get("username") # gets 'username' value from json
    raw_password = data.get("password")

    if not username or not raw_password:
        return jsonify({"message": "Missing username or password"}), 400

    # Check if user exists, hash password, insert into DB, etc.
    print(f"Registering user: {username}")
    
    new_user = User(username=username)
    new_user.set_password(raw_password)
    
    # adds user to database
    db.session.add(new_user)
    db.session.commit()
    
    # logs the user in by setting the session's user-id to the current user
    session["user_id"] = new_user.id

    return jsonify({"message": "User registered successfully", "redirect": "/dashboard"}), 200

@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]

    user = User.query.filter_by(username=username).first()
    
    if not user:
        return "User not found", 404
    
    if not check_password_hash(user.password_hash, password):
        return "Incorrect password", 403

    # success!
    session["user_id"] = user.id
    return redirect("/dashboard")  # or wherever you want to go next

@app.route("/dashboard", methods=["GET"])
def dashboard():
    user_id = session.get("user_id")
    
    if not user_id:
        return redirect(url_for("home"))
    
    user = User.query.get(user_id)
    minutes = 145
    
    return render_template("dashboard.html", user=user, minutes=minutes)

@app.route("/log", methods=["POST", "GET"])
def log_page():
    return render_template("log.html")

@app.route("/api/logs", methods=["POST"])
def add_log():
    data = request.get_json()
    data["date"] = datetime.fromisoformat(data.get("date")) # converts time to python datetime object
    data["user_id"] = session.get("user_id") # set user it
    
    new_log = PracticeLog(**data)
    
    db.session.add(new_log)
    db.session.commit()
    
    return jsonify({ "message": "log added!" }), 201

if __name__ == "__main__":
    app.run(debug=True)