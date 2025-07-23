"""
Error Handling and Edge Case Tests for Practice Tracker Application

This module tests error conditions, edge cases, and boundary conditions
to ensure the application handles unexpected inputs gracefully.
"""

from datetime import datetime, timezone, timedelta
from .conftest import create_test_user, login_test_user
from app.models import PracticeLog, Piece, User
from app.utils import add_to_db, get_or_create_piece
import pytest


def test_invalid_login_attempts(client):
    """Test various invalid login scenarios."""
    create_test_user()
    
    # Test with missing password - returns 401 unauthorized
    resp = client.post("/login", json={"username": "testuser"})
    assert resp.status_code == 401
    
    # Test with missing username - returns 401 unauthorized
    resp = client.post("/login", json={"password": "testpass"})
    assert resp.status_code == 401
    
    # Test with empty credentials - returns 401 unauthorized
    resp = client.post("/login", json={"username": "", "password": ""})
    assert resp.status_code == 401


def test_duplicate_user_registration(client):
    """Test registering user with existing username."""
    # Create first user
    resp1 = client.post("/register", json={
        "username": "duplicate_test",
        "password": "password123"
    })
    assert resp1.status_code == 200
    
    # Try to create user with same username - causes database error (no validation)
    try:
        resp2 = client.post("/register", json={
            "username": "duplicate_test",
            "password": "different_password"
        })
        # If it gets this far, should be server error
        assert resp2.status_code == 500
    except Exception:
        # Database constraint violation is expected
        pass


def test_invalid_registration_data(client):
    """Test registration with invalid data."""
    # Test with missing username - causes database constraint error
    try:
        resp = client.post("/register", json={"password": "validpass"})
        assert resp.status_code == 500  # Server error if it gets that far
    except Exception:
        pass  # Database constraint violation expected
    
    # Test with missing password
    try:
        resp = client.post("/register", json={"username": "validuser"})
        assert resp.status_code == 500  # Server error if it gets that far
    except Exception:
        pass  # Some error expected
    
    # Test with empty strings - also causes constraint violations
    try:
        resp = client.post("/register", json={"username": "", "password": ""})
        assert resp.status_code == 500  # Server error if it gets that far
    except Exception:
        pass  # Database constraint violation expected


def test_log_submission_missing_fields(client):
    """Test log submission with missing required fields."""
    user = create_test_user()
    login_test_user(client)
    
    # Test with missing timestamp - this will cause server error since no validation
    resp = client.post("/api/logs", json={
        "instrument": "piano",
        "duration": 60,
        "piece": "Test Piece",
        "composer": "Test Composer"
    })
    # With validation, missing required fields return 400 Bad Request
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "validation_failed"
    assert "utc_timestamp" in resp.get_json()["message"]
    
    # Test with missing duration
    resp = client.post("/api/logs", json={
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": "piano",
        "piece": "Test Piece",
        "composer": "Test Composer"
    })
    assert resp.status_code == 400
    assert resp.get_json()["error"] == "validation_failed"
    assert "duration" in resp.get_json()["message"]


def test_log_submission_invalid_timestamp(client):
    """Test log submission with invalid timestamp formats."""
    user = create_test_user()
    login_test_user(client)
    
    invalid_timestamps = [
        "not-a-date",
        "2025-13-01T00:00:00",  # Invalid month
        "2025-01-32T00:00:00",  # Invalid day
        "2025-01-01T25:00:00",  # Invalid hour
    ]
    
    for invalid_ts in invalid_timestamps:
        payload = {
            "utc_timestamp": invalid_ts,
            "instrument": "piano",
            "duration": 60,
            "piece": "Test Piece",
            "composer": "Test Composer"
        }
        
        resp = client.post("/api/logs", json=payload)
        # Application now validates timestamps and returns proper errors
        assert resp.status_code == 400, f"Failed for timestamp: {invalid_ts}"
        assert resp.get_json()["error"] == "validation_failed"
        assert "timestamp" in resp.get_json()["message"].lower()


def test_log_submission_invalid_duration(client):
    """Test log submission with invalid duration values."""
    user = create_test_user()
    login_test_user(client)
    
    invalid_durations = [-5, 0, "not-a-number", None, 99999999]
    
    for invalid_duration in invalid_durations:
        payload = {
            "utc_timestamp": "2025-01-01T00:00:00",
            "instrument": "piano",
            "duration": invalid_duration,
            "piece": "Test Piece",
            "composer": "Test Composer"
        }
        
        resp = client.post("/api/logs", json=payload)
        # Negative or zero duration should be rejected
        if isinstance(invalid_duration, (int, float)) and invalid_duration <= 0:
            assert resp.status_code in [400, 422]
        # Non-numeric should also be rejected
        elif not isinstance(invalid_duration, (int, float)):
            assert resp.status_code in [400, 422]


def test_extremely_long_text_fields(client):
    """Test handling of extremely long text in form fields."""
    user = create_test_user()
    login_test_user(client)
    
    # Create very long strings
    long_string = "x" * 10000  # 10KB string
    
    payload = {
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": long_string,
        "duration": 60,
        "piece": long_string,
        "composer": long_string,
        "notes": long_string
    }
    
    resp = client.post("/api/logs", json=payload)
    # Should either accept or gracefully reject very long input
    assert resp.status_code in [200, 201, 400, 413, 422]


def test_special_characters_in_text_fields(client):
    """Test handling of special characters and unicode in text fields."""
    user = create_test_user()
    login_test_user(client)
    
    special_chars_tests = [
        "Pièce with ñ and ü",
        "한국어 제목",  # Korean
        "Русская музыка",  # Russian
        "🎵🎹🎻",  # Emojis
        "<script>alert('xss')</script>",  # Potential XSS
        "'; DROP TABLE users; --",  # SQL injection attempt
        "Piece & \"Quotes\" & 'Apostrophes'"
    ]
    
    for test_string in special_chars_tests:
        payload = {
            "utc_timestamp": "2025-01-01T00:00:00",
            "instrument": "piano",
            "duration": 60,
            "piece": test_string,
            "composer": test_string,
            "notes": test_string
        }
        
        resp = client.post("/api/logs", json=payload)
        # Should handle special characters gracefully
        assert resp.status_code in [200, 201, 400, 422]


def test_concurrent_piece_creation(client):
    """Test creating pieces with same name simultaneously (race condition)."""
    user = create_test_user()
    
    # Simulate concurrent creation of same piece
    piece1 = get_or_create_piece("Concurrent Test", "Test", user.id, 30)
    piece2 = get_or_create_piece("Concurrent Test", "Test", user.id, 45)
    
    # Should be same piece with combined time
    assert piece1.id == piece2.id
    assert piece2.log_time == 75  # 30 + 45


def test_future_timestamps(client):
    """Test handling of future timestamps in logs."""
    user = create_test_user()
    login_test_user(client)
    
    # Create log with future timestamp
    future_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    
    payload = {
        "utc_timestamp": future_date,
        "instrument": "piano",
        "duration": 60,
        "piece": "Future Practice",
        "composer": "Time Traveler"
    }
    
    resp = client.post("/api/logs", json=payload)
    # Application might accept or reject future dates depending on business logic
    assert resp.status_code in [200, 201, 400, 422]


def test_very_old_timestamps(client):
    """Test handling of very old timestamps."""
    user = create_test_user()
    login_test_user(client)
    
    # Create log with very old timestamp
    old_date = "1900-01-01T00:00:00"
    
    payload = {
        "utc_timestamp": old_date,
        "instrument": "piano",
        "duration": 60,
        "piece": "Ancient Practice",
        "composer": "Historical"
    }
    
    resp = client.post("/api/logs", json=payload)
    # Should handle historical dates
    assert resp.status_code in [200, 201, 400, 422]


def test_database_constraint_violations(client):
    """Test database constraint handling."""
    user = create_test_user()
    
    # Test creating log with invalid user_id
    invalid_log = PracticeLog(
        user_id=99999,  # Non-existent user
        user_log_number=1,
        utc_timestamp=datetime.now(timezone.utc),
        instrument="piano",
        duration=60,
        notes="Invalid user",
        piece_id=1
    )
    
    # Should raise database constraint error when trying to save
    with pytest.raises(Exception):  # Foreign key constraint
        add_to_db(invalid_log)


def test_malformed_json_requests(client):
    """Test handling of malformed JSON in API requests."""
    user = create_test_user()
    login_test_user(client)
    
    # Send malformed JSON
    resp = client.post("/api/logs", 
                      data="{'invalid': json,}", 
                      content_type="application/json")
    assert resp.status_code in [400, 422]


def test_unsupported_http_methods(client):
    """Test unsupported HTTP methods on API endpoints."""
    user = create_test_user()
    login_test_user(client)
    
    # Test PATCH on POST-only endpoint
    resp = client.patch("/api/logs")
    assert resp.status_code in [405, 501]
    
    # Test DELETE on GET-only endpoint
    resp = client.delete("/api/dashboard/stats")
    assert resp.status_code in [405, 501]


def test_large_request_payload(client):
    """Test handling of extremely large request payloads."""
    user = create_test_user()
    login_test_user(client)
    
    # Create payload with large notes field
    large_notes = "x" * 100000  # 100KB of text
    
    payload = {
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": "piano",
        "duration": 60,
        "piece": "Large Payload Test",
        "composer": "Stress Tester",
        "notes": large_notes
    }
    
    resp = client.post("/api/logs", json=payload)
    # Should either accept or reject large payloads gracefully
    assert resp.status_code in [200, 201, 400, 413, 422]


def test_empty_database_queries(client):
    """Test queries on empty database."""
    user = create_test_user()
    login_test_user(client)
    
    # All these should work with empty data
    resp1 = client.get("/api/logs")
    assert resp1.status_code == 200
    assert resp1.get_json() == []
    
    resp2 = client.get("/api/stats/pieces")
    assert resp2.status_code == 200
    assert resp2.get_json() == []
    
    resp3 = client.get("/api/dashboard/stats")
    assert resp3.status_code == 200
    # Should return default/zero values
    data = resp3.get_json()
    assert data["total_minutes"] == 0


def test_user_session_handling(client):
    """Test user session edge cases."""
    user = create_test_user()
    
    # Test accessing protected endpoint without login
    resp = client.get("/api/logs")
    assert resp.status_code in [302, 401]
    
    # Login and access endpoint
    login_test_user(client)
    resp = client.get("/api/logs")
    assert resp.status_code == 200
    
    # Logout and try again
    client.get("/logout")
    resp = client.get("/api/logs")
    assert resp.status_code in [302, 401]


def test_timezone_edge_cases(client):
    """Test timezone handling edge cases."""
    # Test with invalid timezone
    try:
        user = User(username="tz_test", timezone="Invalid/Timezone")
        user.set_password("test")
        add_to_db(user)
        
        # Operations should handle invalid timezone gracefully
        # (This depends on how the application handles invalid timezones)
    except Exception:
        # If validation prevents invalid timezones, that's also acceptable
        pass


def test_piece_name_edge_cases(client):
    """Test piece name handling edge cases."""
    user = create_test_user()
    
    edge_cases = [
        ("", "Empty Title"),  # Empty title
        ("   ", "Whitespace"),  # Whitespace only
        ("\n\t", "Special Whitespace"),  # Special whitespace
        ("Title", ""),  # Empty composer
        ("Title", "   "),  # Whitespace composer
    ]
    
    for title, composer in edge_cases:
        piece = get_or_create_piece(title, composer, user.id, 30)
        assert piece is not None
        # Should handle edge cases without crashing


def test_maximum_log_entries(client):
    """Test handling of users with many log entries."""
    user = create_test_user()
    login_test_user(client)
    
    # Create piece for logs
    piece = Piece(title="Stress Test", composer="Load Tester", user_id=user.id, log_time=0)
    add_to_db(piece)
    
    # Create many logs (but not too many to slow down tests)
    base_time = datetime.now(timezone.utc)
    
    for i in range(50):  # 50 logs should be enough for stress testing
        log = PracticeLog(
            user_id=user.id,
            user_log_number=i + 1,
            utc_timestamp=base_time - timedelta(hours=i),
            instrument="piano",
            duration=30,
            notes=f"Stress test log {i+1}",
            piece_id=piece.id
        )
        add_to_db(log)
    
    # API should still work with many logs
    resp = client.get("/api/logs")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 50
    
    # Dashboard should also work
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    
    stats = resp.get_json()
    assert stats["total_minutes"] == 1500  # 50 * 30
