import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['getting-started', 'how-to', 'faq', 'troubleshooting', 'policy', 'template'], required: true, index: true },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

knowledgeBaseSchema.index({ school: 1, category: 1 });
const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
export default KnowledgeBase;
