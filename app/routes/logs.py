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

    piece_title = log_data.pop("piece", None)
    composer_name = log_data.pop("composer", None)

    if piece_title:
        # Try to find by both title and composer
        piece = get_or_create_piece(piece_title, composer_name, current_user.id, log_data["duration"])  
        log_data["piece_id"] = piece.id
    else:
        log_data["piece_id"] = None

    new_log = PracticeLog(**log_data)
    add_to_db(db, new_log)
    return jsonify({"message": "log added!"}), 201


@logs_bp.route("/api/logs", methods=["GET"])
@login_required
def get_logs():
    logs = (
        PracticeLog.query.filter_by(user_id=current_user.id)
        .order_by(PracticeLog.utc_timestamp.desc())
        .all()
    )

    # TODO: replace with serialize function and adjust js frontend
    serialized_logs = []
    for log in logs:
        serialized_logs.append(
            {
                "id": log.user_log_number,
                "date": log.local_date.strftime("%b %d, %Y"),
                "isodate": log.utc_timestamp.strftime("%Y-%m-%d"),
                "duration": log.duration,
                "instrument": log.instrument,
                "piece": log.piece.title if log.piece else "Unlisted",
                "composer": log.piece.composer if log.piece else "Unlisted",
                "notes": log.notes or "",
            }
        )
    return jsonify(serialized_logs), 200


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
