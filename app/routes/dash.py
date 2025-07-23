from flask import Blueprint, jsonify, render_template
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.utils import (
    get_total_log_mins,
    get_today_log_mins,
    get_avg_log_mins,
    get_most_frequent,
    get_logs_from,
    get_this_week_logs
)
from app.utils.formatting import get_instrument_name
from app.utils.stats import calculate_cumulative_data, calculate_weekly_data

dash_bp = Blueprint("dash", __name__)

@dash_bp.route("/dashboard")
@login_required
def dashboard():
    date = datetime.now().strftime("%B %d, %Y")
    return render_template("dashboard.html", user=current_user, date=date)

@dash_bp.route("/api/dashboard/stats")
@login_required
def get_dashboard_stats():
    """Get all dashboard statistics in a single call."""
    all_logs = get_logs_from(current_user)
    weekly_logs = get_this_week_logs()
    
    # Get most frequent piece safely
    most_frequent_piece = get_most_frequent(all_logs, attr="piece")
    piece_title = most_frequent_piece.title if most_frequent_piece else None
    
    return jsonify({
        "cumulative": calculate_cumulative_data(all_logs),
        "weekly": calculate_weekly_data(weekly_logs),
        "daily": {
            "total_today": get_today_log_mins(all_logs) or 0,
            "target": 60
        },
        "common_instrument": get_instrument_name(get_most_frequent(all_logs, attr="instrument")) or "None",
        "total_minutes": get_total_log_mins(all_logs) or 0,
        "average_minutes": get_avg_log_mins(all_logs) or 0,
        "common_piece": piece_title
    })

