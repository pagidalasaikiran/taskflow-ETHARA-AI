const express = require('express');
const { getUsers, getTeamMembers } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.get('/team', getTeamMembers);

module.exports = router;
