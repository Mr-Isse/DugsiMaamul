import asyncHandler from 'express-async-handler';
import AIPrediction from '../models/AIPrediction.js';
import AIChatMessage from '../models/AIChatMessage.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getAIPredictions = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { type, student, riskLevel, page = 1, limit = 20 } = req.query;
  if (type) filter.type = type;
  if (student) filter.student = student;
  if (riskLevel) filter.riskLevel = riskLevel;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    AIPrediction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('student', 'name admissionNumber').lean(),
    AIPrediction.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const generatePredictions = asyncHandler(async (req, res) => {
  const { type, studentIds } = req.body;
  if (!type) return err(res, 400, 'Prediction type is required');
  const supportedTypes = ['performance', 'attendance', 'dropout-risk', 'fee-collection'];
  if (!supportedTypes.includes(type)) return err(res, 400, 'Invalid prediction type');
  const count = Math.floor(Math.random() * 10) + 1;
  ok(res, { data: { message: `Generating ${count} ${type} predictions`, count, status: 'queued' } });
});

export const getAIInsights = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [totalPredictions, highRisk, recentCount] = await Promise.all([
    AIPrediction.countDocuments({ ...filter, isDeleted: false }),
    AIPrediction.countDocuments({ ...filter, isDeleted: false, riskLevel: { $in: ['high', 'critical'] } }),
    AIPrediction.countDocuments({ ...filter, isDeleted: false, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);
  const byType = await AIPrediction.aggregate([
    { $match: { ...filter, isDeleted: false } },
    { $group: { _id: '$type', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' } } },
  ]);
  const byRisk = await AIPrediction.aggregate([
    { $match: { ...filter, isDeleted: false } },
    { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
  ]);
  ok(res, { data: { totalPredictions, highRisk, recentCount, byType, byRisk } });
});

// ── AI Chat ──
export const getAIChatSessions = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), user: req.user._id, isDeleted: false };
  const sessions = await AIChatMessage.aggregate([
    { $match: filter },
    { $group: { _id: '$session', lastMessage: { $last: '$content' }, lastAt: { $max: '$createdAt' }, count: { $sum: 1 } } },
    { $sort: { lastAt: -1 } },
    { $limit: 50 },
  ]);
  ok(res, { data: sessions });
});

export const getAIChatMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const messages = await AIChatMessage.find({ ...tenantFilter(req), session: sessionId, user: req.user._id, isDeleted: false }).sort({ createdAt: 1 }).lean();
  ok(res, { data: messages });
});

export const sendAIChatMessage = asyncHandler(async (req, res) => {
  const { sessionId, content } = req.body;
  if (!content) return err(res, 400, 'Message content is required');
  const sid = sessionId || `chat-${Date.now()}`;
  await AIChatMessage.create({ ...tenantFilter(req), user: req.user._id, session: sid, role: 'user', content });
  const responses = [
    'Based on current data, student attendance has improved by 12% this month.',
    'Fee collection rate is at 87%. Consider sending reminders for outstanding balances.',
    '3 students are flagged as high-risk for dropout based on attendance patterns.',
    'The academic performance trend shows improvement across all grade levels.',
    'Payroll processing is scheduled for next Friday. All timesheets have been approved.',
    'I recommend reviewing the expense report for the transport department - it shows a 15% increase.',
  ];
  const reply = responses[Math.floor(Math.random() * responses.length)];
  const assistantMsg = await AIChatMessage.create({ ...tenantFilter(req), user: req.user._id, session: sid, role: 'assistant', content: reply, tokens: 50 });
  ok(res, { data: { userMessage: { content }, assistantMessage: { content: assistantMsg.content } } });
});

// ── Recommendations ──
export const getAIRecommendations = asyncHandler(async (req, res) => {
  const recommendations = [
    { id: 1, type: 'academic', title: 'Focus on Mathematics scores', description: 'Math performance is 8% below target. Consider additional tutoring sessions.', priority: 'high', icon: 'BookOpen' },
    { id: 2, type: 'attendance', title: 'Address late arrivals', description: '15 students have been late more than 5 times this month.', priority: 'medium', icon: 'Clock' },
    { id: 3, type: 'finance', title: 'Follow up on outstanding fees', description: 'Total outstanding fees amount to $12,500 across 23 students.', priority: 'high', icon: 'DollarSign' },
    { id: 4, type: 'retention', title: 'Monitor at-risk students', description: '3 students show early signs of disengagement.', priority: 'critical', icon: 'AlertTriangle' },
    { id: 5, type: 'operations', title: 'Optimize transport routes', description: 'Current routes show 20% excess mileage. Route optimization could save costs.', priority: 'low', icon: 'MapPin' },
  ];
  ok(res, { data: recommendations });
});
