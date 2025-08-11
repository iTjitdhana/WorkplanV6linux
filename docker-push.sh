#!/bin/bash

# Script สำหรับ push Docker images ขึ้น Docker Hub
echo "🚀 เริ่มต้น push Docker images ขึ้น Docker Hub..."

# ตั้งค่า Docker Hub credentials
DOCKER_USERNAME="itjitdhana"
IMAGE_NAME="workplanv6.4"
VERSION="latest"

# ตรวจสอบว่า Docker ทำงานอยู่หรือไม่
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker ไม่ได้ทำงาน กรุณาเริ่ม Docker ก่อน"
    exit 1
fi

# ตรวจสอบว่า build images แล้วหรือยัง
echo "🔍 ตรวจสอบ Docker images..."
if ! docker images | grep -q "workplanv6-frontend\|workplanv6-backend"; then
    echo "❌ ไม่พบ Docker images กรุณา build ก่อน"
    echo "💡 รันคำสั่ง: ./docker-build.sh"
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
docker tag workplanv6-frontend:latest $DOCKER_USERNAME/$IMAGE_NAME-frontend:$VERSION
docker tag workplanv6-backend:latest $DOCKER_USERNAME/$IMAGE_NAME-backend:$VERSION

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

echo "✅ Push สำเร็จ!"
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
