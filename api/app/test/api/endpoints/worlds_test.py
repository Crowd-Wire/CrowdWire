from fastapi.testclient import TestClient
from app.main import app
from unittest import TestCase
from app import models
from unittest.mock import patch
from app.api.dependencies import get_current_user
from app.core.strings import WORLD_NOT_FOUND
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


