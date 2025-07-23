"""
Authentication Routes Blueprint for Practice Tracker Application

This module handles user authentication operations including registration,
login, and logout. All endpoints return JSON responses for AJAX integration
with the frontend forms.

Security Features:
- Password hashing using secure methods
- User verification and validation
- Session management via Flask-Login
- Timezone capture for user preferences
"""

from flask import Blueprint, jsonify, redirect, request
from flask_login import login_user, logout_user

from app.models import User
from app.utils import add_to_db, verify

# Create blueprint for authentication routes
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Handle user registration with username, password, and timezone.
    
    This endpoint creates a new user account with the provided credentials
    and timezone preference. It validates the input, checks for existing users,
    creates the account, and automatically logs in the new user.
    
    Expected JSON payload:
        - username: Unique username for the account
        - password: Plain text password (will be hashed)
        - timezone: User's timezone (defaults to "UTC")
        
    Returns:
        JSON response with success message and redirect URL, or error details
        
    Status Codes:
        200: User created and logged in successfully
        400: Missing or invalid input data
        409: Username already exists
    """
    # Extract registration data from JSON request
    register_data = request.get_json()
    username = register_data.get("username")
    password = register_data.get("password")
    timezone = register_data.get("timezone", "UTC")  # Default to UTC if not provided
    
    # Debug log for timezone capture (could be removed in production)
    if timezone:
        print("timezone captured successfully:", timezone)

    # Validate required fields are present
    verify({"username": username, "password": password, "timezone": timezone}, 400)

    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    verify({"user": existing_user}, 409, does_exist=True)

    # Create new user with secure password hashing
    new_user = User(username=username, timezone=timezone)
    print("new user created:", new_user)  # Debug log
    new_user.set_password(password)  # Hash the password securely
    add_to_db(new_user)  # Save to database

    # Automatically log in the new user
    login_user(new_user)

    return (
        jsonify({"message": "User registered successfully", "redirect": "/dashboard"}),
        200,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Handle user login with username and password authentication.
    
    This endpoint authenticates users by verifying their credentials against
    the database. Successful authentication establishes a user session.
    
    Expected JSON payload:
        - username: User's username
        - password: User's plain text password
        
    Returns:
        JSON response with success message and redirect URL, or error details
        
    Status Codes:
        200: Login successful, user session established
        401: Invalid username or password
    """
    # Extract login credentials from JSON request
    data = request.get_json() or {}
    username = data.get("username", "")
    password = data.get("password", "")

    # Find user by username
    user = User.query.filter_by(username=username).first()
    
    # Verify user exists
    check = verify({"user": user}, 401)
    if check:
        return check

    # Verify password is correct
    if not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Establish user session
    login_user(user)
    return jsonify({"message": "Login successful", "redirect": "/dashboard"}), 200

@auth_bp.route("/logout")
def logout():
    """
    Handle user logout by clearing the current session.
    
    This endpoint logs out the current user and redirects them to the home page.
    The session is cleared and the user will need to log in again.
    
    Returns:
        Redirect to the home page ("/")
    """
    logout_user()  # Clear the user session
    return redirect("/")  # Redirect to home page