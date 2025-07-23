from zoneinfo import ZoneInfo
from flask import Blueprint, jsonify, render_template
from flask_login import current_user, login_required
from datetime import datetime

from app.models import PracticeLog
from app.utils import (get_avg_log_mins, get_most_frequent, get_this_week_logs, get_logs_from, get_today_log_mins,
                   get_total_log_mins, get_instrument_name,)

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/dashboard")
@login_required
def dashboard():
    date = datetime.now().strftime("%B %d, %Y")
    return render_template("dashboard.html", user=current_user, date=date)

@stats_bp.route("api/stats")
@login_required
def stats():
    user = current_user
    logs = get_logs_from(user)
    weekly_logs = get_this_week_logs()
    
    total_minutes = get_total_log_mins(logs)
    daily_mintes = get_today_log_mins(logs)
    avg_minutes = get_avg_log_mins(logs, 2)
    most_played_instrument = get_most_frequent(logs, attr="instrument")
    
    logs_with_instrument = PracticeLog.query.filter_by(
        instrument=most_played_instrument
    ).all()
    
    most_practiced_piece = get_most_frequent(
        logs_with_instrument, attr="piece", weight_attr="duration", mode="value"
    )
    
    piece_title = most_practiced_piece.title if most_practiced_piece else "Unlisted"
    instrument_name = get_instrument_name(most_played_instrument)
    
    return render_template("stats.html")

@stats_bp.route("/api/dash-stats", methods=["GET"])
@login_required
def dash_stats():
    user = current_user
    logs = get_logs_from(user)

    if not logs:
        return (
            jsonify(
                {
                    "total_minutes": 0,
                    "common_instrument": "Unlisted",
                    "most_practiced_day": "Unlisted",
                }
            ),
            200,
        )

    total_minutes = get_total_log_mins(logs)
    avg_minutes = get_avg_log_mins(logs, 2)
    most_played_instrument = get_most_frequent(logs, attr="instrument")

    freq_instr_logs = PracticeLog.query.filter_by(
        instrument=most_played_instrument
    ).all()
    most_common_piece = get_most_frequent(freq_instr_logs, attr="piece", weight_attr="duration", mode="value")
    common_title = most_common_piece.title if most_common_piece else "Unlisted"

    return (
        jsonify(
            {
                "total_minutes": total_minutes,
                "average_minutes": avg_minutes,
                "common_instr_key": most_played_instrument,
                "common_piece": common_title,
            }
        ),
        200,
    )