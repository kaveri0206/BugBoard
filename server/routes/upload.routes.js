const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', upload.single('file'), uploadController.handleFileUpload);
router.delete('/', uploadController.handleFileDelete);

module.exports = router;