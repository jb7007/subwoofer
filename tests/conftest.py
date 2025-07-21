import pytest
from app import create_app, db
from app.models import User

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
def session(app):
    connection = db.engine.connect()
    transaction = connection.begin()
    options = {"bind": connection}
    session = db.create_scoped_session(options=options)
    db.session = session
    
    yield session
    
    session.remove()
    transaction.rollback()
    connection.close()

def create_test_user(username="testuser", password="testpass"):
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return user

def login_test_user(client, username="testuser", password="testpass"):
    client.post("/login", json={"username": username, "password": password})
