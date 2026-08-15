import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, enum: ['general', 'academic', 'event', 'emergency', 'policy', 'holiday'], required: true, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    targetAudience: [{ type: String, enum: ['all', 'teachers', 'students', 'parents', 'admin', 'staff'] }],
    publishAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isPublished: { type: Boolean, default: true },
    attachments: [{ url: { type: String }, name: { type: String } }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

announcementSchema.index({ school: 1, isPublished: 1, publishAt: -1 });
const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
