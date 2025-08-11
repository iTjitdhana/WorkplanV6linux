#!/bin/bash

# Script สำหรับติดตั้ง Docker บน Windows
echo "🚀 เริ่มต้นติดตั้ง Docker บน Windows..."

# ตรวจสอบ OS
echo "📋 ตรวจสอบ Operating System..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "✅ ตรวจพบ Windows"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "✅ ตรวจพบ Linux"
else
    echo "⚠️  ไม่สามารถระบุ OS ได้"
fi

echo ""
echo "📋 ขั้นตอนการติดตั้ง Docker:"
echo ""
echo "1️⃣ ติดตั้ง Docker Desktop:"
echo "   - ดาวน์โหลดจาก: https://www.docker.com/products/docker-desktop/"
echo "   - ติดตั้ง Docker Desktop"
echo "   - รีสตาร์ทเครื่อง"
echo ""
echo "2️⃣ เริ่มต้น Docker Desktop:"
echo "   - เปิด Docker Desktop"
echo "   - รอให้ Docker Engine เริ่มต้นเสร็จ"
echo ""
echo "3️⃣ ตรวจสอบการติดตั้ง:"
echo "   - รัน: ./check-docker.sh"
echo ""
echo "4️⃣ Build และ Run ระบบ:"
echo "   - รัน: ./docker-build.sh"
echo ""
echo "📝 หมายเหตุ:"
echo "   - ต้องเปิด WSL2 หรือ Hyper-V"
echo "   - ต้องมีสิทธิ์ Administrator"
echo "   - อาจต้องรีสตาร์ทเครื่องหลังติดตั้ง"
echo ""
echo "🔗 ลิงก์ที่มีประโยชน์:"
echo "   - Docker Desktop: https://www.docker.com/products/docker-desktop/"
echo "   - WSL2: https://docs.microsoft.com/en-us/windows/wsl/install"
echo "   - Hyper-V: https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v"
