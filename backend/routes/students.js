// routes/students.js
// REST API endpoints implementing CRUD operations for the "students" entity.
// Uses the synchronous node:sqlite API (DatabaseSync) -- statements are
// prepared and run synchronously, so no callbacks/promises are needed.

const express = require('express');
const router = express.Router();
const db = require('../db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Server-side validation helper ----
function validateStudent(body, { partial = false } = {}) {
  const errors = [];
  const { name, email, course, year, phone } = body;

  if (!partial || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Name is required and must be a non-empty string.');
    }
  }

  if (!partial || email !== undefined) {
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      errors.push('A valid email address is required.');
    }
  }

  if (!partial || course !== undefined) {
    if (!course || typeof course !== 'string' || !course.trim()) {
      errors.push('Course is required and must be a non-empty string.');
    }
  }

  if (!partial || year !== undefined) {
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < 1 || yearNum > 6) {
      errors.push('Year must be an integer between 1 and 6.');
    }
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    if (!/^[0-9+\-\s()]{7,15}$/.test(phone)) {
      errors.push('Phone number format is invalid.');
    }
  }

  return errors;
}

function isUniqueConstraintError(err) {
  return err && typeof err.message === 'string' && err.message.includes('UNIQUE');
}

// ---- CREATE: POST /api/students ----
router.post('/', (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const { name, email, course, year, phone } = req.body;

  try {
    const insert = db.prepare(
      `INSERT INTO students (name, email, course, year, phone) VALUES (?, ?, ?, ?, ?)`
    );
    const result = insert.run(name.trim(), email.trim(), course.trim(), Number(year), phone || null);

    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Student created successfully.', data: row });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(409).json({ success: false, errors: ['A student with this email already exists.'] });
    }
    console.error(err);
    res.status(500).json({ success: false, errors: ['Database error while creating student.'] });
  }
});

// ---- READ ALL: GET /api/students  (supports ?search=&course=) ----
router.get('/', (req, res) => {
  const { search, course } = req.query;
  let sql = 'SELECT * FROM students';
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (course) {
    conditions.push('course = ?');
    params.push(course);
  }
  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY id DESC';

  try {
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: ['Database error while fetching students.'] });
  }
});

// ---- READ ONE: GET /api/students/:id ----
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, errors: ['Invalid student id.'] });
  }
  try {
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ success: false, errors: ['Student not found.'] });
    res.json({ success: true, data: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: ['Database error.'] });
  }
});

// ---- UPDATE: PUT/PATCH /api/students/:id ----
function updateHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, errors: ['Invalid student id.'] });
  }

  const isPartial = req.method === 'PATCH';
  const errors = validateStudent(req.body, { partial: isPartial });
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, errors: ['Student not found.'] });

    const name = req.body.name !== undefined ? req.body.name.trim() : existing.name;
    const email = req.body.email !== undefined ? req.body.email.trim() : existing.email;
    const course = req.body.course !== undefined ? req.body.course.trim() : existing.course;
    const year = req.body.year !== undefined ? Number(req.body.year) : existing.year;
    const phone = req.body.phone !== undefined ? req.body.phone : existing.phone;

    const update = db.prepare(
      `UPDATE students SET name=?, email=?, course=?, year=?, phone=?, updated_at=datetime('now') WHERE id=?`
    );
    update.run(name, email, course, year, phone, id);

    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json({ success: true, message: 'Student updated successfully.', data: row });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(409).json({ success: false, errors: ['Another student with this email already exists.'] });
    }
    console.error(err);
    res.status(500).json({ success: false, errors: ['Database error while updating student.'] });
  }
}

router.put('/:id', updateHandler);
router.patch('/:id', updateHandler);

// ---- DELETE: DELETE /api/students/:id ----
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, errors: ['Invalid student id.'] });
  }
  try {
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, errors: ['Student not found.'] });

    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: ['Database error while deleting student.'] });
  }
});

module.exports = router;
