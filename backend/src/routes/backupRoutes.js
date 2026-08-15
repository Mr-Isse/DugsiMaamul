import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getBackups, createBackup, restoreBackup, verifyBackup, deleteBackup, getBackupStats } from '../controllers/backupController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('BACKUP'));

router.use(checkModuleAccess('backup'));

router.get('/stats', checkPermission('settings.view'), asyncHandler(getBackupStats));

router.route('/')
  .get(checkPermission('settings.view'), asyncHandler(getBackups))
  .post(checkPermission('settings.manage'), asyncHandler(createBackup));
router.post('/:id/restore', checkPermission('settings.manage'), asyncHandler(restoreBackup));
router.post('/:id/verify', checkPermission('settings.manage'), asyncHandler(verifyBackup));
router.delete('/:id', checkPermission('settings.manage'), asyncHandler(deleteBackup));

export default router;
