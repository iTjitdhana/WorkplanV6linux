/**
 * Backend Date Utility Functions
 * ฟังก์ชันจัดการวันที่สำหรับ backend
 */

// ฟังก์ชันสำหรับแปลงวันที่ให้เป็นรูปแบบที่ปลอดภัยสำหรับฐานข้อมูล
const formatDateForDatabase = (date) => {
  if (!date) return null;
  
  // ถ้าเป็น Date object
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // ถ้าเป็น string
  if (typeof date === 'string') {
    // ถ้าเป็นรูปแบบ YYYY-MM-DD อยู่แล้ว
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // ถ้ามี T (ISO string) ให้เอาเฉพาะส่วนวันที่
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    
    // ถ้าเป็นรูปแบบอื่น ให้ลองแปลงเป็น Date object
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }
  
  return null;
};

// ฟังก์ชันสำหรับสร้าง Date object ที่ปลอดภัยจาก timezone issues
const createSafeDate = (dateString) => {
  if (!dateString) return null;
  
  // ถ้าเป็นรูปแบบ YYYY-MM-DD ให้สร้าง Date object แบบ local timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }
  
  // ถ้าเป็นรูปแบบอื่น ให้ใช้ new Date() ปกติ
  return new Date(dateString);
};

module.exports = {
  formatDateForDatabase,
  createSafeDate
}; 