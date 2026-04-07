const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhook.controller');

router.post('/whatsapp', WebhookController.handleWhatsApp);
router.post('/razorpay', WebhookController.handleRazorpay);

module.exports = router;
