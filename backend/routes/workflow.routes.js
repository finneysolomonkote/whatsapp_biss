const express = require('express');
const router = express.Router();
const WorkflowController = require('../controllers/workflow.controller');
const { authenticate, getTenantId } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createWorkflowSchema, updateWorkflowSchema } = require('../schemas/workflow.schema');

router.use(authenticate);
router.use(getTenantId);

router.get('/', WorkflowController.getAll);
router.get('/:id', WorkflowController.getById);
router.post('/', validate(createWorkflowSchema), WorkflowController.create);
router.put('/:id', validate(updateWorkflowSchema), WorkflowController.update);
router.delete('/:id', WorkflowController.delete);

module.exports = router;
