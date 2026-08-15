import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getHealthDashboard, getQueueMonitoring, getCacheMonitoring, getDatabaseMonitoring, getStorageMonitoring, getErrorMonitoring } from '../controllers/systemHealthController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('SYSTEM_HEALTH'));

router.use(checkModuleAccess('system-health'));

router.get('/', checkPermission('settings.view'), asyncHandler(getHealthDashboard));
router.get('/queues', checkPermission('settings.view'), asyncHandler(getQueueMonitoring));
router.get('/cache', checkPermission('settings.view'), asyncHandler(getCacheMonitoring));
router.get('/database', checkPermission('settings.view'), asyncHandler(getDatabaseMonitoring));
router.get('/storage', checkPermission('settings.view'), asyncHandler(getStorageMonitoring));
router.get('/errors', checkPermission('settings.view'), asyncHandler(getErrorMonitoring));

export default router;
