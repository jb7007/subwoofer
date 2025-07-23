"""
Main Routes Blueprint for Practice Tracker Application

This module handles the core application routes including the home page
and user identification endpoints. These are the primary entry points
for users accessing the application.
"""

from flask import Blueprint, render_template
from flask_login import current_user, login_required

# Create blueprint for main application routes
main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    """
    Render the home page of the application.
    
    This is the main landing page that users see when they visit the site.
    It displays different content based on whether the user is authenticated
    or not (login/signup forms vs. dashboard access).
    
    Returns:
        Rendered index.html template with user authentication status
    """
    # Debug log to track authentication status (could be removed in production)
    print("Logged in?", current_user.is_authenticated)
    return render_template("index.html")

@main_bp.route("/_whoami")
@login_required
def whoami():
    """
    API endpoint to return current user information.
    
    This endpoint provides a way for the frontend to verify the current
    user's identity and authentication status via AJAX calls.
    
    Returns:
        JSON object containing the current user's username
        
    Requires:
        User must be authenticated (login_required decorator)
    """
    return {"user": current_user.username}