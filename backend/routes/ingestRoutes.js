const express = require('express');
const multer = require('multer');
const { ingestUpload } = require('../controllers/ingestController');
const fs = require('fs');
const { protect, allowOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

router.post('/upload', protect, allowOnly('NGO'), upload.single('file'), ingestUpload);

module.exports = router;
