from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from .. import db
from ..models import Task, Course, Rubric, Notification
from ..priority import calculate_priority
import re

tasks_bp = Blueprint("tasks", __name__)


# ── Helpers ───────────────────────────────────────────────────

def _parse_dt(s):
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    raise ValueError(f"Cannot parse date: {s}")


def _recalc(task):
    rub    = Rubric.query.get(task.rubric_id)
    weight = rub.weight_percent if rub else 0
    task.priority_score = calculate_priority(weight, task.due_date)


def _auto_notify(task):
    """Schedule 3 notifications: 1 day, 3 hours, 30 minutes before due."""
    Notification.query.filter_by(task_id=task.task_id).delete()
    now     = datetime.utcnow()
    offsets = [timedelta(days=1), timedelta(hours=3), timedelta(minutes=30)]
    for offset in offsets:
        notify_at = task.due_date - offset
        if notify_at > now:
            db.session.add(Notification(task_id=task.task_id, notify_at=notify_at))


# ── Routes ────────────────────────────────────────────────────

@tasks_bp.route("", methods=["GET"])
@jwt_required()
def get_tasks():
    uid   = int(get_jwt_identity())
    tasks = (Task.query
             .filter_by(user_id=uid)
             .order_by(Task.priority_score.desc().nullslast(), Task.due_date)
             .all())
    return jsonify([t.to_dict() for t in tasks]), 200


@tasks_bp.route("/calendar", methods=["GET"])
@jwt_required()
def get_calendar():
    uid   = int(get_jwt_identity())
    year  = request.args.get("year",  type=int, default=datetime.utcnow().year)
    month = request.args.get("month", type=int, default=datetime.utcnow().month)
    start = datetime(year, month, 1)
    end   = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)

    tasks = (Task.query
             .filter_by(user_id=uid)
             .filter(Task.due_date >= start, Task.due_date < end)
             .order_by(Task.due_date)
             .all())
    return jsonify([t.to_dict() for t in tasks]), 200


@tasks_bp.route("", methods=["POST"])
@jwt_required()
def create_task():
    uid  = int(get_jwt_identity())
    data = request.get_json()
    if not data or not all(k in data for k in ("title", "course_id", "due_date")):
        return jsonify({"error": "title, course_id and due_date are required"}), 400

    if not Course.query.filter_by(course_id=data["course_id"], user_id=uid).first():
        return jsonify({"error": "Course not found"}), 404

    task = Task(
        user_id=uid,
        course_id=data["course_id"],
        rubric_id=data.get("rubric_id"),
        category_id=data.get("category_id"),
        title=data["title"],
        description=data.get("description"),
        due_date=_parse_dt(data["due_date"]),
        estimated_minutes=data.get("estimated_minutes"),
        is_completed=False,
    )
    db.session.add(task)
    db.session.flush()
    _recalc(task)
    _auto_notify(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    uid  = int(get_jwt_identity())
    task = Task.query.filter_by(task_id=task_id, user_id=uid).first_or_404()
    data = request.get_json()

    for field in ("title", "description", "estimated_minutes", "category_id", "rubric_id"):
        if field in data:
            setattr(task, field, data[field])
    if "due_date" in data:
        task.due_date = _parse_dt(data["due_date"])
    if "course_id" in data:
        if not Course.query.filter_by(course_id=data["course_id"], user_id=uid).first():
            return jsonify({"error": "Course not found"}), 404
        task.course_id = data["course_id"]

    _recalc(task)
    _auto_notify(task)
    db.session.commit()
    return jsonify(task.to_dict()), 200


@tasks_bp.route("/<int:task_id>/complete", methods=["PATCH"])
@jwt_required()
def complete_task(task_id):
    uid  = int(get_jwt_identity())
    task = Task.query.filter_by(task_id=task_id, user_id=uid).first_or_404()
    task.is_completed = not task.is_completed
    db.session.commit()
    return jsonify(task.to_dict()), 200


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    uid  = int(get_jwt_identity())
    task = Task.query.filter_by(task_id=task_id, user_id=uid).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200


@tasks_bp.route("/import-ics", methods=["POST"])
@jwt_required()
def import_ics():
    uid  = int(get_jwt_identity())
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    # Validate user owns the target course
    course_id = request.form.get("course_id", type=int)
    if not course_id or not Course.query.filter_by(course_id=course_id, user_id=uid).first():
        return jsonify({"error": "Valid course_id is required"}), 400

    content = file.read().decode("utf-8", errors="ignore")
    events  = []
    current = {}

    for line in content.splitlines():
        line = line.strip()
        if line == "BEGIN:VEVENT":
            current = {}
        elif line == "END:VEVENT":
            if "SUMMARY" in current and "DTSTART" in current:
                events.append(current)
            current = {}
        elif line.startswith("SUMMARY"):
            current["SUMMARY"] = line.split(":", 1)[1] if ":" in line else ""
        elif line.startswith("DTSTART"):
            val = line.split(":", 1)[1] if ":" in line else ""
            val = re.sub(r"[TZ]", " ", val).strip()
            try:
                dt = (datetime.strptime(val[:15], "%Y%m%d %H%M%S")
                      if len(val) >= 14
                      else datetime.strptime(val[:8], "%Y%m%d"))
                current["DTSTART"] = dt
            except Exception:
                pass
        elif line.startswith("DESCRIPTION"):
            current["DESCRIPTION"] = line.split(":", 1)[1] if ":" in line else ""

    created = []
    for ev in events:
        task = Task(
            user_id=uid,
            course_id=course_id,
            title=ev["SUMMARY"],
            description=ev.get("DESCRIPTION", "Imported from ICS"),
            due_date=ev["DTSTART"],
            is_completed=False,
        )
        db.session.add(task)
        db.session.flush()
        _recalc(task)
        created.append(task.to_dict())

    db.session.commit()
    return jsonify({"imported": len(created), "tasks": created}), 201
