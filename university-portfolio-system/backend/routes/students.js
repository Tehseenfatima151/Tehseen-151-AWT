const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middlewares/auth');

router.get('/me', auth, studentController.getMe);
router.put('/me', auth, studentController.updateProfile);
router.get('/:id', studentController.getPublicProfile);

module.exports = router;
