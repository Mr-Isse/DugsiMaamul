import mongoose from 'mongoose';

const biReportSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['executive', 'kpi', 'financial', 'academic', 'attendance', 'payroll', 'admission', 'comparative'], required: true, index: true },
    dateRange: { from: { type: Date }, to: { type: Date } },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    data: { type: mongoose.Schema.Types.Mixed },
    charts: [{ type: mongoose.Schema.Types.Mixed }],
    kpis: [{ type: mongoose.Schema.Types.Mixed }],
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['generating', 'ready', 'error'], default: 'ready' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

biReportSchema.index({ school: 1, type: 1, createdAt: -1 });
const BIReport = mongoose.model('BIReport', biReportSchema);
export default BIReport;
