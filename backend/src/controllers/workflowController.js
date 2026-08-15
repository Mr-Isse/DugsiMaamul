import asyncHandler from 'express-async-handler';
import Workflow from '../models/Workflow.js';
import WorkflowInstance from '../models/WorkflowInstance.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// ── Workflow CRUD ──
export const getWorkflows = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { category, search, page = 1, limit = 20 } = req.query;
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    Workflow.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Workflow.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createWorkflow = asyncHandler(async (req, res) => {
  const { name, description, category, steps } = req.body;
  if (!name || !category) return err(res, 400, 'Name and category are required');
  const workflow = await Workflow.create({ ...tenantFilter(req), name, description, category, steps: steps || [], createdBy: req.user._id });
  await logAction(req, { action: 'CREATE', module: 'WORKFLOW', targetId: workflow._id });
  ok(res, { data: workflow }, 201);
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, req.body, { new: true });
  if (!workflow) return err(res, 404, 'Workflow not found');
  ok(res, { data: workflow });
});

export const deleteWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!workflow) return err(res, 404, 'Workflow not found');
  ok(res, { message: 'Workflow deleted' });
});

// ── Workflow Instances ──
export const getWorkflowInstances = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { status, category, page = 1, limit = 20 } = req.query;
  if (status) filter.status = status;
  if (category) filter.category = category;
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    WorkflowInstance.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('requestedBy', 'name email').populate('workflow', 'name').lean(),
    WorkflowInstance.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

export const createWorkflowInstance = asyncHandler(async (req, res) => {
  const { workflowId, title, description, referenceId, referenceModel } = req.body;
  if (!workflowId || !title) return err(res, 400, 'Workflow ID and title are required');
  const workflow = await Workflow.findOne({ _id: workflowId, ...tenantFilter(req), isDeleted: false });
  if (!workflow) return err(res, 404, 'Workflow template not found');
  const steps = workflow.steps.map(s => ({ stepNumber: s.stepNumber, name: s.name, status: 'pending', approverRole: s.approverRole }));
  const instance = await WorkflowInstance.create({
    ...tenantFilter(req), workflow: workflowId, category: workflow.category, title, description,
    referenceId, referenceModel, requestedBy: req.user._id, steps, currentStep: 0, status: 'in_progress',
    academicYear: req.academicYearId,
  });
  await logAction(req, { action: 'CREATE', module: 'WORKFLOW_INSTANCE', targetId: instance._id });
  ok(res, { data: instance }, 201);
});

export const approveWorkflowStep = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const instance = await WorkflowInstance.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!instance) return err(res, 404, 'Workflow instance not found');
  if (instance.status !== 'in_progress' && instance.status !== 'pending') return err(res, 400, 'Workflow is not active');
  const currentStep = instance.steps[instance.currentStep];
  if (!currentStep) return err(res, 400, 'No pending step');
  currentStep.status = 'approved';
  currentStep.approver = req.user._id;
  currentStep.comment = comment;
  currentStep.decidedAt = new Date();
  if (instance.currentStep < instance.steps.length - 1) {
    instance.currentStep += 1;
  } else {
    instance.status = 'approved';
  }
  await instance.save();
  ok(res, { data: instance });
});

export const rejectWorkflowStep = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const instance = await WorkflowInstance.findOne({ _id: req.params.id, ...tenantFilter(req), isDeleted: false });
  if (!instance) return err(res, 404, 'Workflow instance not found');
  const currentStep = instance.steps[instance.currentStep];
  if (!currentStep) return err(res, 400, 'No pending step');
  currentStep.status = 'rejected';
  currentStep.approver = req.user._id;
  currentStep.comment = comment;
  currentStep.decidedAt = new Date();
  instance.status = 'rejected';
  await instance.save();
  ok(res, { data: instance });
});

export const cancelWorkflowInstance = asyncHandler(async (req, res) => {
  const instance = await WorkflowInstance.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false, status: { $in: ['pending', 'in_progress'] } }, { status: 'cancelled' }, { new: true });
  if (!instance) return err(res, 404, 'Active workflow instance not found');
  ok(res, { data: instance });
});

// ── Workflow Stats ──
export const getWorkflowStats = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const [total, pending, approved, rejected] = await Promise.all([
    WorkflowInstance.countDocuments({ ...filter, isDeleted: false }),
    WorkflowInstance.countDocuments({ ...filter, isDeleted: false, status: 'pending' }),
    WorkflowInstance.countDocuments({ ...filter, isDeleted: false, status: 'approved' }),
    WorkflowInstance.countDocuments({ ...filter, isDeleted: false, status: 'rejected' }),
  ]);
  const byCategory = await WorkflowInstance.aggregate([
    { $match: { ...filter, isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  ok(res, { data: { total, pending, approved, rejected, byCategory } });
});
