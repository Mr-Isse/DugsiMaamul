import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getScheduledJobs, createScheduledJob, updateScheduledJob, deleteScheduledJob, toggleScheduledJob, runScheduledJobNow, getAutomationLogs, getAutomationStats } from '../controllers/automationController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('AUTOMATION'));

router.use(checkModuleAccess('automation-engine'));

router.get('/stats', checkPermission('settings.view'), asyncHandler(getAutomationStats));
router.get('/logs', checkPermission('settings.view'), asyncHandler(getAutomationLogs));

router.route('/jobs')
  .get(checkPermission('settings.view'), asyncHandler(getScheduledJobs))
  .post(checkPermission('settings.manage'), asyncHandler(createScheduledJob));
router.route('/jobs/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateScheduledJob))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteScheduledJob));
router.post('/jobs/:id/toggle', checkPermission('settings.manage'), asyncHandler(toggleScheduledJob));
router.post('/jobs/:id/run', checkPermission('settings.manage'), asyncHandler(runScheduledJobNow));

export default router;
