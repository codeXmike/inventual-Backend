
import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true
    },
    name: { type: String, required: true, trim: true },

    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      postal_code: { type: String },
      country: { type: String, default: 'Nigeria' }
    },

    contact: {
      phone: { type: String },
      email: { type: String }
    },

    operating_hours: {
      weekdays: { type: String, default: '9:00 AM - 8:00 PM' },
      weekends: { type: String, default: '10:00 AM - 6:00 PM' }
    },

    employees: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        name: { type: String },
        role: { type: String }
      }
    ],

    status: {
      type: String,
      enum: ['active', 'inactive', 'closed'],
      default: 'active'
    }
  },
  { timestamps: true }
);

const Store = mongoose.model('Store', storeSchema);
export default Store;
