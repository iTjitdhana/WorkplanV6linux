/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // เพิ่ม configuration สำหรับการรัน server บน IP address
  experimental: {
    // อนุญาตให้ server รันบน IP address ที่กำหนด
  },
  // กำหนด hostname สำหรับ development server
  async rewrites() {
    return []
  },
}

export default nextConfig
