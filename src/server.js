import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import http from 'http'
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import expensesRoutes from './routes/expensesRoutes.js'
import productRoutes from './routes/productRoutes.js'
import pwaRoutes from './routes/pwaRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import storesRoutes from './routes/storesRoutes.js'
import connectDB from './config/db.js';


connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  '*',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(helmet())
app.use(cookieParser())
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/pwa', pwaRoutes);

app.get('/', (req, res) => {
  res.send('Server API is running');
  
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
