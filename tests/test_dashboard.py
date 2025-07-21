from .conftest import create_test_user, login_test_user
from app.utils import prepare_log_data, add_to_db, get_or_create_piece
from app.models import PracticeLog

def test_submit_log_endpoint(client, app):
    user = create_test_user()
    login_test_user(client)

    with app.app_context():
        payload = {
            "utc_timestamp": "2025-01-01T00:00:00",
            "local_date": "2025-01-01T00:00:00",
            "instrument": "piano",
            "duration": 60,
            "notes": "",
            "piece": "Concerto in D",
            "composer": "Beethoven"
        }

        resp = client.post("/api/logs", json=payload)
        data = resp.get_json()
        assert resp.status_code == 201
        assert data["message"] == "log added!"
        
        logs = PracticeLog.query.filter_by(user_id=user.id).all()
        assert len(logs) == 1
        
        log = logs[0]
        assert log.instrument == "piano"
        assert log.duration == 60
