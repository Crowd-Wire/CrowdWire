from .base import CRUDBase
from sqlalchemy.orm import Session
from app.schemas import ReportUserCreate
from app.models import Report_User, User
from app.core import strings
from .crud_world_users import crud_world_user

class CRUDReport_User(CRUDBase[Report_User, ReportUserCreate, None]):

    def get_all_user_reports_sent(self, db: Session, user_id: int, request_user: User, page: int):
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

    def get_all_user_reports_received(self, db: Session, user_id: int, request_user: User, page: int ):
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


    def get_user1_report_user2_world(self, db: Session, reported: int, reporter: int, world_id: int):
        """
        Checks if a user has reported another in a given world.
        """

        report = db.query(Report_User).filter(
            Report_User.reporter == reporter,
            Report_User.reported == reported,
            Report_User.world_id == world_id
        ).first()

        return report

    def create(self, db: Session, user_id: int, report: ReportUserCreate):
        """
        Creates a User Report.
        """

        reported = report.reported
        world_id = report.world_id

        # check if both users have been in this world
        if not crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=user_id) \
            or not crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=reported):
            return None, strings.USERS_NOT_IN_SAME_WORLD

        # check if the user has already reported the other in this world
        if self.get_user1_report_user2_world(db=db, reporter=user_id, reported=reported, world_id=world_id):
            return None, strings.USER_ALREADY_REPORTED_IN_THIS_WORLD

        report.reporter = user_id

        report = super().create(db=db, obj_in=report)
        return report, ""


crud_report_user = CRUDReport_User(Report_User)

