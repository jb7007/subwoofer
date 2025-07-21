from .conftest import create_test_user, login_test_user
from app.utils import prepare_log_data, add_to_db, get_or_create_piece
from app.models import PracticeLog

def test_dash_stats(client, app):
    user = create_test_user()
    login_test_user(client)

    with app.app_context():
        log_data = {
            "utc_timestamp": "2025-07-20T18:00:00",
            "local_date": "2025-07-20T14:00:00",
            "instrument": "violin",
            "duration": 60,
            "notes": "",
            "piece": "Concerto in D",
            "composer": "Beethoven"
        }
        
        log_data = prepare_log_data(log_data, user.id)

        piece_title = log_data.pop("piece", None)
        composer_name = log_data.pop("composer", None)

        if piece_title:
            # Try to find by both title and composer
            piece = get_or_create_piece(piece_title, composer_name, user.id, log_data["duration"])  
            log_data["piece_id"] = piece.id
        else:
            log_data["piece_id"] = None
        
        new_log = PracticeLog(**log_data)
        add_to_db(new_log)

    resp = client.get("/api/dash-stats")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total_minutes"] == 60
    assert data["common_instrument"] == "Violin"
