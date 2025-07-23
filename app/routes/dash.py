"""
Dashboard Blueprint for Practice Tracker Application

This module handles both the dashboard page rendering and the API endpoints
that provide dashboard statistics and graph data for the frontend charts.
All graph calculations are performed server-side for consistency and performance.
"""

from flask import Blueprint, jsonify, render_template
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Import utility functions for data retrieval and calculations
from app.utils import (
    get_total_log_mins,    # Get total practice minutes for user
    get_today_log_mins,    # Get today's practice minutes
    get_avg_log_mins,      # Calculate average practice time
    get_most_frequent,     # Find most frequent instrument/piece
    get_logs_from,         # Get all logs for a user
    get_this_week_logs     # Get current week's logs
)
from app.utils.formatting import get_instrument_name  # Format instrument names
from app.utils.stats import calculate_cumulative_data, calculate_weekly_data  # Graph calculations

# Create blueprint for dashboard routes
dash_bp = Blueprint("dash", __name__)

@dash_bp.route("/dashboard")
@login_required
def dashboard():
    """
    Render the main dashboard page.
    
    This route serves the dashboard HTML template with the current date
    and user information. The actual chart data is loaded asynchronously
    via the /api/dashboard/stats endpoint.
    
    Returns:
        Rendered dashboard.html template with user context and formatted date
    """
    # Format current date for display (e.g., "January 15, 2025")
    date = datetime.now().strftime("%B %d, %Y")
    return render_template("dashboard.html", user=current_user, date=date)


@dash_bp.route("/api/dashboard/stats")
@login_required
def get_dashboard_stats():
    """
    API endpoint to retrieve all dashboard statistics and chart data.
    
    This endpoint consolidates all dashboard data into a single API call to minimize
    frontend requests. It provides data for:
    - Cumulative practice time chart (all-time progress)
    - Weekly practice chart (current week's daily totals)
    - Daily practice gauge (today's progress vs target)
    - Summary statistics (totals, averages, most frequent items)
    
    All calculations are performed server-side with proper timezone handling
    to ensure consistency across different user timezones.
    
    Returns:
        JSON response containing:
        - cumulative: Data for the all-time cumulative chart
        - weekly: Data for the current week's daily practice chart  
        - daily: Today's minutes and target for the gauge
        - Statistics: Total minutes, averages, most frequent instrument/piece
    """
    # Retrieve all user's practice logs for lifetime statistics
    all_logs = get_logs_from(current_user)
    
    # Get only this week's logs for weekly chart (more efficient than filtering all logs)
    weekly_logs = get_this_week_logs()
    
    # Safely extract the most frequent piece title, handling None case
    most_frequent_piece = get_most_frequent(all_logs, attr="piece")
    piece_title = most_frequent_piece.title if most_frequent_piece else None
    
    # Return structured JSON data for frontend consumption
    return jsonify({
        # Chart data (calculated server-side for consistency)
        "cumulative": calculate_cumulative_data(all_logs),  # All-time progress chart
        "weekly": calculate_weekly_data(weekly_logs),        # Current week daily totals
        
        # Daily practice gauge data
        "daily": {
            "total_today": get_today_log_mins(all_logs) or 0,  # Today's practice time
            "target": 60  # Daily target in minutes (could be user-configurable)
        },
        
        # Summary statistics for dashboard metrics
        "common_instrument": get_instrument_name(get_most_frequent(all_logs, attr="instrument")) or "None",
        "total_minutes": get_total_log_mins(all_logs) or 0,      # Lifetime total
        "average_minutes": get_avg_log_mins(all_logs) or 0,      # Average per session
        "common_piece": piece_title  # Most frequently practiced piece
    })

