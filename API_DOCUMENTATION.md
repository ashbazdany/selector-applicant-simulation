# API Documentation — Student Management System

Base URL: `http://localhost:5000/api`

All endpoints return JSON in the form:
```json
{ "success": true|false, "message": "...", "errors": ["..."], "data": {...} }
```

---

### 1. Create a Student
`POST /students`

**Request body**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "course": "B.Tech CSE",
  "year": 2,
  "phone": "9876543210"
}
```

**Success — 201**
```json
{ "success": true, "message": "Student created successfully.", "data": { "id": 1, "name": "Priya Sharma", "...": "..." } }
```

**Validation error — 400**
```json
{ "success": false, "errors": ["A valid email address is required."] }
```

**Duplicate email — 409**
```json
{ "success": false, "errors": ["A student with this email already exists."] }
```

---

### 2. Get All Students
`GET /students`
Optional query params: `?search=priya` (matches name/email), `?course=B.Tech%20CSE`

**Success — 200**
```json
{ "success": true, "count": 2, "data": [ { "id": 2, "name": "..." }, { "id": 1, "name": "..." } ] }
```

---

### 3. Get One Student
`GET /students/:id`

**Success — 200** → `{ "success": true, "data": { "id": 1, "...": "..." } }`
**Not found — 404** → `{ "success": false, "errors": ["Student not found."] }`

---

### 4. Update a Student
`PUT /students/:id` (full update) or `PATCH /students/:id` (partial update)

**Request body (PUT example)**
```json
{ "name": "Priya S.", "email": "priya@example.com", "course": "B.Tech CSE", "year": 3, "phone": "9876543210" }
```

**Success — 200** → `{ "success": true, "message": "Student updated successfully.", "data": {...} }`
**Not found — 404**, **Validation — 400**, **Duplicate email — 409**

---

### 5. Delete a Student
`DELETE /students/:id`

**Success — 200** → `{ "success": true, "message": "Student deleted successfully." }`
**Not found — 404** → `{ "success": false, "errors": ["Student not found."] }`

---

### 6. Health Check
`GET /health` → `{ "success": true, "message": "API is running." }`

---

## HTTP Status Code Summary
| Code | Meaning                          |
|------|-----------------------------------|
| 200  | Success (read/update/delete)      |
| 201  | Resource created                  |
| 400  | Validation error / bad input      |
| 404  | Resource not found                |
| 409  | Conflict (duplicate email)        |
| 500  | Server/database error             |
