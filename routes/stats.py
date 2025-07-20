from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from instrument_map import instrument_labels as INSTRUMENTS
from models import PracticeLog
from utils import (get_avg_log_mins, get_most_frequent, get_logs_from,
                   get_total_log_mins)

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/api/dash-stats", methods=["GET"])
@login_required
def dash_stats():
    logs = get_logs_from(current_user)

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
    most_played_instrument = get_most_frequent("instrument", logs)

    freq_instr_logs = PracticeLog.query.filter_by(
        instrument=most_played_instrument
    ).all()
    most_common_piece = get_most_frequent(freq_instr_logs, attr="piece", second_attr="duration", mode="value")
    common_title = most_common_piece.title if most_common_piece else "Unlisted"
    common_instrument = (
        INSTRUMENTS.get(most_played_instrument, "Unlisted")
        if most_played_instrument
        else "Unlisted"
    )

    return (
        jsonify(
            {
                "total_minutes": total_minutes,
                "average_minutes": avg_minutes,
                "common_instrument": common_instrument,
                "common_instr_key": most_played_instrument,
                "common_piece": common_title,
            }
        ),
        200,
    )
