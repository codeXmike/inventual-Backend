import express from 'express';
import {
  getExpenses,
  addExpenses,
  updateExpenses,
  deleteExpenses,
  totalExpenses,
  dailyExpenses,
  monthlyExpenses,
  yeatlyExpenses
} from '../controllers/expensesController.js';

const router = express.Router();

router.get('/', getExpenses);
router.post('/', addExpenses);
router.put('/:id', updateExpenses);
router.delete('/:id', deleteExpenses);

router.get('/total', totalExpenses);
router.get('/daily', dailyExpenses);
router.get('/monthly', monthlyExpenses);
router.get('/yearly', yeatlyExpenses);

export default router;
