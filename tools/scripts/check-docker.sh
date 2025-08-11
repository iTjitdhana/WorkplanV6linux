#!/bin/bash

# Script สำหรับตรวจสอบและแก้ไขปัญหา Docker
echo "🔍 ตรวจสอบระบบ Docker..."

# ตรวจสอบว่า Docker ติดตั้งแล้วหรือไม่
echo "📋 ตรวจสอบ Docker installation..."
if command -v docker &> /dev/null; then
    echo "✅ Docker ติดตั้งแล้ว"
    docker --version
else
    echo "❌ Docker ไม่ได้ติดตั้ง"
    echo "💡 กรุณาติดตั้ง Docker ก่อน:"
    echo "   - Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "   - macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   - Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# ตรวจสอบว่า Docker ทำงานอยู่หรือไม่
echo "📋 ตรวจสอบ Docker service..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker ทำงานอยู่"
else
    echo "❌ Docker ไม่ได้ทำงาน"
    echo "💡 กรุณาเริ่ม Docker Desktop หรือ Docker service"
    echo "   - Windows/macOS: เปิด Docker Desktop"
    echo "   - Linux: sudo systemctl start docker"
    exit 1
fi

# ตรวจสอบ Docker Compose
echo "📋 ตรวจสอบ Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose ติดตั้งแล้ว"
    docker-compose --version
else
    echo "❌ Docker Compose ไม่ได้ติดตั้ง"
    echo "💡 กรุณาติดตั้ง Docker Compose"
    exit 1
fi

# ตรวจสอบ Node.js และ npm
echo "📋 ตรวจสอบ Node.js และ npm..."
if command -v node &> /dev/null; then
    echo "✅ Node.js ติดตั้งแล้ว"
    node --version
else
    echo "❌ Node.js ไม่ได้ติดตั้ง"
    echo "💡 กรุณาติดตั้ง Node.js: https://nodejs.org/"
    exit 1
fi

if command -v npm &> /dev/null; then
    echo "✅ npm ติดตั้งแล้ว"
    npm --version
else
    echo "❌ npm ไม่ได้ติดตั้ง"
    echo "💡 กรุณาติดตั้ง npm"
    exit 1
fi

# ตรวจสอบ ports ที่ใช้งาน
echo "📋 ตรวจสอบ ports ที่ใช้งาน..."
if command -v netstat &> /dev/null; then
    echo "🔍 ตรวจสอบ port 3011..."
    if netstat -tulpn 2>/dev/null | grep :3011; then
        echo "⚠️  Port 3011 ถูกใช้งานอยู่"
    else
        echo "✅ Port 3011 ว่าง"
    fi
    
    echo "🔍 ตรวจสอบ port 3101..."
    if netstat -tulpn 2>/dev/null | grep :3101; then
        echo "⚠️  Port 3101 ถูกใช้งานอยู่"
    else
        echo "✅ Port 3101 ว่าง"
    fi
else
    echo "⚠️  ไม่สามารถตรวจสอบ ports ได้ (netstat ไม่มี)"
fi

# ตรวจสอบ Docker images ที่มีอยู่
echo "📋 ตรวจสอบ Docker images..."
docker images | grep workplanv6

echo ""
echo "🎉 การตรวจสอบเสร็จสิ้น!"
echo "💡 หากทุกอย่าง OK แล้ว ให้รัน:"
echo "   ./docker-build.sh"
