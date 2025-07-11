import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true
    },
    name: { type: String, required: true, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    phone: { type: String },
    manager_name: { type: String },
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
  },
  { timestamps: true }
);

const Store = mongoose.model('Store', storeSchema);
export default Store;
