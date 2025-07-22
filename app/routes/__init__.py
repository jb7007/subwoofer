# routes/__init__.py
from .auth import auth_bp
from .logs import logs_bp
from .stats.pieces import pieces_bp
from .stats.stats import stats_bp
from .main import main_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(pieces_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(main_bp)  