const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/message.controller');
const { authenticate, getTenantId } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createMessageSchema, updateMessageSchema } = require('../schemas/message.schema');

router.use(authenticate);
router.use(getTenantId);

router.get('/', MessageController.getAll);
router.get('/:id', MessageController.getById);
router.post('/', validate(createMessageSchema), MessageController.create);
router.put('/:id', validate(updateMessageSchema), MessageController.update);
router.delete('/:id', MessageController.delete);

module.exports = router;
