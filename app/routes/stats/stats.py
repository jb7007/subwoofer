from zoneinfo import ZoneInfo
from flask import Blueprint, jsonify, render_template
from flask_login import current_user, login_required
from datetime import datetime

from app.models import Piece, PracticeLog
from app.utils import (get_avg_log_mins, get_most_frequent, get_this_week_logs, get_logs_from, get_today_log_mins,
                   get_total_log_mins, get_instrument_name,)

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/api/stats")
@login_required
def stats():
    return render_template("stats.html")

@stats_bp.route("/api/stats/pieces", methods=["GET"])
@login_required
def get_pieces():
    pieces = (
        Piece.query.filter_by(user_id=current_user.id).order_by(Piece.title.asc()).all()
    )
    result = [
        {"id": p.id, "title": p.title, "composer": p.composer, "minutes": p.log_time}
        for p in pieces
    ]
    return jsonify(result), 200