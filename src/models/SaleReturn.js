import mongoose from 'mongoose';

const saleReturnSchema = new mongoose.Schema(
  {
    business_id: { type: String, required: true },
    store_id: { type: String, required: true },
    sale_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },

    date: { type: Date, required: true },
    customer: { type: String, required: true },
    reason: { type: String, required: true },

    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ],

    reference: { type: String, required: true, unique: true },

    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },

    paymentMethod: { type: String, default: 'To be determined' },

    approved_by: { type: String },
    refunded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const SaleReturn = mongoose.model('SaleReturn', saleReturnSchema);
export default SaleReturn;
