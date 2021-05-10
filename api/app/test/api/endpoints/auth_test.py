from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from unittest import TestCase
from app.models import User, World_User
from app.api.dependencies import get_current_user
from app.schemas import GuestUser
from datetime import datetime

client = TestClient(app)


async def override_dependency_user(token: str = None):
    return User(user_id=1)


async def override_dependency_guest():
    return GuestUser(user_id="ccca8d8c-ee65-433e-af45-d5d9ded235a6")


class TestAuth(TestCase):
    def test_login_active_user(self):
        """
        Expects a 400 bad request if the user status is not 0
        """
        with patch("app.crud.crud_users.CRUDUser.authenticate") as mock_post:

            mock_post.return_value = User(status=1), ""
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

            mock_post.return_value = None, ""

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

            mock_post.return_value = User(status=0), ""

            response = client.post(
                "/login",
                data={
                    "username": "user@example.com",
                    "password": "pass",
                }
            )
            assert response.status_code == 200
            assert mock_post.call_count == 1
            assert response.json()['access_token']
            # assert datetime.strptime(response.json()['expire_date'], "%Y-%m-%d %H:%M:%S.%f") > datetime.now()
            assert response.json()['token_type'] == 'bearer'

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
            mock_post.return_value = None, ""

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
            mock_post.return_value = User(), ""

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
            assert response.json()['access_token']
            # assert datetime.strptime(response.json()['expire_date'], "%Y-%m-%d %H:%M:%S.%f") > datetime.now()
            assert response.json()['token_type'] == 'bearer'

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

    def test_generate_invite_link_user_success(self):
        """
        Expects 200 Ok given a user with the right access
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_world_users.CRUDWorld_User.can_generate_link") as mock_post:

            mock_post.return_value = World_User(), ""
            response = client.post(
                "/invitation/1",
            )
            assert response.status_code == 200
            assert mock_post.call_count == 1
            assert response.json()['access_token']
            # assert datetime.strptime(response.json()['expire_date'], "%Y-%m-%d %H:%M:%S.%f") > datetime.now()
            assert response.json()['token_type'] == 'bearer'

    def test_generate_invite_link_guest_forbidden(self):
        """
        Expects 403 forbidden given a guest user
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.post(
            "/invitation/1",
        )
        assert response.status_code == 403

    def test_generate_invite_link_user_forbidden(self):
        """
        Expects 403 forbidden given a user without access
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_world_users.CRUDWorld_User.can_generate_link") as mock_post:
            mock_post.return_value = None, "error"
            response = client.post(
                "/invitation/1",
            )
            assert response.status_code == 403
            assert mock_post.call_count == 1
            assert response.json()['detail'] == "error"

    def test_join_as_guest(self):
        """
        Expects 200 OK when joining as guest.
        """
        response = client.post(
            "/join-guest"
        )
        assert response.status_code == 200
        assert response.json()['guest_uuid'] and response.json()['access_token']
        assert datetime.strptime(response.json()['expire_date'], "%Y-%m-%d %H:%M:%S.%f") > datetime.now()
        assert response.json()['token_type'] == 'bearer'
