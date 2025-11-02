const express = require('express');
const router = express.Router();
const merchandiseController = require('../controllers/merchandiseController');

// Get merchandise options
router.get('/options', merchandiseController.getOptions);

// Generate mockup preview
router.post('/mockup', merchandiseController.generateMockupPreview);

// Create merchandise order
router.post('/order', merchandiseController.createOrder);

// Get user's orders
router.get('/orders/:userId', merchandiseController.getUserOrders);

module.exports = router;