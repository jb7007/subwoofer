from datetime import datetime, timezone

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

def utc_now():
    return datetime.now(timezone.utc)

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    creation_date = db.Column(db.DateTime, default=utc_now, nullable=False)
    timezone = db.Column(db.String(50), default="UTC", nullable=False)

    # establishes a property/way to list all logs owned by the user (user.logs)
    logs = db.relationship("PracticeLog", backref="user", lazy=True)
    # establishes a awy to list all pieces registered by the user (piece.user)
    pieces = db.relationship("Piece", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class PracticeLog(db.Model):
    __tablename__ = "practice_log"
    id = db.Column(db.Integer, primary_key=True)
    user_log_number = db.Column(db.Integer, nullable=False)

    # links each log to a specific user (log.user)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    local_date = db.Column(db.Date, nullable=False)
    utc_timestamp = db.Column(db.DateTime(timezone=True), nullable=False)

    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    instrument = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)

    # links each piece to a specific user (log.piece)
    piece_id = db.Column(db.Integer, db.ForeignKey("piece.id"), nullable=True)
    # allows for (piece.logs) via backref='logs'
    piece = db.relationship("Piece", backref="logs", lazy=True)


class Piece(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    title = db.Column(db.String(100), nullable=False)
    composer = db.Column(db.String(100), nullable=True)
    log_time = db.Column(db.Integer, nullable=False)
