#!/bin/bash

# Script สำหรับ deploy จาก Docker Hub
echo "🚀 เริ่มต้น deploy จาก Docker Hub..."

# ตั้งค่า Docker Hub credentials
DOCKER_USERNAME="itjitdhana"
IMAGE_NAME="workplanv6.4"
VERSION="latest"

# ตรวจสอบว่า Docker ทำงานอยู่หรือไม่
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker ไม่ได้ทำงาน กรุณาเริ่ม Docker ก่อน"
    exit 1
fi

# หยุด containers เดิม (ถ้ามี)
echo "🛑 หยุด containers เดิม..."
docker-compose -f docker-compose.prod.yml down

# Pull images จาก Docker Hub
echo "📥 Pull images จาก Docker Hub..."
docker pull $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION
docker pull $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION

# ตรวจสอบว่า pull สำเร็จหรือไม่
if [ $? -ne 0 ]; then
    echo "❌ Pull images ไม่สำเร็จ"
    exit 1
fi

# Run containers
echo "▶️ เริ่มต้น containers..."
docker-compose -f docker-compose.prod.yml up -d

# ตรวจสอบว่า containers ทำงานอยู่หรือไม่
echo "⏳ รอให้ containers เริ่มต้น..."
sleep 10

# ตรวจสอบสถานะ containers
echo "📊 สถานะ containers:"
docker-compose -f docker-compose.prod.yml ps

# ตรวจสอบ logs
echo "📋 Logs ของ containers:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "✅ Deploy สำเร็จ!"
echo "🌐 Frontend: http://localhost:3011"
echo "🔧 Backend: http://localhost:3101"
echo ""
echo "📝 คำสั่งที่มีประโยชน์:"
echo "  - ดู logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - หยุดระบบ: docker-compose -f docker-compose.prod.yml down"
echo "  - รีสตาร์ท: docker-compose -f docker-compose.prod.yml restart"
