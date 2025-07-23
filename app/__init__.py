"""
Flask Application Factory for Practice Tracker

This module contains the application factory function that creates and configures
the Flask application instance. It handles all initialization including database
setup, authentication configuration, blueprint registration, and environment setup.

Key Components:
- Flask application creation and configuration
- SQLAlchemy database initialization
- Flask-Login authentication setup
- Blueprint registration for modular routing
- Environment variable configuration
- Database file management and creation

The factory pattern allows for easy testing and multiple application instances
with different configurations.
"""

import os

from flask import Flask
from flask_login import LoginManager
from dotenv import load_dotenv

from .models import db, User
from .routes import register_blueprints

# Load environment variables from .env file
load_dotenv()

# Initialize Flask-Login for user session management
login_manager = LoginManager()
login_manager.login_view = "auth.login"    # Redirect unauthenticated users to login
login_manager.login_message = None         # Disable default login required message

def create_app():
    """
    Create and configure the Flask application instance.
    
    This factory function sets up all necessary components for the practice
    tracker application including database configuration, authentication,
    routing, and static file handling.
    
    Returns:
        Flask: Configured Flask application instance ready to run
    """
    # Create Flask application with custom static and template folders
    app = Flask(
        __name__,
        static_folder="../static",      # Serve static files from project root
        template_folder="templates"     # HTML templates location
        )
    
    # Configure SQLite database path
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), os.pardir)
    )
    db_folder = os.path.join(project_root, "instance")  # Database storage folder
    db_path = os.path.join(db_folder, "practice.db")    # SQLite database file
    db_uri = f"sqlite:///{db_path.replace(os.sep, '/')}"  # Convert to URI format
    
    # Application configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Disable event system for performance
    app.secret_key = os.getenv("SECRET_KEY")               # Secret key for sessions (from .env)

    # Initialize extensions with the app
    db.init_app(app)           # SQLAlchemy database
    login_manager.init_app(app) # Flask-Login authentication

    @login_manager.user_loader
    def load_user(user_id):
        """
        Load user for Flask-Login sessions.
        
        This callback function loads a user object from the database
        given their user ID stored in the session.
        
        Args:
            user_id (str): User ID from the session
            
        Returns:
            User: User object or None if not found
        """
        return db.session.get(User, int(user_id))

    @app.context_processor
    def inject_user():
        """
        Make current user available in all templates.
        
        This context processor injects the current user object into
        all template contexts so it can be accessed in Jinja2 templates.
        
        Returns:
            dict: Context variables for templates
        """
        from flask_login import current_user
        return dict(user=current_user)

    # Register all route blueprints for modular routing
    register_blueprints(app)
    
    # Ensure database folder exists and create tables
    os.makedirs(db_folder, exist_ok=True)  # Create instance folder if needed
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist
    
    return app
