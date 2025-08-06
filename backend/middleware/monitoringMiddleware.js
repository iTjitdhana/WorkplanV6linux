const systemMonitor = require('../monitoring');

// Middleware สำหรับติดตาม requests
const requestMonitor = (req, res, next) => {
  // เพิ่มสถิติ request
  systemMonitor.incrementRequests();
  
  // เก็บเวลาที่เริ่ม request
  req.startTime = Date.now();
  
  // เก็บ original send function
  const originalSend = res.send;
  
  // Override send function เพื่อติดตาม response
  res.send = function(data) {
    // คำนวณเวลาที่ใช้
    const duration = Date.now() - req.startTime;
    
    // ตรวจสอบ error status
    if (res.statusCode >= 400) {
      systemMonitor.incrementErrors();
    }
    
    // Log request details
    console.log(`📊 Request: ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    
    // เรียก original send function
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware สำหรับติดตาม errors
const errorMonitor = (err, req, res, next) => {
  // เพิ่มสถิติ error
  systemMonitor.incrementErrors();
  
  // สร้าง alert สำหรับ error
  systemMonitor.createAlert('API_ERROR', `${req.method} ${req.path}: ${err.message}`);
  
  console.error('❌ API Error:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack
  });
  
  next(err);
};

// Middleware สำหรับติดตาม active users
const activeUserMonitor = (req, res, next) => {
  // ตัวอย่างการติดตาม active users (ในระบบจริงอาจใช้ WebSocket)
  // สำหรับตอนนี้จะใช้ session หรือ IP address
  
  // อัปเดตจำนวน active users (ตัวอย่าง)
  const activeUsers = Math.floor(Math.random() * 10) + 1; // จำลองข้อมูล
  systemMonitor.updateActiveUsers(activeUsers);
  
  next();
};

module.exports = {
  requestMonitor,
  errorMonitor,
  activeUserMonitor
}; 