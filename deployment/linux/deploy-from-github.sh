#!/bin/bash

# WorkplanV6 GitHub Deployment Script
# สำหรับ Deploy จาก GitHub บน Linux Server 192.168.0.96

echo "🚀 Deploy WorkplanV6 จาก GitHub"
echo "================================"

# ตั้งค่า
GITHUB_REPO="https://github.com/YOUR_USERNAME/workplanv6.git"
DEPLOY_DIR="/opt/workplanv6"
BACKUP_DIR="/opt/workplanv6-backup"

# ตรวจสอบ Git
if ! command -v git &> /dev/null; then
    echo "❌ Git ไม่ได้ติดตั้ง กรุณาติดตั้ง Git ก่อน"
    echo "   sudo apt update && sudo apt install git"
    exit 1
fi

# ตรวจสอบ Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ไม่ได้ติดตั้ง กรุณาติดตั้ง Docker ก่อน"
    echo "   sudo apt update && sudo apt install docker.io docker-compose"
    exit 1
fi

echo "✅ Git และ Docker พร้อมใช้งาน"

# สร้าง backup (ถ้ามี deployment เก่า)
if [ -d "$DEPLOY_DIR" ]; then
    echo "📦 สร้าง backup ของ deployment เก่า..."
    sudo rm -rf "$BACKUP_DIR"
    sudo mv "$DEPLOY_DIR" "$BACKUP_DIR"
fi

# Clone repository
echo "📥 Clone repository จาก GitHub..."
sudo mkdir -p "$DEPLOY_DIR"
sudo chown $USER:$USER "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

git clone "$GITHUB_REPO" .

if [ $? -ne 0 ]; then
    echo "❌ ไม่สามารถ clone repository ได้"
    echo "ตรวจสอบ URL และ network connection"
    exit 1
fi

echo "✅ Clone repository สำเร็จ"

# สร้างไฟล์ configuration สำหรับ Linux
echo "⚙️  สร้างไฟล์ configuration..."

# สร้าง docker-compose.linux.yml
cat > docker-compose.linux.yml << 'EOF'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3012:3012"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://192.168.0.96:3102
      - BACKEND_URL=http://192.168.0.96:3102
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - workplan-network
    extra_hosts:
      - "host.docker.internal:host-gateway"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3102:3102"
    environment:
      - NODE_ENV=production
      - DB_HOST=192.168.0.94
      - DB_USER=jitdhana
      - DB_PASSWORD=iT12345$
      - DB_NAME=esp_tracker
      - DB_PORT=3306
      - LOGS_DB_HOST=192.168.0.93
      - LOGS_DB_USER=it.jitdhana
      - LOGS_DB_PASSWORD=iT12345$
      - LOGS_DB_NAME=esp_tracker
      - LOGS_DB_PORT=3306
      - JWT_SECRET=workplan_jwt_secret_2024_production_key_v6
      - SESSION_SECRET=workplan_session_secret_2024_production_key_v6
      - CORS_ORIGIN=http://192.168.0.96:3012
    restart: unless-stopped
    networks:
      - workplan-network
    extra_hosts:
      - "host.docker.internal:host-gateway"

networks:
  workplan-network:
    driver: bridge
EOF

# สร้าง environment file สำหรับ backend
mkdir -p backend
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=3102
DB_HOST=192.168.0.94
DB_USER=jitdhana
DB_PASSWORD=iT12345$
DB_NAME=esp_tracker
DB_PORT=3306
LOGS_DB_HOST=192.168.0.93
LOGS_DB_USER=it.jitdhana
LOGS_DB_PASSWORD=iT12345$
LOGS_DB_NAME=esp_tracker
LOGS_DB_PORT=3306
JWT_SECRET=workplan_jwt_secret_2024_production_key_v6
SESSION_SECRET=workplan_session_secret_2024_production_key_v6
CORS_ORIGIN=http://192.168.0.96:3012
EOF

# สร้าง environment file สำหรับ frontend
mkdir -p frontend
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://192.168.0.96:3102
BACKEND_URL=http://192.168.0.96:3102
EOF

echo "✅ สร้างไฟล์ configuration เสร็จสิ้น"

# หยุด containers เก่า (ถ้ามี)
echo "🛑 หยุด containers เก่า..."
docker-compose -f docker-compose.linux.yml down 2>/dev/null || true

# Build และ Start containers
echo "🔨 Build และ Start containers..."
docker-compose -f docker-compose.linux.yml up --build -d

# ตรวจสอบ status
echo "📊 ตรวจสอบ status containers..."
docker-compose -f docker-compose.linux.yml ps

# ตรวจสอบ logs
echo "📋 ตรวจสอบ logs..."
echo "Frontend logs:"
docker-compose -f docker-compose.linux.yml logs --tail=10 frontend

echo "Backend logs:"
docker-compose -f docker-compose.linux.yml logs --tail=10 backend

echo ""
echo "🎉 Deploy เสร็จสิ้น!"
echo "================================"
echo "🌐 Frontend: http://192.168.0.96:3012"
echo "🔧 Backend API: http://192.168.0.96:3102"
echo ""
echo "📋 คำสั่งที่มีประโยชน์:"
echo "   Update: git pull && docker-compose -f docker-compose.linux.yml up --build -d"
echo "   ดู logs: docker-compose -f docker-compose.linux.yml logs -f"
echo "   หยุดระบบ: docker-compose -f docker-compose.linux.yml down"
echo "   เริ่มใหม่: docker-compose -f docker-compose.linux.yml up -d"
echo "   ดู status: docker-compose -f docker-compose.linux.yml ps"
