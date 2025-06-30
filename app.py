# importing flask, database, and classes/tables
from flask import Flask, render_template, request, jsonify, redirect, session, url_for
from flask_login import LoginManager, login_required, current_user, login_user, logout_user 
from models import db, User, PracticeLog, Piece
from datetime import datetime
from instrument_map import instrument_labels as INSTRUMENTS

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

@app.route("/dashboard")
@login_required
def dashboard():
    date = datetime.now().strftime("%B %d, %Y")
    return render_template("dashboard.html", user=current_user, date=date)

@app.route('/api/dash-stats', methods=['GET'])
@login_required
def dash_stats():
    # all logs for the current user
    logs = PracticeLog.query.filter_by(user_id=current_user.id).all()
    
    if not logs:
        return jsonify({
            "total_minutes": 0,
            "common_instrument": "Unlisted",
            "most_practiced_day": "Unlisted"
        }), 200
    
    # calculate total minutes from all logs
    total_minutes = sum(log.duration for log in logs)
    temp_avg = total_minutes / len(logs) if logs else 0.0
    avg_minutes = round(temp_avg, 2)  # round to 2 decimal places 
        
    # get frequent instruments and days
    freq_instruments = {}
    freq_days = {}
    for log in logs:
        if log.instrument:
            # Count frequency of each instrument
            freq_instruments[log.instrument] = freq_instruments.get(log.instrument, 0) + 1
        if log.date:
            # Count frequency of each day
            day = log.date.strftime("%Y-%m-%d")
            freq_days[day] = freq_days.get(day, 0) + 1

    common_key = max(freq_instruments, key=freq_instruments.get, default=None) # get the most common instrument key
    common_instrument = INSTRUMENTS.get(common_key, "Unlisted") if common_key else "Unlisted" # get the human-readable label
    common_day_str = max(freq_days, key=freq_days.get, default="Unlisted") # get the most common day as a string
    
    return jsonify({
        "total_minutes": total_minutes,
        "average_minutes": avg_minutes,
        "common_instrument": common_instrument,
        "most_practiced_day": common_day_str
    }), 200


@app.route("/api/recent-logs", methods=["GET"])
@login_required
def api_recent_logs():
    logs = PracticeLog.query.filter_by(user_id=current_user.id).order_by(PracticeLog.date.desc()).limit(5).all()

    serialized = []
    for log in logs:
        serialized.append({
            "date": log.date.strftime("%b %d, %Y"),
            "duration": log.duration,
            "instrument": log.instrument,
            "piece": log.piece.title if log.piece else "Unlisted",
            "composer": log.piece.composer if log.piece else "Unlisted",
            "notes": log.notes or ""
        })

    return jsonify(serialized)

@app.route("/stats", methods=["GET"])
@login_required
def stats():
    return render_template("stats.html")

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
    
    piece_title = data.pop("piece", None)
    composer_name = data.pop("composer", None)

    if piece_title:
        # Normalize inputs
        piece_title = piece_title.strip()
        composer_name = composer_name.strip() if composer_name else "Unknown"

        # Try to find by both title and composer
        piece = Piece.query.filter_by(title=piece_title, composer=composer_name).first()
        if not piece:
            piece = Piece(title=piece_title, composer=composer_name, user_id=current_user.id)
            db.session.add(piece)
            db.session.commit()

        data["piece_id"] = piece.id
    else:
        data["piece_id"] = None
        
    latest_log = PracticeLog.query.filter_by(user_id=current_user.id)\
        .order_by(PracticeLog.user_log_number.desc())\
            .first()
                              
    next_index = (latest_log.user_log_number + 1) if latest_log else 1
    data["user_log_number"] = next_index

    
    new_log = PracticeLog(**data)
    db.session.add(new_log)
    db.session.commit()
    return jsonify({ "message": "log added!" }), 201

@app.route("/api/logs", methods=["GET"])
@login_required 
def get_logs():
    logs = PracticeLog.query.filter_by(user_id=current_user.id)\
        .order_by(PracticeLog.date.desc()).all()
    
    serialized_logs = []
    for log in logs:
        serialized_logs.append({
            "id": log.user_log_number,
            "date": log.date.strftime("%b %d, %Y"),
            "isodate": log.date.strftime("%Y-%m-%d"),
            "duration": log.duration,
            "instrument": log.instrument,
            "piece": log.piece.title if log.piece else "Unlisted",
            "composer": log.piece.composer if log.piece else "Unlisted",
            "notes": log.notes or ""
        })
    return jsonify(serialized_logs), 200

if __name__ == "__main__":
    app.run(debug=True)
