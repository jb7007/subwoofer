from flask import Blueprint, jsonify, redirect, request
from flask_login import current_user, login_user, logout_user

from app.models import User, db
from app.utils import add_to_db, verify

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    verify({"username": username, "password": password}, 400)

    existing_user = User.query.filter_by(username=username).first()
    verify({"user": existing_user}, 409, does_exist=True)

    new_user = User(username=username)
    new_user.set_password(password)
    add_to_db(new_user)

    login_user(new_user)

    return (
        jsonify({"message": "User registered successfully", "redirect": "/dashboard"}),
        200,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    check = verify({"username": username, "password": password}, 400)
    if check:
        return check

    user = User.query.filter_by(username=username).first()
    check = verify({"user": user}, 401)
    if check:
        return check

    check = verify({"password": password}, 401, msg_override="Incorrect password")
    if check:
        return check

    login_user(user)
    return jsonify({"message": "Login successful", "redirect": "/dashboard"}), 200

@auth_bp.route("/logout")
def logout():
    logout_user()
    return redirect("/")
