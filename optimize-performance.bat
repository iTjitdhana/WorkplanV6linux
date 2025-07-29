@echo off
REM ⚡ Performance Optimization Script
REM สำหรับ optimize ระบบให้มีประสิทธิภาพสูงสุด

echo.
echo ================================
echo Performance Optimization
echo ================================
echo.

echo [INFO] Optimizing system performance for production...
echo.

REM Step 1: Database Optimization
echo [STEP 1] Database Performance Optimization
echo ================================
echo [INFO] Optimizing MySQL settings...

REM Create MySQL optimization script
echo [INFO] Creating MySQL optimization script...
(
echo -- MySQL Performance Optimization
echo SET GLOBAL innodb_buffer_pool_size = 1073741824;
echo SET GLOBAL innodb_log_file_size = 268435456;
echo SET GLOBAL innodb_flush_log_at_trx_commit = 2;
echo SET GLOBAL innodb_flush_method = O_DIRECT;
echo SET GLOBAL query_cache_size = 67108864;
echo SET GLOBAL query_cache_type = 1;
echo SET GLOBAL max_connections = 200;
echo SET GLOBAL thread_cache_size = 16;
echo SET GLOBAL table_open_cache = 4000;
echo SET GLOBAL sort_buffer_size = 2097152;
echo SET GLOBAL read_buffer_size = 2097152;
echo SET GLOBAL read_rnd_buffer_size = 8388608;
echo SET GLOBAL myisam_sort_buffer_size = 8388608;
echo SET GLOBAL key_buffer_size = 268435456;
echo SET GLOBAL max_allowed_packet = 16777216;
echo SET GLOBAL net_buffer_length = 16384;
echo SET GLOBAL interactive_timeout = 28800;
echo SET GLOBAL wait_timeout = 28800;
echo SET GLOBAL connect_timeout = 10;
echo SET GLOBAL max_connect_errors = 1000000;
echo SET GLOBAL open_files_limit = 65536;
echo SET GLOBAL table_definition_cache = 4000;
echo SET GLOBAL performance_schema = ON;
) > mysql_optimize.sql

echo [INFO] MySQL optimization script created: mysql_optimize.sql
echo [INFO] Run this script in MySQL to optimize database performance
echo.

REM Step 2: Node.js Optimization
echo [STEP 2] Node.js Performance Optimization
echo ================================
echo [INFO] Setting Node.js performance flags...

REM Create optimized PM2 ecosystem
echo [INFO] Creating optimized PM2 configuration...
(
echo module.exports = {
echo   apps: [
echo     {
echo       name: 'workplan-backend',
echo       script: 'server.js',
echo       cwd: './backend',
echo       instances: 'max',
echo       exec_mode: 'cluster',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3101
echo       },
echo       max_memory_restart: '512M',
echo       node_args: '--max-old-space-size=512 --optimize-for-size',
echo       error_file: './logs/backend-error.log',
echo       out_file: './logs/backend-out.log',
echo       log_file: './logs/backend-combined.log',
echo       time: true,
echo       autorestart: true,
echo       watch: false,
echo       max_restarts: 10,
echo       min_uptime: '10s'
echo     },
echo     {
echo       name: 'workplan-frontend',
echo       script: 'npm',
echo       args: 'start',
echo       cwd: './frontend',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3011
echo       },
echo       max_memory_restart: '256M',
echo       node_args: '--max-old-space-size=256',
echo       error_file: './logs/frontend-error.log',
echo       out_file: './logs/frontend-out.log',
echo       log_file: './logs/frontend-combined.log',
echo       time: true,
echo       autorestart: true,
echo       watch: false,
echo       max_restarts: 10,
echo       min_uptime: '10s'
echo     }
echo   ]
echo };
) > ecosystem-optimized.config.js

echo [INFO] Optimized PM2 configuration created: ecosystem-optimized.config.js
echo.

REM Step 3: Create logs directory
echo [STEP 3] Setting up Logging
echo ================================
if not exist logs mkdir logs
echo [INFO] Logs directory created
echo.

REM Step 4: System Optimization
echo [STEP 4] System Performance Tips
echo ================================
echo [INFO] System optimization recommendations:
echo.
echo [DATABASE OPTIMIZATION]
echo 1. Run MySQL optimization script: mysql -u root -p ^< mysql_optimize.sql
echo 2. Add indexes to frequently queried columns
echo 3. Use connection pooling (already configured)
echo 4. Enable query caching
echo.
echo [NODE.JS OPTIMIZATION]
echo 1. Use cluster mode for multiple CPU cores
echo 2. Memory limits set to prevent crashes
echo 3. Auto-restart on failures
echo 4. Logging for monitoring
echo.
echo [FRONTEND OPTIMIZATION]
echo 1. Production build with minification
echo 2. Static file compression
echo 3. CDN for static assets (optional)
echo 4. Browser caching enabled
echo.
echo [SYSTEM OPTIMIZATION]
echo 1. Increase Windows page file size
echo 2. Disable unnecessary Windows services
echo 3. Use SSD for database storage
echo 4. Regular system maintenance
echo.

REM Step 5: Create monitoring script
echo [STEP 5] Creating Performance Monitoring
echo ================================
(
echo @echo off
echo REM 📊 Performance Monitoring Script
echo echo.
echo echo ================================
echo echo Performance Monitor
echo echo ================================
echo echo.
echo echo [SYSTEM RESOURCES]
echo echo CPU Usage: 
echo wmic cpu get loadpercentage /value
echo echo.
echo echo Memory Usage:
echo wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
echo echo.
echo echo [PM2 STATUS]
echo pm2 status
echo echo.
echo echo [PM2 MONITORING]
echo pm2 monit
echo echo.
echo pause
) > monitor-performance.bat

echo [INFO] Performance monitoring script created: monitor-performance.bat
echo.

echo ================================
echo ✅ Performance Optimization Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Run: start-production.bat
echo 2. Apply MySQL optimizations: mysql -u root -p ^< mysql_optimize.sql
echo 3. Monitor performance: monitor-performance.bat
echo 4. Check logs in ./logs/ directory
echo.
echo [PERFORMANCE MONITORING]
echo - Use: pm2 monit
echo - View logs: pm2 logs
echo - System resources: monitor-performance.bat
echo.
pause 