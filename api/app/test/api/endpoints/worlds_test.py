from fastapi.testclient import TestClient
from app.main import app
from unittest import TestCase
from app import models
from unittest.mock import patch
from app.api.dependencies import get_current_user
from app.core.strings import WORLD_NOT_FOUND
from app.models import Tag, User
from app.core import strings
from app.schemas import GuestUser

client = TestClient(app)


async def override_dependency_user(token: str = None):
    return User()


async def override_dependency_guest():
    return GuestUser(user_id="ccca8d8c-ee65-433e-af45-d5d9ded235a6")


# TODO: add more tests for guests and users
class TestWorlds(TestCase):

    def test_get_world_correct_id_user(self):
        """
        Expects 200 Ok and that the world has the same id as the given one.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.get") as mock_get:

            # fields are required because of pydantic model
            mock_get.return_value = (models.World(world_id=1, world_map=bytes(), creator=1, max_users=1), "")

            response = client.get(
                "/worlds/1",
            )

            assert response.json()['world_id'] == 1
            assert response.status_code == 200
            assert mock_get.call_count == 1

    def test_get_world_wrong_id_user(self):
        """
        Expects 400 bad request when given a wrong id and checks if the right message is sent.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.get") as mock_get:

            mock_get.return_value = (None, WORLD_NOT_FOUND)

            response = client.get(
                "/worlds/100000",
            )

            assert response.status_code == 400
            assert response.json()['detail'] == WORLD_NOT_FOUND

    def test_get_world_correct_id_guest(self):
        """
        Expects 200 Ok and that the world has the same id as the given one.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.get_available_for_guests") as mock_get:
            mock_get.return_value = (models.World(world_id=1, world_map=bytes(), creator=1, max_users=1), "")

            response = client.get(
                "/worlds/1",
            )

            assert response.json()['world_id'] == 1
            assert response.status_code == 200
            assert mock_get.call_count == 1

    def test_get_world_wrong_id_guest(self):
        """
        Expects 400 bad request when given a wrong id and checks if the right message is sent.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.get_available_for_guests") as mock_get:
            mock_get.return_value = (None, WORLD_NOT_FOUND)

            response = client.get(
                "/worlds/100000",
            )

            assert response.status_code == 400
            assert response.json()['detail'] == WORLD_NOT_FOUND

    def test_search_public_worlds_user(self):

        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:

            world1 = models.World(world_id=1, world_map=bytes(), creator=1, max_users=1)
            world2 = models.World(world_id=2, world_map=bytes(), creator=1, max_users=1)
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds'
            )

            assert response.status_code == 200
            assert len(response.json()) == 2

    def test_search_owned_worlds_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:
            world1 = models.World(world_id=1, world_map=bytes(), creator=1, max_users=1)
            world2 = models.World(world_id=2, world_map=bytes(), creator=1, max_users=1)
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds?visibility=owned'
            )

            assert response.status_code == 200
            assert len(response.json()) == 2

    def test_search_joined_worlds_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:
            world1 = models.World(world_id=1, world_map=bytes(), creator=1, max_users=1)
            world2 = models.World(world_id=2, world_map=bytes(), creator=1, max_users=1)
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds?visibility=joined'
            )

            assert response.status_code == 200
            assert len(response.json()) == 2

    def test_search_invalid_worlds_visibility_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        response = client.get(
            '/worlds?visibility=wrong'
        )
        assert response.status_code == 400

    def test_search_public_worlds_guest(self):
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:
            world1 = models.World(world_id=1, world_map=bytes(), creator=1, max_users=1)
            world2 = models.World(world_id=2, world_map=bytes(), creator=1, max_users=1)
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds'
            )
            assert response.status_code == 200
            assert len(response.json()) == 2

    def test_search_invalid_worlds_visibility_guest(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        response = client.get(
            '/worlds?visibility=wrong'
        )
        assert response.status_code == 400

    def test_search_worlds_by_name_or_description(self):
        app.dependency_overrides[get_current_user] = override_dependency_user

        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:
            world1 = models.World(world_id=1, name="test", world_map=bytes(), creator=1, max_users=1)
            world2 = models.World(world_id=2, name="", description="test", world_map=bytes(), creator=1, max_users=1)
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds/?search=test'
            )

            assert response.status_code == 200
            assert len(response.json()) == 2
            assert "test" in response.json()[0]['name'] or "test" in response.json()[0]["description"]
            assert "test" in response.json()[1]['name'] or "test" in response.json()[1]["description"]

    def test_search_worlds_by_tags(self):
        app.dependency_overrides[get_current_user] = override_dependency_guest

        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:

            world1 = models.World(
                world_id=1,
                name="test",
                world_map=bytes(),
                creator=1,
                max_users=1,
                tags=[Tag(name="string")]
            )

            world2 = models.World(
                world_id=2,
                name="",
                description="test",
                world_map=bytes(),
                creator=1,
                max_users=1,
                tags=[Tag(name="test")]
            )
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds/?tags=test&tags=string'
            )

            assert response.status_code == 200
            assert len(response.json()) == 2
            assert any([tag['name'] == "string" or tag['name'] == "test" for tag in response.json()[0]['tags']])
            assert any([tag['name'] == "string" or tag['name'] == "test" for tag in response.json()[1]['tags']])

    def test_create_world_correct_data_user(self):
        # TODO: improve this
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.create") as mock_post:

            world = models.World(
                world_id=1,
                name="test",
                world_map=bytes(),
                creator=1,
                max_users=1,
                tags=[Tag(name="string")],
                public=True,
                allow_guests=True
            )

            mock_post.return_value = (world, "")

            response = client.post(
                "/worlds/",
                json={
                    "name": "test",
                    "world_map": "",
                    "creator": 1,
                    "max_users": 1,
                    "tags": [],
                    "public": True,
                    "allow_guests": True
                }
            )

            assert response.json()['name'] == world.name
            assert response.status_code == 200

    def test_create_world_invalid_tags_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.create") as mock_post:

            mock_post.return_value = (None, strings.INVALID_TAG)

            response = client.post(
                "/worlds/",
                json={
                    "world_id": 1,
                    "name": "test",
                    "world_map": "",
                    "creator": 1,
                    "max_users": 1,
                    "tags": ['{"name": "aaa"}'],
                    "public": True,
                    "allow_guests": True
                }
            )

            assert response.status_code == 400
            assert response.json()['detail'] == strings.INVALID_TAG

    def test_create_world_guest(self):
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.post(
            "/worlds/",
            json={
                "world_id": 1,
                "name": "test",
                "world_map": "",
                "creator": 1,
                "max_users": 1,
                "tags": ['{"name": "aaa"}'],
                "public": True,
                "allow_guests": True
            }
        )
        assert response.status_code == 403
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_delete_world_guest(self):
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.delete(
            "/worlds/1"
        )
        assert response.status_code == 403
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_delete_world_with_permissions_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.remove") as mock_delete:
            world = models.World(
                world_id=1,
                name="test",
                world_map=bytes(),
                creator=1,
                max_users=1,
                tags=[Tag(name="string")],
                public=True,
                allow_guests=True
            )
            mock_delete.return_value = world , ""
            response = client.delete(
                "/worlds/1"
            )
            assert response.status_code == 200
            assert response.json()['world_id'] == 1

    def test_delete_world_without_permissions_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.remove") as mock_delete:
            mock_delete.return_value = None, ""
            response = client.delete(
                "/worlds/1"
            )
            assert response.status_code == 400

    def test_update_world_user_info_not_joined_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_world_users.CRUDWorld_User.get_user_joined") as mock_get:
            mock_get.return_value = None

            response = client.put(
                "/worlds/1/users",
                json={
                    'avatar': 'avatar1',
                    'username': 'new_username'
                }
            )
            print(response.status_code)
            assert response.status_code == 200