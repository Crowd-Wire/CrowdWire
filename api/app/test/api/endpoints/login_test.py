from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login():
    response = client.post(
        "/login",
        data={
            "username": "user@example.com",
            "password": "pass",
        }
    )

    assert response.status_code == 200
