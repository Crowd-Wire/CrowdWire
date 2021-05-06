from fastapi.testclient import TestClient

from app.main import app
from unittest.mock import patch
from unittest import TestCase
from app.models import Role, User
from app.schemas import GuestUser
from app.api.dependencies import get_current_user

client = TestClient(app)


async def override_dependency_user(token: str = None):
    return User()

async def override_dependency_guest():
    return GuestUser(user_id="ccca8d8c-ee65-433e-af45-d5d9ded235a6")


class TestRoles(TestCase):
    def test_get_all_world_roles_user_success(self):
        """
        Expects 200 Ok given a user with right permissions
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            mock_access.return_value = Role(role_id=1, world_id=1), ""
            with patch("app.crud.crud_roles.CRUDRole.get_world_roles") as mock_get:
                mock_get.return_value = [Role(role_id=1, world_id=1), Role(role_id=2, world_id=1)] , ""
                response = client.get(
                    "/worlds/1/roles",
                )

                assert response.status_code == 200
                assert mock_get.call_count == 1
                assert mock_access.call_count == 1
                assert len(response.json()) == 2
                assert response.json()[0]['world_id'] == 1

    def test_get_all_world_roles_user_forbidden(self):
        """
        Expects 403 forbidden given a user without permissions to access roles.
        """

        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            mock_access.return_value = None, "error"

            response = client.get(
                "/worlds/1/roles",
            )

            assert response.status_code == 403
            assert response.json()['detail'] == "error"
            assert mock_access.call_count == 1

    def test_get_all_world_roles_guest_forbidden(self):
        """
        Expects 403 forbidden when a guest tries to access.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.get(
            "/worlds/1/roles",
        )

        assert response.status_code == 403

    def test_add_role_to_world_guest_forbidden(self):
        """
        Expects 403 forbidden when a guest tries to access.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.post(
            "/worlds/1/roles/",
            json={
                "name": "role",
                "world_id": 1
            }
        )
        assert response.status_code == 403

    def test_add_role_to_world_user_forbidden_or_bad_request(self):
        """
        Expects 400 bad request given a user with no permissions or the role cannot be created.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.create") as mock_post:
            mock_post.return_value = None, "error"

            response = client.post(
                "/worlds/1/roles/",
                json={
                    "name": "role",
                    "world_id": 1
                }
            )

            assert response.status_code == 400
            assert response.json()['detail'] == "error"
            assert mock_post.call_count == 1

    def test_add_role_to_world_user_success(self):
        """
        Expects 200 Ok given a user with permissions.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.create") as mock_post:
            mock_post.return_value = Role(role_id=1, world_id=1), "error"

            response = client.post(
                "/worlds/1/roles/",
                json={
                    "name": "role",
                    "world_id": 1
                }
            )

            assert response.status_code == 200
            assert response.json()['world_id'] == 1
            assert response.json()['role_id'] == 1
            assert mock_post.call_count == 1

    def test_edit_role_in_world_user_forbidden(self):
        """
        Expects 403 forbidden for users withour permission.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            mock_access.return_value = None, "error"

            response = client.put(
                "/worlds/1/roles/1",
                json={}
            )

            assert response.status_code == 403
            assert mock_access.call_count == 1
            assert response.json()['detail'] == "error"

    def test_edit_role_in_world_guest_forbidden(self):
        """
        Expects 403 forbidden for guest users.
        """

        app.dependency_overrides[get_current_user] = override_dependency_guest

        response = client.put(
            "/worlds/1/roles/1",
            json={}
        )

        assert response.status_code == 403

    def test_edit_role_in_world_bad_data_format(self):
        """
        Expects 400 bad request when giving an invalid role.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            with patch("app.crud.crud_roles.CRUDRole.get_by_role_id_and_world_id") as mock_put:

                mock_access.return_value = User(user_id=1), ""
                mock_put.return_value = None, "error"

                response = client.put(
                    "/worlds/1/roles/1",
                    json={}
                )

                assert response.status_code == 400
                assert response.json()['detail'] == "error"
                assert mock_access.call_count == 1
                assert mock_put.call_count == 1

    def test_edit_role_in_world_success(self):
        """
        Expects 200 Ok given a user with access and good data format.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            with patch("app.crud.crud_roles.CRUDRole.get_by_role_id_and_world_id") as mock_retrieve:
                with patch("app.crud.crud_roles.CRUDRole.update") as mock_put:

                    mock_access.return_value = User(user_id=1), ""
                    mock_retrieve.return_value = Role(world_id=1, role_id=1, name="n"), ""
                    mock_put.return_value = Role(world_id=1, role_id=1, name="name"), ""

                    response = client.put(
                        "/worlds/1/roles/1",
                        json={"name": "name"}
                    )

                    assert response.status_code == 200
                    assert response.json()['world_id'] == 1
                    assert response.json()['role_id'] == 1
                    assert response.json()['name'] == "name"
                    assert mock_access.call_count == 1
                    assert mock_retrieve.call_count == 1
                    assert mock_put.call_count == 1

    def test_delete_role_in_world_guest_forbidden(self):
        """
        Expects 403 forbidden for guest users.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest

        response = client.delete(
            "/worlds/1/roles/1"
        )

        assert response.status_code == 403

    def test_delete_role_in_world_user_forbidden(self):
        """
        Expects 403 forbidden given a user with no permissions.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            mock_access.return_value = None, "error"

            response = client.delete(
                "/worlds/1/roles/1",
            )

            assert response.status_code == 403
            assert mock_access.call_count == 1
            assert response.json()['detail'] == "error"

    def test_delete_role_in_world_invalid_role(self):
        """
        Expects 400 bad request given a invalid role.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            with patch("app.crud.crud_roles.CRUDRole.remove") as mock_rem:
                mock_access.return_value = User(user_id=1), ""
                mock_rem.return_value = None, "error"

                response = client.delete(
                    "/worlds/1/roles/1",
                )

                assert response.status_code == 400
                assert mock_rem.call_count == 1
                assert mock_access.call_count == 1
                assert response.json()['detail'] == "error"

    def test_delete_role_in_world_success(self):
        """
        Expects 200 Ok if a given user with access deletes a valid role.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_roles.CRUDRole.can_acess_world_roles") as mock_access:
            with patch("app.crud.crud_roles.CRUDRole.remove") as mock_rem:
                mock_access.return_value = User(user_id=1), ""
                mock_rem.return_value = Role(world_id=1, role_id=1), ""

                response = client.delete(
                    "/worlds/1/roles/1",
                )

                assert response.status_code == 200
                assert mock_rem.call_count == 1
                assert mock_access.call_count == 1
                assert response.json()['world_id'] == 1
                assert response.json()['role_id'] == 1
