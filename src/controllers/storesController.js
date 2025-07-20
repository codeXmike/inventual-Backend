import Store from '../models/Store.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all stores under a business
 * @route   GET /api/stores?business_id=...
 * @access  Private
 */
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

/**
 * @desc    Create a new store
 * @route   POST /api/stores
 * @access  Private
 */
export const addStore = async (req, res) => {
  try {
    const requiredFields = ['business_id', 'name'];
    const missing = requiredFields.filter(f => !req.body[f]);

    if (missing.length) {
      return res.status(400).json({ success: false, error: `Missing fields: ${missing.join(', ')}` });
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.business_id)) {
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

/**
 * @desc    Update store info
 * @route   PUT /api/stores/:id
 * @access  Private
 */
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

/**
 * @desc    Delete a store
 * @route   DELETE /api/stores/:id
 * @access  Private
 */
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

/**
 * @desc    Toggle store open/closed status
 * @route   PATCH /api/stores/:id/toggle-status
 * @access  Private
 */
export const toggleStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Invalid store_id or business_id' });
    }

    const store = await Store.findOne({ _id: id, business_id });
    if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

    store.status = store.status === 'open' ? 'closed' : 'open';
    await store.save();

    res.status(200).json({ success: true, message: `Store is now ${store.status}`, data: store });
  } catch (err) {
    console.error('Error toggling store status:', err.message);
    res.status(500).json({ success: false, error: 'Failed to toggle store status' });
  }
};

/**
 * @desc    Assign store manager
 * @route   PATCH /api/stores/:id/assign-manager
 * @access  Private
 */
export const assignStoreManager = async (req, res) => {
  try {
    const { manager_name, business_id } = req.body;
    const { id } = req.params;

    if (!manager_name) {
      return res.status(400).json({ success: false, error: 'Manager name is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Invalid store_id or business_id' });
    }

    const store = await Store.findOneAndUpdate(
      { _id: id, business_id },
      { manager_name },
      { new: true }
    );

    if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

    res.status(200).json({ success: true, message: 'Manager assigned successfully', data: store });
  } catch (err) {
    console.error('Error assigning store manager:', err.message);
    res.status(400).json({ success: false, error: 'Failed to assign manager' });
  }
};
