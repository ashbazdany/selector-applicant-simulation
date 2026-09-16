// server.js
// Entry point for the Student Management System backend (Express + SQLite REST API).

const express = require('express');
const cors = require('cors');
const path = require('path');
const studentsRouter = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors());              // allow the frontend (different origin/port) to call this API
app.use(express.json());      // parse JSON request bodies
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // serve the frontend

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running.' });
});

// ---- CRUD routes ----
app.use('/api/students', studentsRouter);

// ---- 404 handler for unknown API routes ----
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, errors: ['Endpoint not found.'] });
});

// ---- Centralized error handler ----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, errors: ['Internal server error.'] });
});

app.listen(PORT, () => {
  console.log(`Student Management System backend running on http://localhost:${PORT}`);
  console.log(`Frontend served at http://localhost:${PORT}/index.html`);
});
