"""
Dashboard Route Tests for Practice Tracker Application

This module tests the dashboard functionality including the main dashboard page,
dashboard statistics API endpoint, and data calculations performed server-side.
"""

from datetime import datetime, timezone, timedelta
from .conftest import create_test_user, login_test_user
from app.models import PracticeLog, Piece
from app.utils import add_to_db


def test_dashboard_page_renders(client):
    """Test that the dashboard page renders correctly for logged-in users."""
    user = create_test_user()
    login_test_user(client)
    
    resp = client.get("/dashboard")
    assert resp.status_code == 200
    assert b"Dashboard" in resp.data or b"dashboard" in resp.data


def test_dashboard_page_requires_login(client):
    """Test that dashboard page redirects unauthenticated users."""
    resp = client.get("/dashboard")
    # Should redirect to login page
    assert resp.status_code == 302 or resp.status_code == 401


def test_dashboard_stats_api_requires_login(client):
    """Test that dashboard stats API requires authentication."""
    resp = client.get("/api/dashboard/stats")
    # Should redirect to login page or return 401
    assert resp.status_code == 302 or resp.status_code == 401


def test_dashboard_stats_api_empty_data(client):
    """Test dashboard stats API with no practice logs."""
    user = create_test_user()
    login_test_user(client)
    
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    
    data = resp.get_json()
    
    # Check that all required fields are present
    assert "cumulative" in data
    assert "weekly" in data
    assert "daily" in data
    assert "common_instrument" in data
    assert "total_minutes" in data
    assert "average_minutes" in data
    assert "common_piece" in data
    
    # Check default values for empty data
    assert data["total_minutes"] == 0
    assert data["average_minutes"] == 0
    assert data["daily"]["total_today"] == 0
    assert data["daily"]["target"] == 60
    assert data["common_instrument"] == "Unlisted"
    assert data["common_piece"] is None


def test_dashboard_stats_api_with_data(client):
    """Test dashboard stats API with sample practice logs."""
    user = create_test_user()
    login_test_user(client)
    
    # Create some test practice logs - use current time so "today" calculations work
    base_time = datetime.now(timezone.utc).replace(hour=10, minute=0, second=0, microsecond=0)
    
    # Create logs for different days
    logs_data = [
        {"day_offset": 0, "duration": 45, "instrument": "piano", "piece": "Moonlight Sonata", "composer": "Beethoven"},
        {"day_offset": 0, "duration": 30, "instrument": "guitar", "piece": "Spanish Romance", "composer": "Anonymous"},
        {"day_offset": 1, "duration": 60, "instrument": "piano", "piece": "Moonlight Sonata", "composer": "Beethoven"},
        {"day_offset": 2, "duration": 40, "instrument": "violin", "piece": "Four Seasons", "composer": "Vivaldi"},
    ]
    
    for i, log_data in enumerate(logs_data):
        log_time = base_time - timedelta(days=log_data["day_offset"])
        
        # Create piece if it doesn't exist
        piece = Piece(
            title=log_data["piece"],
            composer=log_data["composer"],
            user_id=user.id,
            log_time=log_data["duration"]
        )
        add_to_db(piece)
        
        # Create practice log
        log = PracticeLog(
            user_id=user.id,
            user_log_number=i + 1,
            utc_timestamp=log_time,
            instrument=log_data["instrument"],
            duration=log_data["duration"],
            notes="Test notes",
            piece_id=piece.id
        )
        add_to_db(log)
    
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    
    data = resp.get_json()
    
    # Check calculated statistics
    assert data["total_minutes"] == 175  # Sum of all durations
    assert data["average_minutes"] == 43.75  # 175 / 4 logs
    assert data["common_instrument"] == "Piano"  # Most frequent (2 logs)
    assert data["common_piece"] == "Moonlight Sonata"  # Most frequent piece
    
    # Check daily data (should include today's logs - logs with day_offset 0)
    assert data["daily"]["total_today"] == 75  # 45 + 30 from today
    assert data["daily"]["target"] == 60
    
    # Check that chart data is present
    assert "cumulative" in data
    assert "weekly" in data
    assert isinstance(data["cumulative"], dict)
    assert isinstance(data["weekly"], dict)


def test_dashboard_stats_with_single_log(client):
    """Test dashboard stats with a single practice log."""
    user = create_test_user()
    login_test_user(client)
    
    # Create a single test log
    piece = Piece(title="Test Piece", composer="Test Composer", user_id=user.id, log_time=30)
    add_to_db(piece)
    
    log = PracticeLog(
        user_id=user.id,
        user_log_number=1,
        utc_timestamp=datetime.now(timezone.utc),
        instrument="piano",
        duration=30,
        notes="Single test log",
        piece_id=piece.id
    )
    add_to_db(log)
    
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    
    data = resp.get_json()
    
    # Check statistics with single log
    assert data["total_minutes"] == 30
    assert data["average_minutes"] == 30
    assert data["common_instrument"] == "Piano"
    assert data["common_piece"] == "Test Piece"


def test_dashboard_stats_timezone_handling(client):
    """Test that dashboard stats properly handle timezone calculations."""
    user = create_test_user()  # User has America/New_York timezone
    login_test_user(client)
    
    # Create a log with a specific UTC time that should be "today" in EST
    # 6 AM UTC = 1 AM EST (same day)
    utc_time = datetime.now(timezone.utc).replace(hour=6, minute=0, second=0, microsecond=0)
    
    piece = Piece(title="Morning Practice", composer="Test", user_id=user.id, log_time=45)
    add_to_db(piece)
    
    log = PracticeLog(
        user_id=user.id,
        user_log_number=1,
        utc_timestamp=utc_time,
        instrument="piano",
        duration=45,
        notes="Timezone test",
        piece_id=piece.id
    )
    add_to_db(log)
    
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    
    data = resp.get_json()
    
    # Should include this log in "today's" total since it's the same day in user's timezone
    assert data["daily"]["total_today"] > 0
    assert data["total_minutes"] == 45


def test_dashboard_api_response_structure(client):
    """Test that the dashboard API returns properly structured JSON."""
    user = create_test_user()
    login_test_user(client)
    
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    assert resp.content_type == "application/json"
    
    data = resp.get_json()
    
    # Verify response structure
    required_keys = ["cumulative", "weekly", "daily", "common_instrument", 
                    "total_minutes", "average_minutes", "common_piece"]
    
    for key in required_keys:
        assert key in data, f"Missing required key: {key}"
    
    # Verify daily structure
    daily_keys = ["total_today", "target"]
    for key in daily_keys:
        assert key in data["daily"], f"Missing daily key: {key}"
    
    # Verify data types
    assert isinstance(data["total_minutes"], (int, float))
    assert isinstance(data["average_minutes"], (int, float))
    assert isinstance(data["daily"]["total_today"], (int, float))
    assert isinstance(data["daily"]["target"], int)
    assert isinstance(data["common_instrument"], (str, type(None)))
    assert isinstance(data["common_piece"], (str, type(None)))
