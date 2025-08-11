# SearchBox Component

## 📋 Overview

SearchBox เป็น React component ที่ใช้สำหรับการค้นหาแบบ autocomplete พร้อมกับ cache และ error handling ที่ครบถ้วน

## 🚀 Features

- **Autocomplete Search**: ค้นหาจาก API พร้อม cache
- **Debouncing & Throttling**: ป้องกันการเรียก API บ่อยเกินไป
- **Error Handling**: จัดการ error และแสดงข้อความแจ้งเตือน
- **Keyboard Navigation**: รองรับการใช้งานด้วย keyboard
- **Add New Item**: สามารถเพิ่มรายการใหม่ได้
- **Loading State**: แสดงสถานะกำลังค้นหา
- **Accessibility**: รองรับ screen reader และ keyboard navigation

## 📦 Installation

```typescript
import { SearchBox, SearchOption } from './components/SearchBox';
```

## 🔧 Props

```typescript
interface SearchBoxProps {
  value: string;                                    // ค่าปัจจุบันใน input
  onChange: (value: string) => void;               // callback เมื่อค่าเปลี่ยน
  onSelect: (item: SearchOption) => void;          // callback เมื่อเลือกตัวเลือก
  cacheRef: React.MutableRefObject<Map<string, SearchOption[]>>; // cache reference
  placeholder?: string;                            // placeholder text (default: "ค้นหา...")
  showAvatar?: boolean;                            // แสดง avatar หรือไม่ (default: false)
  onError?: (error: string) => void;               // callback เมื่อเกิด error
}
```

## 📝 Types

```typescript
export type SearchOption = {
  job_code: string;      // รหัสงาน
  job_name: string;      // ชื่องาน
  category?: string;     // หมวดหมู่ (optional)
  iconUrl?: string;      // URL รูปภาพ (optional)
};
```

## 💻 Usage

### Basic Usage

```typescript
import { useRef, useState } from 'react';
import { SearchBox, SearchOption } from './components/SearchBox';

function MyComponent() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<SearchOption | null>(null);
  const searchCacheRef = useRef<Map<string, SearchOption[]>>(new Map());

  const handleSelect = (item: SearchOption) => {
    setSelectedItem(item);
    console.log('Selected:', item);
  };

  const handleError = (error: string) => {
    console.error('Search error:', error);
  };

  return (
    <SearchBox
      value={searchValue}
      onChange={setSearchValue}
      onSelect={handleSelect}
      cacheRef={searchCacheRef}
      placeholder="ค้นหางาน..."
      onError={handleError}
    />
  );
}
```

### With Error Handling

```typescript
function MyComponent() {
  const [searchValue, setSearchValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = (error: string) => {
    setErrorMessage(error);
    // แสดง toast หรือ notification
  };

  return (
    <div>
      <SearchBox
        value={searchValue}
        onChange={setSearchValue}
        onSelect={handleSelect}
        cacheRef={searchCacheRef}
        onError={handleError}
      />
      {errorMessage && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
    </div>
  );
}
```

## 🔄 API Integration

### Required API Endpoint

SearchBox ต้องการ API endpoint ที่ `/api/process-steps/search`:

```typescript
// GET /api/process-steps/search?query=searchTerm
// Response:
{
  success: boolean;
  data: SearchOption[];
  message?: string;
}
```

### Example API Response

```json
{
  "success": true,
  "data": [
    {
      "job_code": "JOB001",
      "job_name": "งานผลิตชิ้นส่วน A",
      "category": "production",
      "iconUrl": "/icons/production.png"
    },
    {
      "job_code": "JOB002", 
      "job_name": "งานประกอบชิ้นส่วน B",
      "category": "assembly"
    }
  ]
}
```

## 🎯 Performance Features

### Caching
- ใช้ `Map` เก็บผลลัพธ์การค้นหา
- ลดการเรียก API ซ้ำ
- Cache ถูกเก็บใน `cacheRef` ที่ส่งมาจาก parent

### Debouncing
- รอ 150ms หลังผู้ใช้หยุดพิมพ์
- ป้องกันการเรียก API บ่อยเกินไป

### Throttling
- จำกัดการเรียก API ไม่เกิน 100ms ต่อครั้ง
- ป้องกัน API rate limiting

### Abort Controller
- ยกเลิก API calls ที่ไม่จำเป็น
- ป้องกัน race condition

## ⌨️ Keyboard Navigation

- **Arrow Down**: เลื่อนลงในรายการ
- **Arrow Up**: เลื่อนขึ้นในรายการ
- **Enter**: เลือกตัวเลือกที่ไฮไลท์
- **Tab**: เลือกตัวเลือกที่ไฮไลท์
- **Escape**: ปิด dropdown และเคลียร์ error

## 🎨 Styling

### Default Classes
```css
/* Input */
.w-full.pl-8.pr-3.py-2.border.rounded.shadow-sm.focus:ring-2.focus:ring-green-500

/* Error State */
.border-red-500.focus:ring-red-500

/* Dropdown */
.absolute.z-10.mt-1.w-full.bg-white.border.rounded.shadow.max-h-60.overflow-y-auto

/* Option Hover */
.hover:bg-green-100

/* Selected Option */
.bg-green-200
```

### Custom Styling
สามารถ override classes ได้โดยใช้ Tailwind CSS หรือ CSS modules

## 🧪 Testing

```bash
# Run tests
npm test SearchBox.test.tsx

# Run tests with coverage
npm test -- --coverage SearchBox.test.tsx
```

### Test Coverage
- ✅ Rendering
- ✅ User interactions
- ✅ API calls
- ✅ Error handling
- ✅ Keyboard navigation
- ✅ Cache functionality

## 🐛 Error Handling

### Error Types
1. **Network Error**: การเชื่อมต่อล้มเหลว
2. **API Error**: Server error (4xx, 5xx)
3. **Validation Error**: ข้อมูลไม่ถูกต้อง

### Error Display
- แสดง error message ใน dropdown
- แสดง error icon ใน input
- เปลี่ยน border color เป็นสีแดง
- มีปุ่ม "ลองใหม่" สำหรับ retry

## 🔧 Customization

### Custom Placeholder
```typescript
<SearchBox
  placeholder="ค้นหาผู้ใช้..."
  // ... other props
/>
```

### Show Avatar
```typescript
<SearchBox
  showAvatar={true}
  // ... other props
/>
```

### Custom Error Handler
```typescript
<SearchBox
  onError={(error) => {
    // Custom error handling
    showToast(error);
    logError(error);
  }}
  // ... other props
/>
```

## 📚 Examples

### Complete Example
```typescript
import React, { useRef, useState } from 'react';
import { SearchBox, SearchOption } from './components/SearchBox';

export default function JobSearchForm() {
  const [jobQuery, setJobQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<SearchOption | null>(null);
  const searchCacheRef = useRef<Map<string, SearchOption[]>>(new Map());

  const handleJobSelect = (job: SearchOption) => {
    setSelectedJob(job);
    setJobQuery(job.job_name);
  };

  const handleSearchError = (error: string) => {
    console.error('Job search error:', error);
    // แสดง notification หรือ toast
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        เลือกงานผลิต
      </label>
      
      <SearchBox
        value={jobQuery}
        onChange={setJobQuery}
        onSelect={handleJobSelect}
        cacheRef={searchCacheRef}
        placeholder="พิมพ์ชื่องานหรือรหัสงาน..."
        onError={handleSearchError}
      />
      
      {selectedJob && (
        <div className="p-3 bg-green-50 rounded border">
          <p className="text-sm">
            <strong>งานที่เลือก:</strong> {selectedJob.job_name}
          </p>
          <p className="text-xs text-gray-600">
            รหัส: {selectedJob.job_code}
          </p>
        </div>
      )}
    </div>
  );
}
```

## 🤝 Contributing

เมื่อแก้ไข SearchBox component:

1. อัปเดต TypeScript types ถ้าจำเป็น
2. เพิ่ม tests สำหรับฟีเจอร์ใหม่
3. อัปเดต documentation
4. ทดสอบกับ keyboard navigation
5. ทดสอบ error scenarios

## 📄 License

MIT License - ใช้ได้อย่างอิสระ
