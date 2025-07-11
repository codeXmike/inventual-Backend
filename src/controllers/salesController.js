import Sale from '../models/Sale.js';


export const getSales = async (req, res) => {
  try {
    const { business_id, store_id } = req.query;
    const filter = {};
    if (business_id) filter.business_id = business_id;
    if (store_id) filter.store_id = store_id;

    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales', error: err.message });
  }
};


export const addSale = async (req, res) => {
  try {
    const sale = new Sale(req.body);
    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add sale', error: err.message });
  }
};


export const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.status(200).json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sale', error: err.message });
  }
};


export const syncOfflineSales = async (req, res) => {
  try {
    const synced = await Sale.insertMany(req.body.sales, { ordered: false });
    res.status(201).json({ message: 'Sales synced successfully', data: synced });
  } catch (err) {
    res.status(500).json({ message: 'Sync failed', error: err.message });
  }
};


export const getTotalSold = async (req, res) => {
  try {
    const { business_id } = req.query;
    const match = business_id ? { business_id } : {};

    const result = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: "$grand_total" }
        }
      }
    ]);

    const total = result[0]?.total || 0;
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate total sold', error: err.message });
  }
};
