from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Course

courses_bp = Blueprint("courses", __name__)


def _owned(course_id, uid):
    return Course.query.filter_by(course_id=course_id, user_id=uid).first()


@courses_bp.route("", methods=["GET"])
@jwt_required()
def get_courses():
    uid     = int(get_jwt_identity())
    courses = Course.query.filter_by(user_id=uid).order_by(Course.course_name).all()
    return jsonify([c.to_dict() for c in courses]), 200


@courses_bp.route("", methods=["POST"])
@jwt_required()
def create_course():
    uid  = int(get_jwt_identity())
    data = request.get_json()
    if not data or not all(k in data for k in ("course_name", "course_code", "semester")):
        return jsonify({"error": "course_name, course_code and semester are required"}), 400

    course = Course(
        user_id=uid,
        course_name=data["course_name"],
        course_code=data["course_code"],
        semester=data["semester"],
        color_tag=data.get("color_tag", "#534AB7"),
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@courses_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
def update_course(course_id):
    uid    = int(get_jwt_identity())
    course = _owned(course_id, uid)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    data = request.get_json()
    for field in ("course_name", "course_code", "semester", "color_tag"):
        if field in data:
            setattr(course, field, data[field])
    db.session.commit()
    return jsonify(course.to_dict()), 200


@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    uid    = int(get_jwt_identity())
    course = _owned(course_id, uid)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"}), 200
