import mongoose from 'mongoose';

const aiPredictionSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
    type: { type: String, enum: ['performance', 'attendance', 'dropout-risk', 'fee-collection', 'recommendation'], required: true, index: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    prediction: { type: mongoose.Schema.Types.Mixed },
    confidence: { type: Number, min: 0, max: 1 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    factors: [{ type: mongoose.Schema.Types.Mixed }],
    recommendedActions: [{ type: String }],
    modelVersion: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

aiPredictionSchema.index({ school: 1, student: 1, type: 1 });
const AIPrediction = mongoose.model('AIPrediction', aiPredictionSchema);
export default AIPrediction;
