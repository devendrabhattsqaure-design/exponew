const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Traditional Native Registration & Login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Synchronize Supabase user session / SSO with backend DB & get JWT
router.post('/sync', authController.syncUser);

module.exports = router;
