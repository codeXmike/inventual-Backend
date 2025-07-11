import Expense from '../models/Expense.js';


export const getExpenses = async (req, res) => {
  try {
    const { business_id, store_id } = req.query;
    const filter = { business_id };
    if (store_id) filter.store_id = store_id;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
};


export const addExpenses = async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const saved = await newExpense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add expense', error: err.message });
  }
};


export const updateExpenses = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update expense', error: err.message });
  }
};


export const deleteExpenses = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense', error: err.message });
  }
};


export const totalExpenses = async (req, res) => {
  try {
    const { business_id } = req.query;
    const data = await Expense.aggregate([
      { $match: { business_id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({ total: data[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate total', error: err.message });
  }
};


export const dailyExpenses = async (req, res) => {
  try {
    const { business_id } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const data = await Expense.aggregate([
      {
        $match: {
          business_id,
          date: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({ total: data[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get daily expenses', error: err.message });
  }
};


export const monthlyExpenses = async (req, res) => {
  try {
    const { business_id } = req.query;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const data = await Expense.aggregate([
      {
        $match: {
          business_id,
          date: { $gte: start, $lt: end }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({ total: data[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get monthly expenses', error: err.message });
  }
};


export const yeatlyExpenses = async (req, res) => {
  try {
    const { business_id } = req.query;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);

    const data = await Expense.aggregate([
      {
        $match: {
          business_id,
          date: { $gte: start, $lt: end }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({ total: data[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get yearly expenses', error: err.message });
  }
};
