import mongoose from 'mongoose';

const taskItemSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['todo', 'in_progress', 'review', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
    tags: [{ type: String }],
    attachments: [{ url: { type: String }, name: { type: String } }],
    checklist: [{ text: { type: String }, done: { type: Boolean, default: false } }],
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskItemSchema.index({ school: 1, status: 1, assignedTo: 1 });
const TaskItem = mongoose.model('TaskItem', taskItemSchema);
export default TaskItem;
