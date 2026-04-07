const express = require('express');
const router = express.Router();
const CampaignController = require('../controllers/campaign.controller');
const { authenticate, getTenantId } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCampaignSchema, updateCampaignSchema } = require('../schemas/campaign.schema');

router.use(authenticate);
router.use(getTenantId);

router.get('/', CampaignController.getAll);
router.get('/:id', CampaignController.getById);
router.get('/:id/stats', CampaignController.getStats);
router.post('/', validate(createCampaignSchema), CampaignController.create);
router.put('/:id', validate(updateCampaignSchema), CampaignController.update);
router.delete('/:id', CampaignController.delete);

module.exports = router;
