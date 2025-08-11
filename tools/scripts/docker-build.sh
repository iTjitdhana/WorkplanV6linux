#!/bin/bash

# Script สำหรับ build และ run Docker WorkplanV6
echo "🚀 เริ่มต้น build และ run Docker WorkplanV6..."

# ตรวจสอบว่า Docker ทำงานอยู่หรือไม่
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker ไม่ได้ทำงาน กรุณาเริ่ม Docker ก่อน"
    exit 1
fi

# หยุดและลบ containers เดิม (ถ้ามี)
echo "🛑 หยุด containers เดิม..."
docker-compose down

# ลบ images เดิม (ถ้ามี)
echo "🗑️ ลบ images เดิม..."
docker-compose down --rmi all

# Build images ใหม่
echo "🔨 Build images ใหม่..."
docker-compose build --no-cache

# ตรวจสอบว่า build สำเร็จหรือไม่
if [ $? -ne 0 ]; then
    echo "❌ Build ไม่สำเร็จ"
    exit 1
fi

# Run containers
echo "▶️ เริ่มต้น containers..."
docker-compose up -d

# ตรวจสอบว่า containers ทำงานอยู่หรือไม่
echo "⏳ รอให้ containers เริ่มต้น..."
sleep 10

# ตรวจสอบสถานะ containers
echo "📊 สถานะ containers:"
docker-compose ps

# ตรวจสอบ logs
echo "📋 Logs ของ containers:"
docker-compose logs --tail=20

echo "✅ ระบบพร้อมใช้งาน!"
echo "🌐 Frontend: http://localhost:3011"
echo "🔧 Backend: http://localhost:3101"
echo ""
echo "📝 คำสั่งที่มีประโยชน์:"
echo "  - ดู logs: docker-compose logs -f"
echo "  - หยุดระบบ: docker-compose down"
echo "  - รีสตาร์ท: docker-compose restart"
