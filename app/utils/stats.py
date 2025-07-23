"""
Statistics and Data Processing Utilities for Practice Tracker

This module contains functions for calculating practice statistics, aggregating
practice data, and preparing chart data for the dashboard. All functions handle
timezone conversion properly to ensure data accuracy across different user timezones.

Key Functions:
- Statistical calculations: totals, averages, most frequent items
- Chart data preparation: cumulative and weekly practice charts
- Time-aware aggregations: daily, weekly, and all-time summaries

Dependencies:
- Timezone handling via ZoneInfo for accurate local time calculations
- Flask-Login for current user context and timezone preferences
- Counter for efficient frequency calculations
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional
from zoneinfo import ZoneInfo

from flask_login import current_user
from app.models import PracticeLog
from app.utils.query import get_this_week_logs
from app.utils.time import get_today_local

def get_weekly_log_data():
    """
    Calculate weekly practice data with cumulative daily totals.
    
    This function generates data for a weekly practice chart showing cumulative
    practice time throughout the week. Each day shows the running total of 
    practice minutes from Monday to that day.
    
    Returns:
        dict: Contains chart data with:
            - x: Day abbreviations (Mon, Tue, Wed, etc.)
            - y: Cumulative practice minutes for each day
            - avg_arr: Average daily practice repeated for all days
            - x_bounds: Chart bounds for x-axis display
    """
    # Get current week's practice logs
    weekly_logs = get_this_week_logs()
    
    # Calculate start of week in user's local timezone (Monday)
    now_local = get_today_local(current_user.timezone)
    start_local = now_local - timedelta(days=now_local.weekday())
    
    # Group logs by day of week (0=Monday, 6=Sunday)
    daily_totals = defaultdict(int)
    for log in weekly_logs:
        # Convert UTC timestamp to user's local timezone for accurate day calculation
        log_local_date = log.utc_timestamp.astimezone(ZoneInfo(current_user.timezone)).date()
        day_index = (log_local_date - start_local.date()).days
        
        # Only include logs from this week (0-6 day range)
        if 0 <= day_index <= 6:
            daily_totals[day_index] += log.duration

    # Calculate cumulative totals and prepare chart data
    y_vals = []
    x_vals = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    running_total = 0

    # Build cumulative totals for each day of the week
    for i in range(7):
        running_total += daily_totals[i]  # Add today's practice to running total
        y_vals.append(running_total)
        
    return {
        "x": x_vals,
        "y": y_vals,
        "avg_arr": [round(sum(y_vals) / 7, 2)] * 7,  # Average line for comparison
        "x_bounds": [0, 6],
    }


def get_total_log_mins(logs: list) -> int:
    """
    Calculate total practice minutes from a list of practice logs.
    
    Args:
        logs: List of PracticeLog objects
        
    Returns:
        int: Sum of all practice minutes across the provided logs
    """
    return sum(log.duration for log in logs)


def get_today_log_mins(logs: list) -> int:
    """
    Calculate total practice minutes logged today in the user's timezone.
    
    This function filters logs to only include those from today (in the user's
    local timezone) and sums their durations.
    
    Args:
        logs: List of PracticeLog objects to filter and sum
        
    Returns:
        int: Total minutes practiced today in user's local timezone
    """
    # Get today's date in user's timezone (not UTC)
    today = datetime.now(tz=ZoneInfo(current_user.timezone)).date()
    
    # Filter logs to only include today's sessions
    today_logs = [log for log in logs if log.utc_timestamp.date() == today]
    
    # Sum the durations of today's practice sessions
    return get_total_log_mins(today_logs)

def get_avg_log_mins(logs: list, round_val: int=None) -> float:
    """
    Calculate average practice minutes per session from a list of logs.
    
    Args:
        logs: List of PracticeLog objects
        round_val: Optional number of decimal places to round to
        
    Returns:
        float: Average minutes per practice session, optionally rounded
    """
    total = get_total_log_mins(logs)
    avg = total / len(logs) if logs else 0  # Avoid division by zero
    return round(avg, round_val) if round_val is not None else avg


def get_most_frequent(
    logs: List,
    *,
    attr: str,
    weight_attr: Optional[str] = None,
    mode: str = "value"  # one of "value", "count", or "pair"
) -> Any:
    """
    Find the most frequent attribute value across practice logs.
    
    This function can find the most frequent instrument, piece, or any other
    attribute from practice logs. It supports weighted counting (e.g., by duration)
    and different return modes for flexibility.
    
    Args:
        logs: List of PracticeLog objects to analyze
        attr: Name of the attribute to count (e.g., "instrument", "piece")
        weight_attr: Optional attribute to use as weight (e.g., "duration")
        mode: Return format - "value", "count", or "pair"
        
    Returns:
        - mode="value": The most frequent attribute value
        - mode="count": The count/weight of the most frequent item
        - mode="pair": Tuple of (value, count)
        - None if no logs provided
        
    Examples:
        get_most_frequent(logs, attr="instrument") -> "Piano"
        get_most_frequent(logs, attr="piece", weight_attr="duration") -> "Chopin Etude"
        get_most_frequent(logs, attr="instrument", mode="pair") -> ("Piano", 5)
    """
    counter = Counter()
    
    # Count occurrences, optionally weighted by another attribute
    for log in logs:
        key = getattr(log, attr, None)  # Get the attribute value
        weight = getattr(log, weight_attr, 1) if weight_attr else 1  # Use weight or default to 1
        counter[key] += weight

    if not counter:
        return None

    # Get the most common item
    value, cnt = counter.most_common(1)[0]

    # Return based on requested mode
    if mode == "count":
        return cnt
    if mode == "pair":
        return (value, cnt)
    return value  # default "value" mode

def calculate_cumulative_data(logs):
    """
    Calculate cumulative practice data for the all-time progress chart.
    
    This function processes all practice logs to create a timeline showing
    the cumulative total of practice minutes over time. Each day shows the
    running total from the first practice session to that date.
    
    Args:
        logs: List of PracticeLog objects to process
        
    Returns:
        dict: Chart data containing:
            - total_mins: Grand total of all practice minutes
            - y_vals: Cumulative minutes for each day
            - x_vals: Date strings for each data point
            - x_range: Number of data points for chart sizing
    """
    if not logs:
        return {"total_mins": 0, "y_vals": [], "x_vals": [], "x_range": 0}
    
    # Group logs by date in user's local timezone
    log_dates = {}
    for log in logs:
        # Convert UTC timestamp to user's local date for accurate grouping
        local_date = log.utc_timestamp.astimezone(ZoneInfo(current_user.timezone)).date().isoformat()
        if local_date not in log_dates:
            log_dates[local_date] = []
        log_dates[local_date].append(log)
    
    # Get chronologically sorted dates
    sorted_dates = sorted(log_dates.keys())
    if not sorted_dates:
        return {"total_mins": 0, "y_vals": [], "x_vals": [], "x_range": 0}
    
    # Calculate date range from first practice session to today
    start_date = datetime.strptime(sorted_dates[0], "%Y-%m-%d")
    end_date = datetime.now(ZoneInfo(current_user.timezone)).date()
    current = start_date
    
    # Build cumulative totals for each day in the range
    total_mins = 0
    x_vals = []
    y_vals = []
    
    # Iterate through each day from first practice to today
    while current.date() <= end_date:
        date_str = current.date().isoformat()
        
        # Get practice logs for this day (if any)
        day_logs = log_dates.get(date_str, [])
        day_mins = sum(log.duration for log in day_logs)
        
        # Add today's minutes to running total
        total_mins += day_mins
        
        # Store data point for chart
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
    """
    Calculate weekly practice data for the current week's daily practice chart.
    
    This function generates data for a bar chart showing practice minutes
    for each day of the current week (Monday through Sunday). It includes
    an average line for comparison and handles days with no practice.
    
    Args:
        logs: List of PracticeLog objects for the current week
        
    Returns:
        dict: Chart data containing:
            - y_vals: Practice minutes for each day of the week
            - min_avg: Average daily practice time for days with practice
            - min_avg_arr: Average value repeated for all days (for chart line)
            - x_axis_range: Range for x-axis display (0-6 for 7 days)
    """
    if not logs:
        return {"y_vals": [], "min_avg": 0, "min_avg_arr": [], "x_axis_range": 0}
    
    # Calculate the start of the current week in user's local timezone
    today_local = datetime.now(ZoneInfo(current_user.timezone))
    start_local = today_local - timedelta(days=today_local.weekday())  # Monday
    start_local = start_local.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Generate all 7 days of the current week
    days = []
    daily_totals = {}
    current = start_local
    
    # Initialize all days of the week with 0 minutes
    while len(days) < 7:
        date_str = current.date().isoformat()
        days.append(date_str)
        daily_totals[date_str] = 0  # Default to 0 for days with no practice
        current += timedelta(days=1)
    
    # Calculate actual practice totals for each day
    for log in logs:
        # Convert UTC timestamp to user's local date
        log_date = log.utc_timestamp.astimezone(ZoneInfo(current_user.timezone)).date().isoformat()
        
        # Only include logs from this week
        if log_date in daily_totals:
            daily_totals[log_date] += log.duration
    
    # Convert daily totals to array for chart display
    y_vals = [daily_totals[day] for day in days]
    
    # Calculate average for days that had practice (exclude 0 days)
    practice_days = sum(1 for v in y_vals if v > 0)
    min_avg = sum(y_vals) / practice_days if practice_days > 0 else 0
    
    return {
        "y_vals": y_vals,                    # Daily practice minutes
        "min_avg": min_avg,                  # Average for days with practice
        "min_avg_arr": [min_avg] * len(days), # Average line for chart
        "x_axis_range": len(days) - 1        # Chart x-axis range (0-6)
    }