const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversation.controller');
const { authenticate, getTenantId } = require('../middleware/auth');

router.use(authenticate);
router.use(getTenantId);

router.get('/', ConversationController.getAll);
router.get('/:id', ConversationController.getById);
router.post('/', ConversationController.create);
router.put('/:id', ConversationController.update);
router.delete('/:id', ConversationController.delete);

module.exports = router;
