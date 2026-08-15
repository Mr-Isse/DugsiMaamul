import mongoose from 'mongoose';

const approvalStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'skipped'], default: 'pending' },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverRole: { type: String },
  comment: { type: String, trim: true },
  decidedAt: { type: Date },
}, { _id: false });

const workflowInstanceSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentStep: { type: Number, default: 0 },
    steps: [approvalStepSchema],
    status: { type: String, enum: ['pending', 'in_progress', 'approved', 'rejected', 'cancelled'], default: 'pending', index: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workflowInstanceSchema.index({ school: 1, status: 1 });
workflowInstanceSchema.index({ school: 1, requestedBy: 1 });
const WorkflowInstance = mongoose.model('WorkflowInstance', workflowInstanceSchema);
export default WorkflowInstance;
