const Joi = require('joi');

const createWorkflowSchema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().allow('').max(1000),
  trigger_type: Joi.string().required().valid('message_received', 'keyword', 'tag_added', 'appointment_booked', 'webhook'),
  trigger_config: Joi.object(),
  actions: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    config: Joi.object().required()
  })).required().min(1),
  status: Joi.string().valid('draft', 'active', 'paused').default('draft')
});

const updateWorkflowSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(1000),
  trigger_type: Joi.string().valid('message_received', 'keyword', 'tag_added', 'appointment_booked', 'webhook'),
  trigger_config: Joi.object(),
  actions: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    config: Joi.object().required()
  })).min(1),
  status: Joi.string().valid('draft', 'active', 'paused')
}).min(1);

module.exports = {
  createWorkflowSchema,
  updateWorkflowSchema
};
