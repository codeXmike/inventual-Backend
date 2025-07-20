import express from 'express';
import {
  getEmployees,
  addEmployee,
  removeEmployee
} from '../controllers/employeeController.js';

import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', getEmployees);
router.post('/', upload.single('image'), addEmployee);
router.delete('/:id', removeEmployee);

export default router;
