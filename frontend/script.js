// script.js
// Connects the frontend UI to the backend REST API using fetch().
// Implements Create, Read, Update, Delete + client-side validation + search.

const API_BASE = '/api/students';

const form = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const studentIdField = document.getElementById('studentId');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const courseField = document.getElementById('course');
const yearField = document.getElementById('year');
const phoneField = document.getElementById('phone');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentsBody = document.getElementById('studentsBody');
const emptyState = document.getElementById('emptyState');
const alertBox = document.getElementById('alertBox');
const searchInput = document.getElementById('searchInput');

let isEditMode = false;
let searchDebounce = null;

// ---------- Utility: show a temporary alert message ----------
function showAlert(message, type = 'success') {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 3500);
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
}

// ---------- Client-side validation (mirrors server-side rules) ----------
function validateForm() {
  clearFieldErrors();
  let valid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameField.value.trim()) {
    document.getElementById('err-name').textContent = 'Name is required.';
    valid = false;
  }
  if (!emailField.value.trim() || !emailRegex.test(emailField.value.trim())) {
    document.getElementById('err-email').textContent = 'Enter a valid email address.';
    valid = false;
  }
  if (!courseField.value.trim()) {
    document.getElementById('err-course').textContent = 'Course is required.';
    valid = false;
  }
  if (!yearField.value) {
    document.getElementById('err-year').textContent = 'Select a year.';
    valid = false;
  }
  const phone = phoneField.value.trim();
  if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) {
    document.getElementById('err-phone').textContent = 'Invalid phone format.';
    valid = false;
  }
  return valid;
}

// ---------- READ: fetch and render all students ----------
async function loadStudents(query = '') {
  try {
    const url = query ? `${API_BASE}?search=${encodeURIComponent(query)}` : API_BASE;
    const res = await fetch(url);
    const result = await res.json();

    if (!result.success) {
      showAlert('Failed to load students.', 'error');
      return;
    }
    renderTable(result.data);
  } catch (err) {
    showAlert('Network error: could not reach the server.', 'error');
  }
}

function renderTable(students) {
  studentsBody.innerHTML = '';
  if (!students.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  students.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${s.year}</td>
      <td>${s.phone ? escapeHtml(s.phone) : '-'}</td>
      <td>
        <button class="btn-edit" data-id="${s.id}">Edit</button>
        <button class="btn-delete" data-id="${s.id}">Delete</button>
      </td>
    `;
    studentsBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- CREATE / UPDATE: form submit ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    course: courseField.value.trim(),
    year: Number(yearField.value),
    phone: phoneField.value.trim() || null,
  };

  submitBtn.disabled = true;

  try {
    let res, result;
    if (isEditMode) {
      const id = studentIdField.value;
      res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    result = await res.json();

    if (!result.success) {
      showAlert(result.errors ? result.errors.join(' ') : 'Operation failed.', 'error');
      return;
    }

    showAlert(result.message || 'Success.', 'success');
    resetForm();
    loadStudents(searchInput.value.trim());
  } catch (err) {
    showAlert('Network error: could not reach the server.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- Edit / Delete button clicks (event delegation) ----------
studentsBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('btn-edit')) {
    await startEdit(id);
  } else if (e.target.classList.contains('btn-delete')) {
    await deleteStudent(id);
  }
});

async function startEdit(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const result = await res.json();
    if (!result.success) {
      showAlert('Could not load student for editing.', 'error');
      return;
    }
    const s = result.data;
    studentIdField.value = s.id;
    nameField.value = s.name;
    emailField.value = s.email;
    courseField.value = s.course;
    yearField.value = s.year;
    phoneField.value = s.phone || '';

    isEditMode = true;
    formTitle.textContent = `Edit Student #${s.id}`;
    submitBtn.textContent = 'Update Student';
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showAlert('Network error while fetching student.', 'error');
  }
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student record?')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) {
      showAlert(result.errors ? result.errors.join(' ') : 'Delete failed.', 'error');
      return;
    }
    showAlert('Student deleted successfully.', 'success');
    loadStudents(searchInput.value.trim());
  } catch (err) {
    showAlert('Network error while deleting student.', 'error');
  }
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  studentIdField.value = '';
  isEditMode = false;
  formTitle.textContent = 'Add New Student';
  submitBtn.textContent = 'Add Student';
  cancelBtn.classList.add('hidden');
  clearFieldErrors();
}

// ---------- Search (debounced) ----------
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    loadStudents(searchInput.value.trim());
  }, 300);
});

// ---------- Initial load ----------
loadStudents();
