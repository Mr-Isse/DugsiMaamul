import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import { getAIPredictions, generatePredictions, getAIInsights, getAIChatSessions, getAIChatMessages, sendAIChatMessage, getAIRecommendations } from '../controllers/aiController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('AI'));

router.use(checkModuleAccess('ai-learning-assistant'));

router.get('/insights', checkPermission('settings.view'), asyncHandler(getAIInsights));
router.get('/recommendations', checkPermission('settings.view'), asyncHandler(getAIRecommendations));

router.route('/predictions')
  .get(checkPermission('settings.view'), asyncHandler(getAIPredictions))
  .post(checkPermission('settings.manage'), asyncHandler(generatePredictions));

router.get('/chat/sessions', checkPermission('settings.view'), asyncHandler(getAIChatSessions));
router.get('/chat/:sessionId', checkPermission('settings.view'), asyncHandler(getAIChatMessages));
router.post('/chat', checkPermission('settings.view'), asyncHandler(sendAIChatMessage));

export default router;
