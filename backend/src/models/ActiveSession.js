import mongoose from 'mongoose';

const activeSessionSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    location: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

activeSessionSchema.index({ school: 1, user: 1 });
activeSessionSchema.index({ school: 1, expiresAt: 1 });
const ActiveSession = mongoose.model('ActiveSession', activeSessionSchema);
export default ActiveSession;
