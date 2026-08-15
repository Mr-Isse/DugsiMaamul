import asyncHandler from 'express-async-handler';
import Ticket from '../models/Ticket.js';
import TaskItem from '../models/TaskItem.js';
import Announcement from '../models/Announcement.js';
import IncidentReport from '../models/IncidentReport.js';
import Complaint from '../models/Complaint.js';
import Suggestion from '../models/Suggestion.js';
import RiskRegister from '../models/RiskRegister.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import MeetingScheduler from '../models/MeetingScheduler.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// ── Tickets ──
export const getTickets = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, priority, category, search, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'name').populate('assignedTo', 'name').lean(),
    Ticket.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, assignedTo, tags } = req.body;
  if (!title || !description || !category) return err(res, 400, 'Title, description, and category are required');
  const ticket = await Ticket.create({ ...tenantFilter(req), title, description, category, priority, assignedTo, tags, createdBy: req.user._id, academicYear: req.academicYearId });
  await logAction(req, { action: 'CREATE', module: 'TICKET', targetId: ticket._id });
  ok(res, { data: ticket }, 201);
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!ticket) return err(res, 404, 'Ticket not found');
  ok(res, { data: ticket });
});

export const addTicketComment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!ticket) return err(res, 404, 'Ticket not found');
  ticket.comments.push({ user: req.user._id, content: req.body.content });
  await ticket.save();
  ok(res, { data: ticket });
});

export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!ticket) return err(res, 404, 'Ticket not found');
  ok(res, { message: 'Ticket deleted' });
});

// ── Tasks ──
export const getTasks = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, priority, assignedTo, search, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.title = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    TaskItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'name').populate('assignedTo', 'name').lean(),
    TaskItem.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, assignedTo, dueDate, tags, checklist } = req.body;
  if (!title) return err(res, 400, 'Title is required');
  const task = await TaskItem.create({ ...tenantFilter(req), title, description, priority, assignedTo, dueDate, tags, checklist, createdBy: req.user._id, academicYear: req.academicYearId });
  await logAction(req, { action: 'CREATE', module: 'TASK', targetId: task._id });
  ok(res, { data: task }, 201);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await TaskItem.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!task) return err(res, 404, 'Task not found');
  if (req.body.status === 'done') task.completedAt = new Date();
  if (req.body.status === 'done') await task.save();
  ok(res, { data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await TaskItem.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!task) return err(res, 404, 'Task not found');
  ok(res, { message: 'Task deleted' });
});

// ── Announcements ──
export const getAnnouncements = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { category, search, page = 1, limit = 20 } = req.query;
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Announcement.find(filter).sort({ publishAt: -1 }).skip(skip).limit(Number(limit)).populate('author', 'name').lean(),
    Announcement.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, category, priority, targetAudience, expiresAt } = req.body;
  if (!title || !content || !category) return err(res, 400, 'Title, content, and category are required');
  const announcement = await Announcement.create({ ...tenantFilter(req), title, content, category, priority, targetAudience, expiresAt, author: req.user._id, academicYear: req.academicYearId });
  await logAction(req, { action: 'CREATE', module: 'ANNOUNCEMENT', targetId: announcement._id });
  ok(res, { data: announcement }, 201);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!announcement) return err(res, 404, 'Announcement not found');
  ok(res, { data: announcement });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!announcement) return err(res, 404, 'Announcement not found');
  ok(res, { message: 'Announcement deleted' });
});

// ── Complaints ──
export const getComplaints = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, category, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (category) filter.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('submittedBy', 'name').lean(),
    Complaint.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, isAnonymous } = req.body;
  if (!title || !description || !category) return err(res, 400, 'Title, description, and category are required');
  const complaint = await Complaint.create({ ...tenantFilter(req), title, description, category, priority, isAnonymous, submittedBy: req.user._id, academicYear: req.academicYearId });
  ok(res, { data: complaint }, 201);
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!complaint) return err(res, 404, 'Complaint not found');
  ok(res, { data: complaint });
});

// ── Suggestions ──
export const getSuggestions = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Suggestion.find(filter).sort({ upvotes: -1 }).skip(skip).limit(Number(limit)).populate('submittedBy', 'name').lean(),
    Suggestion.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createSuggestion = asyncHandler(async (req, res) => {
  const { title, description, category, isAnonymous } = req.body;
  if (!title || !description || !category) return err(res, 400, 'Title, description, and category are required');
  const suggestion = await Suggestion.create({ ...tenantFilter(req), title, description, category, isAnonymous, submittedBy: req.user._id, academicYear: req.academicYearId });
  ok(res, { data: suggestion }, 201);
});

export const upvoteSuggestion = asyncHandler(async (req, res) => {
  const suggestion = await Suggestion.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!suggestion) return err(res, 404, 'Suggestion not found');
  if (!suggestion.voters.includes(req.user._id)) {
    suggestion.upvotes += 1;
    suggestion.voters.push(req.user._id);
    await suggestion.save();
  }
  ok(res, { data: suggestion });
});

export const updateSuggestion = asyncHandler(async (req, res) => {
  const suggestion = await Suggestion.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!suggestion) return err(res, 404, 'Suggestion not found');
  ok(res, { data: suggestion });
});

// ── Risk Register ──
export const getRiskRegisters = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, category, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (category) filter.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    RiskRegister.find(filter).sort({ riskScore: -1 }).skip(skip).limit(Number(limit)).populate('owner', 'name').lean(),
    RiskRegister.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createRisk = asyncHandler(async (req, res) => {
  const { title, description, category, likelihood, impact, mitigationPlan, contingencyPlan } = req.body;
  if (!title || !description || !category) return err(res, 400, 'Title, description, and category are required');
  const riskScore = (likelihood || 3) * (impact || 3);
  const risk = await RiskRegister.create({ ...tenantFilter(req), title, description, category, likelihood, impact, riskScore, mitigationPlan, contingencyPlan, owner: req.user._id, academicYear: req.academicYearId });
  ok(res, { data: risk }, 201);
});

export const updateRisk = asyncHandler(async (req, res) => {
  if (req.body.likelihood && req.body.impact) req.body.riskScore = req.body.likelihood * req.body.impact;
  const risk = await RiskRegister.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!risk) return err(res, 404, 'Risk not found');
  ok(res, { data: risk });
});

export const deleteRisk = asyncHandler(async (req, res) => {
  const risk = await RiskRegister.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!risk) return err(res, 404, 'Risk not found');
  ok(res, { message: 'Risk deleted' });
});

// ── Knowledge Base ──
export const getKnowledgeBase = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false, isPublished: true };
  const { category, search, page = 1, limit = 20 } = req.query;
  if (category) filter.category = category;
  if (search) { filter.$or = [{ title: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }]; }
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    KnowledgeBase.find(filter).sort({ views: -1 }).skip(skip).limit(Number(limit)).populate('author', 'name').lean(),
    KnowledgeBase.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createKnowledgeBaseArticle = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content || !category) return err(res, 400, 'Title, content, and category are required');
  const article = await KnowledgeBase.create({ ...tenantFilter(req), title, content, category, tags, author: req.user._id });
  ok(res, { data: article }, 201);
});

export const updateKnowledgeBaseArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!article) return err(res, 404, 'Article not found');
  ok(res, { data: article });
});

export const deleteKnowledgeBaseArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!article) return err(res, 404, 'Article not found');
  ok(res, { message: 'Article deleted' });
});

// ── Meetings ──
export const getMeetings = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    MeetingScheduler.find(filter).sort({ startTime: -1 }).skip(skip).limit(Number(limit)).populate('organizer', 'name').lean(),
    MeetingScheduler.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, location, meetingLink, attendees, recurrence } = req.body;
  if (!title || !startTime || !endTime) return err(res, 400, 'Title, start time, and end time are required');
  const meeting = await MeetingScheduler.create({ ...tenantFilter(req), title, description, startTime, endTime, location, meetingLink, attendees, recurrence, organizer: req.user._id, academicYear: req.academicYearId });
  ok(res, { data: meeting }, 201);
});

export const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await MeetingScheduler.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!meeting) return err(res, 404, 'Meeting not found');
  ok(res, { data: meeting });
});

export const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await MeetingScheduler.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!meeting) return err(res, 404, 'Meeting not found');
  ok(res, { message: 'Meeting deleted' });
});

// ── Incidents ──
export const getIncidents = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, severity, category, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (severity) filter.severity = severity;
  if (category) filter.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    IncidentReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('reportedBy', 'name').lean(),
    IncidentReport.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createIncident = asyncHandler(async (req, res) => {
  const { title, description, category, severity, location, affectedPersons } = req.body;
  if (!title || !description || !category || !severity) return err(res, 400, 'Title, description, category, and severity are required');
  const incident = await IncidentReport.create({ ...tenantFilter(req), title, description, category, severity, location, affectedPersons, reportedBy: req.user._id, academicYear: req.academicYearId });
  ok(res, { data: incident }, 201);
});

export const updateIncident = asyncHandler(async (req, res) => {
  const incident = await IncidentReport.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!incident) return err(res, 404, 'Incident not found');
  ok(res, { data: incident });
});

export const deleteIncident = asyncHandler(async (req, res) => {
  const incident = await IncidentReport.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!incident) return err(res, 404, 'Incident not found');
  ok(res, { message: 'Incident deleted' });
});
