# 🚀 คู่มือการ Deploy แบบ Production Mode

## 📋 **Production vs Development**

### 🔧 **Development Mode**
- รันด้วย `npm run dev`
- Hot reload, debugging tools
- ไม่ optimize performance
- ใช้ port 3011 (frontend), 3101 (backend)

### 🚀 **Production Mode**
- Build และ optimize code
- ใช้ PM2 สำหรับ process management
- Environment variables สำหรับ production
- Performance optimization

## 🛠️ **การ Setup Production Environment**

### 1. 📦 **Build Frontend**

#### 1.1 Build Next.js App
```bash
cd frontend
npm run build
```

#### 1.2 ตรวจสอบ Build Output
```bash
# ตรวจสอบไฟล์ที่ build
ls -la .next/
# ตรวจสอบ static files
ls -la out/
```

### 2. 🔧 **Setup Backend Production**

#### 2.1 สร้างไฟล์ ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: 'workplan-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 'max', // หรือระบุจำนวน เช่น 2
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3101,
        DB_HOST: 'localhost',
        DB_USER: 'root',
        DB_PASSWORD: 'your_production_password',
        DB_NAME: 'workplan',
        DB_PORT: 3306
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'workplan-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3011
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3011,
        NEXT_PUBLIC_API_URL: 'http://localhost:3101'
      }
    }
  ]
};
```

#### 2.2 ติดตั้ง PM2
```bash
# ติดตั้ง PM2 globally
npm install -g pm2

# ตรวจสอบการติดตั้ง
pm2 --version
```

### 3. 🗄️ **Database Optimization**

#### 3.1 MySQL Configuration
```sql
-- เพิ่ม indexes สำหรับ performance
CREATE INDEX idx_work_plans_date ON work_plans(production_date);
CREATE INDEX idx_work_plans_status ON work_plans(status_id);
CREATE INDEX idx_logs_work_plan ON logs(work_plan_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);

-- Optimize tables
OPTIMIZE TABLE work_plans;
OPTIMIZE TABLE work_plan_drafts;
OPTIMIZE TABLE logs;
```

#### 3.2 MySQL my.cnf Optimization
```ini
[mysqld]
# Performance settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Connection settings
max_connections = 200
max_connect_errors = 100000

# Query cache
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M
```

## 🚀 **การ Deploy แบบ Production**

### 1. 📦 **Build และ Deploy Script**

#### 1.1 สร้างไฟล์ deploy-production.bat
```batch
@echo off
echo ========================================
echo 🚀 Production Deployment
echo ========================================

echo.
echo 📦 Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend build successful

cd ..

echo.
echo 🔧 Setting up Production Environment...
if not exist "logs" mkdir logs

echo.
echo 🚀 Starting Production with PM2...
pm2 start ecosystem.config.js --env production

echo.
echo 📊 PM2 Status:
pm2 status

echo.
echo 🎯 Production Deployment Complete!
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.
echo 📋 Commands:
echo - pm2 status (ดูสถานะ)
echo - pm2 logs (ดู logs)
echo - pm2 restart all (restart ทั้งหมด)
echo - pm2 stop all (หยุดทั้งหมด)
echo.

pause
```

#### 1.2 สร้างไฟล์ deploy-production.sh (Linux/Mac)
```bash
#!/bin/bash

echo "========================================"
echo "🚀 Production Deployment"
echo "========================================"

echo ""
echo "📦 Building Frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend build successful"

cd ..

echo ""
echo "🔧 Setting up Production Environment..."
mkdir -p logs

echo ""
echo "🚀 Starting Production with PM2..."
pm2 start ecosystem.config.js --env production

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🎯 Production Deployment Complete!"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:3011"
echo "- Backend: http://localhost:3101"
echo ""
echo "📋 Commands:"
echo "- pm2 status (ดูสถานะ)"
echo "- pm2 logs (ดู logs)"
echo "- pm2 restart all (restart ทั้งหมด)"
echo "- pm2 stop all (หยุดทั้งหมด)"
echo ""
```

### 2. 🔧 **Environment Configuration**

#### 2.1 Production Environment Variables
```env
# backend/.env.production
NODE_ENV=production
PORT=3101
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=workplan
DB_PORT=3306

# Security
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# Google Apps Script
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Performance
API_RATE_LIMIT=100
CORS_ORIGINS=http://localhost:3011,http://your-domain.com
```

#### 2.2 Frontend Environment Variables
```env
# frontend/.env.production
NEXT_PUBLIC_API_URL=http://localhost:3101
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📊 **Performance Optimization**

### 1. 🚀 **Frontend Optimization**

#### 1.1 Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### 1.2 Bundle Analysis
```bash
# ติดตั้ง bundle analyzer
npm install --save-dev @next/bundle-analyzer

# รัน bundle analyzer
npm run build
npm run analyze
```

### 2. 🔧 **Backend Optimization**

#### 2.1 Express.js Optimization
```javascript
// backend/server.js
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Compression middleware
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);
```

#### 2.2 Database Connection Pooling
```javascript
// backend/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  
  // Connection pool settings
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  
  // Performance settings
  charset: 'utf8mb4',
  timezone: '+07:00',
  
  // SSL (ถ้าใช้)
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

module.exports = pool;
```

## 🔍 **Monitoring และ Logging**

### 1. 📊 **PM2 Monitoring**
```bash
# ดูสถานะ processes
pm2 status

# ดู logs
pm2 logs

# ดู performance
pm2 monit

# ดู detailed info
pm2 show workplan-backend
pm2 show workplan-frontend
```

### 2. 📈 **Performance Monitoring**
```bash
# ติดตั้ง monitoring tools
npm install -g pm2-logrotate

# ตั้งค่า log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. 🔍 **Health Check Endpoints**
```javascript
// backend/routes/health.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/health', async (req, res) => {
  try {
    // ตรวจสอบ database connection
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
```

## 🔄 **Deployment Scripts**

### 1. 🚀 **Quick Deploy Script**
```batch
@echo off
echo 🚀 Quick Production Deploy

echo 📦 Building...
cd frontend && npm run build && cd ..

echo 🔧 Restarting PM2...
pm2 restart all

echo ✅ Deploy Complete!
```

### 2. 🔄 **Rollback Script**
```batch
@echo off
echo 🔄 Rolling back to previous version

echo 📦 Reverting build...
cd frontend && git checkout HEAD~1 && npm run build && cd ..

echo 🔧 Restarting PM2...
pm2 restart all

echo ✅ Rollback Complete!
```

## 📋 **Production Checklist**

### ✅ **Pre-Deployment**
- [ ] Build frontend successful
- [ ] Database optimized
- [ ] Environment variables set
- [ ] SSL certificates ready (ถ้าใช้)
- [ ] Backup database

### ✅ **Deployment**
- [ ] PM2 processes started
- [ ] Health check passed
- [ ] Logs monitoring active
- [ ] Performance metrics normal

### ✅ **Post-Deployment**
- [ ] All endpoints working
- [ ] Database connections stable
- [ ] Error logs clean
- [ ] Performance acceptable

## 🎯 **สรุป**

### 🚀 **Production Mode Benefits:**
- **Performance**: Optimized code, compression, caching
- **Security**: Security headers, rate limiting, input validation
- **Stability**: Process management, auto-restart, monitoring
- **Scalability**: Load balancing, connection pooling

### 📊 **Monitoring:**
- PM2 process monitoring
- Database performance
- API response times
- Error tracking

### 🔧 **Maintenance:**
- Regular backups
- Log rotation
- Performance tuning
- Security updates

---

## 🎉 **Production Ready!**

ระบบพร้อมใช้งานใน Production Mode แล้ว! 🚀 