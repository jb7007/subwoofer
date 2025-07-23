"""
Utility Functions Package for Practice Tracker Application

This package provides a centralized location for utility functions used
throughout the application. Functions are organized by category and imported
here for easy access from other modules.

Categories:
- auth: Authentication and verification utilities
- db: Database operations and data management
- formatting: Data formatting and serialization
- stats: Statistical calculations and data aggregation
- time: Timezone and datetime utilities
- query: Database query helpers for common operations

Usage:
    from app.utils import function_name
"""

# Authentication utilities
from .auth import verify

# Database operations
from .db import add_to_db, get_or_create_piece

# Data formatting and serialization
from .formatting import prepare_log_data, serialize_logs, get_instrument_name

# Statistical calculations
from .stats import get_weekly_log_data, get_total_log_mins, get_today_log_mins, get_avg_log_mins, get_most_frequent

# Time and timezone utilities
from .time import get_today_local, utc_now, set_as_local

# Database query helpers
from .query import get_logs, get_logs_from, get_last_log, get_last_log_from, get_first_log, get_today_logs, get_this_week_logs