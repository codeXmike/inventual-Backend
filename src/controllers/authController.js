import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Business from '../models/Business.js';



export const register = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      industryType,
      currency,
      logo,
      adminName,
      adminEmail,
      phone,
      password,
    } = req.body;

    const existing = await Business.findOne({ adminEmail });
    if (existing) return res.status(400).json({ message: 'Admin email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const business = new Business({
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      industryType,
      currency,
      logo,
      adminName,
      adminEmail,
      phone,
      password: hashedPassword,
    });

    const saved = await business.save();

    const token = jwt.sign({ id: saved._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, business: saved });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { adminEmail, password } = req.body;
    const business = await Business.findOne({ adminEmail });

    if (!business) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: business._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, business });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Dummy check (in prod: lookup OTP store/db/cache)
    if (otp !== '123456') return res.status(400).json({ message: 'Invalid OTP' });
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

    // You'd send a real email or SMS here
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
