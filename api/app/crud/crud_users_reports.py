from .base import CRUDBase
from sqlalchemy.orm import Session
from app.schemas import ReportUserCreate
from app.models import Report_User, User
from app.core import strings
from .crud_world_users import crud_world_user
from .crud_roles import crud_role
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy import desc, asc


class CRUDReport_User(CRUDBase[Report_User, ReportUserCreate, None]):

    async def filter(
            self,
            db: Session,
            user: User,
            reporter_id: int,
            reported_id: int,
            order_by: str,
            order: str,
            world_id: int = None,
            page: int = 1,
            limit: int = 10
    ):

        # only superusers can search without passing the world_id
        if not world_id and not user.is_superuser:
            # TODO: change this
            return None, strings.ROLE_INVALID_PERMISSIONS

        # check if the user has access to the world provided
        if world_id and not user.is_superuser:
            if not (await crud_role.can_access_world_ban(db=db, world_id=world_id, user_id=user.user_id))[0]:
                return None, strings.ROLE_INVALID_PERMISSIONS

        query = db.query(Report_User)

        if world_id:
            query = query.filter(Report_User.world_id == world_id)

        if reported_id:
            query = query.filter(Report_User.reported == reported_id)

        if reporter_id:
            query = query.filter(Report_User.reporter == reporter_id)

        if order == 'desc':
            ord = desc
        else:
            ord = asc

        if order_by == 'timestamp':
            query = query.order_by(ord(Report_User.timestamp))

        return query.offset(limit * (page - 1)).limit(limit).all(), ""

    def get_all_user_reports_sent(self, db: Session, user_id: int, request_user: User, page: int)\
            -> Tuple[List[Report_User], str]:
        """
        Gets all the reports made by a user.
        """
        page_size = 10

        # page cannot be lower than 1
        if page < 1:
            return None, strings.INVALID_PAGE_NUMBER

        if user_id != request_user.user_id and not request_user.is_superuser:
            return None, strings.USER_SENT_REPORTS_ACCESS_FORBIDDEN

        reports = db.query(Report_User).filter(Report_User.reporter == user_id)\
            .offset(page_size * (page - 1)).limit(page_size).all()

        return reports, ""

    def get_all_user_reports_received(self, db: Session, user_id: int, request_user: User, page: int)\
            -> Tuple[List[Report_User], str]:
        """
        Gets all reports received by a user.
        """
        page_size = 10

        # page cannot be lower than 1
        if page < 1:
            return None, strings.INVALID_PAGE_NUMBER

        if not request_user.is_superuser:
            return None, strings.USER_RECEIVED_REPORTS_ACCESS_FORBIDDEN

        reports = db.query(Report_User).filter(Report_User.reported == user_id)\
            .offset(page_size * (page - 1)).limit(page_size).all()

        return reports, ""

    async def get_all_user_reports_received_in_world(
            self, db: Session, user_id: int, request_user: User, world_id: int, page: int)\
            -> Tuple[List[Report_User], str]:
        """
        Checks if the request user is admin or has world ban permissions. Returns the received reports for
        a user in a given world.
        """

        page_size = 10

        # page cannot be lower than 1
        if page < 1:
            return None, strings.INVALID_PAGE_NUMBER

        role, msg = await crud_role.can_access_world_ban(db=db, world_id=world_id, user_id=request_user.user_id)
        if not request_user.is_superuser and not role:
            return None, strings.ACCESS_FORBIDDEN

        reports = db.query(Report_User).filter(Report_User.reported == user_id, Report_User.world_id == world_id)\
            .offset(page_size * (page - 1)).limit(page_size).all()

        return reports, ""

    def get_user1_report_user2_world(self, db: Session, reported: int, reporter: int, world_id: int)\
            -> Optional[Report_User]:
        """
        Checks if a user has reported another in a given world.
        """

        report = db.query(Report_User).filter(
            Report_User.reporter == reporter,
            Report_User.reported == reported,
            Report_User.world_id == world_id
        ).first()

        return report

    def create(self, db: Session, reporter_id: int, reported_id: int, report: ReportUserCreate) -> Tuple[Optional[Report_User], str]:
        """
        Creates a User Report.
        """

        world_id = report.world_id

        if reporter_id == reported_id:
            return None, strings.CANT_DO_SELF_REPORT

        # check if both users have been in this world
        if not crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=reporter_id) \
                or not crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=reported_id):

            return None, strings.USERS_NOT_IN_SAME_WORLD

        # check if the user has already reported the other in this world
        if self.get_user1_report_user2_world(db=db, reporter=reporter_id, reported=reported_id, world_id=world_id):
            return None, strings.USER_ALREADY_REPORTED_IN_THIS_WORLD

        report.reporter = reporter_id
        report.reported = reported_id
        report.timestamp = datetime.now()

        report = super().create(db=db, obj_in=report)
        return report, ""

    async def remove(self, db: Session, reporter: int, reported: int, world_id: int, request_user: User)\
            -> Tuple[Optional[Report_User], str]:
        """
        Deletes the report made by a user to another in a given world. Can be accessed by world mods, admins and
        the reporter
        """
        # The reporter itself,World mods and platform admins can delete a report made to someone in that world
        role, msg = await crud_role.can_access_world_ban(db=db, world_id=world_id, user_id=request_user.user_id)
        if reporter != request_user.user_id and not request_user.is_superuser and not role:
            return None, strings.ACCESS_FORBIDDEN

        report = self.get_user1_report_user2_world(db=db, reported=reported, reporter=reporter, world_id=world_id)
        if report is None:
            return None, strings.USER_REPORT_NOT_FOUND

        db.delete(report)
        db.commit()
        return report, ""


crud_report_user = CRUDReport_User(Report_User)
