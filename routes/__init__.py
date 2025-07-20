from .auth import auth_bp
from .logs import logs_bp
from .pieces import pieces_bp
from .stats import stats_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(pieces_bp)
