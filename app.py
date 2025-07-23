# importing flask, database, and classes/tables
import os
from datetime import datetime

from flask import Flask, render_template
from flask_login import (LoginManager, current_user, login_required)

from instrument_map import instrument_labels as INSTRUMENTS
from app.models import User, db
from routes import register_blueprints

app = Flask(__name__)

# config
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(basedir, 'instance', 'practice.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.secret_key = os.environ.get("SECRET_KEY")

# initialize db
db.init_app(app)
with app.app_context():
    db.create_all()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"  # where to redirect if not logged in
login_manager.login_message = None  # disable the default flash message


# user_loader callback for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.context_processor
def inject_user():
    return dict(user=current_user)


# register blueprints
register_blueprints(app)


@app.route("/")
def home():
    print("Logged in?", current_user.is_authenticated)
    print("Loaded secret key:", app.secret_key)
    return render_template("index.html")


@app.route("/dashboard")
@login_required
def dashboard():
    date = datetime.now().strftime("%B %d, %Y")
    return render_template("dashboard.html", user=current_user, date=date)


@app.route("/stats", methods=["GET"])
@login_required
def stats():
    return render_template("stats.html")


@app.route("/log", methods=["POST", "GET"])
@login_required
def log_page():
    return render_template("log.html")
