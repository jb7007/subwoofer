from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional
from zoneinfo import ZoneInfo

from flask_login import current_user
from app.models import PracticeLog
from app.utils.query import get_this_week_logs
from app.utils.time import get_today_local

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

def calculate_cumulative_data(logs):
    """Calculate cumulative practice data for the total minutes chart."""
    if not logs:
        return {"total_mins": 0, "y_vals": [], "x_vals": [], "x_range": 0}
    
    # Convert UTC timestamps to local dates for sorting and grouping
    log_dates = {}
    for log in logs:
        local_date = log.utc_timestamp.astimezone(ZoneInfo(current_user.timezone)).date().isoformat()
        if local_date not in log_dates:
            log_dates[local_date] = []
        log_dates[local_date].append(log)
    
    # Get sorted unique dates
    sorted_dates = sorted(log_dates.keys())
    if not sorted_dates:
        return {"total_mins": 0, "y_vals": [], "x_vals": [], "x_range": 0}
    
    # Get date range from first log to today
    start_date = datetime.strptime(sorted_dates[0], "%Y-%m-%d")
    end_date = datetime.now(ZoneInfo(current_user.timezone)).date()
    current = start_date
    
    total_mins = 0
    x_vals = []
    y_vals = []
    
    # Calculate cumulative totals
    while current.date() <= end_date:
        date_str = current.date().isoformat()
        day_logs = log_dates.get(date_str, [])
        day_mins = sum(log.duration for log in day_logs)
        total_mins += day_mins
        
        x_vals.append(date_str)
        y_vals.append(total_mins)
        
        current += timedelta(days=1)
    
    return {
        "total_mins": total_mins,
        "y_vals": y_vals,
        "x_vals": x_vals,
        "x_range": len(x_vals)
    }

def calculate_weekly_data(logs):
    """Calculate weekly practice data for the average chart."""
    if not logs:
        return {"y_vals": [], "min_avg": 0, "min_avg_arr": [], "x_axis_range": 0}
    
    # Get the week's dates in local timezone
    today_local = datetime.now(ZoneInfo(current_user.timezone))
    start_local = today_local - timedelta(days=today_local.weekday())
    start_local = start_local.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Generate all dates for the week
    days = []
    daily_totals = {}
    current = start_local
    
    # Initialize all days with 0 minutes
    while len(days) < 7:
        date_str = current.date().isoformat()
        days.append(date_str)
        daily_totals[date_str] = 0
        current += timedelta(days=1)
    
    # Calculate daily totals
    for log in logs:
        log_date = log.utc_timestamp.astimezone(ZoneInfo(current_user.timezone)).date().isoformat()
        if log_date in daily_totals:
            daily_totals[log_date] += log.duration
    
    # Convert to array for plotting
    y_vals = [daily_totals[day] for day in days]
    
    # Calculate average only if there are values > 0
    practice_days = sum(1 for v in y_vals if v > 0)
    min_avg = sum(y_vals) / practice_days if practice_days > 0 else 0
    
    return {
        "y_vals": y_vals,
        "min_avg": min_avg,
        "min_avg_arr": [min_avg] * len(days),
        "x_axis_range": len(days) - 1
    }