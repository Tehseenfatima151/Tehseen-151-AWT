const express = require('express');
const router = express.Router();

// Basic route (/)
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running successfully' });
});

module.exports = router;
