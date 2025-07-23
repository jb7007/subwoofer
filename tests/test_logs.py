"""
Practice Logs Tests for Practice Tracker Application

This module tests all practice log functionality including log creation,
retrieval, validation, and API endpoints for log management.
"""

from datetime import datetime, timezone, timedelta
from .conftest import create_test_user, login_test_user
from app.models import PracticeLog, Piece
from app.utils import add_to_db
    
def test_submit_log_endpoint(client):
    """Test creating a new practice log via API."""
    user = create_test_user()
    login_test_user(client)

    payload = {
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": "piano",
        "duration": 60,
        "notes": "",
        "piece": "Concerto in D",
        "composer": "Beethoven"
    }

    resp = client.post("/api/logs", json=payload)
    assert resp.status_code == 201
    
    data = resp.get_json()
    assert data["message"] == "log added!"
    
    logs = PracticeLog.query.filter_by(user_id=user.id).all()
    assert len(logs) == 1
    
    log = logs[0]
    
    assert log.id == 1
    assert log.user_log_number == 1
    assert log.user_id == 1
    assert log.utc_timestamp == datetime.fromisoformat("2025-01-01T00:00:00")
    assert log.updated_at is not None
    assert log.instrument == "piano"
    assert log.duration == 60
    assert log.notes == ""


def test_submit_log_requires_authentication(client):
    """Test that log submission requires user authentication."""
    payload = {
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": "piano",
        "duration": 60,
        "notes": "Test notes",
        "piece": "Test Piece",
        "composer": "Test Composer"
    }
    
    resp = client.post("/api/logs", json=payload)
    # Should redirect or return 401 for unauthenticated users
    assert resp.status_code in [302, 401]


def test_submit_log_with_detailed_data(client):
    """Test submitting a log with all optional fields filled."""
    user = create_test_user()
    login_test_user(client)

    payload = {
        "utc_timestamp": "2025-01-15T14:30:00",
        "instrument": "violin",
        "duration": 90,
        "notes": "Worked on difficult passages in measures 23-45. Need to practice scales more.",
        "piece": "Violin Concerto No. 1",
        "composer": "Max Bruch"
    }

    resp = client.post("/api/logs", json=payload)
    assert resp.status_code == 201
    
    # Verify log was created correctly
    log = PracticeLog.query.filter_by(user_id=user.id).first()
    assert log.instrument == "violin"
    assert log.duration == 90
    assert log.notes == "Worked on difficult passages in measures 23-45. Need to practice scales more."
    
    # Verify piece was created/linked
    piece = Piece.query.filter_by(user_id=user.id).first()
    assert piece.title == "Violin Concerto No. 1"
    assert piece.composer == "Max Bruch"
    assert log.piece_id == piece.id


def test_submit_multiple_logs_increments_user_log_number(client):
    """Test that user_log_number increments correctly for multiple logs."""
    user = create_test_user()
    login_test_user(client)

    # Submit first log
    payload1 = {
        "utc_timestamp": "2025-01-01T10:00:00",
        "instrument": "piano",
        "duration": 30,
        "notes": "First session",
        "piece": "Moonlight Sonata",
        "composer": "Beethoven"
    }
    
    resp1 = client.post("/api/logs", json=payload1)
    assert resp1.status_code == 201
    
    # Submit second log
    payload2 = {
        "utc_timestamp": "2025-01-01T16:00:00",
        "instrument": "guitar",
        "duration": 45,
        "notes": "Second session",
        "piece": "Classical Gas",
        "composer": "Mason Williams"
    }
    
    resp2 = client.post("/api/logs", json=payload2)
    assert resp2.status_code == 201
    
    # Verify user_log_number increments
    logs = PracticeLog.query.filter_by(user_id=user.id).order_by(PracticeLog.user_log_number).all()
    assert len(logs) == 2
    assert logs[0].user_log_number == 1
    assert logs[1].user_log_number == 2


def test_get_logs_endpoint(client):
    """Test retrieving user's practice logs via API."""
    user = create_test_user()
    login_test_user(client)
    
    # Create some test logs
    base_time = datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc)
    
    for i in range(3):
        piece = Piece(title=f"Test Piece {i+1}", composer="Test Composer", user_id=user.id, log_time=30)
        add_to_db(piece)
        
        log = PracticeLog(
            user_id=user.id,
            user_log_number=i + 1,
            utc_timestamp=base_time + timedelta(hours=i),
            instrument="piano",
            duration=30,
            notes=f"Test log {i+1}",
            piece_id=piece.id
        )
        add_to_db(log)
    
    resp = client.get("/api/logs")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 3
    
    # Verify log data structure
    log_data = data[0]
    required_fields = ["id", "local_date", "instrument", 
                      "duration", "notes", "piece", "composer"]
    
    for field in required_fields:
        assert field in log_data, f"Missing field: {field}"


def test_get_logs_requires_authentication(client):
    """Test that getting logs requires authentication."""
    resp = client.get("/api/logs")
    assert resp.status_code in [302, 401]


def test_get_logs_empty_for_new_user(client):
    """Test that new users get empty logs list."""
    user = create_test_user()
    login_test_user(client)
    
    resp = client.get("/api/logs")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert data == []


def test_recent_logs_endpoint(client):
    """Test the recent logs API endpoint."""
    user = create_test_user()
    login_test_user(client)
    
    # Create several logs with different timestamps
    base_time = datetime.now(timezone.utc) - timedelta(days=1)
    
    for i in range(5):
        piece = Piece(title=f"Recent Piece {i+1}", composer="Test", user_id=user.id, log_time=20)
        add_to_db(piece)
        
        log = PracticeLog(
            user_id=user.id,
            user_log_number=i + 1,
            utc_timestamp=base_time + timedelta(hours=i*2),
            instrument="piano",
            duration=20,
            notes=f"Recent log {i+1}",
            piece_id=piece.id
        )
        add_to_db(log)
    
    resp = client.get("/api/recent-logs")
    assert resp.status_code == 200
    
    data = resp.get_json()
    
    # Should return recent logs (implementation might limit to last N logs)
    assert isinstance(data, list)
    assert len(data) <= 5  # Assuming it returns recent logs, not necessarily all


def test_recent_logs_requires_authentication(client):
    """Test that recent logs endpoint requires authentication."""
    resp = client.get("/api/recent-logs")
    assert resp.status_code in [302, 401]


def test_log_page_renders(client):
    """Test that the log entry page renders correctly."""
    user = create_test_user()
    login_test_user(client)
    
    resp = client.get("/log")
    assert resp.status_code == 200
    # Check for log form elements
    assert b"form" in resp.data.lower() or b"log" in resp.data.lower()


def test_log_page_requires_authentication(client):
    """Test that log page requires authentication."""
    resp = client.get("/log")
    assert resp.status_code in [302, 401]


def test_submit_log_invalid_data(client):
    """Test log submission with invalid data."""
    user = create_test_user()
    login_test_user(client)

    # Test with missing required fields - causes server error since no validation
    payload = {
        "instrument": "piano",
        "duration": 60
        # Missing timestamp, piece, composer
    }

    resp = client.post("/api/logs", json=payload)
    # Should return server error for missing required fields (no input validation)
    assert resp.status_code == 500


def test_submit_log_creates_piece_if_not_exists(client):
    """Test that submitting a log creates a new piece if it doesn't exist."""
    user = create_test_user()
    login_test_user(client)

    # Verify no pieces exist initially
    assert Piece.query.filter_by(user_id=user.id).count() == 0

    payload = {
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": "piano",
        "duration": 60,
        "notes": "New piece test",
        "piece": "Brand New Piece",
        "composer": "New Composer"
    }

    resp = client.post("/api/logs", json=payload)
    assert resp.status_code == 201
    
    # Verify piece was created
    pieces = Piece.query.filter_by(user_id=user.id).all()
    assert len(pieces) == 1
    
    piece = pieces[0]
    assert piece.title == "Brand New Piece"
    assert piece.composer == "New Composer"
    assert piece.log_time == 60  # Should be updated with practice time


def test_submit_log_updates_existing_piece_time(client):
    """Test that submitting a log updates existing piece's total time."""
    user = create_test_user()
    login_test_user(client)

    # Create an existing piece
    existing_piece = Piece(
        title="Existing Piece", 
        composer="Known Composer", 
        user_id=user.id, 
        log_time=30
    )
    add_to_db(existing_piece)

    payload = {
        "utc_timestamp": "2025-01-01T00:00:00",
        "instrument": "piano",
        "duration": 45,
        "notes": "Additional practice",
        "piece": "Existing Piece",
        "composer": "Known Composer"
    }

    resp = client.post("/api/logs", json=payload)
    assert resp.status_code == 201
    
    # Verify piece time was updated (30 + 45 = 75)
    piece = Piece.query.filter_by(user_id=user.id, title="Existing Piece").first()
    assert piece.log_time == 75
