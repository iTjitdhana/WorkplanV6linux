# 🚀 Production Deployment Guide for WorkplansV4

## 📋 Overview

คู่มือการ deploy ระบบ WorkplansV4 ใน Production Mode สำหรับ Windows Server

## 🎯 Quick Start

### หลังจาก Git Pull

```cmd
# 1. Pull latest changes
git pull origin main

# 2. Run production deployment
production-deploy.bat
```

### หรือใช้ Update Script

```cmd
# ใช้ update script ที่สร้างขึ้น
update-production.bat
```

## 🔧 Scripts ที่สร้างขึ้น

### ไฟล์หลัก
- `production-deploy.bat` - Script หลักสำหรับ production deployment
- `ecosystem.config.js` - PM2 configuration file

### Management Scripts
- `start-production.bat` - Start all applications
- `stop-production.bat` - Stop all applications  
- `restart-production.bat` - Restart all applications
- `status-production.bat` - Check application status
- `logs-production.bat` - View application logs
- `update-production.bat` - Update from git and redeploy

## 📁 Directory Structure

```
WorkplansV4/
├── backend/
│   ├── .env                    # Backend environment variables
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── .env.local              # Frontend environment variables
│   ├── package.json
│   └── next.config.mjs
├── logs/                       # Application logs
│   ├── backend-error.log
│   ├── backend-out.log
│   ├── backend-combined.log
│   ├── frontend-error.log
│   ├── frontend-out.log
│   └── frontend-combined.log
├── ecosystem.config.js         # PM2 configuration
├── production-deploy.bat       # Main deployment script
└── [management scripts].bat    # Management scripts
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=esp_tracker
DB_PORT=3306
PORT=3101
NODE_ENV=production
FRONTEND_URL=http://localhost:3011
API_RATE_LIMIT=1000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3101
```

## 🚀 Deployment Process

### Step 1: Prerequisites
- Node.js 18+ installed
- MySQL server running
- Git repository cloned

### Step 2: Run Deployment
```cmd
production-deploy.bat
```

### Step 3: What Happens
1. **Check Dependencies** - Verify Node.js and PM2
2. **Stop Existing Apps** - Stop any running PM2 processes
3. **Update Backend** - Install dependencies and check .env
4. **Update Frontend** - Install dependencies and build for production
5. **Create PM2 Config** - Generate ecosystem.config.js
6. **Start Applications** - Start with PM2 process manager
7. **Create Scripts** - Generate management scripts

## 📊 PM2 Configuration

### Backend App
```javascript
{
  name: 'workplans-backend',
  cwd: './backend',
  script: 'server.js',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: 3101
  },
  error_file: './logs/backend-error.log',
  out_file: './logs/backend-out.log',
  log_file: './logs/backend-combined.log',
  time: true
}
```

### Frontend App
```javascript
{
  name: 'workplans-frontend',
  cwd: './frontend',
  script: 'npm',
  args: 'start',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: 3011
  },
  error_file: './logs/frontend-error.log',
  out_file: './logs/frontend-out.log',
  log_file: './logs/frontend-combined.log',
  time: true
}
```

## 🔄 Update Process

### Manual Update
```cmd
# 1. Pull changes
git pull origin main

# 2. Run deployment
production-deploy.bat
```

### Automatic Update
```cmd
# Use update script
update-production.bat
```

## 📱 Access URLs

- **Frontend**: http://localhost:3011
- **Backend API**: http://localhost:3101
- **Tracker**: http://localhost:3011/tracker

## 🔧 Management Commands

### PM2 Commands
```cmd
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart all
pm2 stop all        # Stop all
pm2 monit           # Monitor resources
pm2 save            # Save current configuration
```

### Script Commands
```cmd
start-production.bat    # Start applications
stop-production.bat     # Stop applications
restart-production.bat  # Restart applications
status-production.bat   # Check status
logs-production.bat     # View logs
update-production.bat   # Update and redeploy
```

## 📝 Logs

### Log Locations
- **Backend Logs**: `./logs/backend-*.log`
- **Frontend Logs**: `./logs/frontend-*.log`

### View Logs
```cmd
# View all logs
logs-production.bat

# View specific logs
pm2 logs workplans-backend
pm2 logs workplans-frontend

# View log files directly
type logs\backend-error.log
type logs\frontend-error.log
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```cmd
# Check what's using the port
netstat -ano | findstr :3011
netstat -ano | findstr :3101

# Kill process if needed
taskkill /PID <process_id> /F
```

#### 2. MySQL Connection Issues
- Check MySQL service is running
- Verify database credentials in `backend/.env`
- Test connection manually

#### 3. Build Failures
```cmd
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
cd frontend
rmdir /s node_modules
npm install --legacy-peer-deps
npm run build
```

#### 4. PM2 Issues
```cmd
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

### Debug Commands
```cmd
# Check application status
status-production.bat

# View real-time logs
logs-production.bat

# Monitor resources
pm2 monit

# Check environment
echo %NODE_ENV%
node --version
npm --version
```

## 🔒 Security Considerations

### Production Security
1. **Change Default Passwords** - Update MySQL password
2. **Firewall Configuration** - Only open necessary ports
3. **Environment Variables** - Keep sensitive data in .env files
4. **Regular Updates** - Keep dependencies updated
5. **Backup Strategy** - Regular database backups

### Recommended Firewall Rules
```cmd
# Allow only necessary ports
netsh advfirewall firewall add rule name="WorkplansV4 Frontend" dir=in action=allow protocol=TCP localport=3011
netsh advfirewall firewall add rule name="WorkplansV4 Backend" dir=in action=allow protocol=TCP localport=3101
```

## 📈 Performance Optimization

### PM2 Settings
- **Instances**: 1 (can be increased for load balancing)
- **Memory Limit**: 1GB per app
- **Auto Restart**: Enabled
- **Watch Mode**: Disabled (for production)

### Next.js Optimization
- **Production Build**: Optimized automatically
- **Static Generation**: Enabled
- **Image Optimization**: Enabled
- **Bundle Analysis**: Available in build output

## 🔄 Continuous Deployment

### Automated Update Script
```cmd
# Create scheduled task for automatic updates
schtasks /create /tn "WorkplansV4 Update" /tr "C:\path\to\update-production.bat" /sc daily /st 02:00
```

### Git Hooks (Optional)
```bash
# Create post-merge hook for automatic deployment
echo "production-deploy.bat" > .git/hooks/post-merge
chmod +x .git/hooks/post-merge
```

## 📞 Support

### Log Locations
- Application logs: `./logs/`
- PM2 logs: `pm2 logs`
- System logs: Windows Event Viewer

### Common Commands
```cmd
# Quick health check
status-production.bat

# View recent errors
pm2 logs --lines 100

# Restart if issues
restart-production.bat
```

---

## 🎉 Success Checklist

- [ ] Node.js 18+ installed
- [ ] MySQL server running
- [ ] Database configured
- [ ] Environment files created
- [ ] Applications started with PM2
- [ ] Frontend accessible at http://localhost:3011
- [ ] Backend API accessible at http://localhost:3101
- [ ] Management scripts created
- [ ] Logs directory created
- [ ] Firewall configured (if needed) 