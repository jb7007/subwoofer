"""
Database Models for Practice Tracker Application

This module defines the SQLAlchemy models for the practice tracking system,
including users, practice logs, and musical pieces. All models include proper
relationships, constraints, and timezone handling for data integrity.

Models:
- User: User accounts with authentication and timezone preferences
- PracticeLog: Individual practice sessions with detailed metadata
- Piece: Musical pieces that users practice, linked to practice logs

Key Features:
- UTC timestamp storage with timezone conversion
- Secure password hashing using Werkzeug
- Foreign key relationships for data integrity
- User session management via Flask-Login
"""

from datetime import datetime, timezone

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

def utc_now():
    """
    Get current datetime in UTC timezone.
    
    This function provides a consistent way to generate UTC timestamps
    for database storage, ensuring all times are stored in a standard format.
    
    Returns:
        datetime: Current UTC datetime object
    """
    return datetime.now(timezone.utc)

# Initialize SQLAlchemy database instance
db = SQLAlchemy()

class User(UserMixin, db.Model):
    """
    User model for authentication and user management.
    
    This model extends Flask-Login's UserMixin to provide session management
    and includes user preferences like timezone settings. Passwords are
    securely hashed using Werkzeug's security functions.
    
    Attributes:
        id: Primary key for user identification
        username: Unique username for login (max 80 characters)
        password_hash: Securely hashed password (never store plaintext)
        creation_date: UTC timestamp of account creation
        timezone: User's preferred timezone for display purposes
        
    Relationships:
        logs: One-to-many relationship with PracticeLog (user.logs)
        pieces: One-to-many relationship with Piece (user.pieces)
    """
    __tablename__ = "user"

    # Primary key and unique identifier
    id = db.Column(db.Integer, primary_key=True)

    # Authentication fields
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)  # Never store plaintext passwords
    
    # User metadata
    creation_date = db.Column(db.DateTime, default=utc_now(), nullable=False)
    timezone = db.Column(db.String(50), default="UTC", nullable=False)  # User's timezone preference

    # Relationship definitions for easy access to related data
    logs = db.relationship("PracticeLog", backref="user", lazy=True)    # Access via user.logs
    pieces = db.relationship("Piece", backref="user", lazy=True)        # Access via user.pieces

    def set_password(self, password):
        """
        Hash and store a user's password securely.
        
        Args:
            password (str): Plain text password to hash and store
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """
        Verify a password against the stored hash.
        
        Args:
            password (str): Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)


class PracticeLog(db.Model):
    """
    Practice log model for recording individual practice sessions.
    
    This model stores detailed information about each practice session,
    including timing, instrument, duration, and optional notes. All timestamps
    are stored in UTC and converted to user's timezone for display.
    
    Attributes:
        id: Primary key for log identification
        user_log_number: Sequential number for user's logs (1, 2, 3, etc.)
        user_id: Foreign key linking to User table
        utc_timestamp: UTC timestamp of when practice occurred
        updated_at: UTC timestamp of last modification
        instrument: Name/type of instrument practiced
        duration: Practice time in minutes
        notes: Optional text notes about the practice session
        piece_id: Optional foreign key linking to Piece table
        
    Relationships:
        user: Many-to-one relationship with User (log.user)
        piece: Many-to-one relationship with Piece (log.piece)
    """
    __tablename__ = "practice_log"
    
    # Primary key and user sequence number
    id = db.Column(db.Integer, primary_key=True)
    user_log_number = db.Column(db.Integer, nullable=False)  # Sequential numbering per user

    # Foreign key relationship to User
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # Timestamp fields (all stored in UTC)
    utc_timestamp = db.Column(db.DateTime(timezone=True), nullable=False)  # When practice occurred
    updated_at = db.Column(db.DateTime, default=utc_now(), onupdate=utc_now())  # Last modification

    # Practice session details
    instrument = db.Column(db.String(50), nullable=False)  # Instrument name/type
    duration = db.Column(db.Integer, nullable=False)       # Practice time in minutes
    notes = db.Column(db.Text)                             # Optional practice notes

    # Optional relationship to specific piece practiced
    piece_id = db.Column(db.Integer, db.ForeignKey("piece.id"), nullable=True)
    piece = db.relationship("Piece", backref="logs", lazy=True)  # Access via piece.logs


class Piece(db.Model):
    """
    Musical piece model for tracking pieces that users practice.
    
    This model stores information about musical pieces including title,
    composer, and total practice time. Pieces are linked to users and
    can have multiple practice log entries.
    
    Attributes:
        id: Primary key for piece identification
        user_id: Foreign key linking to User table
        title: Title of the musical piece
        composer: Optional composer name
        log_time: Total practice time spent on this piece (in minutes)
        
    Relationships:
        user: Many-to-one relationship with User (piece.user)
        logs: One-to-many relationship with PracticeLog (piece.logs)
    """
    # Primary key and user relationship
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # Piece metadata
    title = db.Column(db.String(100), nullable=False)    # Name of the piece
    composer = db.Column(db.String(100), nullable=True)  # Optional composer information
    log_time = db.Column(db.Integer, nullable=False)     # Total practice time in minutes