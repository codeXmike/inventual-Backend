import express from 'express';
import {
  getEmployees,
  addEmployee,
  removeEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', getEmployees);
router.post('/', addEmployee);
router.delete('/:id', removeEmployee);

export default router;
