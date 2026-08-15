import mongoose from 'mongoose';

const apiTokenSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    token: { type: String, required: true, unique: true },
    scopes: [{ type: String }],
    rateLimit: { type: Number, default: 500 },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

apiTokenSchema.index({ school: 1, user: 1 });
const APIToken = mongoose.model('APIToken', apiTokenSchema);
export default APIToken;
