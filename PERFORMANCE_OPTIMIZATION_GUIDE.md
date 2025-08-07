# 🚀 WorkplanV6 Performance Optimization Guide

## 📊 Performance Optimizations Implemented

### 🎯 Frontend Optimizations

#### 1. Next.js Configuration
- **Bundle Splitting**: แยก vendor chunks และ common chunks
- **Image Optimization**: รองรับ WebP, AVIF formats
- **Compression**: เปิดใช้งาน gzip compression
- **Caching Headers**: ตั้งค่า cache headers สำหรับ static assets
- **Security Headers**: เพิ่ม security headers

#### 2. Webpack Optimizations
```javascript
// Bundle splitting
vendor: {
  test: /[\\/]node_modules[\\/]/,
  name: 'vendors',
  chunks: 'all',
}

// Image optimization
image-webpack-loader: {
  mozjpeg: { progressive: true },
  pngquant: { quality: [0.65, 0.90], speed: 4 },
  webp: { quality: 75 },
}
```

#### 3. Package Optimizations
- **Tree Shaking**: ลบ unused code
- **Code Splitting**: แยก code ตาม routes
- **Lazy Loading**: โหลด components เมื่อจำเป็น

### 🔧 Backend Optimizations

#### 1. Express.js Optimizations
- **Compression**: เปิดใช้งาน gzip compression
- **Rate Limiting**: ป้องกัน API abuse
- **Security Headers**: เพิ่ม security headers
- **Connection Pooling**: ใช้ connection pooling สำหรับ database

#### 2. Database Optimizations
```sql
-- MySQL Performance Settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
query_cache_size = 32M
max_connections = 200
```

#### 3. Caching Strategy
- **API Response Caching**: cache API responses
- **Static File Caching**: cache static files
- **Database Query Caching**: cache frequent queries

### 🐳 Docker Optimizations

#### 1. Container Optimizations
- **Multi-stage Builds**: ลด image size
- **Resource Limits**: จำกัด memory และ CPU
- **Health Checks**: ตรวจสอบ service health
- **Non-root Users**: ใช้ non-root users

#### 2. Nginx Reverse Proxy
- **Load Balancing**: แบ่ง load ระหว่าง services
- **Caching**: cache static files และ API responses
- **Compression**: gzip compression
- **Rate Limiting**: ป้องกัน abuse

## 🚀 How to Use Performance Mode

### Option 1: NPM Performance Mode
```bash
# รัน performance mode
start-performance.bat
```

**Features:**
- Gzip compression
- Image optimization
- Bundle splitting
- Memory optimization
- Caching headers

### Option 2: Docker Performance Mode
```bash
# รัน Docker performance mode
start-performance.bat
```

**Features:**
- Nginx reverse proxy with caching
- Gzip compression
- Rate limiting
- Resource limits
- Health checks
- MySQL optimization

## 📈 Performance Metrics

### Target Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Monitoring Tools
```bash
# Bundle analyzer
npm run analyze

# Performance monitoring
docker-compose logs -f

# Health checks
curl http://localhost:3101/health
```

## 🔧 Advanced Optimizations

### 1. Database Indexing
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_work_plans_date ON work_plans(created_at);
CREATE INDEX idx_production_status_date ON production_status(created_at);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
```

### 2. API Response Optimization
```javascript
// Implement pagination
app.get('/api/work-plans', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const workPlans = await WorkPlan.find()
    .limit(limit)
    .skip(offset)
    .lean(); // Use lean() for better performance
    
  res.json({
    data: workPlans,
    pagination: {
      page,
      limit,
      total: await WorkPlan.countDocuments()
    }
  });
});
```

### 3. Frontend Code Splitting
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Reports = lazy(() => import('./components/Reports'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

## 🛠️ Troubleshooting

### Common Performance Issues

#### 1. Slow Database Queries
```bash
# Check slow queries
docker-compose logs mysql | grep "slow"

# Optimize queries
EXPLAIN SELECT * FROM work_plans WHERE created_at > '2024-01-01';
```

#### 2. Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limits
NODE_OPTIONS="--max-old-space-size=1024"
```

#### 3. Network Issues
```bash
# Check network performance
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3011"

# Optimize network settings
# In nginx.conf
keepalive_timeout 65;
keepalive_requests 100;
```

## 📊 Performance Monitoring

### 1. Real-time Monitoring
```bash
# Monitor containers
docker-compose logs -f

# Monitor system resources
docker stats

# Monitor API performance
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3101/api/health"
```

### 2. Performance Testing
```bash
# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3011

# Stress testing
npm install -g autocannon
autocannon -c 10 -d 30 http://localhost:3011
```

## 🎯 Best Practices

### 1. Development
- ใช้ `npm run dev` สำหรับ development
- ใช้ `npm run build:prod` สำหรับ production build
- เปิดใช้งาน bundle analyzer เพื่อดู bundle size

### 2. Production
- ใช้ Docker สำหรับ production deployment
- เปิดใช้งาน Nginx reverse proxy
- ตั้งค่า proper caching headers
- ใช้ CDN สำหรับ static assets

### 3. Monitoring
- ตรวจสอบ performance metrics อย่างสม่ำเสมอ
- ใช้ health checks เพื่อตรวจสอบ service status
- Monitor memory และ CPU usage

## 📈 Expected Performance Improvements

### Before Optimization
- First Load: ~5-8 seconds
- Bundle Size: ~2-3MB
- API Response: ~500-1000ms
- Memory Usage: ~200-300MB

### After Optimization
- First Load: ~1-2 seconds
- Bundle Size: ~500KB-1MB
- API Response: ~100-200ms
- Memory Usage: ~100-150MB

## 🔄 Continuous Optimization

### 1. Regular Monitoring
- ตรวจสอบ performance metrics ทุกสัปดาห์
- Monitor user experience metrics
- Track error rates และ response times

### 2. Optimization Cycles
- ทดสอบ performance ทุกเดือน
- Update dependencies อย่างสม่ำเสมอ
- Optimize database queries ตาม usage patterns

### 3. User Feedback
- เก็บ feedback จาก users เกี่ยวกับ performance
- Monitor real user metrics
- Adjust optimizations ตาม feedback

---

**🎯 Goal**: ให้ WorkplanV6 รันได้เร็วและเสถียรที่สุดเท่าที่เป็นไปได้! 