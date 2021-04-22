from fastapi.testclient import TestClient
from app.main import app
from unittest import TestCase
from app import models
from unittest.mock import patch
from app.api.dependencies import get_current_user
from app.core.strings import WORLD_NOT_FOUND
from app.models import Tag
from app.core import strings
import json

client = TestClient(app)


# this function will override get_current_user so that there is no need to see if a token is valid
async def override_dependency(token: str = None):
    return models.User()


app.dependency_overrides[get_current_user] = override_dependency


# TODO: add more tests for guests and users
class TestWorlds(TestCase):

    def test_get_world_correct_id(self):
        """
        Expects 200 Ok and that the world has the same id as the given one.
        """
        with patch("app.crud.crud_worlds.CRUDWorld.get") as mock_get:

            # fields are required because of pydantic model
            mock_get.return_value = (models.World(world_id=1, world_map=bytes(), creator=1, max_users=1), "")

            response = client.get(
                "/worlds/1",
            )

            assert response.json()['world_id'] == 1
            assert response.status_code == 200
            assert mock_get.call_count == 1

    def test_get_world_wrong_id(self):
        """
        Expects 400 bad request when given a wrong id and checks if the right message is sent.
        """

        with patch("app.crud.crud_worlds.CRUDWorld.get") as mock_get:

            mock_get.return_value = (None, WORLD_NOT_FOUND)

            response = client.get(
                "/worlds/100000",
            )

            assert response.status_code == 400
            assert response.json()['detail'] == WORLD_NOT_FOUND

    def test_search_worlds_all_worlds(self):

        with patch("app.crud.crud_worlds.CRUDWorld.filter") as mock_get:

            world1 = models.World(world_id=1, world_map=bytes(), creator=1, max_users=1)
            world2 = models.World(world_id=2, world_map=bytes(), creator=1, max_users=1)
            mock_get.return_value = [world1, world2]

            response = client.get(
                '/worlds'
            )

            assert response.status_code == 200
            assert len(response.json()) == 2

    def test_search_worlds_by_name_or_description(self):

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

    def test_create_world_correct_data(self):
        # TODO: improve this
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

    def test_create_world_invalid_tags(self):
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


