from flask import Blueprint, jsonify, redirect, request
from flask_login import login_user, logout_user

from app.models import User
from app.utils import add_to_db, verify

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    register_data = request.get_json()
    username = register_data.get("username")
    password = register_data.get("password")
    timezone = register_data.get("timezone", "UTC")
    
    if timezone:
        print("timezone capturted successfully:", timezone)

    verify({"username": username, "password": password, "timezone": timezone}, 400)

    existing_user = User.query.filter_by(username=username).first()
    verify({"user": existing_user}, 409, does_exist=True)

    new_user = User(username=username, timezone=timezone)
    print("new user created:", new_user)
    new_user.set_password(password)
    add_to_db(new_user)

    login_user(new_user)

    return (
        jsonify({"message": "User registered successfully", "redirect": "/dashboard"}),
        200,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "")
    password = data.get("password", "")

    user = User.query.filter_by(username=username).first()
    check = verify({"user": user}, 401)
    if check:
        return check

    if not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "Login successful", "redirect": "/dashboard"}), 200

@auth_bp.route("/logout")
def logout():
    logout_user()
    return redirect("/")