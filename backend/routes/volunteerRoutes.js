const express = require('express');
const { createVolunteer, triggerSyncForArea } = require('../controllers/volunteerController');
const { protect, allowOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, allowOnly('VOLUNTEER'), createVolunteer);
router.post('/sync', protect, allowOnly('NGO'), triggerSyncForArea);

module.exports = router;
