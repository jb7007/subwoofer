from datetime import datetime
from .conftest import create_test_user, login_test_user
from app.models import PracticeLog
    
def test_submit_log_endpoint(client):
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
