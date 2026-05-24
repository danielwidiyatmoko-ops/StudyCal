# StudyCal

A student calendar web application for managing academic tasks across multiple courses, with automatic priority scoring based on grade weight and deadline proximity.

Built as a final project for the Implementation and Testing of Software (IMPAL) course.

---
## Members

1. Benedictus D W. (103012400209)

thats it... this is a solo project... by one person...

have mercy please...

---
## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python 3 + Flask |
| Database | SQLite (local), PosgreSQL (hosting)|
| Auth | JWT (JSON Web Tokens) |
| Hosting | Vercel (frontend) + Render (backend) |

---
## Diagrams

Diagrams are located in the diagrams folder, which contains the basic UCD, ERD, Class Diagram, Sequence Diagram, DFD-0, and DFD-1

These act as the basic diagrams that define the program, created using a mix of mermaid for pretty diagrams, plantuml for diagrams that cant be ade with mermaid, and drawio for diagrams that cant be made with plantuml. 

## Features

- Register and log in securely with JWT authentication
- Add university courses with custom color tags
- Define score rubric components per course (e.g. Midterm 35%, Final 40%)
- Add tasks linked to a course and rubric component
- Auto-calculated priority score based on grade weight and deadline proximity
- Monthly calendar view with color-coded task dots per course
- Priority-sorted task list with High / Medium / Low badges
- Import schedule from `.ics` files exported from Canvas or Moodle
- Browser notification alerts with dismiss/acknowledge tracking

---

## Priority Formula

```
priority_score = (weight_percent × 0.6) + (urgency_score × 0.4)

urgency_score:
  ≤ 1 day  → 100
  ≤ 3 days → 75
  ≤ 7 days → 50
  > 7 days → 25

Ungraded tasks (no rubric): weight = 0, driven purely by urgency
```

---

## Project Structure

```
StudyCal/
├── backend/          # Flask REST API
├── frontend/         # React + Vite SPA
└── docs/             # Diagrams, ERD, SQL, Postman collection
```

---

## Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # fill in your values
flask run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Documentation

Import `docs/StudyCal.postman_collection.json` into Postman to test all endpoints.

Base URL (local): `http://localhost:5000/api`

---

## Deployment

- Frontend: Vercel — connect GitHub repo, set root to `frontend/`
- Backend: Render

---

## Database

Schema and dummy data: `docs/studycal.sql`

Tables: `users`, `courses`, `rubrics`, `categories`, `tasks`, `notifications`

---

## License

Academic project — Implementation and Testing of Software, 2026.
