import mongoose from 'mongoose';

const aiChatMessageSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    session: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    context: { type: mongoose.Schema.Types.Mixed },
    tokens: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

aiChatMessageSchema.index({ school: 1, session: 1, createdAt: 1 });
const AIChatMessage = mongoose.model('AIChatMessage', aiChatMessageSchema);
export default AIChatMessage;
