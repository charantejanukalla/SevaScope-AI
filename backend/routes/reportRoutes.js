const express = require('express');
const { createReport, getReports, getHeatmapData } = require('../controllers/reportController');
const { protect, allowOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, allowOnly('NGO'), createReport);
router.get('/', getReports);
router.get('/heatmap', getHeatmapData);

module.exports = router;
