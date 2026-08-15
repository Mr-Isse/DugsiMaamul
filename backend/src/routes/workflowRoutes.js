import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, getWorkflowInstances, createWorkflowInstance, approveWorkflowStep, rejectWorkflowStep, cancelWorkflowInstance, getWorkflowStats } from '../controllers/workflowController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('WORKFLOW'));

router.use(checkModuleAccess('workflow-automation'));

router.get('/stats', checkPermission('settings.view'), asyncHandler(getWorkflowStats));

router.route('/templates')
  .get(checkPermission('settings.view'), asyncHandler(getWorkflows))
  .post(checkPermission('settings.manage'), asyncHandler(createWorkflow));
router.route('/templates/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateWorkflow))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteWorkflow));

router.route('/instances')
  .get(checkPermission('settings.view'), asyncHandler(getWorkflowInstances))
  .post(checkPermission('settings.manage'), asyncHandler(createWorkflowInstance));
router.post('/instances/:id/approve', checkPermission('settings.manage'), asyncHandler(approveWorkflowStep));
router.post('/instances/:id/reject', checkPermission('settings.manage'), asyncHandler(rejectWorkflowStep));
router.post('/instances/:id/cancel', checkPermission('settings.manage'), asyncHandler(cancelWorkflowInstance));

export default router;
