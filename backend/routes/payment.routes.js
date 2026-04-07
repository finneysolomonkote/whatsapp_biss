const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate, getTenantId } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema, verifyPaymentSchema, refundSchema } = require('../schemas/payment.schema');

router.use(authenticate);
router.use(getTenantId);

router.post('/create-order', validate(createOrderSchema), PaymentController.createOrder);
router.post('/verify-payment', validate(verifyPaymentSchema), PaymentController.verifyPayment);
router.get('/history', PaymentController.getPaymentHistory);
router.post('/refund', validate(refundSchema), PaymentController.refund);

module.exports = router;
