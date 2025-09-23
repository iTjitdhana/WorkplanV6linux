// Response Size Monitoring Middleware
const responseMonitoring = (req, res, next) => {
  const originalSend = res.send;
  const startTime = Date.now();
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const responseSize = Buffer.byteLength(data, 'utf8');
    
    // Log performance metrics สำหรับ API calls
    if (req.url.startsWith('/api/')) {
      console.log(`📊 API Performance: ${req.method} ${req.url}`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Response Size: ${(responseSize / 1024).toFixed(2)}KB`);
      console.log(`   Compression: ${req.headers['accept-encoding']?.includes('gzip') ? 'Enabled' : 'Disabled'}`);
      
      // เตือนถ้า response ใหญ่เกินไป
      if (responseSize > 1024 * 1024) { // > 1MB
        console.warn(`⚠️ Large Response: ${(responseSize / 1024 / 1024).toFixed(2)}MB for ${req.url}`);
      }
      
      // เตือนถ้า response ช้าเกินไป
      if (responseTime > 1000) { // > 1 second
        console.warn(`⚠️ Slow Response: ${responseTime}ms for ${req.url}`);
      }
    }
    
    // เพิ่ม performance headers
    res.set({
      'X-Response-Time': `${responseTime}ms`,
      'X-Response-Size': `${responseSize}`,
      'X-Compression': req.headers['accept-encoding']?.includes('gzip') ? 'gzip' : 'none'
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = responseMonitoring;




