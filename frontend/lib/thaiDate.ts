// Thai Buddhist Era Date Utilities
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// แปลงปี ค.ศ. เป็น พ.ศ.
export const convertToBuddhistYear = (year: number): number => {
  return year + 543;
};

// แปลงปี พ.ศ. เป็น ค.ศ.
export const convertToChristianYear = (buddhistYear: number): number => {
  return buddhistYear - 543;
};

// Format วันที่แบบไทย (พ.ศ.) - แสดงเฉพาะปี พ.ศ.
export const formatThaiDate = (date: Date, formatString?: string): string => {
  const day = date.getDate();
  const month = format(date, 'MMMM', { locale: th });
  const year = convertToBuddhistYear(date.getFullYear());
  
  if (formatString === 'short') {
    return `${day}/${date.getMonth() + 1}/${year}`;
  }
  
  if (formatString === 'medium') {
    const shortMonth = format(date, 'MMM', { locale: th });
    return `${day} ${shortMonth} ${year}`;
  }
  
  return `${day} ${month} ${year}`;
};

// Format วันที่สำหรับ calendar display (แสดงเฉพาะเดือน/ปี พ.ศ.)
export const formatThaiMonthYear = (date: Date): string => {
  const month = format(date, 'MMMM', { locale: th });
  const year = convertToBuddhistYear(date.getFullYear());
  return `${month} ${year}`;
};

// Format เฉพาะปี พ.ศ.
export const formatThaiYear = (date: Date): string => {
  return convertToBuddhistYear(date.getFullYear()).toString();
};

// Format สำหรับ display ใน button
export const formatThaiDateDisplay = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = format(date, 'MMM', { locale: th });
  const year = convertToBuddhistYear(date.getFullYear());
  return `${day} ${month} ${year}`;
};

// Parse วันที่จาก string (รองรับทั้ง ค.ศ. และ พ.ศ.)
export const parseThaiDate = (dateString: string): Date | null => {
  try {
    // ถ้าเป็น YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString + 'T00:00:00');
    }
    
    // ถ้าเป็นรูปแบบอื่น
    return new Date(dateString);
  } catch {
    return null;
  }
};

// ตรวจสอบว่าเป็นวันนี้หรือไม่
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// ตรวจสอบว่าเป็นพรุ่งนี้หรือไม่
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

// สร้างรายการวันที่สำหรับ quick select
export const getQuickDateOptions = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return [
    {
      label: 'วันนี้',
      date: today,
      description: formatThaiDateDisplay(today)
    },
    {
      label: 'พรุ่งนี้',
      date: tomorrow,
      description: formatThaiDateDisplay(tomorrow)
    },
    {
      label: 'สัปดาหน์หน้า',
      date: nextWeek,
      description: formatThaiDateDisplay(nextWeek)
    }
  ];
};
