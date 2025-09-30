#!/bin/bash

# สคริปต์แก้ไขปัญหาการดึงข้อมูลหน้า 3012/tracker บน Linux Server
# วันที่: 23 กันยายน 2567

echo "🔧 แก้ไขปัญหาการดึงข้อมูลหน้า 3012/tracker บน Linux Server"
echo "================================================================"

# ตรวจสอบว่าอยู่ในโฟลเดอร์ที่ถูกต้อง
if [ ! -f "docker-compose.linux.yml" ]; then
    echo "❌ ไม่พบไฟล์ docker-compose.linux.yml"
    echo "💡 กรุณาเข้าไปในโฟลเดอร์โปรเจคก่อน"
    exit 1
fi

echo "📋 ขั้นตอนการแก้ไขปัญหา:"
echo ""

# 1. ตรวจสอบสถานะ Docker containers
echo "1️⃣ ตรวจสอบสถานะ Docker containers..."
docker compose -f docker-compose.linux.yml ps

echo ""
echo "2️⃣ ตรวจสอบ logs ของ containers..."
echo "📊 Backend logs (5 บรรทัดล่าสุด):"
docker compose -f docker-compose.linux.yml logs --tail=5 backend

echo ""
echo "📊 Frontend logs (5 บรรทัดล่าสุด):"
docker compose -f docker-compose.linux.yml logs --tail=5 frontend

echo ""
echo "3️⃣ ตรวจสอบการเชื่อมต่อเครือข่าย..."
echo "🔍 ทดสอบการเชื่อมต่อไปยัง database server (192.168.0.94:3306)..."
if timeout 5 bash -c "</dev/tcp/192.168.0.94/3306"; then
    echo "✅ เชื่อมต่อ database server ได้"
else
    echo "❌ ไม่สามารถเชื่อมต่อ database server ได้"
    echo "💡 ตรวจสอบ:"
    echo "   - MySQL server กำลังทำงานอยู่หรือไม่"
    echo "   - Firewall settings"
    echo "   - Network connectivity"
fi

echo ""
echo "🔍 ทดสอบการเชื่อมต่อไปยัง backend server (192.168.0.96:3102)..."
if timeout 5 bash -c "</dev/tcp/192.168.0.96/3102"; then
    echo "✅ เชื่อมต่อ backend server ได้"
else
    echo "❌ ไม่สามารถเชื่อมต่อ backend server ได้"
    echo "💡 ตรวจสอบ:"
    echo "   - Backend container กำลังทำงานอยู่หรือไม่"
    echo "   - Port mapping ใน docker-compose"
fi

echo ""
echo "4️⃣ ตรวจสอบไฟล์ environment..."
if [ -f "backend/.env" ]; then
    echo "✅ พบไฟล์ backend/.env"
    echo "📋 ตรวจสอบการตั้งค่าสำคัญ:"
    grep -E "^(DB_HOST|DB_USER|DB_NAME|PORT)" backend/.env | while read line; do
        echo "   $line"
    done
else
    echo "❌ ไม่พบไฟล์ backend/.env"
    echo "💡 สร้างไฟล์ .env สำหรับ backend"
fi

echo ""
echo "5️⃣ รีสตาร์ทระบบ..."
echo "🔄 หยุด containers..."
docker compose -f docker-compose.linux.yml down

echo "🔄 เริ่ม containers ใหม่..."
docker compose -f docker-compose.linux.yml up -d

echo ""
echo "⏳ รอให้ระบบเริ่มทำงาน (30 วินาที)..."
sleep 30

echo ""
echo "6️⃣ ตรวจสอบสถานะหลังรีสตาร์ท..."
docker compose -f docker-compose.linux.yml ps

echo ""
echo "7️⃣ ทดสอบ API endpoints..."
echo "🔍 ทดสอบ health check..."
if curl -s -f "http://192.168.0.96:3102/health" > /dev/null; then
    echo "✅ Backend health check ผ่าน"
else
    echo "❌ Backend health check ล้มเหลว"
fi

echo "🔍 ทดสอบ work-plans API..."
if curl -s -f "http://192.168.0.96:3102/api/work-plans?date=$(date +%Y-%m-%d)" > /dev/null; then
    echo "✅ Work-plans API ผ่าน"
else
    echo "❌ Work-plans API ล้มเหลว"
fi

echo ""
echo "8️⃣ ทดสอบหน้า tracker..."
echo "🔍 ทดสอบการเข้าถึงหน้า tracker..."
if curl -s -f "http://192.168.0.96:3012/tracker" > /dev/null; then
    echo "✅ หน้า tracker เข้าถึงได้"
else
    echo "❌ หน้า tracker เข้าถึงไม่ได้"
fi

echo ""
echo "================================================================"
echo "📊 สรุปผลการแก้ไข:"
echo "================================================================"

# ตรวจสอบสถานะสุดท้าย
echo "🔍 สถานะ containers:"
docker compose -f docker-compose.linux.yml ps

echo ""
echo "🌐 URLs สำหรับทดสอบ:"
echo "   - Frontend: http://192.168.0.96:3012"
echo "   - Tracker: http://192.168.0.96:3012/tracker"
echo "   - Backend API: http://192.168.0.96:3102"
echo "   - Health Check: http://192.168.0.96:3102/health"

echo ""
echo "📋 คำสั่งที่มีประโยชน์:"
echo "   - ดู logs: docker compose -f docker-compose.linux.yml logs -f"
echo "   - ตรวจสอบสถานะ: docker compose -f docker-compose.linux.yml ps"
echo "   - รีสตาร์ท: docker compose -f docker-compose.linux.yml restart"
echo "   - หยุดระบบ: docker compose -f docker-compose.linux.yml down"

echo ""
echo "🎉 การแก้ไขเสร็จสิ้น!"
echo "💡 หากยังมีปัญหา ให้ตรวจสอบ logs และ network connectivity"

