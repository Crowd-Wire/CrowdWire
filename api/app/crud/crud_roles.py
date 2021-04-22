from sqlalchemy.orm import Session
from app.models import Role
from .base import CRUDBase
from app.schemas import RoleCreate, RoleUpdate


class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):

    def get_world_default(self, db: Session, world_id: int) -> Role:
        """
        Returns the default role for a given world
        """
        return db.query(Role).filter(Role.world_id == world_id, Role.is_default.is_(True)).first()

    def create_default(self, db: Session, world_id: int):
        """
        Create default roles when a world is created
        """
        default_roles = [Role(world_id=world_id, name="default", is_default=True, role_manage=True),
                         Role(world_id=world_id, name="speaker"),
                         Role(world_id=world_id, name="moderator")]
        db.add_all(
            default_roles
        )
        db.commit()
        return default_roles


crud_role = CRUDRole(Role)
