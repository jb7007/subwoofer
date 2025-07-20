from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from app.models import Piece

pieces_bp = Blueprint("pieces", __name__)


@pieces_bp.route("/api/pieces", methods=["GET"])
@login_required
def get_pieces():
    pieces = (
        Piece.query.filter_by(user_id=current_user.id).order_by(Piece.title.asc()).all()
    )
    result = [
        {"id": p.id, "title": p.title, "composer": p.composer, "minutes": p.log_time}
        for p in pieces
    ]
    return jsonify(result), 200
