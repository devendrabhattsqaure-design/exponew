const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

router.post('/login', adminAuthController.adminLogin);
router.post('/register', adminAuthController.adminRegister);
router.post('/create-turf-admin', adminAuthController.createTurfAdmin);

module.exports = router;
