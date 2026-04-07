const Joi = require('joi');

const createCampaignSchema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().allow('').max(1000),
  message_template: Joi.string().required().min(1).max(4096),
  status: Joi.string().valid('draft', 'scheduled', 'sending', 'sent', 'paused').default('draft'),
  scheduled_at: Joi.date().iso().allow(null),
  target_segment: Joi.object()
});

const updateCampaignSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(1000),
  message_template: Joi.string().min(1).max(4096),
  status: Joi.string().valid('draft', 'scheduled', 'sending', 'sent', 'paused'),
  scheduled_at: Joi.date().iso().allow(null),
  target_segment: Joi.object()
}).min(1);

module.exports = {
  createCampaignSchema,
  updateCampaignSchema
};
