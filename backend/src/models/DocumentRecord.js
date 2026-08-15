import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeNote: { type: String, trim: true },
  size: { type: Number },
}, { _id: false });

const documentRecordSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: ['policy', 'certificate', 'report', 'contract', 'invoice', 'letter', 'memo', 'other'], required: true, index: true },
    currentVersion: { type: Number, default: 1 },
    versions: [documentVersionSchema],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'archived'], default: 'draft', index: true },
    isPublic: { type: Boolean, default: false },
    permissions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, access: { type: String, enum: ['view', 'edit', 'admin'] } }],
    tags: [{ type: String }],
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

documentRecordSchema.index({ school: 1, category: 1 });
const DocumentRecord = mongoose.model('DocumentRecord', documentRecordSchema);
export default DocumentRecord;
