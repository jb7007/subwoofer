# utils.py
# Utility functions for database operations, log data prep, querying, and statistics

from collections import defaultdict, Counter
from typing import List, Optional, Tuple, Any
from datetime import datetime
from flask import jsonify
from flask_login import current_user

from models import PracticeLog, Piece, db


# ─── DATABASE HELPERS 

def add_to_db(*items):
    """
    Add one or more items to the database session and commit.
    """
    for item in items:
        db.session.add(item)
    db.session.commit()


def verify(fields: dict, error_code, *, msg_override=None, does_exist=False, verb_override=None):
    """
    Validate presence or absence of fields for requests.
    Returns a Flask JSON response tuple if validation fails.
    """
    missing = []
    for key, val in fields.items():
        condition = val if does_exist else not val
        if condition:
            if msg_override:
                return jsonify({"message": msg_override}), error_code
            missing.append(key)
    if missing:
        msg = ", ".join(missing)
        verb = verb_override or ("already exist" if does_exist else "are missing")
        return jsonify({"message": f"The following fields {verb}: {msg}"}), error_code


# ─── LOG DATA FORMATTING / PREP 

def prepare_log_data(raw: dict, user_id: int) -> dict:
    """
    Prepare and clean incoming log data:
    - Parse ISO datetime strings
    - Assign user_id
    - Determine next user_log_number
    """
    data = raw.copy()
    data["utc_timestamp"] = datetime.fromisoformat(data["utc_timestamp"])
    data["local_date"] = datetime.fromisoformat(data["local_date"])
    data["user_id"] = user_id

    latest = (
        PracticeLog.query
        .filter_by(user_id=user_id)
        .order_by(PracticeLog.user_log_number.desc())
        .first()
    )
    data["user_log_number"] = (latest.user_log_number + 1) if latest else 1
    return data


def serialize_logs(logs: list) -> list:
    """
    Serialize a list of PracticeLog objects into dictionaries for JSON.
    """
    output = []
    for log in logs:
        output.append({
            "id": log.user_log_number,
            "local_date": log.local_date,
            "utc_date": log.utc_timestamp,
            "updated_at": log.updated_at,
            "instrument": log.instrument,
            "duration": log.duration,
            "notes": log.notes or "",
            "piece": log.piece.title if log.piece else "Unlisted",
            "composer": log.piece.composer if log.piece else "Unlisted",
        })
    return output


# ─── PIECE MANAGEMENT 

def get_or_create_piece(title: str, composer: str, user_id: int, duration: int) -> Piece:
    """
    Find or create a Piece record, update its log_time, and return it.
    """
    title_clean = title.strip()
    composer_clean = composer.strip() if composer else "Unknown"

    piece = Piece.query.filter_by(
        title=title_clean,
        composer=composer_clean
    ).first()
    if not piece:
        piece = Piece(
            title=title_clean,
            composer=composer_clean,
            user_id=user_id,
            log_time=0
        )
        add_to_db(piece)

    piece.log_time += int(duration)
    db.session.commit()
    return piece


# ─── QUERY HELPERS 

def get_logs() -> list:
    """Get all PracticeLog entries for the current user."""
    return PracticeLog.query.filter_by(
        user_id=current_user.id
    ).all()


def get_logs_from(user) -> list:
    """Get all PracticeLog entries for a given user."""
    return PracticeLog.query.filter_by(user_id=user.id).all()


def get_last_log() -> PracticeLog | None:
    """Get the most recent PracticeLog for the current user."""
    return (
        PracticeLog.query
        .filter_by(user_id=current_user.id)
        .order_by(PracticeLog.user_log_number.desc())
        .first()
    )


def get_last_log_from(user) -> PracticeLog | None:
    """Get the most recent PracticeLog for a given user."""
    return (
        PracticeLog.query
        .filter_by(user_id=user.id)
        .order_by(PracticeLog.user_log_number.desc())
        .first()
    )


def get_first_log(return_date: bool=False, utc: bool=True):
    """
    Get the earliest PracticeLog for the current user.
    Can return the date fields if requested.
    """
    first = (
        PracticeLog.query
        .filter_by(user_id=current_user.id)
        .order_by(PracticeLog.utc_timestamp)
        .first()
    )
    if not first:
        return None
    if return_date:
        return first.utc_timestamp if utc else first.local_date
    return first


# ─── STATS / FREQUENCY 

def get_total_log_mins(logs: list) -> int:
    """Sum durations of a list of logs."""
    return sum(log.duration for log in logs)


def get_avg_log_mins(logs: list, round_val: int=None) -> float:
    """Calculate average minutes from a list of logs."""
    total = get_total_log_mins(logs)
    avg = total / len(logs) if logs else 0
    return round(avg, round_val) if round_val is not None else avg


def get_most_frequent(
    logs: List,
    *,
    attr: str,
    weight_attr: Optional[str] = None,
    mode: str = "value"  # one of "value", "count", or "pair"
) -> Any:
    """
    Returns the most frequent `attr` (e.g., instrument, piece) in logs.
    - weight_attr: if provided, each log contributes getattr(log, weight_attr) instead of 1.
    - mode:
        "value" → just the attr value
        "count" → the total count/weight
        "pair"  → (value, count)
    """
    counter = Counter()
    for log in logs:
        key = getattr(log, attr, None)
        weight = getattr(log, weight_attr, 1) if weight_attr else 1
        counter[key] += weight

    if not counter:
        return None

    value, cnt = counter.most_common(1)[0]

    if mode == "count":
        return cnt
    if mode == "pair":
        return (value, cnt)
    return value  # default "value" mode