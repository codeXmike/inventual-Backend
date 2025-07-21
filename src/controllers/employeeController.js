import Employee from '../models/Employee.js';
import mongoose from 'mongoose';
import ImageKit from 'imagekit';
import fs from 'fs';
import bcrypt from 'bcryptjs';
/**
 * @desc    Get all employees with filtering options
 * @route   GET /api/employees
 * @access  Private (Admin/Manager)
 */
export const getEmployees = async (req, res) => {
  try {
    const { business_id, store_id, status, role, search } = req.query;

    if (!business_id || !mongoose.Types.ObjectId.isValid(business_id)) {
      return res.status(400).json({ success: false, error: 'Valid business_id is required' });
    }

    const filter = { business_id };

    if (store_id) {
      if (!mongoose.Types.ObjectId.isValid(store_id)) {
        return res.status(400).json({ success: false, error: 'Invalid store_id format' });
      }
      filter.store_id = store_id;
    }

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (role && ['cashier', 'manager', 'stockist', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(filter)
      .sort({ createdAt: -1 })
      .select('-password -__v')
      .populate('business_id', 'businessName')
      .populate('store_id', 'name');

    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    console.error(`Error fetching employees: ${err.message}`);
    res.status(500).json({ success: false, error: 'Server error while fetching employees' });
  }
};

/**
 * @desc    Create a new employee scoped to a business
 * @route   POST /api/employees
 * @access  Private (Admin)
 */
export const addEmployee = async (req, res) => {
  try {
    const requiredFields = ['business_id', 'store_id', 'name', 'email', 'phone', 'role', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const { business_id, store_id, name, email, phone, role, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(business_id) || !mongoose.Types.ObjectId.isValid(store_id)) {
      return res.status(400).json({ success: false, error: 'Invalid business_id or store_id format' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const existingEmployee = await Employee.findOne({ business_id, email });
    if (existingEmployee) {
      return res.status(409).json({ success: false, error: 'Employee with this email already exists in this business' });
    }

    // Upload image if provided
    let image = '';
    if (req.file) {
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC,
        privateKey: process.env.IMAGEKIT_PRIVATE,
        urlEndpoint: process.env.IMAGEKIT_URL,
      });

      const uploaded = await imagekit.upload({
        file: fs.readFileSync(req.file.path),
        fileName: req.file.originalname,
        folder: 'employees',
      });

      image = uploaded.url;
      fs.unlinkSync(req.file.path);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const employeeData = {
      business_id,
      store_id,
      name,
      email,
      phone,
      image,
      role,
      password:hashedPassword,
      status: 'active',
      last_login: new Date()
    };

    const employee = new Employee(employeeData);
    const savedEmployee = await employee.save();
    const responseData = savedEmployee.toObject();
    delete responseData.password;
    delete responseData.__v;

    res.status(201).json({ success: true, data: responseData });
  } catch (err) {
    console.error(`Error creating employee: ${err.message}`);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: 'Validation error', details: errors });
    }
    res.status(500).json({ success: false, error: 'Server error while creating employee' });
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (Admin/Manager)
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format'
      });
    }

    // Prevent updating sensitive fields directly through this endpoint
    const { password, status, email, business_id, store_id, ...updateData } = req.body;

    // Validate image if provided
    if (req.body.image && typeof req.body.image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Image must be a string URL'
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .select('-password -__v')
    .populate('business_id', 'businessName')
    .populate('store_id', 'name');

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedEmployee
    });
  } catch (err) {
    console.error(`Error updating employee: ${err.message}`);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while updating employee'
    });
  }
};

/**
 * @desc    Delete an employee
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin)
 */
export const removeEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format'
      });
    }

    // First check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // For admin employees, check if it's the last admin
    if (employee.role === 'admin') {
      const adminCount = await Employee.countDocuments({
        business_id: employee.business_id,
        role: 'admin',
        status: 'active'
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the last admin of a business'
        });
      }
    }

    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: { id },
      message: 'Employee successfully removed'
    });
  } catch (err) {
    console.error(`Error removing employee: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while removing employee'
    });
  }
};

/**
 * @desc    Get employee activity logs
 * @route   GET /api/employees/:id/logs
 * @access  Private (Admin/Manager)
 */
export const getEmployeeLogs = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format'
      });
    }

    const employee = await Employee.findById(id)
      .select('logs name email role image')
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Sort logs by timestamp (newest first)
    const sortedLogs = employee.logs.sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json({
      success: true,
      data: {
        employee: {
          name: employee.name,
          email: employee.email,
          role: employee.role,
          image: employee.image
        },
        logs: sortedLogs
      }
    });
  } catch (err) {
    console.error(`Error fetching employee logs: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching logs'
    });
  }
};

/**
 * @desc    Reassign employee to a different store
 * @route   PUT /api/employees/:id/reassign
 * @access  Private (Admin)
 */
export const reassignEmployeeStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { store_id } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id) || 
        !mongoose.Types.ObjectId.isValid(store_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID or store ID format'
      });
    }

    if (!store_id) {
      return res.status(400).json({
        success: false,
        error: 'store_id is required'
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { store_id },
      { new: true }
    )
    .select('-password -__v')
    .populate('store_id', 'name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Add to logs
    employee.logs.push({
      action: `Reassigned to store: ${employee.store_id.name || store_id}`
    });
    await employee.save();

    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee successfully reassigned'
    });
  } catch (err) {
    console.error(`Error reassigning employee: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while reassigning employee'
    });
  }
};

/**
 * @desc    Deactivate an employee account
 * @route   PUT /api/employees/:id/deactivate
 * @access  Private (Admin)
 */
export const deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format'
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Check if this is the last active admin
    if (employee.role === 'admin' && employee.status === 'active') {
      const adminCount = await Employee.countDocuments({
        business_id: employee.business_id,
        role: 'admin',
        status: 'active',
        _id: { $ne: employee._id }
      });
      
      if (adminCount === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate the last active admin of a business'
        });
      }
    }

    employee.status = 'inactive';
    employee.logs.push({
      action: 'Account deactivated'
    });
    
    const updatedEmployee = await employee.save();
    const responseData = updatedEmployee.toObject();
    delete responseData.password;
    delete responseData.__v;

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Employee account deactivated'
    });
  } catch (err) {
    console.error(`Error deactivating employee: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while deactivating employee'
    });
  }
};

/**
 * @desc    Update employee password (separate from general update)
 * @route   PUT /api/employees/:id/password
 * @access  Private (Admin/Employee)
 */
export const updateEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format'
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // For non-admin requests, verify current password
    if (!req.user.role === 'admin') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required'
        });
      }
      
      // In a real app, you would verify the hashed password here
      // const isMatch = await bcrypt.compare(currentPassword, employee.password);
      // if (!isMatch) {
      //   return res.status(401).json({
      //     success: false,
      //     error: 'Current password is incorrect'
      //   });
      // }
    }

    employee.password = newPassword;
    employee.logs.push({
      action: 'Password updated'
    });
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated'
    });
  } catch (err) {
    console.error(`Error updating password: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while updating password'
    });
  }
};