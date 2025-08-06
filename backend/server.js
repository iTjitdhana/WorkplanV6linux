const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const googleSheetProxy = require('./routes/googleSheetProxy');
const userRoutes = require('./routes/userRoutes');
const workPlanRoutes = require('./routes/workPlanRoutes');
const logRoutes = require('./routes/logRoutes');
const machineRoutes = require('./routes/machineRoutes');
const productionRoomRoutes = require('./routes/productionRoomRoutes');
const productionStatusRoutes = require('./routes/productionStatusRoutes');
const newJobsRoutes = require('./routes/newJobsRoutes');
const processStepRoutes = require('./routes/processStepRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const { requestMonitor, errorMonitor, activeUserMonitor } = require('./middleware/monitoringMiddleware');
const systemMonitor = require('./monitoring');

const app = express();
const PORT = process.env.PORT || 3101;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// ปิด rate limiting ชั่วคราวสำหรับ development
// app.use(limiter);

// เปิด rate limiting เฉพาะใน production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// CORS
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://192.168.0.161:5000',
  process.env.FRONTEND_URL,
  'http://localhost:3011',
  'http://127.0.0.1:3011',
  'http://192.168.0.94:3011',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Network access origins
  /^http:\/\/192\.168\.\d+\.\d+:3011$/,  // Allow any 192.168.x.x IP
  /^http:\/\/10\.\d+\.\d+\.\d+:3011$/,   // Allow any 10.x.x.x IP
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:3011$/,  // Allow 172.16-31.x.x IP
  // เพิ่ม port 3000 สำหรับ Next.js development
  /^http:\/\/192\.168\.\d+\.\d+:3000$/,  // Allow any 192.168.x.x IP on port 3000
  /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,   // Allow any 10.x.x.x IP on port 3000
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:3000$/,  // Allow 172.16-31.x.x IP on port 3000
  // เพิ่ม localhost สำหรับ development
  /^http:\/\/localhost:\d+$/,  // Allow any localhost port
  /^http:\/\/127\.0\.0\.1:\d+$/  // Allow any 127.0.0.1 port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    for (let allowedOrigin of allowedOrigins) {
      if (typeof allowedOrigin === 'string' && allowedOrigin === origin) {
        return callback(null, true);
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Allow if in development mode
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Monitoring middleware
app.use(requestMonitor);
app.use(activeUserMonitor);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);
app.use('/api/users', userRoutes);
app.use('/api/work-plans', workPlanRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/production-rooms', productionRoomRoutes);
app.use('/api/production-statuses', productionStatusRoutes);
app.use('/api/new-jobs', newJobsRoutes);
app.use('/api/process-steps', processStepRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/send-to-google-sheet', googleSheetProxy);
app.use('/api/monitoring', monitoringRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Error monitoring middleware (ต้องอยู่หลัง routes)
app.use(errorMonitor);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API Documentation: http://192.168.0.94:${PORT}/api`);
  console.log(`🌐 Network access: http://192.168.0.94:${PORT}/api`);
  
  // เริ่มต้น monitoring system
  systemMonitor.start();
  console.log('🔍 Real-time monitoring system started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
