const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Synchronize Supabase user session with backend DB
router.post('/sync', authController.syncUser);

module.exports = router;
