import asyncHandler from 'express-async-handler';
import ActiveSession from '../models/ActiveSession.js';
import APIToken from '../models/APIToken.js';
import crypto from 'crypto';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getActiveSessions = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isActive: true };
  const { userId, page = 1, limit = 20 } = req.query;
  if (userId) filter.user = userId;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    ActiveSession.find(filter).sort({ lastActivityAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email role').lean(),
    ActiveSession.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const revokeSession = asyncHandler(async (req, res) => {
  const session = await ActiveSession.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isActive: true }, { isActive: false }, { new: true });
  if (!session) return err(res, 404, 'Session not found');
  await logAction(req, { action: 'REVOKE_SESSION', module: 'SECURITY', targetId: session._id });
  ok(res, { message: 'Session revoked' });
});

export const revokeAllSessions = asyncHandler(async (req, res) => {
  const userId = req.query.userId || req.user._id;
  await ActiveSession.updateMany({ ...tenantFilter(req), user: userId, isActive: true }, { isActive: false });
  ok(res, { message: 'All sessions revoked' });
});

export const getAPITokens = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const [data, total] = await Promise.all([
    APIToken.find(filter).sort({ createdAt: -1 }).populate('user', 'name email').lean(),
    APIToken.countDocuments(filter),
  ]);
  ok(res, { data, total });
});

export const createAPIToken = asyncHandler(async (req, res) => {
  const { name, scopes, rateLimit, expiresAt } = req.body;
  if (!name) return err(res, 400, 'Token name is required');
  const token = `dk_${crypto.randomBytes(32).toString('hex')}`;
  const apiToken = await APIToken.create({ ...tenantFilter(req), user: req.user._id, name, token, scopes: scopes || [], rateLimit, expiresAt });
  await logAction(req, { action: 'CREATE', module: 'API_TOKEN', targetId: apiToken._id });
  ok(res, { data: { ...apiToken.toObject(), token } }, 201);
});

export const revokeAPIToken = asyncHandler(async (req, res) => {
  const token = await APIToken.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isActive: false }, { new: true });
  if (!token) return err(res, 404, 'Token not found');
  ok(res, { message: 'Token revoked' });
});

export const deleteAPIToken = asyncHandler(async (req, res) => {
  const token = await APIToken.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!token) return err(res, 404, 'Token not found');
  ok(res, { message: 'Token deleted' });
});

export const getSecurityDashboard = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [activeSessions, totalTokens, activeTokens] = await Promise.all([
    ActiveSession.countDocuments({ ...filter, isActive: true }),
    APIToken.countDocuments({ ...filter, isDeleted: false }),
    APIToken.countDocuments({ ...filter, isDeleted: false, isActive: true }),
  ]);
  ok(res, { data: { activeSessions, totalTokens, activeTokens, threatLevel: 'low', recentEvents: [] } });
});
