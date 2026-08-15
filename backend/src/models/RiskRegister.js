import mongoose from 'mongoose';

const riskRegisterSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['operational', 'financial', 'compliance', 'strategic', 'reputational', 'safety'], required: true, index: true },
    likelihood: { type: Number, min: 1, max: 5, required: true },
    impact: { type: Number, min: 1, max: 5, required: true },
    riskScore: { type: Number },
    status: { type: String, enum: ['identified', 'assessing', 'mitigating', 'monitoring', 'closed'], default: 'identified', index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mitigationPlan: { type: String, trim: true },
    contingencyPlan: { type: String, trim: true },
    reviewDate: { type: Date },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

riskRegisterSchema.index({ school: 1, riskScore: -1 });
const RiskRegister = mongoose.model('RiskRegister', riskRegisterSchema);
export default RiskRegister;
