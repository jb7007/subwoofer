import pytest
from app import create_app, db
from app.models import User
from flask import template_rendered
from contextlib import contextmanager

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "WTF_CSRF_ENABLED": False,
        "LOGIN_DISABLED": False,
        "SECRET_KEY": "testsecret",
    })
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def db_session(app):
    return db.session

def create_test_user(username="testuser", password="testpass"):
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user

def login_test_user(client, username="testuser", password="testpass"):
    client.post("/login", json={"username": username, "password": password})
