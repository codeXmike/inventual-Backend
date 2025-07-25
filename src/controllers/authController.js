import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import ImageKit from "imagekit";
import Business from '../models/Business.js';
import { getNextBusinessId } from '../utils/getNextID.js';
import Employee from "../models/Employee.js";
import { sendEmail } from '../utils/sendMail.js';
import { otpHTML } from '../utils/otpTemplate.js';
import Otp from '../models/Otp.js';


export const register = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      industryType,
      currency,
      adminName,
      adminEmail,
      phone,
      password
    } = req.body;

    const existing = await Business.findOne({ adminEmail });
    if (existing) return res.status(400).json({ message: 'Admin email already in use' });
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const generateCustomId = async (name) => {
      const cleanName = name.replace(/\s+/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `${cleanName}${random}`;
    };
    const businessId = await generateCustomId(businessName);
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC,
      privateKey: process.env.IMAGEKIT_PRIVATE,
      urlEndpoint: process.env.IMAGEKIT_URL,
    });
    let logoUrl = '';
    if (req.file) {
      const uploaded = await imagekit.upload({
        file: fs.readFileSync(req.file.path),
        fileName: req.file.originalname,
        folder: 'businesses',
      });
      logoUrl = uploaded.url;
      fs.unlinkSync(req.file.path); 
    }


    const business = new Business({
      businessId,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      industryType,
      currency,
      logo: logoUrl,
      adminName,
      adminEmail,
      phone,
      password: hashedPassword,
    });

    const saved = await business.save();

    const token = jwt.sign({ id: saved._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const otpResponse = await sendOtp(adminEmail);
    if (!otpResponse.success) {
      return res.status(500).json({ message: 'Failed to send OTP', error: otpResponse.error });
    }
    res.status(201).json({ token, business: saved });
  } catch (err) {
    res.status(500).json({  message: 'Registration failed',
    error: err.message,
    stack: err.stack, });
  }
};


export const login = async (req, res) => {
  try {
    const { businessId, email, password } = req.body;

    const business = await Business.findOne({businessId});
    if (!business) return res.status(404).json({ message: 'Business not found' });

    let user = null;
    let role = null;

    if (business.adminEmail === email) {
      const isMatch = await bcrypt.compare(password, business.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      user = {
        id: business._id,
        name: business.adminName,
        email: business.adminEmail,
        role: 'admin',
      };
      
    } else {
      const employee = await Employee.findOne({ email, business_id: business._id });
      if (!employee) return res.status(404).json({ message: 'User not found' });

      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      // Log login
      employee.last_login = new Date();
      employee.logs.push({ action: 'Logged in' });
      await employee.save();
      user = {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        store_id: employee.store_id,
        role: employee.role
      };
      
    }
    const token = jwt.sign({ id: user.id, businessId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user, business});
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


const sendOtp = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendEmail(email, 'Your OTP Code', otpHTML(otp));
    return { success: true, otp }; // Optionally return OTP for dev/test
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: 'Invalid OTP' });

    if (record.expiresAt < new Date())
      return res.status(400).json({ message: 'OTP expired' });
    
    await Otp.deleteOne({ _id: record._id });

    res.status(200).json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const business = await Business.findOne({ email });
    if (!business) return res.status(404).json({ message: 'Email not registered' });

    res.status(200).json({ message: 'OTP sent to your email', otp: '123456' }); // dev only
  } catch (err) {
    res.status(500).json({ message: 'Failed to process request', error: err.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;
    const hashed = await bcrypt.hash(new_password, 10);
    const updated = await Business.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};


export const updateBusiness = async (req, res) => {
  try {
    const updated = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
};
