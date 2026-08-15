import mongoose from 'mongoose';

const systemHealthSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
    service: { type: String, required: true, index: true },
    status: { type: String, enum: ['healthy', 'degraded', 'down', 'unknown'], default: 'healthy', index: true },
    responseTime: { type: Number },
    uptime: { type: Number },
    lastCheckAt: { type: Date, default: Date.now },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    errors: [{ message: { type: String }, timestamp: { type: Date } }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

systemHealthSchema.index({ school: 1, service: 1 });
const SystemHealth = mongoose.model('SystemHealth', systemHealthSchema);
export default SystemHealth;
