from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Rubric, Course

rubrics_bp = Blueprint("rubrics", __name__)


def _owns_course(course_id, uid):
    return Course.query.filter_by(course_id=course_id, user_id=uid).first()


@rubrics_bp.route("/course/<int:course_id>", methods=["GET"])
@jwt_required()
def get_rubrics(course_id):
    uid = int(get_jwt_identity())
    if not _owns_course(course_id, uid):
        return jsonify({"error": "Course not found"}), 404

    rubrics = (Rubric.query
               .filter_by(course_id=course_id)
               .order_by(Rubric.weight_percent.desc())
               .all())
    return jsonify([r.to_dict() for r in rubrics]), 200


@rubrics_bp.route("", methods=["POST"])
@jwt_required()
def create_rubric():
    uid  = int(get_jwt_identity())
    data = request.get_json()
    if not data or not all(k in data for k in ("course_id", "component_name", "weight_percent")):
        return jsonify({"error": "course_id, component_name and weight_percent are required"}), 400

    if not _owns_course(data["course_id"], uid):
        return jsonify({"error": "Course not found"}), 404

    rubric = Rubric(
        course_id=data["course_id"],
        category_id=data.get("category_id"),
        component_name=data["component_name"],
        weight_percent=float(data["weight_percent"]),
    )
    db.session.add(rubric)
    db.session.commit()
    return jsonify(rubric.to_dict()), 201


@rubrics_bp.route("/<int:rubric_id>", methods=["PUT"])
@jwt_required()
def update_rubric(rubric_id):
    uid    = int(get_jwt_identity())
    rubric = Rubric.query.get_or_404(rubric_id)
    if not _owns_course(rubric.course_id, uid):
        return jsonify({"error": "Rubric not found"}), 404

    data = request.get_json()
    for field in ("component_name", "weight_percent", "category_id"):
        if field in data:
            setattr(rubric, field, data[field])
    db.session.commit()
    return jsonify(rubric.to_dict()), 200


@rubrics_bp.route("/<int:rubric_id>", methods=["DELETE"])
@jwt_required()
def delete_rubric(rubric_id):
    uid    = int(get_jwt_identity())
    rubric = Rubric.query.get_or_404(rubric_id)
    if not _owns_course(rubric.course_id, uid):
        return jsonify({"error": "Rubric not found"}), 404

    db.session.delete(rubric)
    db.session.commit()
    return jsonify({"message": "Rubric deleted"}), 200
