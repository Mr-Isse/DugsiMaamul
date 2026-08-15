import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getDocuments, createDocument, updateDocument, deleteDocument, approveDocument, rejectDocument, addDocumentVersion, getDocumentStats } from '../controllers/documentWorkflowController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('DOCUMENT'));

router.use(checkModuleAccess('documents'));

router.get('/stats', checkPermission('settings.view'), asyncHandler(getDocumentStats));

router.route('/')
  .get(checkPermission('settings.view'), asyncHandler(getDocuments))
  .post(checkPermission('settings.manage'), asyncHandler(createDocument));
router.route('/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateDocument))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteDocument));
router.post('/:id/approve', checkPermission('settings.manage'), asyncHandler(approveDocument));
router.post('/:id/reject', checkPermission('settings.manage'), asyncHandler(rejectDocument));
router.post('/:id/versions', checkPermission('settings.manage'), asyncHandler(addDocumentVersion));

export default router;
