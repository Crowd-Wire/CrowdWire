from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from unittest import TestCase
from app.models import User

# class used by fastapi for tests
client = TestClient(app)


class TestAuth(TestCase):
    def test_login_active_user(self):

        with patch("app.crud.crud_users.CRUDUser.authenticate") as mock_post:

            mock_post.return_value = User(status=1)
            response = client.post(
                "/login",
                data={
                    "username": "user@example.com",
                    "password": "pass",
                }
            )
            assert response.status_code == 400
            assert mock_post.call_count == 1

    def test_login_wrong_credentials(self):
        with patch("app.crud.crud_users.CRUDUser.authenticate") as mock_post:

            mock_post.return_value = None

            response = client.post(
                "/login",
                data={
                    "username": "user@example.com",
                    "password": "pass1",
                }
            )
            assert response.status_code == 400
            assert mock_post.call_count == 1

    def test_login_correct_credentials(self):
        with patch("app.crud.crud_users.CRUDUser.authenticate") as mock_post:

            mock_post.return_value = User(status=0)

            response = client.post(
                "/login",
                data={
                    "username": "user@example.com",
                    "password": "pass",
                }
            )
            assert response.status_code == 200
            assert mock_post.call_count == 1

    def test_login_wrong_data(self):

        response = client.post(
            "/login",
            data={
                "email": "user@example.com",
                "password": "pass",
            }
        )
        assert response.status_code == 422

    def test_register(self):
        pass