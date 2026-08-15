import asyncHandler from 'express-async-handler';
import DynamicConfig from '../models/DynamicConfig.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getDynamicConfigs = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { module: mod } = req.query;
  if (mod) filter.module = mod;
  const data = await DynamicConfig.find(filter).lean();
  ok(res, { data });
});

export const getDynamicConfig = asyncHandler(async (req, res) => {
  const { module: mod } = req.params;
  let config = await DynamicConfig.findOne({ ...tenantFilter(req), module: mod, isDeleted: false }).lean();
  if (!config) config = await DynamicConfig.create({ ...tenantFilter(req), module: mod, fields: [], values: {} });
  ok(res, { data: config });
});

export const upsertDynamicConfig = asyncHandler(async (req, res) => {
  const { module: mod } = req.params;
  const { fields, values } = req.body;
  let config = await DynamicConfig.findOne({ ...tenantFilter(req), module: mod, isDeleted: false });
  if (!config) {
    config = await DynamicConfig.create({ ...tenantFilter(req), module: mod, fields: fields || [], values: values || {} });
  } else {
    if (fields) config.fields = fields;
    if (values) config.values = { ...config.values, ...values };
    await config.save();
  }
  await logAction(req, { action: 'UPDATE', module: 'DYNAMIC_CONFIG', targetId: config._id });
  ok(res, { data: config });
});

export const deleteDynamicConfig = asyncHandler(async (req, res) => {
  const config = await DynamicConfig.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!config) return err(res, 404, 'Config not found');
  ok(res, { message: 'Config deleted' });
});
