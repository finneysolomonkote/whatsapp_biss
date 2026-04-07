const Joi = require('joi');

const createContactSchema = Joi.object({
  first_name: Joi.string().required().min(1).max(100),
  last_name: Joi.string().allow('').max(100),
  phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
  email: Joi.string().email().allow(''),
  tags: Joi.array().items(Joi.string()),
  custom_fields: Joi.object()
});

const updateContactSchema = Joi.object({
  first_name: Joi.string().min(1).max(100),
  last_name: Joi.string().allow('').max(100),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  email: Joi.string().email().allow(''),
  tags: Joi.array().items(Joi.string()),
  custom_fields: Joi.object()
}).min(1);

module.exports = {
  createContactSchema,
  updateContactSchema
};
