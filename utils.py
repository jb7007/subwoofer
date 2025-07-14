from collections import defaultdict
from flask import Flask, render_template, request, jsonify, redirect, session, url_for
from flask_login import LoginManager, login_required, current_user, login_user, logout_user 
from models import db, User, PracticeLog, Piece
from datetime import datetime
from instrument_map import instrument_labels as INSTRUMENTS

def add_to_db(db, *items):
    for item in items:
        db.session.add(item)
    db.session.commit()

def verify(fields: dict, error_code, *, msg_override=None, does_exist=False):
    target_fields = []

    for key, val in fields.items():
        condition = val if does_exist else not val
        if condition:
            if msg_override:
                return jsonify({"message": msg_override}), error_code
            target_fields.append(key)

    if target_fields:
        msg_string = ", ".join(target_fields)
        verb = "already exist" if does_exist else "are missing"
        return jsonify({"message": f"The following fields {verb}: {msg_string}"}), error_code

def get_logs():
    return PracticeLog.query.filter_by(user_id=current_user.id).all()

def get_logs_from(user):
    return PracticeLog.query.filter_by(user_id=user.id).all()

def get_last_log():
    return PracticeLog.query.filter_by(user_id=current_user.id)\
        .order_by(PracticeLog.user_log_number.desc())\
            .first()

def get_last_log_from(user):
    return PracticeLog.query.filter_by(user_id=user.id)\
        .order_by(PracticeLog.user_log_number.desc())\
            .first()

def get_total_log_mins(logs):
    return sum(log.duration for log in logs)

def get_avg_log_mins(logs, round_val=None):
    avg = get_total_log_mins(logs) / len(logs)
    return round(avg, round_val) if round_val is not None else avg

def serialize_logs(logs):
    serialized = []
    for log in logs:
        serialized.append({
            "id": log.user_log_number,
            "local_date": log.local_date,
            "utc_date": log.utc_timestamp,
            "created_at": log.created_at,
            "updated_at": log.updated_at,
            "instrument": log.instrument,
            "duration": log.duration,
            "notes": log.notes or "",
            "piece": log.piece.title if log.piece else "Unlisted",
            "composer": log.piece.composer if log.piece else "Unlisted"
        })
    return serialized

def get_frequent(attribute, logs, *, return_pair=False, return_count=False, second_attr=None):
    freq = defaultdict(int)
    
    for log in logs:
        value = getattr(log, attribute, None)
        freq[value] += int(getattr(log, second_attr, 1)) if second_attr else 1
    
    if not freq:
        return None
    
    most_common = max(freq.items(), key=lambda x: x[1])

    if return_pair:
        return most_common
    if return_count:
        return most_common[1]
    return most_common[0]

def set_data(data, attribute, value):
    data[attribute] = value