from .conftest import create_test_user, login_test_user
from app.utils import get_or_create_piece, add_to_db
from app.models import Piece

def test_get_pieces(client):
    user = create_test_user()
    login_test_user(client)

    get_or_create_piece("Etude No. 1", "Chopin", user.id, 30)

    resp = client.get("/api/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert any(p["title"] == "Etude No. 1" for p in data)
    
def test_piece_creation(client):
    user = create_test_user()
    login_test_user(client)

    piece = Piece.query.filter_by(user_id=user.id).all()
    assert len(piece) == 0
    
    get_or_create_piece("Etude No. 1", "Chopin", user.id, 30)
    assert Piece.query.count() == 1
    
    piece = Piece.query.first()
    assert piece.title == "Etude No. 1"

def test_existing_piece_retrieval(client):
    user = create_test_user()
    login_test_user(client)
    
    empty = Piece.query.filter_by(user_id=user.id).all()
    assert len(empty) == 0

    new_piece = Piece(title="Etude No. 1", composer="Chopin", user_id=user.id, log_time=0)
    add_to_db(new_piece)
    
    assert Piece.query.count() == 1
    
    piece = get_or_create_piece("Etude No. 1", "Chopin", user.id, 30)
    assert piece is not None
    assert piece.id is not None
    assert piece.user_id == user.id
    
    assert piece.title == "Etude No. 1"
    assert piece.composer == "Chopin"
    assert piece.log_time == 30
    
    
