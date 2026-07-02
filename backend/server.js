import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import institutionRoutes from './routes/institution.js';
import teacherRoutes from './routes/teacher.js';
import studentRoutes from './routes/student.js';

// Load env variables — MUST be before any code that reads process.env
dotenv.config();

// Initialize express
const app = express();

// Connect to database (env vars are now available)
connectDB();

// Security middleware
app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting — generous enough for mobile/shared IPs, tight enough to deter abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // raised from 100 — mobile users share carrier IPs
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // still count failed requests
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Result Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`📋 Admin Dashboard: http://localhost:5174`);
  console.log(`🎓 Frontend Portal: http://localhost:5173\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Try: npx kill-port ${PORT}  — or change PORT in .env\n`);
    process.exit(1);
  }
  throw err;
});

export default app;
