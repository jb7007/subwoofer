from datetime import datetime
from typing import Optional

from app.models import PracticeLog
from app.utils.time import set_as_local
from app.utils.db import get_or_create_piece
from ..instrument_map import instrument_labels as INSTRUMENTS


def prepare_log_data(raw: dict, user_id: int) -> dict:
    """
    Prepare and clean incoming log data:
    - Parse ISO datetime strings
    - Assign user_id
    - Determine next user_log_number
    """
    data = raw.copy()
    data["utc_timestamp"] = datetime.fromisoformat(data["utc_timestamp"])
    data["user_id"] = user_id

    latest = (
        PracticeLog.query
        .filter_by(user_id=user_id)
        .order_by(PracticeLog.user_log_number.desc())
        .first()
    )
    data["user_log_number"] = (latest.user_log_number + 1) if latest else 1
    
    piece_title = data.pop("piece", None)
    composer_name = data.pop("composer", None)

    if piece_title:
        # Try to find by both title and composer
        piece = get_or_create_piece(piece_title, composer_name, user_id, data["duration"])  
        data["piece_id"] = piece.id
    else:
        data["piece_id"] = None
    return data


def serialize_logs(logs: list, local_format: Optional[str] = None) -> list:
    """
    Serialize a list of PracticeLog objects into dictionaries for JSON.
    """
    output = []
    for log in logs:
        output.append({
            "id": log.user_log_number,
            "local_date": set_as_local(log.utc_timestamp, log.user.timezone, local_format),
            "utc_date": log.utc_timestamp,
            "updated_at": log.updated_at,
            "instrument": log.instrument,
            "duration": log.duration,
            "notes": log.notes or "",
            "piece": log.piece.title if log.piece else "Unlisted",
            "composer": log.piece.composer if log.piece else "Unlisted",
        })
    return output

def get_instrument_name(instr: str) -> str:
    """
    Get the full name of an instrument from its key.
    Returns "Unlisted" if not found.
    """
    return INSTRUMENTS.get(instr, "Unlisted")