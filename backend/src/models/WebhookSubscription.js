import mongoose from 'mongoose';

const webhookSubscriptionSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    events: [{ type: String, required: true }],
    secret: { type: String, select: false },
    status: { type: String, enum: ['active', 'paused', 'failed'], default: 'active', index: true },
    retryCount: { type: Number, default: 3 },
    lastTriggeredAt: { type: Date },
    lastStatus: { type: Number },
    failureCount: { type: Number, default: 0 },
    headers: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

webhookSubscriptionSchema.index({ school: 1, events: 1 });
const WebhookSubscription = mongoose.model('WebhookSubscription', webhookSubscriptionSchema);
export default WebhookSubscription;
