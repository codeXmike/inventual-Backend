import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    business_id: { type: String, required: true },
    store_id: { type: String, required: true },

    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g. Utilities, Rent, Supplies
    amount: { type: Number, required: true },

    date: { type: Date, default: Date.now },
    description: { type: String },

    added_by: { type: String } // name or user id
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
