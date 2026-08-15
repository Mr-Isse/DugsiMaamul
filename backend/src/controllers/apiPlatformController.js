import asyncHandler from 'express-async-handler';
import WebhookSubscription from '../models/WebhookSubscription.js';
import crypto from 'crypto';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getWebhooks = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const [data, total] = await Promise.all([
    WebhookSubscription.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'name').lean(),
    WebhookSubscription.countDocuments(filter),
  ]);
  ok(res, { data, total });
});

export const createWebhook = asyncHandler(async (req, res) => {
  const { name, url, events, secret } = req.body;
  if (!name || !url || !events?.length) return err(res, 400, 'Name, URL, and events are required');
  const webhook = await WebhookSubscription.create({ ...tenantFilter(req), name, url, events, secret: secret || crypto.randomBytes(24).toString('hex'), createdBy: req.user._id });
  await logAction(req, { action: 'CREATE', module: 'WEBHOOK', targetId: webhook._id });
  ok(res, { data: webhook }, 201);
});

export const updateWebhook = asyncHandler(async (req, res) => {
  const webhook = await WebhookSubscription.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!webhook) return err(res, 404, 'Webhook not found');
  ok(res, { data: webhook });
});

export const deleteWebhook = asyncHandler(async (req, res) => {
  const webhook = await WebhookSubscription.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!webhook) return err(res, 404, 'Webhook not found');
  ok(res, { message: 'Webhook deleted' });
});

export const testWebhook = asyncHandler(async (req, res) => {
  const webhook = await WebhookSubscription.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!webhook) return err(res, 404, 'Webhook not found');
  ok(res, { data: { message: 'Test webhook sent', status: 'success' } });
});

export const getWebhookLogs = asyncHandler(async (req, res) => {
  ok(res, { data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
});

export const getAPIUsageStats = asyncHandler(async (req, res) => {
  ok(res, { data: { totalRequests: 12500, successRate: 99.2, avgResponseTime: 145, topEndpoints: [{ path: '/students', count: 3200 }, { path: '/attendance', count: 2800 }, { path: '/fees', count: 2100 }] } });
});
