import Employee from '../models/Employee.js';


export const getEmployees = async (req, res) => {
  try {
    const { business_id, store_id } = req.query;
    const filter = {};
    if (business_id) filter.business_id = business_id;
    if (store_id) filter.store_id = store_id;

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
  }
};


export const addEmployee = async (req, res) => {
  try {
    const existing = await Employee.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const employee = new Employee(req.body);
    const saved = await employee.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add employee', error: err.message });
  }
};


export const udpateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update employee', error: err.message });
  }
};


export const removeEmployee = async (req, res) => {
  try {
    const removed = await Employee.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove employee', error: err.message });
  }
};


export const employeeLogs = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id, 'logs name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ name: employee.name, logs: employee.logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
};

export const reassignStore = async (req, res) => {
  try {
    const { store_id } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { store_id },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Store reassigned', employee });
  } catch (err) {
    res.status(400).json({ message: 'Reassignment failed', error: err.message });
  }
};

export const deactivateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deactivated', employee });
  } catch (err) {
    res.status(400).json({ message: 'Failed to deactivate', error: err.message });
  }
};
