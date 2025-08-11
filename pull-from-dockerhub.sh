#!/bin/bash

# Script สำหรับ pull และ run WorkplanV6 จาก Docker Hub
echo "🚀 เริ่มต้น pull และ run WorkplanV6 จาก Docker Hub..."

# ตั้งค่า Docker Hub credentials
echo "📋 กรุณาใส่ข้อมูล Docker Hub:"
read -p "Docker Hub Username: " DOCKER_USERNAME
read -p "Image Name (เช่น workplanv6): " IMAGE_NAME
read -p "Version (เช่น latest): " VERSION

# ตั้งค่า default values
VERSION=${VERSION:-latest}
IMAGE_NAME=${IMAGE_NAME:-workplanv6}

echo ""
echo "📋 ข้อมูลที่จะใช้:"
echo "Username: $DOCKER_USERNAME"
echo "Image Name: $IMAGE_NAME"
echo "Version: $VERSION"
echo ""

# ตรวจสอบว่า Docker ทำงานอยู่หรือไม่
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker ไม่ได้ทำงาน กรุณาเริ่ม Docker ก่อน"
    exit 1
fi

# Pull images
echo "📥 Pull frontend image..."
docker pull $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION
if [ $? -ne 0 ]; then
    echo "❌ Pull frontend ไม่สำเร็จ"
    exit 1
fi

echo "📥 Pull backend image..."
docker pull $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION
if [ $? -ne 0 ]; then
    echo "❌ Pull backend ไม่สำเร็จ"
    exit 1
fi

# Stop existing containers
echo "🛑 หยุด containers ที่มีอยู่..."
docker stop workplanv6-frontend workplanv6-backend 2>/dev/null
docker rm workplanv6-frontend workplanv6-backend 2>/dev/null

# Run containers
echo "🚀 เริ่มต้น run containers..."

echo "📦 Running backend..."
docker run -d \
  --name workplanv6-backend \
  -p 3101:3101 \
  -e NODE_ENV=production \
  -e DB_HOST=192.168.0.94 \
  -e DB_USER=jitdhana \
  -e DB_PASSWORD=iT12345$ \
  -e DB_NAME=esp_tracker \
  -e DB_PORT=3306 \
  --restart unless-stopped \
  $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION

if [ $? -ne 0 ]; then
    echo "❌ Run backend ไม่สำเร็จ"
    exit 1
fi

echo "📦 Running frontend..."
docker run -d \
  --name workplanv6-frontend \
  -p 3011:3011 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://192.168.0.94:3101 \
  -e BACKEND_URL=http://backend:3101 \
  --restart unless-stopped \
  $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION

if [ $? -ne 0 ]; then
    echo "❌ Run frontend ไม่สำเร็จ"
    exit 1
fi

echo ""
echo "✅ Pull และ run สำเร็จ!"
echo ""
echo "📋 Containers ที่รันอยู่:"
docker ps --filter "name=workplanv6" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 URLs:"
echo "  - Frontend: http://localhost:3011"
echo "  - Backend API: http://localhost:3101"
echo ""
echo "📝 คำสั่งสำหรับจัดการ containers:"
echo "  - ดู logs: docker logs workplanv6-frontend"
echo "  - ดู logs: docker logs workplanv6-backend"
echo "  - หยุด: docker stop workplanv6-frontend workplanv6-backend"
echo "  - ลบ: docker rm workplanv6-frontend workplanv6-backend"
