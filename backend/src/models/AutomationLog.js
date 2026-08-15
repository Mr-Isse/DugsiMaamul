import mongoose from 'mongoose';

const automationLogSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledJob' },
    type: { type: String, required: true, index: true },
    status: { type: String, enum: ['success', 'failed', 'partial'], required: true, index: true },
    message: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    recordsProcessed: { type: Number, default: 0 },
    duration: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

automationLogSchema.index({ school: 1, createdAt: -1 });
const AutomationLog = mongoose.model('AutomationLog', automationLogSchema);
export default AutomationLog;
