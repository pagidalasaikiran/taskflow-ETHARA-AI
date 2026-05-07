const express = require('express');
const { getRecentActivities } = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/recent', getRecentActivities);

module.exports = router;
