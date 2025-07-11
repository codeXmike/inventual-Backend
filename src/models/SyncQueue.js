import mongoose from 'mongoose';

const syncQueueSchema = new mongoose.Schema(
  {
    business_id: String,
    store_id: String,
    device_id: String,
    data_type: String,
    payload: mongoose.Schema.Types.Mixed,

    status: { type: String, enum: ['pending', 'synced', 'failed'], default: 'pending' },
    synced_at: { type: Date }
  },
  { timestamps: true }
);

const SyncQueue = mongoose.model('SyncQueue', syncQueueSchema);
export default SyncQueue;
