import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: 200
  },
  code: {
    type: String,
    required: [true, 'Institution code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20
  },
  type: {
    type: String,
    enum: ['university', 'polytechnic', 'college', 'secondary', 'primary'],
    required: [true, 'Institution type is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Nigeria' },
    zipCode: String
  },
  logo: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: [true, 'Institution email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  motto: {
    type: String,
    default: null
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending'
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxStudents: {
    type: Number,
    default: 500
  },
  maxTeachers: {
    type: Number,
    default: 50
  },
  settings: {
    caMaxScore: { type: Number, default: 40 },
    examMaxScore: { type: Number, default: 60 },
    allowStudentRegistration: { type: Boolean, default: true },
    resultApprovalRequired: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
institutionSchema.index({ status: 1 });
// Note: code already has a unique index from `unique: true` in schema definition

const Institution = mongoose.model('Institution', institutionSchema);
export default Institution;
