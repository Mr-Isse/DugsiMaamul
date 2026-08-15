import mongoose from 'mongoose';

const backupRecordSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['automatic', 'manual', 'scheduled'], required: true, index: true },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'verified'], default: 'pending', index: true },
    size: { type: Number },
    location: { type: String },
    collections: [{ type: String }],
    recordsCount: { type: Number },
    startedAt: { type: Date },
    completedAt: { type: Date },
    verifiedAt: { type: Date },
    expiresAt: { type: Date },
    errorMessage: { type: String },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

backupRecordSchema.index({ school: 1, createdAt: -1 });
const BackupRecord = mongoose.model('BackupRecord', backupRecordSchema);
export default BackupRecord;
