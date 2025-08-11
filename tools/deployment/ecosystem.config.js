module.exports = {
  apps: [
    {
      name: 'workplan-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 'max', // หรือระบุจำนวน เช่น 2
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3101
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3101,
        DB_HOST: '192.168.0.94',  // เปลี่ยนเป็น IP ของ database server
        DB_USER: 'jitdhana',
        DB_PASSWORD: 'iT12345$',
        DB_NAME: 'esp_tracker',
        DB_PORT: 3306,
        API_RATE_LIMIT: 100,
        PRODUCTION_HOST: '192.168.0.161',  // IP ของ server ที่รัน backend
        CORS_ORIGINS: 'http://192.168.0.161:3011,http://192.168.0.94:3011'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'workplan-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3011
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3011,
        NEXT_PUBLIC_API_URL: 'http://192.168.0.161:3101',  // เปลี่ยนเป็น IP ของ backend server
        NEXT_PUBLIC_APP_ENV: 'production',
        NEXT_PUBLIC_APP_VERSION: '1.0.0'
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_memory_restart: '1G'
    }
  ],

  deploy: {
    production: {
      user: 'your-username',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/iTjitdhana/WorkplanV5.git',
      path: '/var/www/workplan',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 