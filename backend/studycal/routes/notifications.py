from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from .. import db
from ..models import Notification, Task

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    uid      = int(get_jwt_identity())
    task_ids = [t.task_id for t in Task.query.filter_by(user_id=uid).all()]
    notifs   = (Notification.query
                .filter(Notification.task_id.in_(task_ids))
                .order_by(Notification.notify_at.desc())
                .all())
    return jsonify([n.to_dict() for n in notifs]), 200


@notifications_bp.route("/pending", methods=["GET"])
@jwt_required()
def get_pending():
    uid      = int(get_jwt_identity())
    task_ids = [t.task_id for t in Task.query.filter_by(user_id=uid).all()]
    now      = datetime.utcnow()
    notifs   = (Notification.query
                .filter(
                    Notification.task_id.in_(task_ids),
                    Notification.is_sent == False,
                    Notification.notify_at <= now,
                )
                .all())
    for n in notifs:
        n.is_sent = True
    db.session.commit()
    return jsonify([n.to_dict() for n in notifs]), 200


@notifications_bp.route("/<int:notif_id>/acknowledge", methods=["PATCH"])
@jwt_required()
def acknowledge(notif_id):
    uid   = int(get_jwt_identity())
    notif = Notification.query.get_or_404(notif_id)
    task  = Task.query.filter_by(task_id=notif.task_id, user_id=uid).first()
    if not task:
        return jsonify({"error": "Notification not found"}), 404

    notif.is_acknowledged = True
    db.session.commit()
    return jsonify(notif.to_dict()), 200
