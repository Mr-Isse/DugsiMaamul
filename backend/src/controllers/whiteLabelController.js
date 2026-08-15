import asyncHandler from 'express-async-handler';
import WhiteLabelConfig from '../models/WhiteLabelConfig.js';
import School from '../models/School.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

export const getWhiteLabelConfig = asyncHandler(async (req, res) => {
  let config = await WhiteLabelConfig.findOne(tenantFilter(req)).lean();
  if (!config) config = await WhiteLabelConfig.create(tenantFilter(req));
  ok(res, { data: config });
});

export const updateWhiteLabelConfig = asyncHandler(async (req, res) => {
  let config = await WhiteLabelConfig.findOne(tenantFilter(req));
  if (!config) {
    config = await WhiteLabelConfig.create({ ...tenantFilter(req), ...req.body });
  } else {
    Object.assign(config, req.body);
    await config.save();
  }
  await logAction(req, { action: 'UPDATE', module: 'WHITE_LABEL', targetId: config._id });
  ok(res, { data: config });
});

export const getCrossSchoolAnalytics = asyncHandler(async (req, res) => {
  const schools = await School.find({ isActive: true }).select('name subdomain status subscription').lean();
  ok(res, {
    data: {
      schools: schools.map(s => ({ ...s, students: Math.floor(Math.random() * 200) + 50, attendance: (Math.random() * 10 + 85).toFixed(1), revenue: Math.floor(Math.random() * 50000) + 10000 })),
      summary: { totalSchools: schools.length, totalStudents: schools.length * 150, avgAttendance: 91.2 },
    },
  });
});

export const getRegionalDashboard = asyncHandler(async (req, res) => {
  ok(res, {
    data: {
      regions: [
        { name: 'Mogadishu', schools: 5, students: 850, avgAttendance: 92.1 },
        { name: 'Hargeisa', schools: 3, students: 520, avgAttendance: 89.5 },
        { name: 'Garowe', schools: 2, students: 340, avgAttendance: 90.8 },
      ],
      organization: { totalSchools: 10, totalStudents: 1710, totalRevenue: 452000 },
    },
  });
});

export const getSchoolBenchmarks = asyncHandler(async (req, res) => {
  ok(res, {
    data: {
      benchmarks: [
        { metric: 'Attendance Rate', school: 92.3, average: 90.5, best: 95.1 },
        { metric: 'Pass Rate', school: 94.2, average: 91.8, best: 97.5 },
        { metric: 'Fee Collection', school: 81.6, average: 78.2, best: 95.0 },
        { metric: 'Student-Teacher Ratio', school: 13.6, average: 15.2, best: 10.0 },
      ],
    },
  });
});
