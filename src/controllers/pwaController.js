// import DeviceLog from '../models/deviceLog.model.js'; // Optional for tracking
import SyncQueue from '../models/SyncQueue.js'; // Optional for queuing offline syncs
import os from 'os';
import dns from 'dns';

// 🔁 Sync offline data to server
export const sync = async (req, res) => {
  try {
    const { data, business_id, store_id, device_id } = req.body;
    const syncedAt = new Date();
    console.log(`[SYNC] from ${device_id}:`, data);

    res.status(200).json({ message: 'Data synced', syncedAt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to sync data', error: err.message });
  }
};

export const getPing = async (req, res) => {
  try {
    res.status(200).json({ status: 'Online', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'Offline', error: err.message });
  }
};


export const getStatus = async (req, res) => {
  try {
    const status = {
      server_time: new Date(),
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      network: os.networkInterfaces(),
    };

    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get device status', error: err.message });
  }
};


export const checkInternet = async (req, res) => {
  try {
    dns.lookup('google.com', (err) => {
      if (err) return res.status(200).json({ connected: false });
      res.status(200).json({ connected: true });
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
};


export const queueOfflineSync = async (req, res) => {
  try {
    const { device_id, business_id, store_id, data_type, payload } = req.body;

    const saved = await SyncQueue.create({
      device_id,
      business_id,
      store_id,
      data_type,
      payload,
      status: 'pending',
    });

    res.status(201).json({ message: 'Queued successfully', id: saved._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to queue sync', error: err.message });
  }
};


export const processQueuedSyncs = async (req, res) => {
  try {
    const { business_id } = req.query;
    const pending = await SyncQueue.find({ business_id, status: 'pending' });

    for (const entry of pending) {
      entry.status = 'synced';
      entry.synced_at = new Date();
      await entry.save();
    }

    res.status(200).json({ message: 'Processed all queued syncs', count: pending.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process queue', error: err.message });
  }
};
