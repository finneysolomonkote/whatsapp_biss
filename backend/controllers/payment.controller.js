const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const crypto = require('crypto');

const createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    const orderOptions = {
      amount: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        tenant_id: req.tenantId,
        user_id: req.user.id,
        ...notes
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    await Payment.create({
      order_id: order.id,
      amount,
      currency,
      status: 'created',
      payment_gateway: 'razorpay',
      metadata: { notes }
    }, req.tenantId, req.user.id);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      await Payment.updateByOrderId(razorpay_order_id, {
        payment_id: razorpay_payment_id,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, req.tenantId);

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      await Payment.updateByOrderId(razorpay_order_id, {
        status: 'failed',
        failure_reason: 'Invalid signature'
      }, req.tenantId);

      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await Payment.findAll(req.tenantId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const refund = async (req, res, next) => {
  try {
    const { payment_id, amount } = req.body;

    const payment = await Payment.findByPaymentId(payment_id, req.tenantId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const refundAmount = amount ? amount * 100 : payment.amount * 100;

    const refundResult = await razorpay.payments.refund(payment_id, {
      amount: refundAmount
    });

    await Payment.updateByPaymentId(payment_id, {
      status: 'refunded',
      refund_id: refundResult.id,
      refunded_at: new Date().toISOString()
    }, req.tenantId);

    res.json({
      success: true,
      data: refundResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  refund
};
