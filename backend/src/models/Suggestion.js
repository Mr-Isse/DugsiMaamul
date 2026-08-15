import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['academic', 'facilities', 'process', 'technology', 'general'], required: true, index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['submitted', 'under_review', 'approved', 'implemented', 'declined'], default: 'submitted', index: true },
    upvotes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    response: { type: String, trim: true },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: { type: Date },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

suggestionSchema.index({ school: 1, upvotes: -1 });
const Suggestion = mongoose.model('Suggestion', suggestionSchema);
export default Suggestion;
