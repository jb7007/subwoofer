"""
Pieces Tests for Practice Tracker Application

This module tests the pieces functionality including piece creation,
retrieval, time tracking, and API endpoints for piece management.
"""

from .conftest import create_test_user, login_test_user
from app.utils import get_or_create_piece, add_to_db
from app.models import Piece


def test_get_pieces_empty_user(client):
    """Test getting pieces for user with no pieces."""
    user = create_test_user()
    login_test_user(client)

    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert data == []


def test_get_pieces_with_data(client):
    """Test getting pieces for user with existing pieces."""
    user = create_test_user()
    login_test_user(client)

    # Create test pieces
    piece1 = Piece(title="Moonlight Sonata", composer="Beethoven", user_id=user.id, log_time=120)
    piece2 = Piece(title="Canon in D", composer="Pachelbel", user_id=user.id, log_time=90)
    piece3 = Piece(title="Ave Maria", composer="Schubert", user_id=user.id, log_time=60)
    
    add_to_db(piece1)
    add_to_db(piece2)
    add_to_db(piece3)

    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 3
    
    # Check that pieces are sorted by title (ascending)
    titles = [p["title"] for p in data]
    assert titles == ["Ave Maria", "Canon in D", "Moonlight Sonata"]
    
    # Check piece data structure
    piece_data = data[0]
    required_fields = ["id", "title", "composer", "minutes"]
    for field in required_fields:
        assert field in piece_data
    
    # Verify specific piece data
    ave_maria = next(p for p in data if p["title"] == "Ave Maria")
    assert ave_maria["composer"] == "Schubert"
    assert ave_maria["minutes"] == 60


def test_get_pieces_requires_authentication(client):
    """Test that pieces endpoint requires authentication."""
    resp = client.get("/api/stats/pieces")
    assert resp.status_code in [302, 401]


def test_get_pieces_user_isolation(client):
    """Test that users only see their own pieces."""
    user1 = create_test_user(username="user1", password="pass1")
    user2 = create_test_user(username="user2", password="pass2")
    
    # Create pieces for user1
    piece1 = Piece(title="User1 Piece", composer="Composer1", user_id=user1.id, log_time=60)
    add_to_db(piece1)
    
    # Create pieces for user2
    piece2 = Piece(title="User2 Piece", composer="Composer2", user_id=user2.id, log_time=90)
    add_to_db(piece2)
    
    # Login as user1 and check pieces
    login_test_user(client, username="user1", password="pass1")
    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "User1 Piece"
    
    # Logout and login as user2
    client.get("/logout")
    login_test_user(client, username="user2", password="pass2")
    
    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "User2 Piece"


def test_piece_creation_new_piece(client):
    """Test creating a new piece."""
    user = create_test_user()
    login_test_user(client)

    # Verify no pieces exist initially
    pieces = Piece.query.filter_by(user_id=user.id).all()
    assert len(pieces) == 0
    
    # Create new piece
    piece = get_or_create_piece("New Etude", "Chopin", user.id, 30)
    
    assert piece is not None
    assert piece.title == "New Etude"
    assert piece.composer == "Chopin"
    assert piece.user_id == user.id
    assert piece.log_time == 30
    
    # Verify it was saved to database
    assert Piece.query.count() == 1
    db_piece = Piece.query.first()
    assert db_piece.title == "New Etude"


def test_piece_creation_duplicate_handling(client):
    """Test that creating duplicate pieces works correctly."""
    user = create_test_user()
    login_test_user(client)

    # Create first instance
    piece1 = get_or_create_piece("Duplicate Test", "Test Composer", user.id, 45)
    assert piece1.log_time == 45
    
    # Create same piece again - should update existing
    piece2 = get_or_create_piece("Duplicate Test", "Test Composer", user.id, 30)
    
    # Should be the same piece object
    assert piece1.id == piece2.id
    assert piece2.log_time == 75  # 45 + 30
    
    # Should only be one piece in database
    assert Piece.query.filter_by(user_id=user.id).count() == 1


def test_existing_piece_retrieval(client):
    """Test retrieving and updating an existing piece."""
    user = create_test_user()
    login_test_user(client)
    
    # Verify no pieces initially
    empty = Piece.query.filter_by(user_id=user.id).all()
    assert len(empty) == 0

    # Create piece directly in database
    new_piece = Piece(title="Etude No. 1", composer="Chopin", user_id=user.id, log_time=0)
    add_to_db(new_piece)
    
    assert Piece.query.count() == 1
    
    # Retrieve and update existing piece
    piece = get_or_create_piece("Etude No. 1", "Chopin", user.id, 30)
    
    assert piece is not None
    assert piece.id == new_piece.id  # Same piece
    assert piece.user_id == user.id
    assert piece.title == "Etude No. 1"
    assert piece.composer == "Chopin"
    assert piece.log_time == 30  # Updated from 0 to 30
    
    # Should still be only one piece
    assert Piece.query.count() == 1


def test_piece_time_accumulation(client):
    """Test that piece practice time accumulates correctly."""
    user = create_test_user()
    login_test_user(client)

    # Add practice time in multiple sessions
    piece = get_or_create_piece("Time Test", "Composer", user.id, 20)
    assert piece.log_time == 20
    
    # Add more time
    piece = get_or_create_piece("Time Test", "Composer", user.id, 35)
    assert piece.log_time == 55  # 20 + 35
    
    # Add even more time
    piece = get_or_create_piece("Time Test", "Composer", user.id, 15)
    assert piece.log_time == 70  # 55 + 15


def test_piece_case_sensitivity(client):
    """Test piece title and composer case sensitivity."""
    user = create_test_user()
    login_test_user(client)

    # Create piece with specific case
    piece1 = get_or_create_piece("Moonlight Sonata", "Beethoven", user.id, 30)
    
    # Try with different case - should create separate piece
    piece2 = get_or_create_piece("moonlight sonata", "beethoven", user.id, 45)
    
    # Should be different pieces due to case sensitivity
    assert piece1.id != piece2.id
    assert Piece.query.filter_by(user_id=user.id).count() == 2


def test_piece_with_empty_composer(client):
    """Test creating piece with empty composer."""
    user = create_test_user()
    login_test_user(client)

    piece = get_or_create_piece("Unknown Origin", "", user.id, 25)
    
    assert piece.title == "Unknown Origin"
    assert piece.composer == "Unknown"  # Empty composer becomes "Unknown"
    assert piece.log_time == 25


def test_piece_with_long_titles(client):
    """Test pieces with very long titles and composers."""
    user = create_test_user()
    login_test_user(client)

    long_title = "This is a very long piece title that might cause issues if not handled properly"
    long_composer = "Very Long Composer Name That Also Might Cause Database Issues"
    
    piece = get_or_create_piece(long_title, long_composer, user.id, 40)
    
    assert piece.title == long_title
    assert piece.composer == long_composer
    assert piece.log_time == 40


def test_pieces_sorting_alphabetical(client):
    """Test that pieces are returned in alphabetical order by title."""
    user = create_test_user()
    login_test_user(client)

    # Create pieces in non-alphabetical order
    pieces_data = [
        ("Zebra Song", "Last"),
        ("Apple Dance", "First"), 
        ("Middle Waltz", "Middle"),
        ("Beta March", "Second")
    ]
    
    for title, composer in pieces_data:
        piece = Piece(title=title, composer=composer, user_id=user.id, log_time=30)
        add_to_db(piece)

    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    titles = [p["title"] for p in data]
    
    # Should be alphabetically sorted
    expected_order = ["Apple Dance", "Beta March", "Middle Waltz", "Zebra Song"]
    assert titles == expected_order


def test_piece_zero_time_handling(client):
    """Test handling pieces with zero practice time."""
    user = create_test_user()
    login_test_user(client)

    # Create piece with zero time
    piece = Piece(title="No Practice Yet", composer="Composer", user_id=user.id, log_time=0)
    add_to_db(piece)

    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["minutes"] == 0
    assert data[0]["title"] == "No Practice Yet"


def test_piece_large_time_values(client):
    """Test pieces with large practice time values."""
    user = create_test_user()
    login_test_user(client)

    # Create piece with large time value (many hours of practice)
    large_time = 10000  # ~166 hours
    piece = Piece(title="Marathon Practice", composer="Dedicated", user_id=user.id, log_time=large_time)
    add_to_db(piece)

    resp = client.get("/api/stats/pieces")
    assert resp.status_code == 200
    
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["minutes"] == large_time
    
    
