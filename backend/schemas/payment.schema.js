const Joi = require('joi');

const createOrderSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('INR'),
  receipt: Joi.string(),
  notes: Joi.object()
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required()
});

const refundSchema = Joi.object({
  payment_id: Joi.string().required(),
  amount: Joi.number().positive()
});

module.exports = {
  createOrderSchema,
  verifyPaymentSchema,
  refundSchema
};
