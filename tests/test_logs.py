from app.models import PracticeLog
from .conftest import create_test_user, login_test_user
from datetime import datetime

def test_add_log(client, app):
    user = create_test_user()
    login_test_user(client)

    payload = {
        "utc_timestamp": "2025-07-20T18:00:00",
        "local_date": "2025-07-20T14:00:00",
        "instrument": "Alto Saxophone",
        "duration": 45,
        "notes": "Testing log submission",
        "piece": "Etude No. 1",
        "composer": "Chopin"
    }

    resp = client.post("/api/logs", json=payload)
    assert resp.status_code == 201
    assert resp.get_json()["message"] == "log added!"

    with app.app_context():
        logs = PracticeLog.query.all()
        assert len(logs) == 1
        assert logs[0].instrument == "Alto Saxophone"
        assert logs[0].piece.title == "Etude No. 1"
