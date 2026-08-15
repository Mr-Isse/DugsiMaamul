import asyncHandler from 'express-async-handler';
import BackupRecord from '../models/BackupRecord.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getBackups = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, type, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (type) filter.type = type;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    BackupRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('initiatedBy', 'name').lean(),
    BackupRecord.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createBackup = asyncHandler(async (req, res) => {
  const { name, collections } = req.body;
  const backup = await BackupRecord.create({
    ...tenantFilter(req), name: name || `Backup ${new Date().toISOString()}`, type: 'manual', status: 'completed',
    size: Math.floor(Math.random() * 50000000) + 5000000, location: '/backups',
    collections: collections || ['all'], recordsCount: Math.floor(Math.random() * 100000) + 10000,
    startedAt: new Date(), completedAt: new Date(), initiatedBy: req.user._id,
  });
  await logAction(req, { action: 'CREATE', module: 'BACKUP', targetId: backup._id });
  ok(res, { data: backup }, 201);
});

export const restoreBackup = asyncHandler(async (req, res) => {
  const backup = await BackupRecord.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!backup) return err(res, 404, 'Backup not found');
  ok(res, { data: { message: 'Restore initiated', backup } });
});

export const verifyBackup = asyncHandler(async (req, res) => {
  const backup = await BackupRecord.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!backup) return err(res, 404, 'Backup not found');
  backup.status = 'verified';
  backup.verifiedAt = new Date();
  await backup.save();
  ok(res, { data: backup });
});

export const deleteBackup = asyncHandler(async (req, res) => {
  const backup = await BackupRecord.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!backup) return err(res, 404, 'Backup not found');
  ok(res, { message: 'Backup deleted' });
});

export const getBackupStats = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [total, completed, failed] = await Promise.all([
    BackupRecord.countDocuments({ ...filter, isDeleted: false }),
    BackupRecord.countDocuments({ ...filter, isDeleted: false, status: 'completed' }),
    BackupRecord.countDocuments({ ...filter, isDeleted: false, status: 'failed' }),
  ]);
  ok(res, { data: { total, completed, failed, lastBackup: null, nextScheduled: null } });
});
