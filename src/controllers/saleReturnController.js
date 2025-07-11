import SaleReturn from '../models/SaleReturn.js';
import Product from '../models/Product.js';


export const createSaleReturn = async (req, res) => {
  try {
    const returnData = req.body;

    const newReturn = new SaleReturn(returnData);
    const savedReturn = await newReturn.save();

    
    for (const item of returnData.items) {
      await Product.findOneAndUpdate(
        {
          name: item.name,
          business_id: returnData.business_id,
          store_id: returnData.store_id
        },
        { $inc: { quantity: item.quantity } }
      );
    }

    res.status(201).json(savedReturn);
  } catch (err) {
    res.status(500).json({ message: 'Sale return failed', error: err.message });
  }
};


export const getSaleReturns = async (req, res) => {
  try {
    const { business_id } = req.query;
    const returns = await SaleReturn.find({ business_id }).sort({ createdAt: -1 });
    res.status(200).json(returns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch returns', error: err.message });
  }
};


export const getSaleReturn = async (req, res) => {
  try {
    const saleReturn = await SaleReturn.findById(req.params.id);
    if (!saleReturn) return res.status(404).json({ message: 'Sale return not found' });
    res.status(200).json(saleReturn);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};


export const updateSaleReturnStatus = async (req, res) => {
  try {
    const { status, approved_by } = req.body;

    const updated = await SaleReturn.findByIdAndUpdate(
      req.params.id,
      { status, approved_by },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Return not found' });
    res.status(200).json({ message: `Return ${status.toLowerCase()}`, data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};


export const markAsRefunded = async (req, res) => {
  try {
    const updated = await SaleReturn.findByIdAndUpdate(
      req.params.id,
      { refunded: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Return not found' });
    res.status(200).json({ message: 'Marked as refunded', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark refund', error: err.message });
  }
};
