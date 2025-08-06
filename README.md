# 🏭 WorkplanV6 - Production Planning System

ระบบวางแผนการผลิตแบบครบวงจร สำหรับโรงงานอุตสาหกรรม

## 🚀 Features

- **📅 Production Planning**: วางแผนการผลิตรายวัน/รายสัปดาห์
- **👥 Operator Management**: จัดการผู้ปฏิบัติงาน
- **🏭 Room & Machine Management**: จัดการห้องผลิตและเครื่องจักร
- **📊 Real-time Monitoring**: ระบบติดตามสถานะแบบ Real-time
- **📈 Reports & Analytics**: รายงานและวิเคราะห์ข้อมูล
- **🔄 Google Sheets Integration**: เชื่อมต่อกับ Google Sheets
- **📱 Responsive Design**: รองรับทุกอุปกรณ์

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **React Hook Form** - Form Management

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MySQL** - Database
- **mysql2** - MySQL Driver
- **CORS** - Cross-Origin Resource Sharing

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/iTjitdhana/WorkplanV6.git
cd WorkplanV6
```

### 2. Install Dependencies
```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Database Setup
```sql
-- Create Database
CREATE DATABASE esp_tracker;

-- Import Database Schema
mysql -u root -p esp_tracker < backend/esp_tracker.sql
```

### 4. Environment Configuration

#### Backend (.env)
```env
NODE_ENV=production
DB_HOST=192.168.0.94
DB_USER=jitdhana
DB_PASSWORD=iT12345$
DB_NAME=esp_tracker
DB_PORT=3306
PORT=3101
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3101/api
```

### 5. Start Development Servers

#### Option 1: Manual Start
```bash
# Start Backend
cd backend
npm start

# Start Frontend (in new terminal)
cd frontend
npm run dev
```

#### Option 2: Using Scripts
```bash
# Windows
.\quick-start-simple.ps1

# Linux/Mac
./quick-start.sh
```

### 6. Access Application
- **Frontend**: http://localhost:3011
- **Backend API**: http://localhost:3101/api

## 📁 Project Structure

```
WorkplanV6/
├── backend/                 # Backend API Server
│   ├── config/             # Database & Server Config
│   ├── controllers/        # API Controllers
│   ├── models/            # Database Models
│   ├── routes/            # API Routes
│   ├── middleware/        # Custom Middleware
│   └── server.js          # Main Server File
├── frontend/              # Next.js Frontend
│   ├── app/              # App Router Pages
│   ├── components/       # React Components
│   ├── lib/             # Utilities & Helpers
│   └── public/          # Static Assets
├── assets/              # CSS Styles
└── docs/               # Documentation
```

## 🔧 API Endpoints

### Production Planning
- `GET /api/work-plans` - Get all work plans
- `POST /api/work-plans` - Create new work plan
- `PUT /api/work-plans/:id` - Update work plan
- `DELETE /api/work-plans/:id` - Delete work plan

### Drafts Management
- `GET /api/work-plans/drafts` - Get all drafts
- `POST /api/work-plans/drafts` - Create draft
- `POST /api/work-plans/sync-drafts-to-plans` - Sync drafts to plans

### Production Rooms & Machines
- `GET /api/production-rooms` - Get production rooms
- `GET /api/machines` - Get machines

### Reports & Analytics
- `GET /api/reports` - Get production reports
- `POST /api/reports/export` - Export reports

### Google Sheets Integration
- `POST /api/send-to-google-sheet` - Send data to Google Sheets

## 🚀 Deployment

### Production Setup
```bash
# Build Frontend
cd frontend
npm run build

# Start Production Servers
cd ../backend
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=esp_tracker
DB_PORT=3306
PORT=3101
```

## 📊 Database Schema

### Main Tables
- `work_plans` - Production plans
- `work_plan_drafts` - Draft plans
- `production_rooms` - Production rooms
- `machines` - Production machines
- `users` - System users
- `logs` - Activity logs

## 🔍 Monitoring

- **Real-time Monitoring**: Built-in monitoring system
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: API response times and throughput

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@workplan.com
- **Issues**: [GitHub Issues](https://github.com/iTjitdhana/WorkplanV6/issues)

## 🔄 Version History

- **v6.0.0** - Complete rewrite with Next.js 14 and TypeScript
- **v5.0.0** - Added Google Sheets integration
- **v4.0.0** - Real-time monitoring system
- **v3.0.0** - Production room and machine management
- **v2.0.0** - Draft system and sync functionality
- **v1.0.0** - Basic production planning

---

**Made with ❤️ by iTjitdhana Team** 