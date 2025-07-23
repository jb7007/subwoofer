from datetime import datetime, timedelta, timezone
from app.models import PracticeLog
from flask_login import current_user
from app.utils.time import get_today_local
from zoneinfo import ZoneInfo

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

def get_today_logs() -> list:
    """
    Get all PracticeLog entries for the current user from today.
    Uses the user's timezone to determine "today".
    """
    today = datetime.now(tz=ZoneInfo(current_user.timezone)).date()
    return (
        PracticeLog.query
        .filter_by(user_id=current_user.id)
        .filter(PracticeLog.utc_timestamp >= today)
        .all()
    )

def get_last_log_from(user) -> PracticeLog | None:
    """Get the most recent PracticeLog for a given user."""
    return (
        PracticeLog.query
        .filter_by(user_id=user.id)
        .order_by(PracticeLog.user_log_number.desc())
        .first()
    )


def get_first_log(return_date: bool=False):
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
        return first.utc_timestamp
    return first


def get_this_week_logs():
    now_local = get_today_local(current_user.timezone)
    
    start_local = now_local - timedelta(days=now_local.weekday())
    start_local = start_local.replace(hour=0, minute=0, second=0, microsecond=0)
    
    end_local = start_local + timedelta(days=7)
    
    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)
    
    weekly_logs = (
        PracticeLog.query
        .filter_by(user_id=current_user.id)
        .filter(PracticeLog.utc_timestamp >= start_utc, PracticeLog.utc_timestamp < end_utc)
        .all()
    )
    
    return weekly_logs