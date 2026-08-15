import express from 'express';
import { protect, checkPermission } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkModuleAccess } from '../middlewares/featureMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';
import { injectBranch, injectOwnership } from '../middlewares/tenantMiddleware.js';
import { auditMiddleware } from '../utils/auditLogger.js';
import {
  getTickets, createTicket, updateTicket, addTicketComment, deleteTicket,
  getTasks, createTask, updateTask, deleteTask,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getComplaints, createComplaint, updateComplaint,
  getSuggestions, createSuggestion, upvoteSuggestion, updateSuggestion,
  getRiskRegisters, createRisk, updateRisk, deleteRisk,
  getKnowledgeBase, createKnowledgeBaseArticle, updateKnowledgeBaseArticle, deleteKnowledgeBaseArticle,
  getMeetings, createMeeting, updateMeeting, deleteMeeting,
  getIncidents, createIncident, updateIncident, deleteIncident,
} from '../controllers/enterpriseFeatureController.js';

const router = express.Router();
router.use(asyncHandler(protect));
router.use(asyncHandler(injectBranch));
router.use(injectOwnership);
router.use(checkSubscription);
router.use(auditMiddleware('ENTERPRISE'));

// ── Tickets ──
router.use('/tickets', checkModuleAccess('ticketing'));
router.route('/tickets')
  .get(checkPermission('settings.view'), asyncHandler(getTickets))
  .post(checkPermission('settings.manage'), asyncHandler(createTicket));
router.route('/tickets/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateTicket))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteTicket));
router.post('/tickets/:id/comments', checkPermission('settings.view'), asyncHandler(addTicketComment));

// ── Tasks ──
router.use('/tasks', checkModuleAccess('task-management'));
router.route('/tasks')
  .get(checkPermission('settings.view'), asyncHandler(getTasks))
  .post(checkPermission('settings.manage'), asyncHandler(createTask));
router.route('/tasks/:id')
  .put(checkPermission('settings.view'), asyncHandler(updateTask))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteTask));

// ── Announcements ──
router.use('/announcements', checkModuleAccess('announcements'));
router.route('/announcements')
  .get(checkPermission('settings.view'), asyncHandler(getAnnouncements))
  .post(checkPermission('settings.manage'), asyncHandler(createAnnouncement));
router.route('/announcements/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateAnnouncement))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteAnnouncement));

// ── Complaints ──
router.use('/complaints', checkModuleAccess('complaints'));
router.route('/complaints')
  .get(checkPermission('settings.view'), asyncHandler(getComplaints))
  .post(checkPermission('settings.view'), asyncHandler(createComplaint));
router.put('/complaints/:id', checkPermission('settings.manage'), asyncHandler(updateComplaint));

// ── Suggestions ──
router.use('/suggestions', checkModuleAccess('suggestions'));
router.route('/suggestions')
  .get(checkPermission('settings.view'), asyncHandler(getSuggestions))
  .post(checkPermission('settings.view'), asyncHandler(createSuggestion));
router.route('/suggestions/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateSuggestion));
router.post('/suggestions/:id/upvote', checkPermission('settings.view'), asyncHandler(upvoteSuggestion));

// ── Risk Register ──
router.use('/risks', checkModuleAccess('risk-register'));
router.route('/risks')
  .get(checkPermission('settings.view'), asyncHandler(getRiskRegisters))
  .post(checkPermission('settings.manage'), asyncHandler(createRisk));
router.route('/risks/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateRisk))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteRisk));

// ── Knowledge Base ──
router.use('/knowledge-base', checkModuleAccess('knowledge-base'));
router.route('/knowledge-base')
  .get(checkPermission('settings.view'), asyncHandler(getKnowledgeBase))
  .post(checkPermission('settings.manage'), asyncHandler(createKnowledgeBaseArticle));
router.route('/knowledge-base/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateKnowledgeBaseArticle))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteKnowledgeBaseArticle));

// ── Meetings ──
router.use('/meetings', checkModuleAccess('meeting-scheduler'));
router.route('/meetings')
  .get(checkPermission('settings.view'), asyncHandler(getMeetings))
  .post(checkPermission('settings.manage'), asyncHandler(createMeeting));
router.route('/meetings/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateMeeting))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteMeeting));

// ── Incidents ──
router.use('/incidents', checkModuleAccess('incident-management'));
router.route('/incidents')
  .get(checkPermission('settings.view'), asyncHandler(getIncidents))
  .post(checkPermission('settings.manage'), asyncHandler(createIncident));
router.route('/incidents/:id')
  .put(checkPermission('settings.manage'), asyncHandler(updateIncident))
  .delete(checkPermission('settings.manage'), asyncHandler(deleteIncident));

export default router;
