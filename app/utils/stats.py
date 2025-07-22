from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional
from zoneinfo import ZoneInfo

from flask_login import current_user
from app.models import PracticeLog
from app.utils.time import get_today_local


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

def get_weekly_log_data():
    weekly_logs = get_this_week_logs()
    now_local = get_today_local(current_user.timezone)
    start_local = now_local - timedelta(days=now_local.weekday())
    
    daily_totals = defaultdict(int)
    for log in weekly_logs:
        log_local_date = log.utc_timestamp.astimezone(ZoneInfo(current_user.timezone)).date()
        day_index = (log_local_date - start_local.date()).days
        if 0 <= day_index <= 6:
            daily_totals[day_index] += log.duration

    
    y_vals = []
    x_vals = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    running_total = 0

    for i in range(7):
        running_total += daily_totals[i]
        y_vals.append(running_total)
        
    return {
        "x": x_vals,
        "y": y_vals,
        "avg_arr": [round(sum(y_vals) / 7, 2)] * 7,
        "x_bounds": [0, 6],
    }

def get_total_log_mins(logs: list) -> int:
    """Sum durations of a list of logs."""
    return sum(log.duration for log in logs)

def get_today_log_mins(logs: list) -> int:
    """
    Calculate total minutes logged today.
    Uses the user's timezone to determine "today".
    """
    today = datetime.now(tz=ZoneInfo(current_user.timezone)).date()
    today_logs = [log for log in logs if log.utc_timestamp.date() == today]
    return get_total_log_mins(today_logs)

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