# importing flask, database, and classes/tables
from flask import Flask, render_template, request, jsonify, redirect, session, url_for
from flask_login import LoginManager, login_required, current_user, login_user, logout_user  # ─── ADDED ───>
from models import db, User, PracticeLog
from datetime import datetime

# password hashing
from werkzeug.security import generate_password_hash, check_password_hash

# for secret key deployment
from dotenv import load_dotenv
import os

app = Flask(__name__)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"        # where to redirect if not logged in
login_manager.login_message = None        # disable the default flash message

@app.context_processor
def inject_user():
    return dict(user=current_user)

# user_loader callback for Flask-Login
@login_manager.user_loader 
def load_user(user_id):
    return User.query.get(int(user_id))

# config
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
    print("Logged in?", current_user.is_authenticated)
    print("Loaded secret key:", app.secret_key)
    return render_template("index.html")

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    raw_password = data.get("password")

    if not username or not raw_password:
        return jsonify({"message": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "username already taken!"}), 409

    new_user = User(username=username)
    new_user.set_password(raw_password)
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)

    return jsonify({"message": "User registered successfully", "redirect": "/dashboard"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    print("Username received:", username)
    if not username:
        print("No username provided")
        return jsonify({"message": "Missing username"}), 400

    password = data.get("password")
    print("Password received:", password)
    if not password:
        print("No password provided")
        return jsonify({"message": "Missing password"}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user:
        print("User not found")
        return jsonify({"message": "User not found"}), 401
    if not check_password_hash(user.password_hash, password):
        print("Incorrect password")
        return jsonify({"message": "Incorrect password"}), 401

    login_user(user)
    print("User logged in:", user.username)
    return jsonify({"message": "Login successful", "redirect": "/dashboard"}), 200

@app.route("/logout")
def logout():
    logout_user()  # ← removes the session info
    return redirect("/")

@app.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
    return render_template("dashboard.html", user=current_user, minutes=420)

@app.route("/log", methods=["POST", "GET"])
@login_required
def log_page():
    return render_template("log.html")

@app.route("/api/logs", methods=["POST"])
@login_required
def add_log():
    data = request.get_json()
    data["date"] = datetime.fromisoformat(data.get("date"))
    data["user_id"] = current_user.id 
    new_log = PracticeLog(**data)
    db.session.add(new_log)
    db.session.commit()
    return jsonify({ "message": "log added!" }), 201

@app.route("/api/logs", methods=["GET"])
@login_required  # now works, because login_manager is set up ─── ADDED ───>
def get_logs():
    logs = PracticeLog.query.filter_by(user_id=current_user.id)\
             .order_by(PracticeLog.date.desc()).all()

    serialized_logs = []
    for log in logs:
        serialized_logs.append({
            "id": log.id,
            "date": log.date.strftime("%Y-%m-%d"),
            "duration": log.duration,
            "instrument": log.instrument,
            "piece": log.piece.title if log.piece else "Unlisted",
            "notes": log.notes or ""
        })
    return jsonify(serialized_logs), 200

if __name__ == "__main__":
    app.run(debug=True)
