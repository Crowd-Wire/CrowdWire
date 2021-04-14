from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from unittest import TestCase
from app.models import User

# class used by fastapi for tests
client = TestClient(app)


class TestAuth(TestCase):
    def test_login_active_user(self):
        """
        Expects a 400 bad request if the user status is not 0
        """
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
        """
        Expects a 400 bad request if the credentials do not match
        """
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
        """
        Expects a 200 OK if given the correct credentials
        """

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

    def test_login_wrong_data_format(self):
        """
        Expects 422 code status when data format does not match
        """
        response = client.post(
            "/login",
            data={
                "email": "user@example.com",
                "password": "pass",
            }
        )
        assert response.status_code == 422

    def test_register_invalid_email(self):
        """
        Expects 400 bad request when the email already exists
        """

        with patch("app.crud.crud_users.CRUDUser.create") as mock_post:
            mock_post.return_value = None

            response = client.post(
                "/register",
                json={
                    "email": "user@example.com",
                    "hashed_password": "pass",
                    "name": "name"
                }
            )

            assert response.status_code == 400
            assert mock_post.call_count == 1

    def test_register_correct_data(self):
        """
        Expects 200 OK when given the right data
        """

        with patch("app.crud.crud_users.CRUDUser.create") as mock_post:
            mock_post.return_value = User()

            response = client.post(
                "/register",
                json={
                    "email": "user@example.com",
                    "hashed_password": "pass",
                    "name": "name"
                }
            )

            assert response.status_code == 200
            assert mock_post.call_count == 1

    def test_register_wrong_data_format(self):
        """
        Expects 422 status code when the data does not have the correct format
        """

        response = client.post(
            "/login",
            data={
                "email": "user@example.com",
                "password": "pass",
            }
        )
        assert response.status_code == 422
