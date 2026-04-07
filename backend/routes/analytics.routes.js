const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');
const { authenticate, getTenantId } = require('../middleware/auth');

router.use(authenticate);
router.use(getTenantId);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/message-stats', AnalyticsController.getMessageStats);
router.get('/campaign-performance', AnalyticsController.getCampaignPerformance);
router.get('/workflow-performance', AnalyticsController.getWorkflowPerformance);
router.get('/contact-growth', AnalyticsController.getContactGrowth);

module.exports = router;
