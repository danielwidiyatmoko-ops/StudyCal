from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db  = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    # ── Config ────────────────────────────────────────────────
    app.config["SQLALCHEMY_DATABASE_URI"]        = os.getenv("DATABASE_URL", "sqlite:///studycal.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"]                 = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]       = False

    # ── Extensions ────────────────────────────────────────────
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_url}})
    db.init_app(app)
    jwt.init_app(app)

    # ── Blueprints ────────────────────────────────────────────
    from .routes.auth          import auth_bp
    from .routes.courses       import courses_bp
    from .routes.rubrics       import rubrics_bp
    from .routes.tasks         import tasks_bp
    from .routes.notifications import notifications_bp
    from .routes.categories    import categories_bp

    app.register_blueprint(auth_bp,          url_prefix="/api/auth")
    app.register_blueprint(courses_bp,       url_prefix="/api/courses")
    app.register_blueprint(rubrics_bp,       url_prefix="/api/rubrics")
    app.register_blueprint(tasks_bp,         url_prefix="/api/tasks")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(categories_bp,    url_prefix="/api/categories")

    # ── DB init + seed ────────────────────────────────────────
    with app.app_context():
        db.create_all()
        _seed_categories()

    return app


def _seed_categories():
    from .models import Category
    if Category.query.count() == 0:
        defaults = ["Homework", "Online Quiz", "Exam", "Project", "Lab Report"]
        for name in defaults:
            db.session.add(Category(name=name))
        db.session.commit()
