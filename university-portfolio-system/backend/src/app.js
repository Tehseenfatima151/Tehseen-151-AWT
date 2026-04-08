require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Existing route modules (currently located in `backend/routes`).
const authRoutes = require('../routes/auth');
const studentRoutes = require('../routes/students');
const skillRoutes = require('../routes/skills');
const projectRoutes = require('../routes/projects');
const certificateRoutes = require('../routes/certificates');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certificates', certificateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Basic error handler (e.g., malformed JSON)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const message = err?.message || 'Server error';
  let status = err?.statusCode || 500;

  // Map common request/validation issues to 400.
  if (err?.code === 'LIMIT_FILE_SIZE') status = 400;
  if (typeof message === 'string' && message.toLowerCase().includes('invalid file type')) status = 400;
  if (typeof message === 'string' && message.toLowerCase().includes('only pdf')) status = 400;

  res.status(status).json({ message });
});

module.exports = app;
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

