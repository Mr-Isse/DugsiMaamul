import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getDynamicConfigs, getDynamicConfig, upsertDynamicConfig, deleteDynamicConfig } from '../controllers/dynamicConfigController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('DYNAMIC_CONFIG'));

router.use(checkModuleAccess('dynamic-config'));

router.get('/', checkPermission('settings.view'), asyncHandler(getDynamicConfigs));
router.get('/module/:module', checkPermission('settings.view'), asyncHandler(getDynamicConfig));
router.put('/module/:module', checkPermission('settings.manage'), asyncHandler(upsertDynamicConfig));
router.delete('/:id', checkPermission('settings.manage'), asyncHandler(deleteDynamicConfig));

export default router;
