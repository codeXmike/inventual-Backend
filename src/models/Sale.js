import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    business_id: { type: String, required: true },
    store_id: { type: String, required: true },

    customer_id: { type: String },
    customer_name: { type: String },

    sale_date: { type: Date, required: true },
    biller_name: { type: String, required: true },

    products: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ],

    subtotal: { type: Number, required: true },
    tax_amount: { type: Number, required: false },
    discount_amount: { type: Number, required: false },
    grand_total: { type: Number, required: true },

    payment_method: { type: String, enum: ['cash', 'card', 'transfer', 'other'], default: 'cash' },
    sale_status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
    sales_note: { type: String },

    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;