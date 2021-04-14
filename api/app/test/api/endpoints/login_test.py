from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from unittest import TestCase
from app.models import User
client = TestClient(app)


class TestLogin(TestCase):
    def test_login_active_user(self):

        with patch("app.crud.crud_users.CRUDUser.authenticate") as mocket_get:

            mocket_get.return_value = User(status=0)
            response = client.post(
                "/login",
                data={
                    "username": "user@example.com",
                    "password": "pass",
                }
            )
            assert response.status_code == 200
            assert mocket_get.call_count == 1

    def test_login_wrong_credentials(self):
        response = client.post(
            "/login",
            data={
                "username": "user@example.com",
                "password": "pass1",
            }
        )
        assert response.status_code == 400
