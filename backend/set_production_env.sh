#!/bin/bash

echo "🔧 Setting Production Environment Variables"
echo "=========================================="

# สร้างไฟล์ .env สำหรับ production
cat > .env << 'EOF'
# Production Environment Variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=esp_tracker
DB_PORT=3306

# Server Configuration
PORT=3101
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=http://192.168.0.94:3011

# API Rate Limit
API_RATE_LIMIT=1000
EOF

echo "✅ Created .env file for production"
echo ""
echo "📝 Please edit .env file and set your MySQL root password:"
echo "   nano .env"
echo ""
echo "🚀 Then run the server:"
echo "   npm start"
echo ""
echo "🔍 Or test with:"
echo "   NODE_ENV=production npm start" 