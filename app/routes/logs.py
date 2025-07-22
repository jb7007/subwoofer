from flask import Blueprint, jsonify, request, render_template
from flask_login import current_user, login_required

from app.models import PracticeLog, db
from app.utils import add_to_db, serialize_logs, prepare_log_data, get_or_create_piece

logs_bp = Blueprint("logs", __name__)


@logs_bp.route("/log", methods=["POST", "GET"])
@login_required
def log_page():
    return render_template("log.html")

@logs_bp.route("/api/logs", methods=["POST"])
@login_required
def add_log():
    raw_data = request.get_json()
    log_data = prepare_log_data(raw_data, current_user.id)

    new_log = PracticeLog(**log_data)
    add_to_db(new_log)
    return jsonify({"message": "log added!"}), 201


@logs_bp.route("/api/logs", methods=["GET"])
@login_required
def get_logs():
    logs = (
        PracticeLog.query.filter_by(user_id=current_user.id)
        .order_by(PracticeLog.utc_timestamp.desc())
        .all()
    )

    return jsonify(serialize_logs(logs)), 200


@logs_bp.route("/api/recent-logs", methods=["GET"])
@login_required
def api_recent_logs():
    logs = (
        PracticeLog.query.filter_by(user_id=current_user.id)
        .order_by(PracticeLog.utc_timestamp.desc())
        .limit(5)
        .all()
    )

    serialized = serialize_logs(logs)

    return jsonify(serialized)