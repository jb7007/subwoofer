import os

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
    
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), os.pardir)
    )
    db_folder = os.path.join(project_root, "instance")
    db_path = os.path.join(db_folder, "practice.db")
    db_uri = f"sqlite:///{db_path.replace(os.sep, '/')}"
    
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
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
    
    os.makedirs(db_folder, exist_ok=True)
    with app.app_context():
        db.create_all()
    
    return app
