# importing flask, database, and classes/tables
from collections import defaultdict
from flask import Flask, render_template, request, jsonify, redirect, session, url_for
from flask_login import LoginManager, login_required, current_user, login_user, logout_user 
from models import db, User, PracticeLog, Piece
from datetime import datetime
from instrument_map import instrument_labels as INSTRUMENTS
from utils import add_to_db, get_avg_log_mins, get_frequent, get_logs_from, get_total_log_mins, serialize_logs, verify

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
    password = data.get("password")
    
    verify({"username": username, "password": password}, 400)
    
    existing_user = User.query.filter_by(username=username).first()
    verify({"user": existing_user}, 409, does_exist=True)

    new_user = User(username=username)
    new_user.set_password(password)
    add_to_db(db, new_user)

    login_user(new_user)

    return jsonify({"message": "User registered successfully", "redirect": "/dashboard"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    print("Username received:", username)
    print("Password received:", password)

    verify({"username": username, "password": password}, 400)
    
    user = User.query.filter_by(username=username).first()
    
    verify({"user": user}, 401, msg_override="User not found")
    verify({"password": password}, 401, msg_prefix="Incorrect")

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
    logs = get_logs_from(current_user)
    
    if not logs:
        return jsonify({
            "total_minutes": 0,
            "common_instrument": "Unlisted",
            "most_practiced_day": "Unlisted"
        }), 200
    
    # calculate total minutes from all logs
    total_minutes = get_total_log_mins(logs)
    avg_minutes = get_avg_log_mins(logs, 2) if logs else 0.0
        
    most_played_instrument = get_frequent("instrument", logs)
    
    freq_instr_logs = PracticeLog.query.filter_by(instrument=most_played_instrument).all()

    most_common_piece = get_frequent("piece", freq_instr_logs, "duration")
    common_title = most_common_piece.title if most_common_piece else "Unlisted"

    common_instrument = INSTRUMENTS.get(most_played_instrument, "Unlisted") if most_played_instrument else "Unlisted" # get the human-readable label
    
    return jsonify({
        "total_minutes": total_minutes,
        "average_minutes": avg_minutes,
        "common_instrument": common_instrument,
        "common_instr_key": most_played_instrument,
        "common_piece": common_title
    }), 200


@app.route("/api/recent-logs", methods=["GET"])
@login_required
def api_recent_logs():
    logs = PracticeLog.query.filter_by(user_id=current_user.id).order_by(PracticeLog.utc_timestamp.desc()).limit(5).all()

    serialized = serialize_logs(logs)

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
    print(data)
    
    # TODO: turn into a util function
    data["utc_timestamp"] = datetime.fromisoformat(data.get("utc_timestamp"))
    data["local_date"] = datetime.fromisoformat(data.get("local_date"))
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
            # make a piece and add it to the database
            piece = Piece(title=piece_title, composer=composer_name, user_id=current_user.id, log_time=0)
            add_to_db(db, piece)

        data["piece_id"] = piece.id
        piece.log_time += int(data.get("duration"))
    else:
        data["piece_id"] = None
        
    latest_log = PracticeLog.query.filter_by(user_id=current_user.id)\
        .order_by(PracticeLog.user_log_number.desc())\
            .first()
                        
    # TODO: turn into a util function      
    next_index = (latest_log.user_log_number + 1) if latest_log else 1
    data["user_log_number"] = next_index

    
    new_log = PracticeLog(**data)
    add_to_db(db, new_log)
    return jsonify({ "message": "log added!" }), 201

@app.route("/api/logs", methods=["GET"])
@login_required 
def get_logs():
    logs = PracticeLog.query.filter_by(user_id=current_user.id)\
        .order_by(PracticeLog.utc_timestamp.desc()).all()
    
    # TODO: replace with serialize function and adjust js frontend
    serialized_logs = []
    for log in logs:
        serialized_logs.append({
            "id": log.user_log_number,
            "date": log.local_date.strftime("%b %d, %Y"),
            "isodate": log.utc_timestamp.strftime("%Y-%m-%d"),
            "duration": log.duration,
            "instrument": log.instrument,
            "piece": log.piece.title if log.piece else "Unlisted",
            "composer": log.piece.composer if log.piece else "Unlisted",
            "notes": log.notes or ""
        })
    return jsonify(serialized_logs), 200

@app.route("/api/pieces", methods=["GET"])
@login_required
def get_pieces():
    # TODO: admire modularity
    pieces = Piece.query.filter_by(user_id=current_user.id).order_by(Piece.title.asc()).all()
    result = [{"id": p.id, "title": p.title, "composer": p.composer, "minutes": p.log_time} for p in pieces]
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True)
