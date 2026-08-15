import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String, trim: true },
    meetingLink: { type: String, trim: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: ['pending', 'accepted', 'declined', 'tentative'], default: 'pending' } }],
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled', index: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

meetingSchema.index({ school: 1, startTime: 1 });
const MeetingScheduler = mongoose.model('MeetingScheduler', meetingSchema);
export default MeetingScheduler;
