import mongoose from 'mongoose';

const dynamicFieldSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'json', 'file'], required: true },
  options: [{ type: String }],
  defaultValue: { type: mongoose.Schema.Types.Mixed },
  validation: { type: mongoose.Schema.Types.Mixed },
  section: { type: String, trim: true },
  sortOrder: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const dynamicConfigSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    module: { type: String, required: true, index: true },
    fields: [dynamicFieldSchema],
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dynamicConfigSchema.index({ school: 1, module: 1 }, { unique: true });
const DynamicConfig = mongoose.model('DynamicConfig', dynamicConfigSchema);
export default DynamicConfig;
