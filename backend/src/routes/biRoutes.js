import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getBIReports, generateBIReport, deleteBIReport, getExecutiveDashboard, getKPIDashboard, getFinancialAnalytics, getAcademicAnalytics, getComparativeReports } from '../controllers/biController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('BI'));

router.use(checkModuleAccess('performance-tracking'));

router.get('/executive', checkPermission('settings.view'), asyncHandler(getExecutiveDashboard));
router.get('/kpi', checkPermission('settings.view'), asyncHandler(getKPIDashboard));
router.get('/financial', checkPermission('settings.view'), asyncHandler(getFinancialAnalytics));
router.get('/academic', checkPermission('settings.view'), asyncHandler(getAcademicAnalytics));
router.get('/comparative', checkPermission('settings.view'), asyncHandler(getComparativeReports));

router.route('/reports')
  .get(checkPermission('settings.view'), asyncHandler(getBIReports))
  .post(checkPermission('settings.manage'), asyncHandler(generateBIReport));
router.delete('/reports/:id', checkPermission('settings.manage'), asyncHandler(deleteBIReport));

export default router;
