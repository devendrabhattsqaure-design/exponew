const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const dashboardController = require('../controllers/dashboardController');

router.post('/login', adminAuthController.adminLogin);
router.post('/register', adminAuthController.adminRegister);
router.post('/create-turf-admin', adminAuthController.createTurfAdmin);

// Dashboard / Business Stats
router.get('/dashboard/stats', dashboardController.getBusinessStats);

// Employee Management
router.post('/employees', adminAuthController.createEmployee);
router.get('/employees', adminAuthController.getEmployees);
router.put('/employees/:id', adminAuthController.updateEmployee);
router.delete('/employees/:id', adminAuthController.deleteEmployee);

module.exports = router;
