# TrackerV2 - Production Tracking System

ระบบติดตามการผลิตแบบ Real-time สำหรับโรงงานอุตสาหกรรม

## 🚀 Features

- **Real-time Production Tracking** - ติดตามการผลิตแบบ Real-time
- **Work Plan Management** - จัดการแผนงานการผลิต
- **Machine Status Monitoring** - ตรวจสอบสถานะเครื่องจักร
- **Production Logs** - บันทึกข้อมูลการผลิต
- **Reports & Analytics** - รายงานและวิเคราะห์ข้อมูล
- **User Management** - จัดการผู้ใช้งาน
- **Auto-refresh System** - ระบบอัปเดตอัตโนมัติ

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 📋 System Requirements

- Node.js 18+
- MySQL 8.0+
- Docker (optional)

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/iTjitdhana/TrackerV2.git
cd TrackerV2
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database configuration
npm run start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp env.example .env.local
# Edit .env.local with your API configuration
npm run dev
```

## 🌐 Port Configuration

- **Backend API**: `http://192.168.0.94:3102`
- **Frontend**: `http://192.168.0.94:3012`
- **Database**: `192.168.0.94:3306`

## 🗄️ Database Configuration

```env
DB_HOST=192.168.0.94
DB_USER=jitdhana
DB_PASSWORD=iT12345$
DB_NAME=esp_tracker
DB_PORT=3306
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Manual Docker Commands
```bash
# Build images
docker build -t trackerv2-backend ./backend
docker build -t trackerv2-frontend .

# Run containers
docker run -d -p 3102:3102 --name trackerv2-backend trackerv2-backend
docker run -d -p 3012:3012 --name trackerv2-frontend trackerv2-frontend
```

## 📁 Project Structure

```
TrackerV2/
├── backend/                 # Backend API server
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── server.js          # Main server file
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── tools/               # Development tools
├── docs/               # Documentation
└── docker-compose.yml  # Docker configuration
```

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3102
DB_HOST=192.168.0.94
DB_USER=jitdhana
DB_PASSWORD=iT12345$
DB_NAME=esp_tracker
DB_PORT=3306
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://192.168.0.94:3012
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://192.168.0.94:3102
NEXT_PUBLIC_BACKEND_URL=http://192.168.0.94:3102
```

## 🚀 Quick Start Scripts

### Windows (.bat files)
- `fix-all-issues.bat` - Fix all common issues
- `run-production.bat` - Start production servers
- `build-simple.bat` - Build frontend for production
- `restart-backend.bat` - Restart backend server

### Linux/Mac (.sh files)
- `start-production.sh` - Start production servers
- `setup-production.sh` - Setup production environment

## 📊 API Endpoints

### Production Management
- `GET /api/work-plans` - Get work plans
- `POST /api/work-plans` - Create work plan
- `PUT /api/work-plans/:id` - Update work plan
- `DELETE /api/work-plans/:id` - Delete work plan

### Production Logs
- `GET /api/production-logs` - Get production logs
- `POST /api/production-logs` - Create production log
- `PUT /api/production-logs/:id` - Update production log

### Machine Management
- `GET /api/machines` - Get machines
- `POST /api/machines` - Create machine
- `PUT /api/machines/:id` - Update machine

### Reports
- `GET /api/reports` - Generate reports
- `GET /api/reports/production-analysis` - Production analysis
- `POST /api/reports/export` - Export reports

## 🔒 Security Features

- JWT Authentication
- CORS Protection
- Rate Limiting
- Input Validation
- SQL Injection Prevention
- XSS Protection

## 📈 Performance Optimizations

- Database Connection Pooling
- API Response Caching
- Frontend Code Splitting
- Image Optimization
- Gzip Compression
- CDN Integration

## 🐛 Troubleshooting

### Common Issues
1. **Port Already in Use**
   - Check if ports 3102 and 3012 are available
   - Kill existing processes: `taskkill /f /im node.exe`

2. **Database Connection Failed**
   - Verify database credentials in `.env`
   - Check network connectivity to database server

3. **Frontend Build Failed**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `npm install`

### Debug Mode
```bash
# Backend debug
NODE_ENV=development npm run dev

# Frontend debug
npm run dev
```

## 📝 Changelog

### v2.0.0 (Latest)
- Updated ports: Backend 3102, Frontend 3012
- Enhanced production tracking features
- Improved real-time updates
- Better error handling
- Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@trackerv2.com
- GitHub Issues: [Create Issue](https://github.com/iTjitdhana/TrackerV2/issues)

## 🔗 Links

- **Live Demo**: http://192.168.0.94:3012
- **API Documentation**: http://192.168.0.94:3102/health
- **GitHub Repository**: https://github.com/iTjitdhana/TrackerV2

---

**TrackerV2** - Empowering Production Excellence 🏭
