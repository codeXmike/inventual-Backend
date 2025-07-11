import Business from '../models/Business.js';
import Store from '../models/Store.js';


export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json(business);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch business', error: err.message });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update business', error: err.message });
  }
};


export const getAllStores = async (req, res) => {
  try {
    const { business_id } = req.params;
    const stores = await Store.find({ business_id }).sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
};

export const createBusiness = async (req, res) => {
  try {
    const existing = await Business.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const business = new Business(req.body);
    const saved = await business.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create business', error: err.message });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const deleted = await Business.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete business', error: err.message });
  }
};

export const searchBusinesses = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await Business.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};
