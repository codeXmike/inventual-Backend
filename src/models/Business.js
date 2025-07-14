import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    businessId: { type: String, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessEmail: { type: String, required: true, unique: true },
    businessPhone: { type: String },
    businessAddress: { type: String },
    industryType: { type: String },
    currency: { type: String },
    logo: { type: String },

    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true},
    phone: { type: String },
    password: { type: String, required: true },

    registration_number: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

const Business = mongoose.model('Business', businessSchema);
export default Business;
