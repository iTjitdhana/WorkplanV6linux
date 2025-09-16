const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './production.env' });

const app = express();
const PORT = process.env.PORT || 3101;

// Debug logging
console.log('🚀 Starting Backend Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', PORT);
console.log('🌐 CORS Origin:', process.env.CORS_ORIGIN || 'http://192.168.0.94:3012');
console.log('🗄️ Database Host:', process.env.DB_HOST || 'localhost');

// Performance optimizations
app.use(compression()); // Enable gzip compression
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting for API protection (very relaxed for development)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced from 15 minutes)
  max: 10000, // limit each IP to 10000 requests per minute (increased from 1000)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  keyGenerator: (req) => {
    // Use a more specific key to avoid conflicts
    return req.ip + ':' + req.path;
  }
});

// Rate limiting disabled for development
// app.use('/api/work-plans', limiter); // Disabled
// app.use('/api/users', limiter); // Disabled
// app.use('/api/machines', limiter); // Disabled
// app.use('/api/production-rooms', limiter); // Disabled
// Don't apply rate limiting to logs and other read-only endpoints

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN || 'http://192.168.0.94:3012', 'http://localhost:3012', 'http://127.0.0.1:3012']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with caching
app.use('/static', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API routes
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/new-jobs', require('./routes/newJobsRoutes'));
app.use('/api/production-rooms', require('./routes/productionRoomRoutes'));
app.use('/api/production-status', require('./routes/productionStatusRoutes'));
app.use('/api/work-plans', require('./routes/workPlanRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/monitoring', require('./routes/monitoringRoutes'));
app.use('/api/process-steps', require('./routes/processStepRoutes'));
app.use('/api/send-to-google-sheet', require('./routes/googleSheetProxy'));

// Role Menu Management Routes
app.use('/api/admin', require('./routes/roleMenuRoutes'));
app.use('/api/me', require('./routes/roleMenuRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Initialize database connection status
app.locals.dbConnected = false;

// Test database connection and set status
const testConnectionAndSetStatus = async () => {
  try {
    const { testConnection } = require('./config/database');
    await testConnection();
    app.locals.dbConnected = true;
    console.log('✅ Database connection status set to true');
  } catch (error) {
    app.locals.dbConnected = false;
    console.log('❌ Database connection status set to false');
    console.error('⚠️ Database connection test failed, but server continues running');
    console.error('   This may cause API endpoints to fail');
  }
};

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 External access: http://192.168.0.94:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://192.168.0.94:${PORT}/api`);
  console.log(`✅ Server is ready to accept connections!`);
  
  // Test database connection and set status
  testConnectionAndSetStatus();
});

// Keep-alive timeout
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

module.exports = app;
