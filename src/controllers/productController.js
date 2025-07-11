import Product from '../models/Product.js';


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};


export const addProducts = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add product', error: err.message });
  }
};


export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product', error: err.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};


export const getStockAlert = async (req, res) => {
  try {
    const alerts = await Product.find({ $expr: { $lte: ['$quantity', '$stock_alert'] } });
    res.status(200).json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stock alerts', error: err.message });
  }
};


export const searchProducts = async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { category: new RegExp(query, 'i') },
        { barcode: new RegExp(query, 'i') }
      ]
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};