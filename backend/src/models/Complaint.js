import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['academic', 'facilities', 'staff', 'safety', 'transport', 'food', 'other'], required: true, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['submitted', 'acknowledged', 'investigating', 'resolved', 'closed', 'rejected'], default: 'submitted', index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    response: { type: String, trim: true },
    respondedAt: { type: Date },
    resolvedAt: { type: Date },
    isAnonymous: { type: Boolean, default: false },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

complaintSchema.index({ school: 1, status: 1, category: 1 });
const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
