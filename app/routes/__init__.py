"""
Routes Package Initialization for Practice Tracker Application

This module centralizes blueprint imports and provides a single function
to register all route blueprints with the Flask application. This modular
approach keeps routes organized and makes the application structure clear.

Blueprints:
- auth_bp: Authentication routes (login, register, logout)
- logs_bp: Practice log management routes
- stats_bp: Statistics and data analysis routes  
- main_bp: Core application routes (home page, etc.)
- dash_bp: Dashboard and visualization routes

The register_blueprints function should be called during application
factory setup to enable all routes.
"""

# Import all route blueprints
from .auth import auth_bp
from .logs import logs_bp
from .stats import stats_bp
from .main import main_bp
from .dash import dash_bp

def register_blueprints(app):
    """
    Register all route blueprints with the Flask application.
    
    This function registers each blueprint with the Flask app instance,
    making all defined routes available. Blueprints are registered in
    a specific order to handle any potential route conflicts.
    
    Args:
        app (Flask): Flask application instance to register blueprints with
    """
    app.register_blueprint(auth_bp)   # Authentication routes
    app.register_blueprint(logs_bp)   # Practice log routes
    app.register_blueprint(stats_bp)  # Statistics routes
    app.register_blueprint(main_bp)   # Main application routes
    app.register_blueprint(dash_bp)   # Dashboard routes