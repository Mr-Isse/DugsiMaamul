import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import BIReport from '../models/BIReport.js';
import { tenantFilter } from '../utils/tenantQuery.js';
import { logAction } from '../utils/auditLogger.js';

const ok = (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data });
const err = (res, code, msg) => res.status(code).json({ success: false, message: msg });

const User = () => mongoose.model('User');
const Attendance = () => mongoose.model('Attendance');
const Payment = () => mongoose.model('Payment');
const Expense = () => mongoose.model('Expense');
const Mark = () => mongoose.model('Mark');
const Ticket = () => mongoose.model('Ticket');
const BranchModel = () => mongoose.model('Branch');
const ClassModel = () => mongoose.model('Class');
const SubjectModel = () => mongoose.model('Subject');
const AcademicYearModel = () => mongoose.model('AcademicYear');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfDay = (d) => { const t = new Date(d); t.setHours(0, 0, 0, 0); return t; };
const endOfDay = (d) => { const t = new Date(d); t.setHours(23, 59, 59, 999); return t; };
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const monthsAgo = (n, from = new Date()) => {
  const d = new Date(from);
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const monthLabel = (year, month) => `${MONTH_NAMES[month - 1]} ${year}`;
const safeRate = (num, denom) => denom > 0 ? Math.round((num / denom) * 1000) / 10 : 0;

const academicYearStringFilter = async (academicYearId) => {
  if (!academicYearId) return null;
  try {
    const ay = await AcademicYearModel().findById(academicYearId).select('name').lean();
    return ay?.name || null;
  } catch { return null; }
};

const mergeActivity = (...arrays) =>
  arrays
    .flat()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

// ── GET BI Reports ───────────────────────────────────────────────────────────

export const getBIReports = asyncHandler(async (req, res) => {
  const filter = { ...tenantFilter(req), isDeleted: false };
  const { type, search, page = 1, limit = 20 } = req.query;
  if (type) filter.type = type;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    BIReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('generatedBy', 'name').lean(),
    BIReport.countDocuments(filter),
  ]);
  ok(res, { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
});

// ── GENERATE BI Report ───────────────────────────────────────────────────────

export const generateBIReport = asyncHandler(async (req, res) => {
  const { name, type, dateRange, academicYear } = req.body;
  if (!name || !type) return err(res, 400, 'Name and type are required');

  const filter = tenantFilter(req);
  const now = new Date();

  const ayStr = await academicYearStringFilter(academicYear || req.academicYearId);
  const ayFilter = ayStr ? { academicYear: ayStr } : {};
  const ayObjectIdFilter = (academicYear || req.academicYearId)
    ? { academicYear: new mongoose.Types.ObjectId(academicYear || req.academicYearId) }
    : {};

  const [totalStudents, totalTeachers, attendanceAgg, revenueAgg, expenseAgg, openTickets] = await Promise.all([
    User().countDocuments({ ...filter, role: 'student' }),
    User().countDocuments({ ...filter, role: 'teacher' }),
    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: monthsAgo(11), $lte: now }, isDeleted: false } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),
    Payment().aggregate([
      { $match: { ...filter, status: 'Paid', isDeleted: false, ...ayFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense().aggregate([
      { $match: { ...filter, status: 'Paid', ...ayFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Ticket().countDocuments({ ...filter, isDeleted: false, status: { $in: ['open', 'in_progress'] } }),
  ]);

  const kpis = [
    { label: 'Total Students', value: totalStudents },
    { label: 'Active Teachers', value: totalTeachers },
    { label: 'Attendance Rate', value: `${attendanceAgg[0] ? safeRate(attendanceAgg[0].attended, attendanceAgg[0].total) : 0}%` },
    { label: 'Total Revenue', value: revenueAgg[0]?.total || 0 },
    { label: 'Total Expenses', value: expenseAgg[0]?.total || 0 },
    { label: 'Net Profit', value: (revenueAgg[0]?.total || 0) - (expenseAgg[0]?.total || 0) },
    { label: 'Open Tickets', value: openTickets },
  ];

  const report = await BIReport.create({
    ...tenantFilter(req), name, type, dateRange, academicYear, status: 'ready',
    data: { generatedAt: new Date(), summary: 'Report data compiled successfully' },
    kpis,
    generatedBy: req.user._id,
  });
  await logAction(req, { action: 'CREATE', module: 'BI_REPORT', targetId: report._id });
  ok(res, { data: report }, 201);
});

// ── DELETE BI Report ──────────────────────────────────────────────────────────

export const deleteBIReport = asyncHandler(async (req, res) => {
  const report = await BIReport.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), isDeleted: false }, { isDeleted: true }, { new: true });
  if (!report) return err(res, 404, 'Report not found');
  ok(res, { message: 'Report deleted' });
});

// ── EXECUTIVE DASHBOARD ──────────────────────────────────────────────────────

export const getExecutiveDashboard = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const now = new Date();
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const mtdStart = startOfMonth(now);
  const mtdEnd = endOfMonth(now);

  const [
    totalStudents,
    activeTeachers,
    attendanceAgg,
    revenueMTD,
    outstandingFees,
    openTickets,
    attendanceTrend,
    revenueTrend,
    enrollmentByClass,
    recentPayments,
    recentAttendance,
  ] = await Promise.all([
    User().countDocuments({ ...filter, role: 'student' }),
    User().countDocuments({ ...filter, role: 'teacher' }),

    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: thirtyDaysAgo, $lte: now }, isDeleted: false } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),

    Payment().aggregate([
      { $match: { ...filter, status: 'Paid', isDeleted: false, date: { $gte: mtdStart, $lte: mtdEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    Payment().aggregate([
      { $match: { ...filter, status: 'Pending', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    Ticket().countDocuments({ ...filter, isDeleted: false, status: { $in: ['open', 'in_progress'] } }),

    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: monthsAgo(5), $lte: now }, isDeleted: false } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Payment().aggregate([
      { $match: { ...filter, status: 'Paid', isDeleted: false, date: { $gte: monthsAgo(5), $lte: now } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    User().aggregate([
      { $match: { ...filter, role: 'student' } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'cls' } },
      { $unwind: { path: '$cls', preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, name: { $ifNull: ['$cls.name', 'Unassigned'] } } },
      { $sort: { count: -1 } },
    ]),

    Payment().find({ ...filter, isDeleted: false }).sort({ date: -1 }).limit(5)
      .select('amount date status student').populate('student', 'name').lean(),

    Attendance().find({ ...filter, isDeleted: false }).sort({ date: -1 }).limit(5)
      .select('date status user').populate('user', 'name').lean(),
  ]);

  const attendanceRate = attendanceAgg[0] ? safeRate(attendanceAgg[0].attended, attendanceAgg[0].total) : 0;
  const revenue = revenueMTD[0]?.total || 0;
  const outstanding = outstandingFees[0]?.total || 0;

  const recentActivity = mergeActivity(
    recentPayments.map(p => ({
      type: 'payment',
      text: `Payment received: ${p.amount} from ${p.student?.name || 'Student'}`,
      date: p.date,
    })),
    recentAttendance.map(a => ({
      type: 'attendance',
      text: `${a.user?.name || 'Student'} marked ${a.status}`,
      date: a.date,
    })),
  );

  ok(res, {
    data: {
      kpis: [
        { label: 'Total Students', value: totalStudents, change: 0, trend: 'stable', icon: 'Users' },
        { label: 'Attendance Rate', value: `${attendanceRate}%`, change: 0, trend: 'stable', icon: 'CheckCircle' },
        { label: 'Revenue (MTD)', value: revenue, change: 0, trend: 'stable', icon: 'DollarSign' },
        { label: 'Outstanding Fees', value: outstanding, change: 0, trend: 'stable', icon: 'AlertTriangle' },
        { label: 'Active Teachers', value: activeTeachers, change: 0, trend: 'stable', icon: 'BookOpen' },
        { label: 'Tickets Open', value: openTickets, change: 0, trend: 'stable', icon: 'MessageSquare' },
      ],
      charts: {
        attendanceTrend: attendanceTrend.map(item => ({
          month: MONTH_NAMES[item._id.month - 1],
          rate: safeRate(item.attended, item.total),
        })),
        revenueTrend: revenueTrend.map(item => ({
          month: MONTH_NAMES[item._id.month - 1],
          amount: item.total,
        })),
        enrollmentByGrade: enrollmentByClass.map(e => ({
          grade: e.name,
          count: e.count,
        })),
      },
      recentActivity,
    },
  });
});

// ── KPI DASHBOARD ────────────────────────────────────────────────────────────

export const getKPIDashboard = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = startOfMonth(now);

  const ayObjectId = (req.academicYearId && mongoose.Types.ObjectId.isValid(req.academicYearId))
    ? new mongoose.Types.ObjectId(req.academicYearId) : null;

  const ayStr = await academicYearStringFilter(req.academicYearId);
  const paymentAyFilter = ayStr ? { academicYear: ayStr } : {};
  const markAyFilter = ayObjectId ? { academicYear: ayObjectId } : {};

  const [
    markStats,
    paymentStats,
    attendanceToday,
    attendanceWeek,
    attendanceMonth,
    chronicAbsentees,
    totalStaff,
    totalTeachers,
    absentToday,
  ] = await Promise.all([
    // Academic: aggregate marks for current academic year
    Mark().aggregate([
      { $match: { ...filter, ...markAyFilter } },
      { $group: {
        _id: null,
        avgTotal: { $avg: '$total' },
        totalDocs: { $sum: 1 },
        passCount: { $sum: { $cond: [{ $gte: ['$total', 50] }, 1, 0] } },
        topCount: { $sum: { $cond: [{ $gte: ['$total', 80] }, 1, 0] } },
        riskCount: { $sum: { $cond: [{ $lt: ['$total', 40] }, 1, 0] } },
      }},
    ]),

    // Financial: aggregate payments
    Payment().aggregate([
      { $match: { ...filter, isDeleted: false } },
      { $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }},
    ]),

    // Attendance: today
    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: todayStart, $lte: todayEnd }, isDeleted: false } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),

    // Attendance: this week
    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: weekStart, $lte: now }, isDeleted: false } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),

    // Attendance: this month
    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: monthStart, $lte: now }, isDeleted: false } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),

    // Chronic absentees: absent >= 5 days this month
    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: monthStart, $lte: now }, status: 'Absent', isDeleted: false } },
      { $group: { _id: '$user', absentCount: { $sum: 1 } } },
      { $match: { absentCount: { $gte: 5 } } },
      { $count: 'total' },
    ]),

    // HR: total staff (non-student, non-parent)
    User().countDocuments({ ...filter, role: { $nin: ['student', 'parent'] } }),
    User().countDocuments({ ...filter, role: 'teacher' }),

    // HR: absent today
    Attendance().aggregate([
      { $match: { ...filter, date: { $gte: todayStart, $lte: todayEnd }, status: 'Absent', isDeleted: false } },
      { $count: 'total' },
    ]),
  ]);

  const m = markStats[0] || {};
  const paymentMap = {};
  for (const p of (paymentStats || [])) paymentMap[p._id] = p.total;
  const paidTotal = paymentMap.Paid || 0;
  const pendingTotal = paymentMap.Pending || 0;
  const allPaymentTotal = paidTotal + pendingTotal + (paymentMap.Failed || 0);

  ok(res, {
    data: {
      academic: {
        avgScore: m.avgTotal ? Math.round(m.avgTotal * 10) / 10 : 0,
        passRate: m.totalDocs ? safeRate(m.passCount || 0, m.totalDocs) : 0,
        topPerformers: m.topCount || 0,
        atRisk: m.riskCount || 0,
      },
      financial: {
        totalRevenue: paidTotal + pendingTotal + (paymentMap.Failed || 0),
        collected: paidTotal,
        pending: pendingTotal,
        collectionRate: allPaymentTotal > 0 ? safeRate(paidTotal, allPaymentTotal) : 0,
      },
      attendance: {
        todayRate: attendanceToday[0] ? safeRate(attendanceToday[0].attended, attendanceToday[0].total) : 0,
        weeklyAvg: attendanceWeek[0] ? safeRate(attendanceWeek[0].attended, attendanceWeek[0].total) : 0,
        monthlyAvg: attendanceMonth[0] ? safeRate(attendanceMonth[0].attended, attendanceMonth[0].total) : 0,
        chronicAbsentees: chronicAbsentees[0]?.total || 0,
      },
      hr: {
        totalStaff,
        teachers: totalTeachers,
        support: totalStaff - totalTeachers,
        absentToday: absentToday[0]?.total || 0,
      },
    },
  });
});

// ── FINANCIAL ANALYTICS ──────────────────────────────────────────────────────

export const getFinancialAnalytics = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const now = new Date();

  const [revenueByMonth, revenueTotal, revenueByMethod, expenseTotal, expenseByCategory, outstandingAgg] = await Promise.all([
    Payment().aggregate([
      { $match: { ...filter, status: 'Paid', isDeleted: false, date: { $gte: monthsAgo(5), $lte: now } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Payment().aggregate([
      { $match: { ...filter, status: 'Paid', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    Payment().aggregate([
      { $match: { ...filter, status: 'Paid', isDeleted: false } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    Expense().aggregate([
      { $match: { ...filter, status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    Expense().aggregate([
      { $match: { ...filter, status: 'Paid' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    Payment().aggregate([
      { $match: { ...filter, status: 'Pending', isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const revTotal = revenueTotal[0]?.total || 0;
  const expTotal = expenseTotal[0]?.total || 0;

  ok(res, {
    data: {
      revenue: {
        total: revTotal,
        trend: revenueByMonth.map(item => ({
          month: MONTH_NAMES[item._id.month - 1],
          year: item._id.year,
          amount: item.total,
        })),
        byMethod: revenueByMethod.map(item => ({
          method: item._id || 'Unknown',
          total: item.total,
          count: item.count,
        })),
      },
      expenses: {
        total: expTotal,
        byCategory: expenseByCategory.map(item => ({
          category: item._id || 'Other',
          total: item.total,
          count: item.count,
        })),
      },
      profit: revTotal - expTotal,
      outstanding: {
        total: outstandingAgg[0]?.total || 0,
        count: outstandingAgg[0]?.count || 0,
      },
    },
  });
});

// ── ACADEMIC ANALYTICS ───────────────────────────────────────────────────────

export const getAcademicAnalytics = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const now = new Date();

  const ayObjectId = (req.academicYearId && mongoose.Types.ObjectId.isValid(req.academicYearId))
    ? new mongoose.Types.ObjectId(req.academicYearId) : null;
  const markFilter = ayObjectId ? { ...filter, academicYear: ayObjectId } : { ...filter };

  const [overall, bySubject, byClass, trend] = await Promise.all([
    Mark().aggregate([
      { $match: markFilter },
      { $group: {
        _id: null,
        avgTotal: { $avg: '$total' },
        maxTotal: { $max: '$total' },
        minTotal: { $min: '$total' },
        totalDocs: { $sum: 1 },
        passCount: { $sum: { $cond: [{ $gte: ['$total', 50] }, 1, 0] } },
      }},
    ]),

    Mark().aggregate([
      { $match: markFilter },
      { $group: {
        _id: '$subject',
        avgTotal: { $avg: '$total' },
        count: { $sum: 1 },
      }},
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } },
      { $unwind: { path: '$subjectInfo', preserveNullAndEmptyArrays: true } },
      { $project: {
        avgTotal: { $round: ['$avgTotal', 1] },
        count: 1,
        name: { $ifNull: ['$subjectInfo.name', 'Unknown'] },
      }},
      { $sort: { avgTotal: -1 } },
    ]),

    Mark().aggregate([
      { $match: markFilter },
      { $group: {
        _id: '$class',
        avgTotal: { $avg: '$total' },
        count: { $sum: 1 },
      }},
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      { $project: {
        avgTotal: { $round: ['$avgTotal', 1] },
        count: 1,
        name: { $ifNull: ['$classInfo.name', 'Unknown'] },
      }},
      { $sort: { avgTotal: -1 } },
    ]),

    Mark().aggregate([
      { $match: { ...markFilter, createdAt: { $gte: monthsAgo(5), $lte: now } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        avgTotal: { $avg: '$total' },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const o = overall[0] || {};

  ok(res, {
    data: {
      overall: {
        avgScore: o.avgTotal ? Math.round(o.avgTotal * 10) / 10 : 0,
        passRate: o.totalDocs ? safeRate(o.passCount || 0, o.totalDocs) : 0,
        topScore: o.maxTotal || 0,
        lowestScore: o.minTotal || 0,
      },
      bySubject: bySubject.map(s => ({ subject: s.name, avg: s.avgTotal, count: s.count })),
      byGrade: byClass.map(c => ({ grade: c.name, avg: c.avgTotal, count: c.count })),
      trend: trend.map(t => ({
        month: MONTH_NAMES[t._id.month - 1],
        year: t._id.year,
        avg: Math.round(t.avgTotal * 10) / 10,
      })),
    },
  });
});

// ── COMPARATIVE REPORTS ──────────────────────────────────────────────────────

export const getComparativeReports = asyncHandler(async (req, res) => {
  const filter = tenantFilter(req);
  const now = new Date();

  const ayObjectId = (req.academicYearId && mongoose.Types.ObjectId.isValid(req.academicYearId))
    ? new mongoose.Types.ObjectId(req.academicYearId) : null;

  const [branches, branchMarks, branchAttendance, branchPayments, yearMarks, yearAttendance, yearPayments] = await Promise.all([
    BranchModel().find({ tenant: req.schoolId, isDeleted: { $ne: true } }).select('name').lean(),

    Mark().aggregate([
      { $match: { school: req.schoolId, ...(ayObjectId ? { academicYear: ayObjectId } : {}) } },
      { $group: {
        _id: '$branch',
        avgTotal: { $avg: '$total' },
        count: { $sum: 1 },
      }},
    ]),

    Attendance().aggregate([
      { $match: { school: req.schoolId, date: { $gte: monthsAgo(11), $lte: now }, isDeleted: false } },
      { $group: {
        _id: '$branch',
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),

    Payment().aggregate([
      { $match: { school: req.schoolId, status: 'Paid', isDeleted: false } },
      { $group: {
        _id: '$branch',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }},
    ]),

    Mark().aggregate([
      { $match: { school: req.schoolId, academicYear: { $exists: true, $ne: null } } },
      { $group: {
        _id: '$academicYear',
        avgTotal: { $avg: '$total' },
        count: { $sum: 1 },
      }},
    ]),

    Attendance().aggregate([
      { $match: { school: req.schoolId, date: { $gte: monthsAgo(11), $lte: now }, isDeleted: false } },
      { $group: {
        _id: '$academicYear',
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late', 'Early_Leave', 'Half_Day']] }, 1, 0] } },
      }},
    ]),

    Payment().aggregate([
      { $match: { school: req.schoolId, status: 'Paid', isDeleted: false } },
      { $group: {
        _id: '$academicYear',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }},
    ]),
  ]);

  const branchMap = {};
  for (const b of branches) branchMap[b._id.toString()] = b.name;

  const marksByBranch = {};
  for (const m of (branchMarks || [])) {
    const id = m._id?.toString();
    if (id) marksByBranch[id] = { avgScore: Math.round((m.avgTotal || 0) * 10) / 10, count: m.count };
  }
  const attByBranch = {};
  for (const a of (branchAttendance || [])) {
    const id = a._id?.toString();
    if (id) attByBranch[id] = { rate: safeRate(a.attended, a.total), total: a.total };
  }
  const payByBranch = {};
  for (const p of (branchPayments || [])) {
    const id = p._id?.toString();
    if (id) payByBranch[id] = { total: p.total, count: p.count };
  }

  const branchResults = branches.map(b => {
    const id = b._id.toString();
    return {
      name: b.name,
      students: marksByBranch[id]?.count || 0,
      attendance: attByBranch[id]?.rate || 0,
      avgScore: marksByBranch[id]?.avgScore || 0,
      revenue: payByBranch[id]?.total || 0,
    };
  });

  // Resolve academic year strings
  const yearIds = [...new Set([
    ...(yearMarks || []).map(y => y._id?.toString()),
    ...(yearAttendance || []).map(y => y._id?.toString()),
    ...(yearPayments || []).map(y => y._id?.toString()),
  ])].filter(Boolean);

  const yearStrings = {};
  if (yearIds.length > 0) {
    const validIds = yearIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length > 0) {
      const years = await AcademicYearModel().find({ _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) } })
        .select('_id name').lean();
      for (const y of years) yearStrings[y._id.toString()] = y.name;
    }
  }

  const yearMap = {};
  for (const m of (yearMarks || [])) {
    const id = m._id?.toString();
    if (!id) continue;
    if (!yearMap[id]) yearMap[id] = {};
    yearMap[id].avgScore = Math.round((m.avgTotal || 0) * 10) / 10;
  }
  for (const a of (yearAttendance || [])) {
    const id = a._id?.toString();
    if (!id) continue;
    if (!yearMap[id]) yearMap[id] = {};
    yearMap[id].attendance = safeRate(a.attended, a.total);
  }
  for (const p of (yearPayments || [])) {
    const id = p._id?.toString();
    if (!id) continue;
    if (!yearMap[id]) yearMap[id] = {};
    yearMap[id].revenue = p.total;
  }

  const termResults = Object.entries(yearMap).map(([id, data]) => ({
    term: yearStrings[id] || id,
    ...data,
  }));

  ok(res, {
    data: {
      branches: branchResults,
      terms: termResults,
    },
  });
});
