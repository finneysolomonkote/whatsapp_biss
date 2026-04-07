const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contact.controller');
const { authenticate, getTenantId } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createContactSchema, updateContactSchema } = require('../schemas/contact.schema');

router.use(authenticate);
router.use(getTenantId);

router.get('/', ContactController.getAll);
router.get('/:id', ContactController.getById);
router.post('/', validate(createContactSchema), ContactController.create);
router.put('/:id', validate(updateContactSchema), ContactController.update);
router.delete('/:id', ContactController.delete);

module.exports = router;
