from app.models import User
from .conftest import create_test_user

def test_register(client):
    resp = client.post("/register", json={
        "username": "registered_user",
        "password": "secure_password",
    })
    assert resp.status_code == 200
    assert b"User registered successfully" in resp.data

def test_login(client):
    create_test_user()
    resp = client.post("/login", json={
        "username": "testuser",
        "password": "testpass"
    })
    
    assert resp.status_code == 200

def test_logout(client):
    create_test_user()
    client.post("/login", json={"username": "testuser", "password": "testpass"})
    resp = client.get("/logout", follow_redirects=True)
    
    assert resp.status_code == 200

def test_login_invalid_user(client):
    create_test_user()
    
    resp = client.post("/login", json={
        "username": "nonexistent_user",
        "password": "testpass"
    })
    
    assert resp.status_code == 401
    
def test_login_wrong_password(client):
    create_test_user()
    
    resp = client.post("/login", json={
        "username": "testuser",
        "password": "wrong_password"
    })
    
    assert resp.status_code == 401
