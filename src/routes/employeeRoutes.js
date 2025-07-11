import express from 'express';
import {
  getEmployees,
  addEmployee,
  udpateEmployee,
  removeEmployee,
  employeeLogs
} from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', getEmployees);
router.post('/', addEmployee);
router.put('/:id', udpateEmployee);
router.delete('/:id', removeEmployee);
router.get('/logs', employeeLogs);

export default router;
