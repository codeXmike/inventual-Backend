// models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
