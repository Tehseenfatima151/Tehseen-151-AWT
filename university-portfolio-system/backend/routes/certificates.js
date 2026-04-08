const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const auth = require('../middlewares/auth');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.CERTIFICATE_MAX_FILE_SIZE || 5 * 1024 * 1024) }, // default 5MB
  fileFilter: (req, file, cb) => {
    const allowed =
      file.mimetype === 'application/pdf' ||
      (typeof file.mimetype === 'string' && file.mimetype.startsWith('image/'));

    if (!allowed) {
      return cb(new Error('Invalid file type. Only PDF or image files are allowed.'));
    }
    return cb(null, true);
  }
});

router.get('/', auth, certificateController.getCertificates);
router.post('/', auth, upload.single('file'), certificateController.addCertificate);
router.put('/:id', auth, upload.single('file'), certificateController.updateCertificate);
router.delete('/:id', auth, certificateController.deleteCertificate);
router.post('/profile-picture', auth, upload.single('file'), certificateController.uploadProfilePicture);

module.exports = router;
