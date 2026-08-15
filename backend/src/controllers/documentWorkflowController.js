import asyncHandler from 'express-async-handler';
import DocumentRecord from '../models/DocumentRecord.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getDocuments = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { category, status, search, page = 1, limit = 20 } = req.query;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    DocumentRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('uploadedBy', 'name').populate('approvedBy', 'name').lean(),
    DocumentRecord.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createDocument = asyncHandler(async (req, res) => {
  const { title, description, category, fileUrl, publicId, tags } = req.body;
  if (!title || !category) return err(res, 400, 'Title and category are required');
  const doc = await DocumentRecord.create({
    ...tenantFilter(req), title, description, category, tags,
    versions: [{ version: 1, fileUrl, publicId, uploadedBy: req.user._id }],
    currentVersion: 1, uploadedBy: req.user._id, status: 'draft',
    academicYear: req.academicYearId,
  });
  await logAction(req, { action: 'CREATE', module: 'DOCUMENT', targetId: doc._id });
  ok(res, { data: doc }, 201);
});

export const updateDocument = asyncHandler(async (req, res) => {
  const doc = await DocumentRecord.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!doc) return err(res, 404, 'Document not found');
  ok(res, { data: doc });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await DocumentRecord.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!doc) return err(res, 404, 'Document not found');
  ok(res, { message: 'Document deleted' });
});

export const approveDocument = asyncHandler(async (req, res) => {
  const doc = await DocumentRecord.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!doc) return err(res, 404, 'Document not found');
  doc.status = 'approved';
  doc.approvedBy = req.user._id;
  doc.approvedAt = new Date();
  await doc.save();
  ok(res, { data: doc });
});

export const rejectDocument = asyncHandler(async (req, res) => {
  const doc = await DocumentRecord.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!doc) return err(res, 404, 'Document not found');
  doc.status = 'rejected';
  await doc.save();
  ok(res, { data: doc });
});

export const addDocumentVersion = asyncHandler(async (req, res) => {
  const { fileUrl, publicId, changeNote } = req.body;
  const doc = await DocumentRecord.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!doc) return err(res, 404, 'Document not found');
  doc.currentVersion += 1;
  doc.versions.push({ version: doc.currentVersion, fileUrl, publicId, uploadedBy: req.user._id, changeNote });
  doc.status = 'draft';
  await doc.save();
  ok(res, { data: doc });
});

export const getDocumentStats = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [total, drafts, approved, pending] = await Promise.all([
    DocumentRecord.countDocuments({ ...filter, isDeleted: false }),
    DocumentRecord.countDocuments({ ...filter, isDeleted: false, status: 'draft' }),
    DocumentRecord.countDocuments({ ...filter, isDeleted: false, status: 'approved' }),
    DocumentRecord.countDocuments({ ...filter, isDeleted: false, status: 'pending' }),
  ]);
  const byCategory = await DocumentRecord.aggregate([{ $match: { ...filter, isDeleted: false } }, { $group: { _id: '$category', count: { $sum: 1 } } }]);
  ok(res, { data: { total, drafts, approved, pending, byCategory } });
});
