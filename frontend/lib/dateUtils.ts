/**
 * Date Utility Functions
 * ฟังก์ชันจัดการวันที่แบบรวมศูนย์
 */

// ฟังก์ชันสำหรับสร้าง Date object ที่ปลอดภัยจาก timezone issues
export const createSafeDate = (dateString: string) => {
  if (!dateString) return null;
  
  // ถ้าเป็นรูปแบบ YYYY-MM-DD ให้สร้าง Date object แบบ local timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return isNaN(date.getTime()) ? null : date;
  }
  // ถ้าเป็นรูปแบบอื่น ให้ใช้ new Date() ปกติ
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// ฟังก์ชันสำหรับแสดงผลวันที่
export const formatDateForDisplay = (date: Date | string | null, format: 'short' | 'full' | 'thai' = 'short') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '-';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
      });
    case 'full':
      return dateObj.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    case 'thai':
      return dateObj.toLocaleDateString("th-TH", {
        weekday: 'long',
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    default:
      return dateObj.toLocaleDateString("th-TH");
  }
};

// ฟังก์ชันสำหรับส่งข้อมูลไป API (YYYY-MM-DD) - แก้ไข timezone issue
export const formatDateForAPI = (date: Date | string | null) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '';
  
  // ใช้ local timezone แทน UTC เพื่อหลีกเลี่ยง timezone offset
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// ฟังก์ชันสำหรับ Google Sheet
export const formatDateForGoogleSheet = (date: Date | string | null) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '';
  
  return dateObj.toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// ฟังก์ชันสำหรับค่าในฟอร์ม (DD/MM/YYYY)
export const formatDateForValue = (date: Date | string | null) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '';
  
  return dateObj.toLocaleDateString('th-TH');
};

// ฟังก์ชันสำหรับแสดงผลวันที่แบบย่อ (DD/MM)
export const formatDateShort = (date: Date | string | null) => {
  return formatDateForDisplay(date, 'short');
};

// ฟังก์ชันสำหรับแสดงผลวันที่แบบเต็ม
export const formatDateFull = (date: Date | string | null) => {
  return formatDateForDisplay(date, 'full');
};

// ฟังก์ชันสำหรับแสดงผลวันที่แบบไทย
export const formatDateThai = (date: Date | string | null) => {
  return formatDateForDisplay(date, 'thai');
};

// ฟังก์ชันสำหรับแสดงผลวันที่และเวลา
export const formatDateTime = (date: Date | string | null) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '-';
  
  return dateObj.toLocaleString('th-TH', {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

// ฟังก์ชันสำหรับแสดงผลเวลา
export const formatTime = (date: Date | string | null) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '-';
  
  return dateObj.toLocaleTimeString('th-TH', {
    hour: "2-digit",
    minute: "2-digit"
  });
};

// ฟังก์ชันสำหรับตรวจสอบว่าเป็นวันปัจจุบันหรือไม่
export const isToday = (date: Date | string | null) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return false;
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// ฟังก์ชันสำหรับแปลงรูปแบบ DD/MM/YYYY เป็น YYYY-MM-DD
export const parseDateDDMMYYYY = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateString;
};

// ฟังก์ชันสำหรับแปลงรูปแบบ YYYY-MM-DD เป็น DD/MM/YYYY
export const parseDateYYYYMMDD = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

// ฟังก์ชันสำหรับสร้างช่วงวันที่ของสัปดาห์
export const getWeekDates = (date: Date) => {
  const week = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
};

// ฟังก์ชันสำหรับชื่อวันในสัปดาห์
export const getDayName = (date: Date) => {
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"];
  return days[date.getDay()];
}; 

// ฟังก์ชันสำหรับแสดงผลวันที่แบบย่อแบบไทย (DD ส.ค. YYYY)
export const formatDateThaiShort = (date: Date | string | null) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
  if (!dateObj) return '-';
  
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
  
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  return `${day} ${monthNames[month]} ${year}`;
}; 