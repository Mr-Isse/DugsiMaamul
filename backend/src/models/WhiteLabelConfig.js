import mongoose from 'mongoose';

const whiteLabelSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    primaryColor: { type: String, default: '#4f46e5' },
    secondaryColor: { type: String, default: '#7c3aed' },
    accentColor: { type: String, default: '#06b6d4' },
    darkBgColor: { type: String, default: '#111827' },
    lightBgColor: { type: String, default: '#ffffff' },
    logoUrl: { type: String },
    faviconUrl: { type: String },
    loginBannerUrl: { type: String },
    companyName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    customDomain: { type: String, trim: true, sparse: true },
    customEmailTemplate: { type: String },
    loginPageMessage: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WhiteLabelConfig = mongoose.model('WhiteLabelConfig', whiteLabelSchema);
export default WhiteLabelConfig;
