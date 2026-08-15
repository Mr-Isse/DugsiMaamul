import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getWhiteLabelConfig, updateWhiteLabelConfig, getCrossSchoolAnalytics, getRegionalDashboard, getSchoolBenchmarks } from '../controllers/whiteLabelController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('WHITE_LABEL'));

router.route('/config')
  .get(checkPermission('settings.view'), asyncHandler(getWhiteLabelConfig))
  .put(checkPermission('settings.manage'), asyncHandler(updateWhiteLabelConfig));

router.get('/cross-school', checkPermission('settings.view'), asyncHandler(getCrossSchoolAnalytics));
router.get('/regional', checkPermission('settings.view'), asyncHandler(getRegionalDashboard));
router.get('/benchmarks', checkPermission('settings.view'), asyncHandler(getSchoolBenchmarks));

export default router;
