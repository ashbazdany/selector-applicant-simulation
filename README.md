# Student Management System — CRUD Web Application

A complete CRUD (Create, Read, Update, Delete) web application built to satisfy the
"Complete CRUD-Based Web Application Development" SOP.

## 1. Project Overview
A Student Management System that lets a user add, view, search, edit, and delete
student records through a web UI backed by a REST API and a relational database.

## 2. Problem Statement
Institutions need a simple, reliable way to maintain student records (name, email,
course, year, phone) with validation, without relying on spreadsheets or paper.

## 3. Objectives
- Provide a responsive web UI for managing student records.
- Expose a RESTful API implementing full CRUD operations.
- Persist data in a relational database (SQLite).
- Validate input on both client and server.
- Handle errors gracefully with meaningful messages.

## 4. Technology Stack
| Layer            | Technology                     |
|-------------------|--------------------------------|
| Frontend          | HTML5, CSS3, vanilla JavaScript (fetch API) |
| Backend           | Node.js, Express.js            |
| Database          | SQLite via Node's built-in `node:sqlite` module (no native build tools needed) |
| API Testing       | Postman / curl                 |
| Version Control   | Git                            |

## 5. System Architecture
```
User → Browser (HTML/CSS/JS) → fetch() → REST API (Express) → SQLite Database
```
The Express server also statically serves the frontend files, so the whole app
runs from a single server process on one port.

## 6. Database Design (ER Summary)
**Table: `students`**

| Column      | Type    | Constraints                        |
|-------------|---------|-------------------------------------|
| id          | INTEGER | PRIMARY KEY, AUTOINCREMENT          |
| name        | TEXT    | NOT NULL                            |
| email       | TEXT    | NOT NULL, UNIQUE                    |
| course      | TEXT    | NOT NULL                            |
| year        | INTEGER | NOT NULL, CHECK (1–6)               |
| phone       | TEXT    | optional, format-validated          |
| created_at  | TEXT    | default: current timestamp          |
| updated_at  | TEXT    | updated on every edit                |

Single-entity design: one table is sufficient for this application's scope.

## 7. REST API Endpoints
| Operation | Method | Endpoint              | Description                  |
|-----------|--------|------------------------|-------------------------------|
| Create    | POST   | `/api/students`        | Add a new student             |
| Read All  | GET    | `/api/students`        | List all students (supports `?search=` and `?course=`) |
| Read One  | GET    | `/api/students/:id`    | Get a single student          |
| Update    | PUT/PATCH | `/api/students/:id` | Update an existing student    |
| Delete    | DELETE | `/api/students/:id`    | Delete a student               |
| Health    | GET    | `/api/health`          | API health check               |

All responses follow the shape: `{ success, message?, errors?, data? }`.

## 8. Validation Rules
- `name`, `email`, `course`, `year` are required.
- `email` must match a valid email pattern and be unique (duplicate → HTTP 409).
- `year` must be an integer between 1 and 6.
- `phone` is optional but validated for format if provided.
- Server-side validation is enforced even though client-side validation also exists.

## 9. Setup & Execution Instructions

### Prerequisites
- Node.js v22.5+ (v24 recommended) and npm installed. This project uses Node's
  built-in `node:sqlite` module, so **no native compiler / Visual Studio Build
  Tools are required** — a common source of `npm install` failures on Windows
  with the older `sqlite3` package.

### Steps
```bash
# 1. Move into the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```
The server starts at **http://localhost:5000**. The frontend is served automatically
from the same server — open `http://localhost:5000/index.html` in your browser.

The SQLite database file (`students.db`) is created automatically inside `backend/`
on first run, along with the `students` table.

### Environment variables (optional)
- `PORT` — change the port the server listens on (default `5000`).

## 10. Testing Procedure
Test each endpoint with Postman or curl:

1. **Create** — valid data (201), missing required field (400), duplicate email (409).
2. **Read** — list all (200, empty array on fresh DB), get by valid id (200), invalid id (400/404).
3. **Update** — valid id + valid data (200), non-existent id (404), duplicate email conflict (409).
4. **Delete** — valid id (200), already-deleted/invalid id (404).
5. **Frontend** — verify table refreshes after each operation, success/error banners appear,
   search filters records, and the layout adapts on a narrow (mobile) viewport.
6. **Resilience** — stop the backend and confirm the frontend shows a network-error message
   instead of failing silently.

Example curl commands:
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya@example.com","course":"B.Tech CSE","year":2}'

curl http://localhost:5000/api/students

curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya S.","email":"priya@example.com","course":"B.Tech CSE","year":3}'

curl -X DELETE http://localhost:5000/api/students/1
```

## 11. Security & Quality Notes
- No hard-coded secrets; the app has none by default (add `.env` + `dotenv` if you
  introduce authentication).
- All SQL uses parameterized queries (`?` placeholders) — no string concatenation,
  preventing SQL injection.
- CORS is enabled so the frontend can be hosted separately if desired.
- Input is validated and sanitized (HTML-escaped) before rendering in the UI.

## 12. Version Control
Initialize Git and commit in logical stages:
```bash
git init
git add .
git commit -m "Initial project structure"
# ... commit backend, frontend, docs separately as you build/extend
git remote add origin <your-repo-url>
git push -u origin main
```
`.gitignore` already excludes `node_modules/`, the SQLite DB file, and `.env`.

## 13. Future Enhancements
- Add authentication (e.g., JWT) and role-based access.
- Add pagination and sorting for large datasets.
- Add automated tests (Jest + Supertest for the API).
- Switch to PostgreSQL/MySQL for production deployment.

## 14. Project Structure
```
student-management-system/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   ├── .gitignore
│   └── routes/
│       └── students.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── API_DOCUMENTATION.md
└── README.md
```
