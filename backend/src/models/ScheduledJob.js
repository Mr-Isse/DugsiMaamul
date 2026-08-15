import mongoose from 'mongoose';

const scheduledJobSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['auto-promotion', 'auto-attendance', 'auto-payroll', 'auto-fee-reminder', 'auto-report', 'auto-notification', 'auto-email', 'auto-sms', 'auto-push', 'custom'], required: true, index: true },
    cronExpression: { type: String, trim: true },
    interval: { type: Number },
    intervalUnit: { type: String, enum: ['minutes', 'hours', 'days', 'weeks', 'months'] },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
    lastStatus: { type: String, enum: ['success', 'failed', 'running', 'idle'], default: 'idle' },
    lastError: { type: String },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

scheduledJobSchema.index({ school: 1, nextRunAt: 1 });
const ScheduledJob = mongoose.model('ScheduledJob', scheduledJobSchema);
export default ScheduledJob;
