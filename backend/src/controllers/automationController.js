import asyncHandler from 'express-async-handler';
import ScheduledJob from '../models/ScheduledJob.js';
import AutomationLog from '../models/AutomationLog.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getScheduledJobs = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { type, status, page = 1, limit = 20 } = req.query;
  if (type) filter.type = type;
  if (status) filter.lastStatus = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    ScheduledJob.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    ScheduledJob.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createScheduledJob = asyncHandler(async (req, res) => {
  const { name, description, type, cronExpression, interval, intervalUnit, config } = req.body;
  if (!name || !type) return err(res, 400, 'Name and type are required');
  const job = await ScheduledJob.create({ ...tenantFilter(req), name, description, type, cronExpression, interval, intervalUnit, config, createdBy: req.user._id });
  await logAction(req, { action: 'CREATE', module: 'SCHEDULED_JOB', targetId: job._id });
  ok(res, { data: job }, 201);
});

export const updateScheduledJob = asyncHandler(async (req, res) => {
  const job = await ScheduledJob.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!job) return err(res, 404, 'Job not found');
  ok(res, { data: job });
});

export const deleteScheduledJob = asyncHandler(async (req, res) => {
  const job = await ScheduledJob.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!job) return err(res, 404, 'Job not found');
  ok(res, { message: 'Job deleted' });
});

export const toggleScheduledJob = asyncHandler(async (req, res) => {
  const job = await ScheduledJob.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!job) return err(res, 404, 'Job not found');
  job.isActive = !job.isActive;
  await job.save();
  ok(res, { data: job });
});

export const runScheduledJobNow = asyncHandler(async (req, res) => {
  const job = await ScheduledJob.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!job) return err(res, 404, 'Job not found');
  job.lastRunAt = new Date();
  job.runCount += 1;
  job.lastStatus = 'running';
  await job.save();
  const log = await AutomationLog.create({ ...tenantFilter(req), job: job._id, type: job.type, status: 'success', message: 'Manual execution triggered', recordsProcessed: 0, duration: 0 });
  job.lastStatus = 'success';
  job.lastRunAt = new Date();
  await job.save();
  ok(res, { data: { job, log } });
});

export const getAutomationLogs = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { type, status, page = 1, limit = 20 } = req.query;
  if (type) filter.type = type;
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    AutomationLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('job', 'name type').lean(),
    AutomationLog.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const getAutomationStats = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [totalJobs, activeJobs, recentLogs] = await Promise.all([
    ScheduledJob.countDocuments({ ...filter, isDeleted: false }),
    ScheduledJob.countDocuments({ ...filter, isDeleted: false, isActive: true }),
    AutomationLog.countDocuments({ ...filter, isDeleted: false, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);
  const successLogs = await AutomationLog.countDocuments({ ...filter, isDeleted: false, status: 'success', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  const failedLogs = await AutomationLog.countDocuments({ ...filter, isDeleted: false, status: 'failed', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  const byType = await ScheduledJob.aggregate([{ $match: { ...filter, isDeleted: false } }, { $group: { _id: '$type', count: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }]);
  ok(res, { data: { totalJobs, activeJobs, recentLogs, successLogs, failedLogs, byType } });
});
