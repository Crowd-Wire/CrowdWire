from fastapi.testclient import TestClient
from app.main import app
from unittest import TestCase
from app import models, schemas
from unittest.mock import patch
from app.api.dependencies import get_current_user, get_db, get_current_user_for_invite
from app.core.strings import WORLD_NOT_FOUND
from app.models import Tag, User, World_User
from app.core import strings
from app.schemas import GuestUser
from datetime import datetime

client = TestClient(app)


async def override_dependency_user(token: str = None):
    return User()


async def override_dependency_guest():
    return GuestUser(user_id="ccca8d8c-ee65-433e-af45-d5d9ded235a6")


async def override_dependency_super_user():
    return User(is_superuser=True)


async def override_get_db():
    return None


async def override_get_current_user_for_invite_user():
    return User(), models.World(world_id=1, world_map="".encode())


async def override_get_current_user_for_invite_guest():
    return GuestUser(user_id="ccca8d8c-ee65-433e-af45-d5d9ded235a6"), models.World(world_id=1, world_map="".encode())


app.dependency_overrides[get_db] = override_get_db


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
            assert mock_get.call_count == 1

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
            assert mock_get.call_count == 1

    def test_search_public_worlds_user(self):
        """
        Expects 200 Ok when user searches public worlds.
        """
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
            assert mock_get.call_count == 1

    def test_search_owned_worlds_user(self):
        """
        Expects 200 Ok when user searches for owned worlds.
        """
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
            assert mock_get.call_count == 1

    def test_search_joined_worlds_user(self):
        """
        Expects 200 Ok when user searchs for joined worlds.
        """
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
            assert mock_get.call_count == 1

    def test_search_invalid_worlds_visibility_user(self):
        """
        Expects 400 Bad Request when user provides wrong visibility parameter.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        response = client.get(
            '/worlds?visibility=wrong'
        )
        assert response.status_code == 400

    def test_search_public_worlds_guest(self):
        """
        Expects 200 Ok when a guest searches public worlds.
        """
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
            assert mock_get.call_count == 1

    def test_search_invalid_worlds_visibility_guest(self):
        """
        Expects 400 Bad Request when a guest provides invalid visibility parameter.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        response = client.get(
            '/worlds?visibility=wrong'
        )
        assert response.status_code == 400

    def test_search_worlds_by_name_or_description(self):
        """
        Expects 200 Ok when user tries to search world by name or description.
        """
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
            assert mock_get.call_count == 1

    def test_search_worlds_by_tags(self):
        """
        Expects 200 Ok when guest tries to search world by tags.
        """
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
            assert mock_get.call_count == 1

    def test_create_world_correct_data_user(self):
        "Expects 200 Ok when user creates a world with correct data."
        app.dependency_overrides[get_current_user] = override_dependency_user
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
            assert mock_post.call_count == 1

    def test_create_world_invalid_tags_user(self):
        """
        Expects 400 Bad Request when user provides invalid tags.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
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
            assert mock_post.call_count == 1

    def test_create_world_guest(self):
        """
        Expects 403 Forbidden when guest tries to create a world.
        """
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
        """
        Expects 403 Forbidden when gues tries to delete a world.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.delete(
            "/worlds/1"
        )
        assert response.status_code == 403
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_delete_world_with_permissions_user(self):
        """
        Expects 200 Ok when a user tries to remove a world with the right permissions.
        """
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
            assert mock_delete.call_count == 1

    def test_delete_world_without_permissions_user(self):
        """
        Expects 400 Bad Request when a user tries to delete a world without permissions.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.remove") as mock_delete:
            mock_delete.return_value = None, ""
            response = client.delete(
                "/worlds/1"
            )
            assert response.status_code == 400
            assert mock_delete.call_count == 1

    def test_update_world_user_info_change_others_guest(self):
        """
        Expects 400 Bad Request when guest tries to change another user info.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest

        response = client.put(
            "/worlds/1/users/1",
            json={}
        )
        assert response.status_code == 400
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_update_world_user_info_cannot_report_guest(self):
        """
        Expects 400 Bad Request when someone tries to report a guest.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        response = client.put(
            "/worlds/1/users/ccca8d8c-ee65-433e-af45-d5d9ded235a6",
            json={'status': 1}
        )

        assert response.status_code == 400
        assert response.json()['detail'] == strings.USER_IS_NOT_BANNABLE

    def test_update_world_user_info_only_guests_can_update(self):
        """
        Expects 400 Bad Request when someone that is not the guest itself tries to update its info.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        response = client.put(
            "/worlds/1/users/ccca8d8c-ee65-433e-af45-d5d9ded235a6",
            json={}
        )

        assert response.status_code == 400
        assert response.json()['detail'] == strings.CHANGE_USER_INFO_FORBIDDEN

    def test_update_world_user_info_update_success_guest(self):
        """
        Expects 200 Ok when a guest tries to update its own profile.
        """

        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.redis.connection.RedisConnector.get_world_user_data") as mock_get:
            with patch("app.redis.connection.RedisConnector.save_world_user_data") as mock_put:
                role = models.Role(role_id=1, world_id=1)

                mock_get.return_value = schemas.World_UserWithRoleInDB(
                    role_id=1, avatar='avatar_1', username='name', role=role, world_id=1
                )

                response = client.put(
                    "/worlds/1/users/ccca8d8c-ee65-433e-af45-d5d9ded235a6",
                    json={'username': 'new_name'}
                )
                assert response.status_code == 200
                assert response.json()['username'] == 'new_name'
                assert response.json()['avatar'] == 'avatar_1'
                assert mock_get.call_count == 1
                assert mock_put.call_count == 1

    def test_update_world_user_info_not_joined_guest(self):
        """
        Expects 400 Bad Request when guest tries to update data from a world where he didnt join.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.redis.connection.RedisConnector.get_world_user_data") as mock_get:
            mock_get.return_value = None

            response = client.put(
                "/worlds/1/users/ccca8d8c-ee65-433e-af45-d5d9ded235a6",
                json={
                    'username': 'new_username'
                }
            )
            assert response.status_code == 400
            assert mock_get.call_count == 1

    def test_update_world_user_info_not_joined_user(self):
        """
        Expects 400 Bad Request when user tries to update its info in a not joined world.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_world_users.CRUDWorld_User.update_world_user_info") as mock_put:
            mock_put.return_value = None , ""

            response = client.put(
                "/worlds/1/users/1",
                json={}
            )
            assert response.status_code == 400
            assert mock_put.call_count == 1

    def test_update_world_user_info_access_user(self):
        """
        Expects 200 Ok when a user tries to update its info in a joined world.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_world_users.CRUDWorld_User.update_world_user_info") as db_update:
            with patch("app.redis.connection.RedisConnector.get_world_user_data") as mock_get:
                with patch("app.redis.connection.RedisConnector.save_world_user_data") as mock_put:
                    role = models.Role(role_id=1, world_id=1)

                    db_update.return_value = World_User(role_id=1, avatar="avatar_1", username="name"), ""
                    mock_get.return_value = schemas.World_UserWithRoleInDB(
                        role_id=1, avatar='avatar_1', username='name', role=role, world_id=1
                    )

                    response = client.put(
                        "/worlds/1/users/1",
                        json={
                            'username': 'new_username'
                        }
                    )

                    assert response.status_code == 200
                    assert response.json()['username'] == "new_username"
                    assert response.json()['avatar'] == 'avatar_1'
                    assert db_update.call_count == 1
                    assert mock_get.call_count == 1
                    assert mock_put.call_count == 1

    def test_update_world_guest(self):
        """
        Expects 403 Forbidden when guest tries to update world.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        response = client.put(
            "/worlds/1", json={}
        )

        assert response.status_code == 403
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_update_world_no_access_user(self):
        """
        Expects 400 Bad Request when user has no access to update world.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.is_editable_to_user") as editable:
            editable.return_value = None, ""
            response = client.put(
                "/worlds/1", json={}
            )
            assert response.status_code == 400
            assert editable.call_count == 1

    def test_update_world_correct_access_user(self):
        """
        Expects 200 Ok when user can edit and provides correct update data.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.is_editable_to_user") as editable:
            with patch("app.crud.crud_worlds.CRUDWorld.update") as update:

                editable.return_value = models.World(), ""
                update.return_value = models.World(
                    world_id=1, name="test", creator=1, world_map=bytes("".encode()), max_users=10
                ), ""
                response = client.put(
                    "/worlds/1", json={
                        "name": "test"
                    }
                )

                assert response.status_code == 200
                assert response.json()['name'] == "test"
                assert response.json()['world_id'] == 1
                assert editable.call_count == 1
                assert update.call_count == 1

    def test_update_world_incorrect_data_user(self):
        """
        Expects 400 Bad Request when user provides invalid update data.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.is_editable_to_user") as editable:
            with patch("app.crud.crud_worlds.CRUDWorld.update") as update:
                editable.return_value = models.World(), ""
                update.return_value = None, ""
                response = client.put(
                    "/worlds/1", json={
                        "name": "test"
                    }
                )
                assert response.status_code == 400
                assert editable.call_count == 1
                assert update.call_count == 1

    def test_join_world_no_access_user(self):
        """
        Expects 400 Bad Request when user tries to join world that he has no access.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.get_available") as access:
            access.return_value = None, ""
            response = client.post(
                "/worlds/1/users"
            )
            assert response.status_code == 400
            assert access.call_count == 1

    def test_join_world_in_cache_user(self):
        """
        Expects 200 Ok when a User tries to join a world and its data is in cache.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.get_available") as access:
            with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
                with patch("app.crud.crud_world.update_online_users") as online_users:
                    role = schemas.RoleInDB(role_id=1, world_id=1)
                    access.return_value = models.World(world_map="".encode()), ""
                    online_users.return_value = access.return_value
                    cache.return_value = schemas.World_UserWithRoleAndMap(
                        map="".encode(), role=role, role_id=1, world_id=1
                    )
                    response = client.post(
                        "/worlds/1/users"
                    )
                    assert response.status_code == 200
                    assert response.json()['role']['role_id'] == 1
                    assert response.json()['world_id'] == 1
                    assert access.call_count == 1
                    assert cache.call_count == 1

    def test_join_world_no_cache_user(self):
        """
        Expects 200 Ok when a user tries to join a world and its data is not in cache.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_worlds.CRUDWorld.get_available") as access:
            with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
                with patch("app.crud.crud_world_users.CRUDWorld_User.join_world") as join:
                    with patch("app.crud.crud_world.update_online_users") as online_users:
                        # TODO: Change later
                        access.return_value = models.World(world_map="".encode()), ""
                        online_users.return_value = access.return_value
                        cache.return_value = None
                        join.return_value = (models.World_User(user_id=1, role_id=1, world_id=1),
                                             models.Role(role_id=1, world_id=1))

                        response = client.post(
                            "/worlds/1/users"
                        )
                        assert response.status_code == 200
                        assert response.json()['world_id'] == 1
                        assert response.json()['role']['role_id'] == 1
                        assert access.call_count == 1
                        assert cache.call_count == 1
                        assert join.call_count == 1

    def test_join_world_no_access_guest(self):
        """
        Expects 400 Bad Request when a guest tries to access a world not allowed for guests.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.get_available_for_guests") as access:
            access.return_value = None, ""
            response = client.post(
                "/worlds/1/users"
            )
            assert response.status_code == 400
            assert access.call_count == 1

    def test_join_world_in_cache_guest(self):
        """
        Expects 200 Ok when a guest tries to join a world that has already joined.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.get_available_for_guests") as access:
            with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
                role = schemas.RoleInDB(role_id=1, world_id=1)
                access.return_value = models.World(world_map="".encode()), ""
                cache.return_value = schemas.World_UserWithRoleAndMap(
                    map="".encode(), role=role, role_id=1, world_id=1
                )
                response = client.post(
                    "/worlds/1/users"
                )
                assert response.status_code == 200
                assert response.json()['role']['role_id'] == 1
                assert response.json()['world_id'] == 1
                assert access.call_count == 1
                assert cache.call_count == 1

    def test_join_world_no_cache_guest(self):
        """
        Expects 200 Ok when a guest tries to join a world that has not joined yet.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest
        with patch("app.crud.crud_worlds.CRUDWorld.get_available_for_guests") as access:
            with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
                with patch("app.crud.crud_roles.CRUDRole.get_world_default") as default_role:
                    with patch("app.redis.connection.RedisConnector.join_new_guest_user") as join:
                        role = schemas.RoleInDB(role_id=1, world_id=1)

                        access.return_value = models.World(world_map="".encode()), ""
                        cache.return_value = None
                        default_role.return_value = models.Role(role_id=1, world_id=1)
                        join.return_value = schemas.World_UserWithRoleInDB(
                            role=role, avatar='avatar_1', username='name', role_id=1, world_id=1
                        )
                        response = client.post(
                            "/worlds/1/users",
                        )
                        assert response.status_code == 200
                        assert response.json()['role']['role_id'] == 1
                        assert response.json()['world_id'] == 1
                        assert access.call_count == 1
                        assert cache.call_count == 1
                        assert default_role.call_count == 1
                        assert join.call_count == 1

    def test_join_world_by_invite_in_cache_user(self):
        """
        Expects 200 Ok when a user tries to join a world that already joined.
        """
        app.dependency_overrides[get_current_user_for_invite] = override_get_current_user_for_invite_user
        with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
            role = schemas.RoleInDB(role_id=1, world_id=1)

            cache.return_value = schemas.World_UserWithRoleAndMap(
                map="".encode(), role=role, role_id=1, world_id=1
            )

            response = client.post(
                "/worlds/invite/correct"
            )

            assert response.status_code == 200
            assert response.json()['world_id'] == 1
            assert response.json()['role']['role_id'] == 1
            assert cache.call_count == 1

    def test_join_world_by_invite_no_cache_user(self):
        """
        Expects 200 Ok when a user tries to join a world that has not joined yet.
        """
        app.dependency_overrides[get_current_user_for_invite] = override_get_current_user_for_invite_user
        with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
            with patch("app.crud.crud_world_users.CRUDWorld_User.join_world") as join:

                cache.return_value = None
                join.return_value = (models.World_User(user_id=1, role_id=1, world_id=1),
                                     models.Role(role_id=1, world_id=1))

                response = client.post(
                    "/worlds/invite/correct"
                )

                assert response.status_code == 200
                assert response.json()['world_id'] == 1
                assert response.json()['role']['role_id'] == 1
                assert cache.call_count == 1
                assert join.call_count == 1

    def test_join_world_by_invite_in_cache_guest(self):
        """
        Expects 200 Ok when a guest tries to join the same world.
        """
        app.dependency_overrides[get_current_user_for_invite] = override_get_current_user_for_invite_guest

        with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
            role = schemas.RoleInDB(role_id=1, world_id=1)

            cache.return_value = schemas.World_UserWithRoleAndMap(
                map="".encode(), role=role, role_id=1, world_id=1
            )

            response = client.post(
                "/worlds/invite/correct"
            )

            assert response.status_code == 200
            assert response.json()['world_id'] == 1
            assert response.json()['role']['role_id'] == 1
            assert cache.call_count == 1

    def test_join_world_by_invite_no_cache_guest(self):
        """
        Expects 200 Ok when a guest tries to join a world that has not yet joined.
        """

        app.dependency_overrides[get_current_user_for_invite] = override_get_current_user_for_invite_guest
        with patch("app.redis.connection.RedisConnector.get_world_user_data") as cache:
            with patch("app.crud.crud_roles.CRUDRole.get_world_default") as default_role:
                with patch("app.redis.connection.RedisConnector.join_new_guest_user") as join:
                    role = schemas.RoleInDB(role_id=1, world_id=1)

                    cache.return_value = None
                    default_role.return_value = models.Role(role_id=1, world_id=1)
                    join.return_value = schemas.World_UserWithRoleInDB(
                        role=role, avatar='avatar_1', username='name', role_id=1, world_id=1
                    )
                    response = client.post(
                        "/worlds/invite/correct"
                    )

                    assert response.status_code == 200
                    assert response.json()['world_id'] == 1
                    assert response.json()['role']['role_id'] == 1
                    assert cache.call_count == 1
                    assert default_role.call_count == 1
                    assert join.call_count == 1

    def test_get_all_users_from_world_guest(self):
        """
        Expects 403 Forbidden when a guest tries to retrieve all users from world.
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest

        response = client.get(
            "/worlds/1/users"
        )

        assert response.status_code == 403
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_get_all_users_from_world_no_access_user(self):
        """
        Expects 400 Bad Request when user tries to access all users from world without permission.
        """
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_roles.CRUDRole.can_access_world_roles") as access:
            access.return_value = None, ""

            response = client.get(
                "/worlds/1/users"
            )

            assert response.status_code == 400
            assert access.call_count == 1

    def test_get_all_users_from_world_with_access_user(self):
        app.dependency_overrides[get_current_user] = override_dependency_user
        with patch("app.crud.crud_roles.CRUDRole.can_access_world_roles") as access:
            with patch("app.crud.crud_world_users.CRUDWorld_User.get_all_registered_users") as get_users:

                access.return_value = models.Role(), ""
                get_users.return_value = [
                    models.World_User(world_id=1, role_id=1, user_id=1),
                    models.World_User(world_id=1, role_id=1, user_id=2)
                ]

                response = client.get(
                    "/worlds/1/users"
                )

                assert response.status_code == 200
                assert len(response.json()) == 2
                assert response.json()[0]['user_id'] == 1
                assert response.json()[1]['user_id'] == 2
                assert access.call_count == 1
                assert get_users.call_count == 1

    def test_get_worlds_reports_guest(self):
        """
        Expects 403 Forbidden when guest tries to access world reports
        """
        app.dependency_overrides[get_current_user] = override_dependency_guest

        response = client.get(
            "/worlds/reports/"
        )

        assert response.status_code == 403
        assert response.json()['detail'] == strings.ACCESS_FORBIDDEN

    def test_get_worlds_reports_not_super_user(self):
        """
        Expects 403 Forbidden when a user that is not super user tries to access the world reports
        """
        app.dependency_overrides[get_current_user] = override_dependency_user

        response = client.get(
            "/worlds/reports/"
        )

        assert response.status_code == 403
        assert response.json()['detail'] == strings.WORLD_REPORT_ACCESS_FORBIDDEN

    def test_get_worlds_reports_is_superuser(self):
        """
        Expects 200 Ok when a super user tries to access the world reports
        """
        app.dependency_overrides[get_current_user] = override_dependency_super_user

        with patch("app.crud.crud_world_reports.CRUDReport_World.get_all_world_reports") as mock_get:
            mock_get.return_value = [{'reported': 1, 'reporter': 1, 'comment': 'test',
                                      'timestamp': datetime.now(), 'reviewed': True, 'banned': False,
                                      'world_name': 'test', 'reporter_email': 'test@test.com'}], ""

            response = client.get(
                "/worlds/reports/"
            )

            assert response.status_code == 200
            assert len(response.json()) == 1
            assert response.json()[0]['comment'] == 'test'
            assert response.json()[0]['reported'] == 1
            assert response.json()[0]['reporter'] == 1
            assert response.json()[0]['reviewed']
            assert not response.json()[0]['banned']
            assert response.json()[0]['world_name'] == 'test'
            assert response.json()[0]['reporter_email'] == 'test@test.com'
            assert mock_get.call_count == 1
