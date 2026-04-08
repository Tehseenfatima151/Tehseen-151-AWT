const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const auth = require('../middlewares/auth');

router.get('/', auth, skillController.getSkills);
router.post('/', auth, skillController.addSkill);
router.put('/:id', auth, skillController.updateSkill);
router.delete('/:id', auth, skillController.deleteSkill);

module.exports = router;
