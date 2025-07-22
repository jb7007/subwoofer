from datetime import datetime, timezone
from .conftest import create_test_user, login_test_user
from app.utils import set_as_local

def test_timezone_offset(client):
    user = create_test_user()
    login_test_user(client)
    
    assert user.timezone == "America/New_York"
    
def test_timezone_conversion():
    utc_time = datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    local_time = set_as_local(utc_time, "America/New_York", "%Y-%m-%d %H:%M:%S")
    
    assert local_time == "2024-12-31 19:00:00"