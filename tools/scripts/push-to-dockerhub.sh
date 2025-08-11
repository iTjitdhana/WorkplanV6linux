#!/bin/bash

# Script สำหรับ push WorkplanV6 ไปยัง Docker Hub
echo "🚀 เริ่มต้น push WorkplanV6 ไปยัง Docker Hub..."

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

# Build images ถ้ายังไม่มี
echo "🔨 ตรวจสอบและ build Docker images..."

# Build frontend
echo "📦 Building frontend image..."
docker build -t workplanv6-frontend:$VERSION .
if [ $? -ne 0 ]; then
    echo "❌ Build frontend ไม่สำเร็จ"
    exit 1
fi

# Build backend
echo "📦 Building backend image..."
docker build -t workplanv6-backend:$VERSION ./backend
if [ $? -ne 0 ]; then
    echo "❌ Build backend ไม่สำเร็จ"
    exit 1
fi

# Login to Docker Hub
echo "🔐 Login to Docker Hub..."
docker login -u $DOCKER_USERNAME

if [ $? -ne 0 ]; then
    echo "❌ Login ไม่สำเร็จ กรุณาตรวจสอบ credentials"
    exit 1
fi

# Tag images
echo "🏷️ Tag images..."
docker tag workplanv6-frontend:$VERSION $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION
docker tag workplanv6-backend:$VERSION $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION

# Push frontend image
echo "📤 Push frontend image..."
docker push $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION

if [ $? -ne 0 ]; then
    echo "❌ Push frontend ไม่สำเร็จ"
    exit 1
fi

# Push backend image
echo "📤 Push backend image..."
docker push $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION

if [ $? -ne 0 ]; then
    echo "❌ Push backend ไม่สำเร็จ"
    exit 1
fi

echo ""
echo "✅ Push สำเร็จ!"
echo ""
echo "📋 Images ที่ push แล้ว:"
echo "  - $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION"
echo "  - $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION"
echo ""
echo "🌐 Docker Hub URLs:"
echo "  - https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME-frontend"
echo "  - https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME-backend"
echo ""
echo "📝 คำสั่งสำหรับ pull:"
echo "  - docker pull $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION"
echo "  - docker pull $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION"
echo ""
echo "📝 คำสั่งสำหรับ run:"
echo "  - docker run -p 3011:3011 $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION"
echo "  - docker run -p 3101:3101 $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION"
