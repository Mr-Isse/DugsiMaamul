import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getActiveSessions, revokeSession, revokeAllSessions, getAPITokens, createAPIToken, revokeAPIToken, deleteAPIToken, getSecurityDashboard } from '../controllers/advancedSecurityController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('ADVANCED_SECURITY'));

router.use(checkModuleAccess('two-factor-auth'));

router.get('/dashboard', checkPermission('settings.view'), asyncHandler(getSecurityDashboard));

router.route('/sessions')
  .get(checkPermission('settings.view'), asyncHandler(getActiveSessions));
router.post('/sessions/:id/revoke', checkPermission('settings.manage'), asyncHandler(revokeSession));
router.post('/sessions/revoke-all', checkPermission('settings.manage'), asyncHandler(revokeAllSessions));

router.route('/api-tokens')
  .get(checkPermission('settings.view'), asyncHandler(getAPITokens))
  .post(checkPermission('settings.manage'), asyncHandler(createAPIToken));
router.post('/api-tokens/:id/revoke', checkPermission('settings.manage'), asyncHandler(revokeAPIToken));
router.delete('/api-tokens/:id', checkPermission('settings.manage'), asyncHandler(deleteAPIToken));

export default router;
