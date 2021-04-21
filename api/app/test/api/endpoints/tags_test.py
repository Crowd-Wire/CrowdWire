from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from unittest.mock import patch
from unittest import TestCase
from app.models import Tag
from app import schemas, models
from app.api.dependencies import get_current_user, reusable_oauth2

client = TestClient(app)


# this function will override get_current_user so that there is no need to see if a token is valid
async def override_dependency(token: str = None):
    return models.User()


app.dependency_overrides[get_current_user] = override_dependency


class TestTags(TestCase):
    def test_get_all(self):
        with patch("app.crud.crud_tags.CRUDTag.get_all") as mock_post:
            mock_post.return_value = [Tag(name="string"), Tag(name="string2"), Tag(name="string3")]
            response = client.get(
                "/tags",
            )
            assert response.status_code == 200
            assert mock_post.call_count == 1
            assert len(response.json()) == 3
