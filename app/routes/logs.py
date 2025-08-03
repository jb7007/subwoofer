"""
Practice Logs Routes Blueprint for Practice Tracker Application

This module handles all practice log operations including creating new logs,
retrieving user logs, and providing API endpoints for log management.
All log data is timezone-aware and properly formatted for display.

Key Features:
- Practice log creation with validation
- Log retrieval with proper ordering
- Recent logs for dashboard display
- Timezone-aware timestamp handling
"""

from flask import Blueprint, jsonify, request, render_template
from flask_login import current_user, login_required

from app.models import PracticeLog, db
from app.utils import add_to_db, serialize_logs, prepare_log_data, get_or_create_piece

# Create blueprint for practice log routes
logs_bp = Blueprint("logs", __name__)


@logs_bp.route("/log", methods=["POST", "GET"])
@login_required
def log_page():
    """
    Render the practice log entry page.
    
    This route serves the log entry form where users can record new
    practice sessions with details like instrument, piece, duration, and notes.
    
    Returns:
        Rendered log.html template for practice session entry
        
    Requires:
        User must be authenticated (login_required decorator)
    """
    return render_template("log.html")

@logs_bp.route("/api/logs", methods=["POST"])
@login_required
def add_log():
    """
    API endpoint to create a new practice log entry.
    
    This endpoint accepts practice session data from the frontend form,
    validates and processes it, then saves it to the database. It handles
    piece creation/lookup and data formatting automatically.
    
    Expected JSON payload:
        - instrument: Instrument type/name
        - piece_title: Title of the piece practiced
        - duration: Practice time in minutes
        - notes: Optional practice notes
        - timestamp: Optional timestamp (defaults to now)
        
    Returns:
        JSON response confirming log creation
        
    Status Codes:
        201: Log created successfully
        400: Invalid or missing required data
    """
    # Extract raw data from request
    raw_data = request.get_json()
    if raw_data is None:
        return jsonify({"error": "validation_failed", "message": "Request body must contain valid JSON"}), 400
    
    # Validate the incoming data
    from app.utils.validation import validate_log_submission_data
    is_valid, validated_data, error_message = validate_log_submission_data(raw_data)
    
    if not is_valid:
        return jsonify({"error": "validation_failed", "message": error_message}), 400
    
    # Prepare validated data for database
    log_data = prepare_log_data(validated_data, current_user.id)

    # Create new practice log entry
    new_log = PracticeLog(**log_data)
    add_to_db(new_log)  # Save to database
    
    return jsonify({"message": "log added!"}), 201


@logs_bp.route("/api/logs", methods=["GET"])
@login_required
def get_logs():
    """
    API endpoint to retrieve all practice logs for the current user.
    
    This endpoint returns all practice logs belonging to the authenticated user,
    ordered by most recent first. The logs are serialized with proper timezone
    conversion for frontend display.
    
    Returns:
        JSON array of serialized practice logs with formatted timestamps
        
    Status Codes:
        200: Logs retrieved successfully
        
    Requires:
        User must be authenticated (login_required decorator)
    """
    # Query user's logs ordered by most recent first
    logs = (
        PracticeLog.query.filter_by(user_id=current_user.id)
        .order_by(PracticeLog.utc_timestamp.desc())
        .all()
    )

    # Serialize logs with timezone conversion for frontend
    return jsonify(serialize_logs(logs)), 200

@logs_bp.route("/api/edit-log/<int:user_log_number>", methods=["PATCH"])
@login_required
def edit_logs(user_log_number):
    data = request.get_json()
    log = PracticeLog.query.filter_by(user_id=current_user.id, user_log_number=user_log_number).first()
    
    if not log:
        return jsonify({"error": "Log not found!"}), 404
    
    if "duration" in data:
        log.duration = data["duration"]
    if "instrument" in data:
        log.instrument = data["instrument"]
    if "notes" in data:
        log.notes = data["notes"]
    
    db.session.commit()
    
    return jsonify({"message": "log edited!"}), 201


@logs_bp.route("/api/recent-logs", methods=["GET"])
@login_required
def api_recent_logs():
    """
    API endpoint to retrieve the 5 most recent practice logs for dashboard display.
    
    This endpoint provides a quick overview of recent practice sessions for
    the dashboard's recent activity section. Logs are formatted with readable
    date strings for display purposes.
    
    Returns:
        JSON array of the 5 most recent practice logs with formatted dates
        
    Status Codes:
        200: Recent logs retrieved successfully
        
    Requires:
        User must be authenticated (login_required decorator)
    """
    # Query only the 5 most recent logs for performance
    logs = (
        PracticeLog.query.filter_by(user_id=current_user.id)
        .order_by(PracticeLog.utc_timestamp.desc())
        .limit(5)  # Limit to 5 most recent for dashboard display
        .all()
    )

    # Serialize with human-readable date format for dashboard
    serialized = serialize_logs(logs, local_format="%A, %b %d, %Y")

    return jsonify(serialized)