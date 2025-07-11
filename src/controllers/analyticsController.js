import Sale from '../models/Sale.js';
import Product from '../models/Product.js';


export const saleSum = async (req, res) => {
  try {
    const { business_id } = req.query;

    const data = await Sale.aggregate([
      { $match: { business_id } },
      {
        $group: {
          _id: null,
          total_sales: { $sum: "$grand_total" },
          total_discount: { $sum: "$discount_amount" },
          total_tax: { $sum: "$tax_amount" },
          total_orders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(data[0] || {
      total_sales: 0,
      total_discount: 0,
      total_tax: 0,
      total_orders: 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute sales summary', error: err.message });
  }
};


export const productPerformance = async (req, res) => {
  try {
    const { business_id } = req.query;

    const sales = await Sale.aggregate([
      { $match: { business_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.name",
          total_quantity_sold: { $sum: "$products.quantity" },
          total_revenue: { $sum: "$products.total" }
        }
      },
      { $sort: { total_revenue: -1 } }
    ]);

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get product performance', error: err.message });
  }
};


export const inventoryStatus = async (req, res) => {
  try {
    const { business_id } = req.query;

    const stats = await Product.aggregate([
      { $match: { business_id } },
      {
        $group: {
          _id: null,
          total_items: { $sum: "$quantity" },
          total_cost_value: { $sum: { $multiply: ["$cost_price", "$quantity"] } },
          total_sale_value: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      }
    ]);

    res.status(200).json(stats[0] || {
      total_items: 0,
      total_cost_value: 0,
      total_sale_value: 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inventory status', error: err.message });
  }
};

export const lowStock = async (req, res) => {
  try {
    const { business_id } = req.query;

    const lowStockProducts = await Product.find({
      business_id,
      $expr: { $lte: ["$quantity", "$stock_alert"] }
    });

    res.status(200).json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get low stock items', error: err.message });
  }
};


export const overView = async (req, res) => {
  try {
    const { business_id } = req.query;

    const [salesSum] = await Sale.aggregate([
      { $match: { business_id } },
      {
        $group: {
          _id: null,
          total_sales: { $sum: "$grand_total" },
          total_orders: { $sum: 1 }
        }
      }
    ]);

    const lowStockCount = await Product.countDocuments({
      business_id,
      $expr: { $lte: ["$quantity", "$stock_alert"] }
    });

    const topProducts = await Sale.aggregate([
      { $match: { business_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.name",
          total_sold: { $sum: "$products.quantity" },
          revenue: { $sum: "$products.total" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      total_sales: salesSum?.total_sales || 0,
      total_orders: salesSum?.total_orders || 0,
      low_stock_items: lowStockCount,
      top_products: topProducts
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get overview', error: err.message });
  }
};

export const categoryStats = async (req, res) => {
  try {
    const { business_id } = req.query;

    const stats = await Product.aggregate([
      { $match: { business_id } },
      {
        $group: {
          _id: "$category",
          total_items: { $sum: "$quantity" },
          total_value: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category stats', error: err.message });
  }
};
