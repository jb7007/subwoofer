# routes/main.py
from flask import Blueprint, render_template
from flask_login import current_user, login_required

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    print("Logged in?", current_user.is_authenticated)
    return render_template("index.html")

@main_bp.route("/_whoami")
@login_required
def whoami():
    return {"user": current_user.username}
