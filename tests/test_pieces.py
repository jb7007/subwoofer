from .conftest import create_test_user, login_test_user
from app.utils import get_or_create_piece

def test_get_pieces(client, app):
    user = create_test_user()
    login_test_user(client)

    with app.app_context():
        get_or_create_piece("Etude No. 1", "Chopin", user.id, 30)

    resp = client.get("/api/pieces")
    assert resp.status_code == 200
    data = resp.get_json()
    assert any(p["title"] == "Etude No. 1" for p in data)
