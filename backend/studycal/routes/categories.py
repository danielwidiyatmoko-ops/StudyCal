from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Category

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():
    cats = Category.query.order_by(Category.name).all()
    return jsonify([c.to_dict() for c in cats]), 200
