import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook, getWebhookLogs, getAPIUsageStats } from '../controllers/apiPlatformController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('API_PLATFORM'));

router.use(checkModuleAccess('api-platform'));

router.get('/usage', checkPermission('settings.view'), asyncHandler(getAPIUsageStats));
router.get('/webhook-logs', checkPermission('settings.view'), asyncHandler(getWebhookLogs));

router.route('/webhooks')
  .get(checkPermission('settings.view'), asyncHandler(getWebhooks))
  .post(checkPermission('settings.manage'), asyncHandler(createWebhook));
router.route('/webhooks/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateWebhook))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteWebhook));
router.post('/webhooks/:id/test', checkPermission('settings.manage'), asyncHandler(testWebhook));

export default router;
