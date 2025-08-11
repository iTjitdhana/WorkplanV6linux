// components/SearchBox.tsx (Professional Version)
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, AlertCircle } from "lucide-react";

export type SearchOption = {
  job_code: string;
  job_name: string;
  category?: string;
  iconUrl?: string;
};

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: SearchOption) => void;
  cacheRef: React.MutableRefObject<Map<string, SearchOption[]>>;
  placeholder?: string;
  showAvatar?: boolean;
  onError?: (error: string) => void; // เพิ่ม error callback
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Throttle function เพื่อป้องกันการเรียก API บ่อยเกินไป
function useThrottle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecutedRef = useRef(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastExecutedRef.current > delay) {
      func(...args);
      lastExecutedRef.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
        lastExecutedRef.current = Date.now();
      }, delay - (now - lastExecutedRef.current));
    }
  }, [func, delay]) as T;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  onSelect,
  cacheRef,
  placeholder = "ค้นหา...",
  showAvatar = false,
  onError
}) => {
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null); // เพิ่ม error state
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const justSelectedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ลด debounce delay จาก 200ms เป็น 150ms เพื่อการตอบสนองที่เร็วขึ้น
  const debouncedValue = useDebounce(value, 150);

  // ฟังก์ชันสำหรับการค้นหาแบบ throttled
  const performSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) return;

    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      setError(null); // เคลียร์ error เมื่อเริ่มค้นหาใหม่

      const response = await fetch(
        `/api/process-steps/search?query=${encodeURIComponent(searchTerm)}`,
        { signal: controller.signal }
      );
      
      if (!response.ok) {
        const errorMessage = `การค้นหาล้มเหลว (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const results = data.data || [];
      
      // ตรวจสอบว่า search term ยังคงเหมือนเดิม (ป้องกัน race condition)
      if (searchTerm === debouncedValue) {
        cacheRef.current.set(searchTerm.toLowerCase(), results);
        setOptions(results.slice(0, 20));
        setShowDropdown(true);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Search error:", err);
        const errorMessage = err.message || "เกิดข้อผิดพลาดในการค้นหา";
        setError(errorMessage);
        
        // เรียก error callback ถ้ามี
        if (onError) {
          onError(errorMessage);
        }
      }
    } finally {
      setIsSearching(false);
    }
  }, [debouncedValue, cacheRef, onError]);

  // ใช้ throttle สำหรับการค้นหา
  const throttledSearch = useThrottle(performSearch, 100);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (!debouncedValue.trim()) {
      setOptions([]);
      setShowDropdown(false);
      setError(null); // เคลียร์ error เมื่อไม่มีข้อความ
      return;
    }

    const term = debouncedValue.trim().toLowerCase();
    
    // ค้นหาใน cache ก่อน
    const cachedResults = cacheRef.current.get(term);
    if (cachedResults && cachedResults.length > 0) {
      setOptions(cachedResults.slice(0, 20));
      setShowDropdown(true);
      setError(null); // เคลียร์ error เมื่อพบผลลัพธ์ใน cache
      return;
    }

    // ค้นหาใน cache ทั้งหมด
    const all = Array.from(cacheRef.current.values()).flat();
    const seen = new Set();
    const localResults = all.filter(item => {
      const match = item.job_name.toLowerCase().includes(term) || 
                   item.job_code.toLowerCase().includes(term);
      const key = `${item.job_code}|${item.job_name}`;
      if (!match || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (localResults.length > 0) {
      setOptions(localResults.slice(0, 20));
      setShowDropdown(true);
      setError(null); // เคลียร์ error เมื่อพบผลลัพธ์ใน cache
      return;
    }

    // เรียก API ถ้าไม่พบใน cache และมีข้อความอย่างน้อย 2 ตัวอักษร
    if (debouncedValue.length >= 2) {
      throttledSearch(debouncedValue);
      // แสดง dropdown ทันทีเพื่อให้เห็น "กำลังค้นหา..."
      setShowDropdown(true);
    } else {
      // แสดง dropdown แม้ไม่มีผลลัพธ์ เพื่อให้แสดงปุ่มเพิ่มรายการใหม่
      setShowDropdown(true);
    }
  }, [debouncedValue, throttledSearch]);

  // ตรวจสอบว่าควรแสดงปุ่มเพิ่มรายการใหม่หรือไม่
  // แสดงเมื่อมีข้อความ, ไม่กำลังค้นหา, และไม่มี exact match ในผลลัพธ์
  const showAddNew = value.trim().length > 0 && 
                    !isSearching && 
                    !error && // ไม่แสดงปุ่มเพิ่มใหม่เมื่อมี error
                    !options.some(option => 
                      option.job_name.toLowerCase() === value.trim().toLowerCase() ||
                      option.job_code.toLowerCase() === value.trim().toLowerCase()
                    );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(prev => {
        const max = showAddNew ? options.length : options.length - 1;
        return Math.min(prev + 1, max);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        selectOption(options[highlightIndex]);
      } else if (showAddNew && highlightIndex === options.length) {
        handleAddNew();
      }
    } else if (e.key === "Tab") {
      if (showAddNew && highlightIndex === options.length) {
        e.preventDefault();
        handleAddNew();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      setError(null); // เคลียร์ error เมื่อกด Escape
    }
  }, [highlightIndex, options.length, showAddNew]);

  const selectOption = useCallback((item: SearchOption) => {
    onSelect(item);
    justSelectedRef.current = true;
    setShowDropdown(false);
    setOptions([]);
    setHighlightIndex(-1);
    setError(null); // เคลียร์ error เมื่อเลือกตัวเลือก
  }, [onSelect]);

  const handleAddNew = useCallback(() => {
    selectOption({ job_code: "NEW", job_name: value.trim() });
  }, [selectOption, value]);

  // ฟังก์ชันสำหรับจัดการการคลิกที่รองรับ hardware หลายประเภท
  const handleOptionClick = useCallback((item: SearchOption, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    selectOption(item);
  }, [selectOption]);

  // ฟังก์ชันสำหรับจัดการการคลิกปุ่มเพิ่มรายการใหม่
  const handleAddNewClick = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleAddNew();
  }, [handleAddNew]);

  // ฟังก์ชันสำหรับจัดการการกด Enter บนรายการ
  const handleOptionKeyDown = useCallback((item: SearchOption, event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(item);
    }
  }, [selectOption]);

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่า input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setHighlightIndex(-1);
    setError(null); // เคลียร์ error เมื่อผู้ใช้พิมพ์ใหม่
    
    // แสดง dropdown ทันทีเมื่อมีข้อความ
    if (e.target.value.trim().length > 0) {
      setShowDropdown(true);
    }
  }, [onChange]);

  // ฟังก์ชันสำหรับ retry การค้นหา
  const handleRetry = useCallback(() => {
    setError(null);
    if (debouncedValue.trim().length >= 2) {
      performSearch(debouncedValue);
    }
  }, [debouncedValue, performSearch]);

  // Cleanup เมื่อ component unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={() => { 
            if (value.trim().length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-8 pr-3 py-2 border rounded shadow-sm focus:ring-2 focus:ring-green-500 ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          autoComplete="off"
          spellCheck="false"
        />
        {error && (
          <AlertCircle className="absolute right-2 w-4 h-4 text-red-500" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-2 text-gray-500">🔍 กำลังค้นหา...</div>
          ) : error ? (
            <div className="p-2">
              <div className="text-red-600 text-sm mb-2">❌ {error}</div>
              <button
                onClick={handleRetry}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              {options.length === 0 ? (
                <div className="p-2 text-gray-400">ไม่พบผลลัพธ์</div>
              ) : (
                options.map((item, i) => (
                  <div
                    key={item.job_code}
                    onClick={(e) => handleOptionClick(item, e)}
                    onMouseDown={(e) => handleOptionClick(item, e)}
                    onTouchEnd={(e) => handleOptionClick(item, e)}
                    onKeyDown={(e) => handleOptionKeyDown(item, e)}
                    className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-green-100 ${i === highlightIndex ? "bg-green-200" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`เลือก ${item.job_name}`}
                  >
                    {showAvatar && (
                      <img
                        src={item.iconUrl || `/placeholder.svg?text=${item.job_name.charAt(0)}`}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{item.job_name}</span>
                      <span className="text-xs text-gray-500">{item.job_code} {item.category ? `• ${item.category}` : ""}</span>
                    </div>
                  </div>
                ))
              )}
              
              {showAddNew && (
                <div
                  className={`p-2 cursor-pointer text-green-700 hover:bg-green-100 font-semibold ${highlightIndex === options.length ? "bg-green-200" : ""}`}
                  onClick={handleAddNewClick}
                  onMouseDown={handleAddNewClick}
                  onTouchEnd={handleAddNewClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAddNew();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`เพิ่มรายการใหม่ "${value.trim()}"`}
                >
                  ➕ เพิ่มรายการใหม่ "{value.trim()}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
