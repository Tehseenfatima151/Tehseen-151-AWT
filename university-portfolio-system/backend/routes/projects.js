const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middlewares/auth');

router.get('/', auth, projectController.getProjects);
router.post('/', auth, projectController.addProject);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router;
