const Joi = require('joi');

const createMessageSchema = Joi.object({
  conversation_id: Joi.string().uuid().required(),
  contact_id: Joi.string().uuid().required(),
  content: Joi.string().required().min(1).max(4096),
  direction: Joi.string().valid('inbound', 'outbound').required(),
  status: Joi.string().valid('sent', 'delivered', 'read', 'failed').default('sent')
});

const updateMessageSchema = Joi.object({
  status: Joi.string().valid('sent', 'delivered', 'read', 'failed').required()
});

module.exports = {
  createMessageSchema,
  updateMessageSchema
};
