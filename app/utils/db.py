from app.models import Piece, db

def add_to_db(*items):
    """
    Add one or more items to the database session and commit.
    """
    for item in items:
        db.session.add(item)
    db.session.commit()
    
def get_or_create_piece(title: str, composer: str, user_id: int, duration: int) -> Piece:
    """
    Find or create a Piece record, update its log_time, and return it.
    """
    title_clean = title.strip()
    composer_clean = composer.strip() if composer else "Unknown"

    piece = Piece.query.filter_by(
        title=title_clean,
        composer=composer_clean
    ).first()
    if not piece:
        piece = Piece(
            title=title_clean,
            composer=composer_clean,
            user_id=user_id,
            log_time=0
        )
        add_to_db(piece)

    piece.log_time += int(duration)
    db.session.commit()
    return piece