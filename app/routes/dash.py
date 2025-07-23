from flask import Blueprint, jsonify
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

dash_bp = Blueprint("dash", __name__)

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

