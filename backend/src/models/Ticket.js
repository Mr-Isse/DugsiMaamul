import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  attachments: [{ url: { type: String }, name: { type: String } }],
}, { timestamps: true });

const ticketSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['technical', 'billing', 'feature-request', 'bug', 'general', 'hr', 'academic'], required: true, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'], default: 'open', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema],
    tags: [{ type: String }],
    dueDate: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ticketSchema.index({ school: 1, status: 1, priority: 1 });
const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
