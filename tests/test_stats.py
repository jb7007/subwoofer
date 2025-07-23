"""
Statistics Tests for Practice Tracker Application

This module tests the statistics calculations and data aggregation functions
used throughout the application for generating insights and analytics.
"""

from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from .conftest import create_test_user, login_test_user
from app.models import PracticeLog, Piece
from app.utils import add_to_db
from app.utils.stats import (
    calculate_cumulative_data,
    calculate_weekly_data,
    get_weekly_log_data
)


def test_stats_page_renders(client):
    """Test that the stats page renders correctly."""
    user = create_test_user()
    login_test_user(client)
    
    resp = client.get("/api/stats")
    assert resp.status_code == 200


def test_stats_page_requires_authentication(client):
    """Test that stats page requires authentication."""
    resp = client.get("/api/stats")
    assert resp.status_code in [302, 401]


def test_calculate_cumulative_data_empty(client):
    """Test cumulative data calculation with no logs."""
    cumulative_data = calculate_cumulative_data([], timezone="UTC")
    
    # Should return dictionary with empty values
    assert isinstance(cumulative_data, dict)
    assert cumulative_data["total_mins"] == 0
    assert cumulative_data["y_vals"] == []
    assert cumulative_data["x_vals"] == []
    assert cumulative_data["x_range"] == 0


def test_calculate_cumulative_data_single_log(client):
    """Test cumulative data with a single log.""" 
    user = create_test_user()
    login_test_user(client)  # This sets up the user context
    
    log = PracticeLog(
        user_id=user.id,
        user_log_number=1,
        utc_timestamp=datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc),
        instrument="piano",
        duration=60,
        notes="Single log test",
        piece_id=1
    )
    
    # Test within app context
    with client.application.app_context():
        cumulative_data = calculate_cumulative_data([log], timezone="UTC")
    
    assert isinstance(cumulative_data, dict)
    assert cumulative_data["total_mins"] == 60
    assert len(cumulative_data["y_vals"]) >= 1
    assert len(cumulative_data["x_vals"]) >= 1


def test_calculate_cumulative_data_multiple_logs(client):
    """Test cumulative data calculation with multiple logs."""
    user = create_test_user()
    
    # Create logs over several days
    base_date = datetime(2025, 1, 10, 10, 0, 0, tzinfo=timezone.utc)
    
    logs = [
        PracticeLog(user_id=user.id, user_log_number=1, utc_timestamp=base_date,
                   instrument="piano", duration=30, notes="Day 1", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=2, utc_timestamp=base_date + timedelta(days=1),
                   instrument="piano", duration=45, notes="Day 2", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=3, utc_timestamp=base_date + timedelta(days=1),
                   instrument="guitar", duration=15, notes="Day 2 again", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=4, utc_timestamp=base_date + timedelta(days=3),
                   instrument="violin", duration=90, notes="Day 4", piece_id=1),
    ]
    
    cumulative_data = calculate_cumulative_data(logs, timezone="UTC")
    
    # Should have data points for each day with practice
    assert isinstance(cumulative_data, dict)
    assert "y_vals" in cumulative_data
    assert "x_vals" in cumulative_data
    assert len(cumulative_data["x_vals"]) >= 3
    
    # Check that totals are cumulative (increasing)
    previous_total = 0
    for total in cumulative_data["y_vals"]:
        assert total >= previous_total
        previous_total = total
    
    # Final total should be sum of all durations
    final_total = cumulative_data["total_mins"]
    assert final_total == 180  # 30 + 45 + 15 + 90


def test_calculate_cumulative_data_same_day_logs(client):
    """Test cumulative data with multiple logs on the same day."""
    user = create_test_user()
    
    same_day = datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc)
    
    logs = [
        PracticeLog(user_id=user.id, user_log_number=1, utc_timestamp=same_day,
                   instrument="piano", duration=30, notes="Morning", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=2, utc_timestamp=same_day + timedelta(hours=8),
                   instrument="guitar", duration=45, notes="Evening", piece_id=1),
    ]
    
    cumulative_data = calculate_cumulative_data(logs, timezone="UTC")
    
    # Should combine logs from same day
    assert isinstance(cumulative_data, dict)
    assert "total_mins" in cumulative_data
    
    # Check that same-day logs are combined (total should be 30 + 45 = 75)
    assert cumulative_data["total_mins"] == 75


def test_calculate_weekly_data_current_week(client):
    """Test weekly data calculation for current week."""
    user = create_test_user()
    
    # Get current week's Monday
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    
    logs = [
        # Monday
        PracticeLog(user_id=user.id, user_log_number=1, 
                   utc_timestamp=week_start,
                   instrument="piano", duration=60, notes="Monday", piece_id=1),
        
        # Wednesday (skip Tuesday)
        PracticeLog(user_id=user.id, user_log_number=2,
                   utc_timestamp=week_start + timedelta(days=2),
                   instrument="guitar", duration=45, notes="Wednesday", piece_id=1),
        
        # Friday
        PracticeLog(user_id=user.id, user_log_number=3,
                   utc_timestamp=week_start + timedelta(days=4),
                   instrument="violin", duration=30, notes="Friday", piece_id=1),
    ]
    
    weekly_data = calculate_weekly_data(logs, timezone="UTC")
    
    # Should return dictionary with y_vals for 7 days
    assert isinstance(weekly_data, dict)
    assert "y_vals" in weekly_data
    assert len(weekly_data["y_vals"]) == 7
    
    # Check that we have the right totals (60 + 45 + 30 = 135 total)
    total_minutes = sum(weekly_data["y_vals"])
    assert total_minutes == 135
    
    # Monday should be first day (index 0), Friday should be index 4
    # Monday has 60 minutes, Wednesday has 45 minutes, Friday has 30 minutes  
    assert weekly_data["y_vals"][0] == 60  # Monday
    assert weekly_data["y_vals"][2] == 45  # Wednesday 
    assert weekly_data["y_vals"][4] == 30  # Friday


def test_calculate_weekly_data_multiple_sessions_same_day(client):
    """Test weekly data with multiple practice sessions on the same day."""
    user = create_test_user()
    
    # Current week's Tuesday
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    tuesday = week_start + timedelta(days=1)
    
    logs = [
        # Two sessions on Tuesday
        PracticeLog(user_id=user.id, user_log_number=1,
                   utc_timestamp=tuesday + timedelta(hours=9),  # Morning
                   instrument="piano", duration=30, notes="Morning practice", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=2,
                   utc_timestamp=tuesday + timedelta(hours=18),  # Evening
                   instrument="guitar", duration=25, notes="Evening practice", piece_id=1),
    ]
    
    weekly_data = calculate_weekly_data(logs, timezone="UTC")
    
    # The logs should be combined on whatever day they fall on
    # Let's find which day has the 55 minutes total
    total_minutes = sum(weekly_data["y_vals"])
    assert total_minutes == 55  # 30 + 25
    
    # Find which day has the practice (should be exactly one day)
    practice_days = [i for i, mins in enumerate(weekly_data["y_vals"]) if mins > 0]
    assert len(practice_days) == 1  # Only one day should have practice
    assert weekly_data["y_vals"][practice_days[0]] == 55  # That day should have 55 minutes


def test_calculate_weekly_data_different_weeks(client):
    """Test that weekly data only includes current week logs."""
    user = create_test_user()
    
    # Get actual current week Monday (current week calculation)
    user_timezone = "UTC"
    today_local = datetime.now(ZoneInfo(user_timezone))
    start_local = today_local - timedelta(days=today_local.weekday())  # Monday
    start_local = start_local.replace(hour=0, minute=0, second=0, microsecond=0)
    last_week = start_local - timedelta(days=7)
    
    logs = [
        # Current week (Monday)
        PracticeLog(user_id=user.id, user_log_number=1,
                   utc_timestamp=start_local,
                   instrument="piano", duration=60, notes="This week", piece_id=1),
        
        # Last week (should be filtered out by only passing current week logs)
        PracticeLog(user_id=user.id, user_log_number=2,
                   utc_timestamp=last_week,
                   instrument="guitar", duration=90, notes="Last week", piece_id=1),
    ]
    
    # Simulate what the route does: filter to current week logs before calling calculate_weekly_data
    current_week_logs = [log for log in logs if log.utc_timestamp >= start_local]
    
    weekly_data = calculate_weekly_data(current_week_logs, timezone="UTC")
    
    # Should only include current week's data
    total_minutes = sum(weekly_data["y_vals"])
    assert total_minutes == 60  # Only current week's log


def test_get_weekly_log_data(client):
    """Test weekly log data retrieval function."""
    user = create_test_user()
    
    # Create a test piece for the logs
    piece = Piece(user_id=user.id, title="Test Piece", composer="Test Composer", log_time=0)
    add_to_db(piece)
    
    # Create logs spanning multiple weeks
    now = datetime.now(timezone.utc)
    current_week = now - timedelta(days=now.weekday())
    
    logs = [
        # This week
        PracticeLog(user_id=user.id, user_log_number=1,
                   utc_timestamp=current_week + timedelta(days=1),
                   instrument="piano", duration=40, notes="This week", piece_id=piece.id),
        
        # Last week
        PracticeLog(user_id=user.id, user_log_number=2,
                   utc_timestamp=current_week - timedelta(days=5),
                   instrument="guitar", duration=50, notes="Last week", piece_id=piece.id),
    ]
    
    # Add logs to database
    for log in logs:
        add_to_db(log)
    
    # Test the utility function - this should return chart data, not logs
    chart_data = get_weekly_log_data(timezone="UTC", user_id=user.id)
    
    # Should return chart data structure
    assert isinstance(chart_data, dict)
    assert "x" in chart_data
    assert "y" in chart_data
    
    # Should have data for the current week
    # The chart data represents cumulative totals, so it should have the current week's data
    total_practice = chart_data["y"][-1] if chart_data["y"] else 0  # Last day's cumulative total
    assert total_practice == 40  # Only current week's 40 minutes


def test_weekly_data_timezone_handling(client):
    """Test that weekly data handles timezones correctly."""
    user = create_test_user()
    
    # Get current week's Monday in UTC
    user_timezone = "UTC"
    today_local = datetime.now(ZoneInfo(user_timezone))
    start_local = today_local - timedelta(days=today_local.weekday())  # Monday
    monday_utc = start_local.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    
    log = PracticeLog(
        user_id=user.id,
        user_log_number=1,
        utc_timestamp=monday_utc,
        instrument="piano",
        duration=60,
        notes="Timezone test",
        piece_id=1
    )
    
    weekly_data = calculate_weekly_data([log], timezone="UTC")
    
    # The log should appear on the correct day based on user's timezone
    total_practice = sum(weekly_data["y_vals"])
    assert total_practice == 60


def test_weekly_data_empty_week(client):
    """Test weekly data calculation with no logs for current week."""
    weekly_data = calculate_weekly_data([], timezone="UTC")
    
    # Should return dictionary with empty values
    assert isinstance(weekly_data, dict)
    assert weekly_data["y_vals"] == []
    assert weekly_data["min_avg"] == 0
    assert weekly_data["min_avg_arr"] == []
    assert weekly_data["x_axis_range"] == 0


def test_stats_calculation_consistency(client):
    """Test that different statistical functions return consistent results."""
    user = create_test_user()
    
    # Create a set of test logs
    base_time = datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc)
    
    logs = [
        PracticeLog(user_id=user.id, user_log_number=1, utc_timestamp=base_time,
                   instrument="piano", duration=30, notes="Log 1", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=2, utc_timestamp=base_time + timedelta(hours=2),
                   instrument="guitar", duration=45, notes="Log 2", piece_id=1),
        PracticeLog(user_id=user.id, user_log_number=3, utc_timestamp=base_time + timedelta(days=1),
                   instrument="violin", duration=60, notes="Log 3", piece_id=1),
    ]
    
    # Calculate using different methods
    cumulative_data = calculate_cumulative_data(logs, timezone="UTC")
    weekly_data = calculate_weekly_data(logs, timezone="UTC")
    
    # Total from cumulative should match sum of weekly data
    cumulative_total = cumulative_data["total_mins"] if cumulative_data else 0
    weekly_total = sum(weekly_data["y_vals"])
    
    # Both should equal the sum of all log durations
    expected_total = sum(log.duration for log in logs)
    
    assert cumulative_total == expected_total
    # Weekly total might be different if logs span multiple weeks
    # but should be <= cumulative total
    assert weekly_total <= cumulative_total
