import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    image: { type: String, required: true },
    role: { type: String, enum: ['cashier', 'manager', 'stockist', 'admin'], default: 'cashier', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', required: true },
    password: { type: String, required: true },
    last_login: { type: Date, required: true },
    logs: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
