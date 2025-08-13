# 🚀 Production Deployment Guide

## 📋 Overview
คู่มือการ deploy WorkplanV6 ในโหมด Production พร้อมการ optimize และ security

## 🛠️ Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Git
- Docker (optional)

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd WorkplanV6
```

### 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install --production

# Backend  
cd ../backend
npm install --production
```

### 3. Environment Setup
```bash
# Copy production environment files
cp backend/production.env backend/.env
```

## 🚀 Quick Start

### Option 1: Using Scripts (Recommended)
```bash
# Windows
start-production.bat

# Linux/Mac
chmod +x start-production.sh
./start-production.sh
```

### Option 2: Build First (If you encounter build issues)
```bash
# Windows
build-frontend.bat
start-production.bat

# Linux/Mac
cd frontend && npm run build
./start-production.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run start

# Terminal 2 - Frontend  
cd frontend
npm run start
```

## 🔧 Production Optimizations

### Frontend (Next.js)
- ✅ **Static Generation**: Pre-rendered pages
- ✅ **Image Optimization**: WebP/AVIF formats
- ✅ **Code Splitting**: Automatic bundle splitting
- ✅ **Compression**: Gzip compression enabled
- ✅ **Security Headers**: X-Frame-Options, CSP
- ✅ **Performance**: Optimized CSS and package imports

### Backend (Express.js)
- ✅ **Rate Limiting**: 100 requests per 15 minutes
- ✅ **Security**: Helmet.js enabled
- ✅ **Compression**: Gzip compression
- ✅ **CORS**: Configured for production
- ✅ **Error Handling**: Comprehensive error handling
- ✅ **Logging**: Production logging enabled

## 🌐 Access URLs
- **Frontend**: http://192.168.0.94:3011
- **Backend API**: http://192.168.0.94:3101
- **Health Check**: http://192.168.0.94:3101/health

## 🔒 Security Features
- Rate limiting on API endpoints
- CORS protection
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Input validation and sanitization
- SQL injection protection
- Environment variable protection

## 📊 Performance Features
- Database connection pooling
- API response caching
- Static asset optimization
- Code splitting and lazy loading
- Image optimization
- Gzip compression

## 🐳 Docker Deployment (Optional)
```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Monitoring
- Application logs in `backend/logs/`
- Database connection monitoring
- API response time monitoring
- Error tracking and reporting

## 🚨 Troubleshooting

### Common Issues
1. **Port already in use**: Change ports in environment files
2. **Database connection failed**: Check network and credentials
3. **Build errors**: Clear node_modules and reinstall

### Logs Location
- Backend: `backend/logs/production.log`
- Frontend: Console output
- Docker: `docker-compose logs`

## 📈 Performance Metrics
- **Frontend Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Memory Usage**: < 512MB per service

## 🔄 Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild frontend
cd frontend && npm run build

# Restart services
# Use start-production scripts or restart manually
```

## 📞 Support
- Check logs for error details
- Verify database connections
- Test API endpoints individually
- Monitor system resources

---
**Production Ready! 🎯**
