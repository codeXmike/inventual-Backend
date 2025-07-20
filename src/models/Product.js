import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    business_id: { type: String, required: true, trim: true },
    store_id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    stock_alert: { type: Number, required: true },
    brand: { type: String, required: true },
    barcode: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    cost_price: { type: Number, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
