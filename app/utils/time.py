from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

def get_today_local(tz_name) -> datetime:
    """
    Get the current date in the user's timezone.
    """
    return datetime.now(tz=ZoneInfo(tz_name)).date()

def get_today_utc() -> datetime:
    """
    Get the current date in UTC.
    """
    return datetime.now(timezone.utc).date()

def set_as_local(
    utc_dt: datetime,
    tz_name: str = "UTC",
    fmt: Optional[str] = None
) -> str:
    fmt = fmt or "%Y-%m-%d"
    
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    
    local_dt = utc_dt.astimezone(ZoneInfo(tz_name))
    return local_dt.strftime(fmt)

