from . import db
from datetime import datetime,timezone


class User(db.Model):
    __tablename__ = "users"
    user_id       = db.Column(db.Integer,     primary_key=True)
    name          = db.Column(db.String(100),  nullable=False)
    email         = db.Column(db.String(150),  nullable=False, unique=True)
    password_hash = db.Column(db.String(255),  nullable=False)
    created_at    = db.Column(db.DateTime,     default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    courses       = db.relationship("Course",  backref="owner", cascade="all, delete", lazy=True)
    tasks         = db.relationship("Task",    backref="owner", cascade="all, delete", lazy=True)

    def to_dict(self):
        return {
            "user_id":    self.user_id,
            "name":       self.name,
            "email":      self.email,
            "created_at": self.created_at.isoformat()+'Z',
        }


class Category(db.Model):
    __tablename__ = "categories"
    category_id   = db.Column(db.Integer,    primary_key=True)
    name          = db.Column(db.String(50), nullable=False, unique=True)

    def to_dict(self):
        return {"category_id": self.category_id, "name": self.name}


class Course(db.Model):
    __tablename__ = "courses"
    course_id     = db.Column(db.Integer,     primary_key=True)
    user_id       = db.Column(db.Integer,     db.ForeignKey("users.user_id"),   nullable=False)
    course_name   = db.Column(db.String(150), nullable=False)
    course_code   = db.Column(db.String(20),  nullable=False)
    semester      = db.Column(db.String(30),  nullable=False)
    color_tag     = db.Column(db.String(10),  nullable=False, default="#534AB7")

    rubrics       = db.relationship("Rubric", backref="course", cascade="all, delete", lazy=True)
    tasks         = db.relationship("Task",   backref="course", cascade="all, delete", lazy=True)

    def to_dict(self):
        return {
            "course_id":   self.course_id,
            "user_id":     self.user_id,
            "course_name": self.course_name,
            "course_code": self.course_code,
            "semester":    self.semester,
            "color_tag":   self.color_tag,
        }


class Rubric(db.Model):
    __tablename__  = "rubrics"
    rubric_id      = db.Column(db.Integer,     primary_key=True)
    course_id      = db.Column(db.Integer,     db.ForeignKey("courses.course_id"),     nullable=False)
    category_id    = db.Column(db.Integer,     db.ForeignKey("categories.category_id"),nullable=True)
    component_name = db.Column(db.String(100), nullable=False)
    weight_percent = db.Column(db.Float,       nullable=False)

    tasks          = db.relationship("Task", backref="rubric", lazy=True)

    def to_dict(self):
        return {
            "rubric_id":      self.rubric_id,
            "course_id":      self.course_id,
            "category_id":    self.category_id,
            "component_name": self.component_name,
            "weight_percent": self.weight_percent,
        }


class Task(db.Model):
    __tablename__     = "tasks"
    task_id           = db.Column(db.Integer,  primary_key=True)
    user_id           = db.Column(db.Integer,  db.ForeignKey("users.user_id"),        nullable=False)
    course_id         = db.Column(db.Integer,  db.ForeignKey("courses.course_id"),    nullable=False)
    rubric_id         = db.Column(db.Integer,  db.ForeignKey("rubrics.rubric_id"),    nullable=True)
    category_id       = db.Column(db.Integer,  db.ForeignKey("categories.category_id"), nullable=True)
    title             = db.Column(db.String(200), nullable=False)
    description       = db.Column(db.Text,     nullable=True)
    due_date          = db.Column(db.DateTime, nullable=False)
    estimated_minutes = db.Column(db.Integer,  nullable=True)
    priority_score    = db.Column(db.Float,    nullable=True)
    is_completed      = db.Column(db.Boolean,  default=False, nullable=False)
    created_at        = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    notifications     = db.relationship("Notification", backref="task", cascade="all, delete", lazy=True)

    def to_dict(self):
        cat = Category.query.get(self.category_id)
        rub = Rubric.query.get(self.rubric_id)
        crs = Course.query.get(self.course_id)
        return {
            "task_id":           self.task_id,
            "user_id":           self.user_id,
            "course_id":         self.course_id,
            "course_name":       crs.course_name  if crs else None,
            "color_tag":         crs.color_tag    if crs else "#888",
            "rubric_id":         self.rubric_id,
            "rubric_component":  rub.component_name if rub else None,
            "weight_percent":    rub.weight_percent  if rub else 0,
            "category_id":       self.category_id,
            "category":          cat.name if cat else None,
            "title":             self.title,
            "description":       self.description,
            "due_date":          self.due_date.isoformat() + 'Z',
            "estimated_minutes": self.estimated_minutes,
            "priority_score":    self.priority_score,
            "is_completed":      self.is_completed,
            "created_at":        self.created_at.isoformat() + 'Z',
        }


class Notification(db.Model):
    __tablename__   = "notifications"
    notif_id        = db.Column(db.Integer,  primary_key=True)
    task_id         = db.Column(db.Integer,  db.ForeignKey("tasks.task_id"), nullable=False)
    notify_at       = db.Column(db.DateTime, nullable=False)
    is_sent         = db.Column(db.Boolean,  default=False, nullable=False)
    is_acknowledged = db.Column(db.Boolean,  default=False, nullable=False)

    def to_dict(self):
        t   = Task.query.get(self.task_id)
        crs = Course.query.get(t.course_id) if t else None
        return {
            "notif_id":        self.notif_id,
            "task_id":         self.task_id,
            "task_title":      t.title              if t   else None,
            "course_name":     crs.course_name      if crs else None,
            "color_tag":       crs.color_tag        if crs else "#888",
            "due_date":        t.due_date.isoformat() + 'Z' if t else None,
            "notify_at":       self.notify_at.isoformat() + 'Z',
            "is_sent":         self.is_sent,
            "is_acknowledged": self.is_acknowledged,
            "priority_score":  t.priority_score     if t   else None,
        }
