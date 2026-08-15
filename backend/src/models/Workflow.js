import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['approval', 'notification', 'condition', 'auto-action'], required: true },
  approverRole: { type: String, enum: ['schooladmin', 'admin', 'teacher', 'accountant', 'superadmin'] },
  approverUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notifyRoles: [{ type: String }],
  condition: { type: String },
  action: { type: String },
  timeout: { type: Number, default: 0 },
}, { _id: false });

const workflowSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: ['leave', 'fee', 'expense', 'purchase', 'admission', 'promotion', 'transfer', 'certificate', 'custom'], required: true, index: true },
    steps: [workflowStepSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workflowSchema.index({ school: 1, category: 1 });
const Workflow = mongoose.model('Workflow', workflowSchema);
export default Workflow;
