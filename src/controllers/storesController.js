import Store from '../models/Store.js';
import mongoose from 'mongoose';

// GET a single store by ID
export const getStore = async (req, res) => {
  try {
    const { store_id } = req.query;

    if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
      return res.status(400).json({ success: false, error: 'Invalid store' });
    }

    const store = await Store.findById(store_id);
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    console.error('Error fetching store:', err.message);
    res.status(500).json({ success: false, error: 'Server error while fetching store' });
  }
};

// GET all stores under a business
export const getStores = async (req, res) => {
  try {
    const { business_id } = req.query;

    if (!business_id || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Valid business_id is required' });
    }

    const stores = await Store.find({ business_id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: stores.length, data: stores });
  } catch (err) {
    console.error('Error fetching stores:', err.message);
    res.status(500).json({ success: false, error: 'Server error while fetching stores' });
  }
};

// POST create a new store
export const addStore = async (req, res) => {
  try {
    const { business_id, name } = req.body;

    if (!business_id || !name) {
      return res.status(400).json({ success: false, error: 'business_id and name are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Invalid business_id format' });
    }

    const store = new Store(req.body);
    const saved = await store.save();

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error creating store:', err.message);
    res.status(400).json({ success: false, error: 'Failed to create store' });
  }
};

// PUT update store info
export const updateStoreInfo = async (req, res) => {
  try {
    const { business_id } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Invalid store_id or business_id' });
    }

    const updated = await Store.findOneAndUpdate(
      { _id: id, business_id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, error: 'Store not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating store:', err.message);
    res.status(400).json({ success: false, error: 'Failed to update store' });
  }
};

// DELETE a store
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Invalid store_id or business_id' });
    }

    const deleted = await Store.findOneAndDelete({ _id: id, business_id });

    if (!deleted) return res.status(404).json({ success: false, error: 'Store not found' });

    res.status(200).json({ success: true, message: 'Store deleted successfully' });
  } catch (err) {
    console.error('Error deleting store:', err.message);
    res.status(500).json({ success: false, error: 'Server error while deleting store' });
  }
};

// PATCH toggle store status (between active/inactive/closed)
export const toggleStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Invalid store_id or business_id' });
    }

    const store = await Store.findOne({ _id: id, business_id });
    if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

    // Cycle status: active → inactive → closed → active
    const nextStatus = {
      active: 'inactive',
      inactive: 'closed',
      closed: 'active'
    };

    store.status = nextStatus[store.status] || 'active';
    await store.save();

    res.status(200).json({ success: true, message: `Store is now ${store.status}`, data: store });
  } catch (err) {
    console.error('Error toggling store status:', err.message);
    res.status(500).json({ success: false, error: 'Failed to toggle store status' });
  }
};

// PATCH assign store manager (through employees array)
export const assignStoreManager = async (req, res) => {
  try {
    const { manager_id, manager_name, manager_role = 'Manager', business_id } = req.body;
    const { id } = req.params;

    if (!manager_id || !manager_name || !business_id) {
      return res.status(400).json({ success: false, error: 'Missing manager_id, name, or business_id' });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(business_id) || !mongoose.Types.ObjectId.isValid(manager_id)) {
      return res.status(400).json({ success: false, error: 'Invalid IDs' });
    }

    const store = await Store.findOne({ _id: id, business_id });
    if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

    const alreadyExists = store.employees.some(emp => emp.id.toString() === manager_id);
    if (!alreadyExists) {
      store.employees.push({
        id: manager_id,
        name: manager_name,
        role: manager_role
      });
    } else {
      store.employees = store.employees.map(emp =>
        emp.id.toString() === manager_id ? { ...emp, role: manager_role } : emp
      );
    }

    await store.save();
    res.status(200).json({ success: true, message: 'Manager assigned successfully', data: store });
  } catch (err) {
    console.error('Error assigning store manager:', err.message);
    res.status(400).json({ success: false, error: 'Failed to assign manager' });
  }
};
