import os
from datetime import datetime

from flask import Flask
from flask_login import LoginManager
from dotenv import load_dotenv

from .models import db, User
from .routes import register_blueprints

load_dotenv()

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.login_message = None

def create_app():
    app = Flask(
        __name__,
        static_folder="../static",
        template_folder="templates"
        )
    
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"sqlite:///{os.path.join(basedir, '..', 'instance', 'practice.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.getenv("SECRET_KEY")

    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.context_processor
    def inject_user():
        from flask_login import current_user
        return dict(user=current_user)

    register_blueprints(app)
    
    return app
