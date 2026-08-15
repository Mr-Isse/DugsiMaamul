import mongoose from 'mongoose';

const incidentReportSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['safety', 'security', 'academic', 'health', 'facility', 'it', 'other'], required: true, index: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
    status: { type: String, enum: ['reported', 'investigating', 'resolved', 'closed'], default: 'reported', index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, trim: true },
    affectedPersons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    actions: [{ action: { type: String }, takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: { type: Date } }],
    resolution: { type: String, trim: true },
    resolvedAt: { type: Date },
    attachments: [{ url: { type: String }, name: { type: String } }],
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

incidentReportSchema.index({ school: 1, severity: 1, status: 1 });
const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);
export default IncidentReport;
