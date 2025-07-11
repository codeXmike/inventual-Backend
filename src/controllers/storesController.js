import Store from '../models/Store.js';


export const getStores = async (req, res) => {
  try {
    const { business_id } = req.query;
    const filter = business_id ? { business_id } : {};
    const stores = await Store.find(filter).sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
};


export const addStore = async (req, res) => {
  try {
    const store = new Store(req.body);
    const savedStore = await store.save();
    res.status(201).json(savedStore);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create store', error: err.message });
  }
};


export const updateStoreInfo = async (req, res) => {
  try {
    const updated = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update store', error: err.message });
  }
};


export const deleteStore = async (req, res) => {
  try {
    const deleted = await Store.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete store', error: err.message });
  }
};

export const toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    store.status = store.status === 'open' ? 'closed' : 'open';
    await store.save();

    res.status(200).json({ message: `Store is now ${store.status}`, store });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle store status', error: err.message });
  }
};

export const assignStoreManager = async (req, res) => {
  try {
    const { manager_name } = req.body;
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { manager_name },
      { new: true }
    );
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json({ message: 'Manager updated', store });
  } catch (err) {
    res.status(400).json({ message: 'Failed to assign manager', error: err.message });
  }
};
