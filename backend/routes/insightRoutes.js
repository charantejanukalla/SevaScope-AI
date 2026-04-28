const express = require('express');
const { getPriorityInsights, getRecommendations, getTrends, getExplanations } = require('../controllers/insightsController');

const router = express.Router();

router.get('/priority', getPriorityInsights);
router.get('/recommendations', getRecommendations);
router.get('/trends', getTrends);
router.get('/explanations', getExplanations);

module.exports = router;
