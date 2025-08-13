"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  Edit,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  User as UserIcon,
  XCircle,
  BarChart3,
  ChevronDown as ChevronDownIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Noto_Sans_Thai } from "next/font/google"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SearchBox, SearchOption } from "./components/SearchBox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createSafeDate, formatDateForDisplay, formatDateForAPI, formatDateThaiShort } from "@/lib/dateUtils";
import { config, debugLog, debugError } from "@/lib/config";
import { api, handleApiError, createAbortController } from "@/lib/api";
import { getOperatorsArray, getOperatorsString } from "@/lib/utils";
import type { 
  User, 
  Machine, 
  ProductionRoom, 
  ProductionItem, 
  ProductionLog, 
  DraftWorkPlan,
  JobOption 
} from "@/types/production";
import Link from "next/link";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
})

// ===== ฟังก์ชันช่วยเช็ค prefix เลขงาน (ต้องอยู่บนสุดของไฟล์) =====
const hasJobNumberPrefix = (name: string) => /^([A-D]|\d+)\s/.test(name);

export default function MedicalAppointmentDashboard() {
  // Helper function for API URL - ใช้ config
  const getApiUrl = (endpoint: string) => {
    return config.api.baseUrl + endpoint;
  };

  // เปลี่ยน default selectedDate เป็นวันที่ปัจจุบัน (dynamic)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [searchTerm, setSearchTerm] = useState("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily")
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)
  const [selectedWeekDay, setSelectedWeekDay] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // เพิ่ม state สำหรับฟอร์ม
  const [operators, setOperators] = useState(["", "", "", ""]); // 4 ตำแหน่ง
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // เพิ่ม state สำหรับ dropdown และ autocomplete
  const [jobQuery, setJobQuery] = useState("");
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [jobCode, setJobCode] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [rooms, setRooms] = useState<ProductionRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const jobInputRef = useRef<HTMLInputElement>(null);
  const [jobName, setJobName] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const justSelectedFromDropdownRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showWorkerDetails, setShowWorkerDetails] = useState(false); // เพิ่ม state สำหรับเปิด/ปิดรายละเอียด
  const [showTimeTable, setShowTimeTable] = useState(false); // เพิ่ม state สำหรับเปิด/ปิด Time Table Popup (default ปิด)
  const [syncModeEnabled, setSyncModeEnabled] = useState(false); // เพิ่ม state สำหรับ sync mode
  
  // เพิ่ม cache สำหรับผลลัพธ์การค้นหา
  const searchCacheRef = useRef<Map<string, SearchOption[]>>(new Map());
  const [isSearching, setIsSearching] = useState(false);

  const isCreatingRef = useRef(false); // <--- ย้ายมาอยู่นอก useEffect

  // ใช้ useDebounce หลังจากประกาศ jobQuery แล้ว
  const debouncedJobQuery = useDebounce(jobQuery, 200); // 200ms debounce

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในช่องหมายเหตุ
  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  }, []);

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในช่องหมายเหตุของ edit dialog
  const handleEditNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditNote(e.target.value);
  }, []);

  // Debounced handlers สำหรับช่องหมายเหตุ
  const debouncedNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // ใช้ setTimeout เพื่อ debounce การอัพเดท state
    setTimeout(() => {
      setNote(value);
    }, 0);
  }, []);

  const debouncedEditNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // ใช้ setTimeout เพื่อ debounce การอัพเดท state
    setTimeout(() => {
      setEditNote(value);
    }, 0);
  }, []);

  // ฟังก์ชันสร้าง array ของเวลา 08:00-18:00 ทีละ 15 นาที
  const generateTimeOptions = (start = "08:00", end = "18:00", step = 15) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const result = [];
    let [h, m] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    while (h < endH || (h === endH && m <= endM)) {
      result.push(`${pad(h)}:${pad(m)}`);
      m += step;
      if (m >= 60) { h++; m = m - 60; }
    }
    console.log('⏰ Generated time options:', result);
    return result;
  };
  const timeOptions = generateTimeOptions();

  // set วันปัจจุบันเมื่อเข้าเว็บ
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;
    debugLog('📅 Setting initial selectedDate:', todayString);
    setSelectedDate(todayString);
  }, []);

  // state สำหรับข้อมูลแผนผลิตจริง
  const [productionData, setProductionData] = useState<ProductionItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // ดึงข้อมูลแผนผลิตจริงและแบบร่างมารวมกัน
  useEffect(() => {
      loadAllProductionData();
  }, []);

  // Fetch dropdown data on mount
  useEffect(() => {
    console.log('🔍 Fetching dropdown data...');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    // Fetch users
    fetch(`/api/users`)
      .then(res => {
        console.log('Users API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Users data:', data);
        setUsers(data.data || []);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setUsers([]);
      });
    
    // Fetch machines
    fetch(`/api/machines`)
      .then(res => {
        console.log('Machines API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Machines data:', data);
        setMachines(data.data || []);
      })
      .catch(err => {
        console.error('Error fetching machines:', err);
        setMachines([]);
      });
    
    // Fetch production rooms
    fetch(`/api/production-rooms`)
      .then(res => {
        console.log('Rooms API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Rooms data:', data);
        setRooms(data.data || []);
      })
      .catch(err => {
        console.error('Error fetching rooms:', err);
        setRooms([]);
      });
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('👥 Users state updated:', users);
    console.log('⏰ Time options state updated:', timeOptions);
  }, [users, timeOptions]);

  // Autocomplete job name/code - ใช้ local search แทน API เพื่อความเร็ว
  useEffect(() => {
  if (justSelectedFromDropdownRef.current) {
    justSelectedFromDropdownRef.current = false;
    return;
  }

  if (debouncedJobQuery.length < 1) {
    setShowJobDropdown(false);
    setJobOptions([]);
    setIsSearching(false);
    return;
  }

  setIsSearching(false);

  const searchTerm = debouncedJobQuery.toLowerCase().trim();
  const allCachedResults: { job_code: string; job_name: string }[] = [];

  for (const results of searchCacheRef.current.values()) {
    allCachedResults.push(...results);
  }

  const filteredResults = allCachedResults.filter(
    (item) =>
      item.job_name.toLowerCase().includes(searchTerm) ||
      item.job_code.toLowerCase().includes(searchTerm)
  );

  const uniqueResults = filteredResults.filter((item, index, self) =>
    index === self.findIndex((t) =>
      t.job_code === item.job_code && t.job_name === item.job_name
    )
  );

  setJobOptions(uniqueResults);
  setShowJobDropdown(uniqueResults.length > 0);

  if (uniqueResults.length === 0 && debouncedJobQuery.length >= 2) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      abortControllerRef.current = new AbortController();

             fetch(`/api/process-steps/search?query=${encodeURIComponent(debouncedJobQuery)}`, {
        signal: abortControllerRef.current.signal
      })
        .then(res => res.json())
        .then(data => {
          const results = data.data || [];
          const cacheKey = debouncedJobQuery.toLowerCase().trim();
          searchCacheRef.current.set(cacheKey, results);
          if (searchCacheRef.current.size > 50) {
            const firstKey = searchCacheRef.current.keys().next().value;
            if (firstKey) {
            searchCacheRef.current.delete(firstKey);
            }
          }
          setJobOptions(results);
          setShowJobDropdown(true);
          setIsSearching(false);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Error fetching job options:', err);
            setJobOptions([]);
            setShowJobDropdown(false);
          }
          setIsSearching(false);
        });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }
}, [debouncedJobQuery]);

  // ฟังก์ชันสร้าง job_code ใหม่ (เลขงานอัตโนมัติ)
  const handleAddNewJob = () => {
    // หาเลขงานที่ยังไม่ซ้ำ (เริ่มจาก 1)
    let jobNumber = 1;
    const allCodes = jobOptions.map(j => j.job_code.toLowerCase());
    
    // หาเลขงานที่ยังไม่ซ้ำ
    while (allCodes.includes(jobNumber.toString())) {
      jobNumber++;
    }
    
    // สร้าง job_code เป็นเลขงาน
    const newJobCode = jobNumber.toString();
    setJobCode(newJobCode);
    setJobName(jobQuery);
    setShowJobDropdown(false);
  };

  // Helper functions for week navigation
  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    // เพิ่มเฉพาะ 6 วัน (จันทร์-เสาร์) ไม่รวมอาทิตย์
    for (let i = 0; i < 6; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
    setSelectedWeekDay(null) // Reset selected day when navigating weeks
  }





  const formatDateForGoogleSheet = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
    if (!dateObj) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('th-TH', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateForValue = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? createSafeDate(date) : date;
    if (!dateObj) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('th-TH'); // DD/MM/YYYY
  };

  const formatDate = (date: Date) => {
    return formatDateForDisplay(date, 'short');
  }

  const formatFullDate = (date: Date) => {
    return formatDateForDisplay(date, 'full');
  }

  const formatProductionDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getDayName = (date: Date) => {
    const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"]
    return days[date.getDay()]
  }

  // เพิ่มฟังก์ชันสำหรับสีของแต่ละวัน
  const getDayBackgroundColor = (date: Date) => {
    const dayIndex = date.getDay() // 0 = อาทิตย์, 1 = จันทร์, ...
    const colors = [
      "bg-red-100 border-red-200", // อาทิตย์ - สีแดง
      "bg-yellow-100 border-yellow-200", // จันทร์ - สีเหลือง
      "bg-pink-100 border-pink-200", // อังคาร - สีชมพู
      "bg-emerald-200 border-emerald-300", // พุธ - สีเขียวเข้ม
      "bg-orange-100 border-orange-200", // พฤหัสบดี - สีส้ม
      "bg-blue-100 border-blue-200", // ศุกร์ - สีฟ้า
      "bg-purple-100 border-purple-200", // เสาร์ - สีม่วง
    ]
    return colors[dayIndex]
  }

  const getDayTextColor = (date: Date) => {
    const dayIndex = date.getDay()
    const colors = [
      "text-red-800", // อาทิตย์
      "text-yellow-800", // จันทร์
      "text-pink-800", // อังคาร
      "text-emerald-900", // พุธ - สีเขียวเข้ม
      "text-orange-800", // พฤหัสบดี
      "text-blue-800", // ศุกร์
      "text-purple-800", // เสาร์
    ]
    return colors[dayIndex]
  }

  // Staff image mapping
  const staffImages: { [key: string]: string } = {
    // ชื่อไทย
    จรัญ: "/images/staff/จรัญ.jpg",
    แมน: "/images/staff/แมน.jpg",
    แจ็ค: "/images/staff/แจ็ค.jpg",
    ป้าน้อย: "/images/staff/ป้าน้อย.jpg",
    พี่ตุ่น: "/images/staff/พี่ตุ่น.jpg",
    เอ: "/images/staff/เอ.jpg",
    โอเล่: "/images/staff/โอเล่.jpg",
    พี่ภา: "/images/staff/พี่ภา.jpg",
    อาร์ม: "/images/staff/อาร์ม.jpg",
    สาม: "/images/staff/สาม.jpg",
    มิ้นต์: "/placeholder.svg?height=80&width=80&text=มิ้นต์",
    นิค: "/placeholder.svg?height=80&width=80&text=นิค",
    เกลือ: "/placeholder.svg?height=80&width=80&text=เกลือ",
    เป้ง: "/placeholder.svg?height=80&width=80&text=เป้ง",
    // id_code
    arm: "/images/staff/อาร์ม.jpg",
    saam: "/images/staff/สาม.jpg",
    toon: "/images/staff/พี่ตุ่น.jpg",
    man: "/images/staff/แมน.jpg",
    sanya: "/images/staff/พี่สัญญา.jpg",
    noi: "/images/staff/ป้าน้อย.jpg",
    pha: "/images/staff/พี่ภา.jpg",
    ae: "/images/staff/เอ.jpg",
    rd: "/images/staff/RD.jpg",
    Ola: "/images/staff/โอเล่.jpg",
    JJ: "/images/staff/จรัญ.jpg",
    Jak: "/images/staff/แจ็ค.jpg",
  }

  const weekDates = getWeekDates(currentWeek)
  const weekRange = `${formatDateForDisplay(weekDates[0], 'full')} - ${formatDateForDisplay(weekDates[5], 'full')}`

  // Get production data for current week
  const getWeekProduction = () => {
    const weekStart = formatDateForAPI(weekDates[0]);
    const weekEnd = formatDateForAPI(weekDates[5]);
    const defaultCodes = ['A', 'B', 'C', 'D'];
    const filteredData = productionData
      .filter((item) => {
        const isInWeekRange = item.production_date >= weekStart && item.production_date <= weekEnd;
        // กรองออกงาน A, B, C, D ทั้งหมด (ทั้งแบบร่างและเสร็จแล้ว)
        const isNotDefaultJob = !defaultCodes.includes(item.job_code);
        return isInWeekRange && isNotDefaultJob;
      })
      .sort((a, b) => {
        const dateComparison = a.production_date.localeCompare(b.production_date);
        if (dateComparison !== 0) return dateComparison;
        const timeA = a.start_time || "00:00";
        const timeB = b.start_time || "00:00";
        const timeComparison = timeA.localeCompare(timeB);
        if (timeComparison !== 0) return timeComparison;
        const operatorA = (typeof a.operators === 'string' ? a.operators : "").split(", ")[0] || "";
        const operatorB = (typeof b.operators === 'string' ? b.operators : "").split(", ")[0] || "";
        const indexA = operatorA.indexOf("อ");
        const indexB = operatorB.indexOf("อ");
        if (indexA === 0 && indexB !== 0) return -1;
        if (indexB === 0 && indexA !== 0) return 1;
        return operatorA.localeCompare(operatorB);
      });
    // ไม่เติม prefix ใด ๆ
    return filteredData;
  };

  // Get production data for selected day
  const getSelectedDayProduction = () => {
    const targetDate = viewMode === "daily" ? selectedDate : selectedWeekDay;
    if (!targetDate) return [];
    const defaultCodes = ['A', 'B', 'C', 'D'];
    const normalizeDate = (dateStr: string) => {
      if (!dateStr) return '';
      return formatDateForAPI(dateStr);
    };
    const dayData = productionData.filter(item => normalizeDate(item.production_date) === normalizeDate(targetDate));
    
    // งาน default (A,B,C,D)
    let defaultDrafts = dayData.filter(item => item.isDraft && defaultCodes.includes(item.job_code));
    defaultDrafts.sort((a, b) => defaultCodes.indexOf(a.job_code) - defaultCodes.indexOf(b.job_code));

    // งานปกติ (is_special !== 1 และ workflow_status_id !== 10, ไม่ใช่ default, isDraft = false)
    const normalJobs = dayData.filter(item => 
      !defaultCodes.includes(item.job_code) && 
      item.is_special !== 1 && 
      item.workflow_status_id !== 10 && 
      !item.isDraft
    );
    
    // งานพิเศษ (is_special === 1 หรือ workflow_status_id === 10, isDraft = false)
    const specialJobs = dayData.filter(item => 
      !defaultCodes.includes(item.job_code) && 
      (item.is_special === 1 || item.workflow_status_id === 10) && 
      !item.isDraft
    );
    
    // งาน draft (isDraft = true, ไม่ใช่ default)
    const draftJobs = dayData.filter(item => !defaultCodes.includes(item.job_code) && item.isDraft);

    // ฟังก์ชันเรียงตามเวลา/คน
    const sortFn = (a: any, b: any) => {
      const timeA = a.start_time || "00:00";
      const timeB = b.start_time || "00:00";
      const timeComparison = timeA.localeCompare(timeB);
      if (timeComparison !== 0) return timeComparison;
      const operatorA = getOperatorsArray(a.operators)[0] || "";
      const operatorB = getOperatorsArray(b.operators)[0] || "";
      const indexA = operatorA.indexOf("อ");
      const indexB = operatorB.indexOf("อ");
      if (indexA === 0 && indexB !== 0) return -1;
      if (indexB === 0 && indexA !== 0) return 1;
      return operatorA.localeCompare(operatorB);
    };
    
    normalJobs.sort(sortFn);
    specialJobs.sort(sortFn);
    draftJobs.sort(sortFn);

    // Debug: แสดงข้อมูลการแยกงาน
    console.log("🔍 [DEBUG] getSelectedDayProduction แยกงาน:");
    console.log("🔍 [DEBUG] งานปกติ:", normalJobs.length, "รายการ");
    console.log("🔍 [DEBUG] งานพิเศษ:", specialJobs.length, "รายการ");
    console.log("🔍 [DEBUG] งานปกติ:", normalJobs.map(item => ({ 
      job_name: item.job_name, 
      is_special: item.is_special, 
      workflow_status_id: item.workflow_status_id 
    })));
    console.log("🔍 [DEBUG] งานพิเศษ:", specialJobs.map(item => ({ 
      job_name: item.job_name, 
      is_special: item.is_special, 
      workflow_status_id: item.workflow_status_id 
    })));

    // รวมกลุ่มตามลำดับที่ต้องการ: default -> งานปกติ -> งานพิเศษ -> draft
    return [...defaultDrafts, ...normalJobs, ...specialJobs, ...draftJobs];
  };

  // Use useMemo to recalculate when productionData changes
  const weekProduction = useMemo(() => {
    const result = getWeekProduction();
    console.log('📊 [DEBUG] weekProduction length:', result.length);
    console.log('📊 [DEBUG] weekProduction sample:', result.slice(0, 3));
    return result;
  }, [productionData, currentWeek]);

  const selectedDayProduction = useMemo(() => {
    const result = getSelectedDayProduction();
    console.log('🎯 [DEBUG] selectedDayProduction useMemo recalculated');
    console.log('🎯 [DEBUG] selectedDayProduction length:', result.length);
    console.log('🎯 [DEBUG] selectedDayProduction sample:', result.slice(0, 3));
    return result;
  }, [productionData, selectedDate, selectedWeekDay, viewMode]);

  // เพิ่มฟังก์ชันส่งข้อมูลไป Google Sheet
  const sendToGoogleSheet = async (data: any) => {
    console.log("🟡 [DEBUG] call sendToGoogleSheet", data);
    // เรียกไปที่ frontend API route แทน backend
    const url = '/api/send-to-google-sheet';
    console.log("🟡 [DEBUG] Google Sheet URL:", url);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("🟡 [DEBUG] Google Sheet response status:", res.status);
      const result = await res.text();
      console.log("🟢 [DEBUG] Google Sheet result:", result);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error("🔴 [DEBUG] Google Sheet error:", err);
      throw err; // Re-throw เพื่อให้ handleSyncDrafts จับ error ได้
    }
  };

  // ฟังก์ชันคำนวณลำดับงานตามเวลาเริ่มและผู้ปฏิบัติงาน
  const calculateWorkOrder = (targetDate: string, targetStartTime: string, targetOperators: string) => {
    const jobsOnDate = productionData.filter(item => {
      const itemDate = item.production_date ? item.production_date.split('T')[0] : '';
      return itemDate === targetDate;
    });
    
    // เรียงงานตามเวลาเริ่มและผู้ปฏิบัติงาน
    const sortedJobs = jobsOnDate.sort((a, b) => {
      // เรียงตามเวลาเริ่ม
      const timeA = a.start_time || "00:00"
      const timeB = b.start_time || "00:00"
      const timeComparison = timeA.localeCompare(timeB)
      if (timeComparison !== 0) return timeComparison
      
      // หากเวลาเริ่มเหมือนกัน เรียงตามผู้ปฏิบัติงานคนที่ 1 ที่มีตัวอักษร "อ"
      const operatorA = getOperatorsArray(a.operators)[0] || ""
      const operatorB = getOperatorsArray(b.operators)[0] || ""
      
      // หาตำแหน่งของ "อ" ในชื่อ (indexOf จะ return -1 ถ้าไม่เจอ)
      const indexA = operatorA.indexOf("อ")
      const indexB = operatorB.indexOf("อ")
      
      // ถ้า A มี "อ" ที่ตำแหน่งแรก (index 0) และ B ไม่มี "อ" หรือมี "อ" ที่ตำแหน่งอื่น
      if (indexA === 0 && indexB !== 0) {
        console.log(`🔍 [DEBUG] A (${operatorA}) comes before B (${operatorB}) because A has "อ" at first position`);
        return -1
      }
      // ถ้า B มี "อ" ที่ตำแหน่งแรก (index 0) และ A ไม่มี "อ" หรือมี "อ" ที่ตำแหน่งอื่น
      if (indexB === 0 && indexA !== 0) {
        console.log(`🔍 [DEBUG] B (${operatorB}) comes before A (${operatorA}) because B has "อ" at first position`);
        return 1
      }
      // ถ้าทั้งคู่มี "อ" ที่ตำแหน่งแรก หรือทั้งคู่ไม่มี "อ" ที่ตำแหน่งแรก เรียงตามตัวอักษร
      const result = operatorA.localeCompare(operatorB);
      console.log(`🔍 [DEBUG] Both have same "อ" position, comparing alphabetically: ${result}`);
      return result
    });

    console.log('🔍 [DEBUG] Sorted week data:', sortedJobs.map((item: any) => ({
      job_name: item.job_name,
      start_time: item.start_time,
      operators: item.operators,
      first_operator: (item.operators || "").split(", ")[0] || ""
    })));

    return sortedJobs.length + 1;
  }

  // ฟังก์ชันสร้างเลขงานอัตโนมัติ
  const generateJobCode = () => {
    // หาเลขงานที่ยังไม่ซ้ำในวันนั้น
    const dayJobs = productionData.filter(item => 
      item.production_date === selectedDate
    );
    
    let jobNumber = 1;
    const existingCodes = dayJobs.map(job => job.job_code);
    
    // หาเลขงานที่ยังไม่ซ้ำ (เริ่มจาก 1, 2, 3, 4, 5...)
    while (existingCodes.includes(jobNumber.toString())) {
      jobNumber++;
    }
    
    return jobNumber.toString();
  };

  const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, "");

  const isJobNameDuplicate = (name: string) => {
    // ตรวจสอบกับข้อมูลที่มีอยู่จริงในระบบเฉพาะวันที่เลือก
    const normalizedName = normalize(name);
    console.log('🔍 [DEBUG] Checking for duplicate job name:', name);
    console.log('🔍 [DEBUG] Normalized name:', normalizedName);
    console.log('🔍 [DEBUG] Selected date:', selectedDate);
    
    // กรองข้อมูลเฉพาะวันที่เลือก
    const jobsOfSelectedDate = productionData.filter(item => {
      const itemDate = item.production_date ? item.production_date.split('T')[0] : '';
      return itemDate === selectedDate;
    });
    
    console.log('🔍 [DEBUG] Jobs of selected date:', jobsOfSelectedDate.map(item => ({
      job_name: item.job_name || '',
      normalized: normalize(item.job_name || ''),
      production_date: item.production_date
    })));
    
    const isDuplicate = jobsOfSelectedDate.some(item => normalize(item.job_name || '') === normalizedName);
    console.log('🔍 [DEBUG] Is duplicate:', isDuplicate);
    return isDuplicate;
  };

  const isEndTimeAfterStartTime = (start: string, end: string) => {
    if (!start || !end) return true;
    return end > start;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // ป้องกัน submit ซ้ำ
    setIsSubmitting(true);
    setMessage("");

    // Validation เฉพาะบันทึกเสร็จสิ้น (workflow_status_id = 2)
    const requiredFields = [jobName.trim(), startTime.trim(), endTime.trim(), selectedRoom && selectedRoom !== "__none__"];
    const hasOperator = operators.filter(op => op && op !== "__none__").length > 0;
    if (requiredFields.includes("") || !hasOperator) {
      setErrorDialogMessage("กรุณาใส่ข้อมูล");
      setShowErrorDialog(true);
      setIsSubmitting(false);
      return;
    }
    if (!isEndTimeAfterStartTime(startTime, endTime)) {
      setMessage("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      setIsSubmitting(false);
      return;
    }
    if (isJobNameDuplicate(jobName)) {
      setMessage("ชื่องานนี้มีอยู่แล้ว");
      setIsSubmitting(false);
      return;
    }

    try {
      // map operators เป็น object { id_code, name }
      const operatorsToSend = operators
        .filter(Boolean)
        .map(name => {
          const user = users.find(u => u.name === name);
          return user ? { id_code: user.id_code, name: user.name } : { name };
        });
      // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่ (เครื่องบันทึกข้อมูลการผลิตไม่เป็น required)
      const isValid = jobName.trim() !== "" && 
                     operators.filter(Boolean).length > 0 && 
                     startTime.trim() !== "" && 
                     endTime.trim() !== "" && 
                     selectedRoom.trim() !== "";
      console.log("[DEBUG] isValid:", isValid);
      // ใช้ค่าเริ่มต้นหากไม่มีการใส่เวลา
      const finalStartTime = startTime.trim() || "00:00";
      const finalEndTime = endTime.trim() || "00:00";
      
      // สร้างเลขงานอัตโนมัติถ้าไม่มี job_code
      const finalJobCode = jobCode || generateJobCode();
      
      // คำนวณลำดับงาน
      const workOrder = calculateWorkOrder(selectedDate, finalStartTime, operators.filter(Boolean).join(", "));
      const requestBody = {
        production_date: selectedDate,
        job_code: finalJobCode,
        job_name: jobName || jobQuery,
        start_time: finalStartTime,
        end_time: finalEndTime,
        machine_id: machines.find(m => m.machine_code === selectedMachine)?.id || null,
        production_room_id: rooms.find(r => r.room_code === selectedRoom)?.id || null,
        notes: note,
        workflow_status_id: isValid ? 2 : 1, // 2 = บันทึกเสร็จสิ้น, 1 = แบบร่าง
        operators: operatorsToSend,
        work_order: workOrder // เพิ่มลำดับงาน
      };
      console.log("[DEBUG] requestBody:", requestBody);
      const res = await fetch(`/api/work-plans/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      console.log("[DEBUG] API response:", data);
      if (data.success) {
        resetForm();
        await loadAllProductionData();
      } else {
        console.warn("[DEBUG] API error message:", data.message);
      }
    } catch (err) {
      console.error("[DEBUG] API error:", err);
    }
    setIsSubmitting(false);
  };

  const handleSaveDraft = async () => {
    console.log('🔧 handleSaveDraft called');
    console.log('🔧 Current state:', {
      jobName,
      jobQuery,
      jobCode,
      startTime,
      endTime,
      selectedMachine,
      selectedRoom,
      operators,
      note,
      isSubmitting
    });

    if (isSubmitting) {
      console.log('🔧 Already submitting, returning');
      return; // ป้องกัน submit ซ้ำ
    }
    
    setIsSubmitting(true);
    setMessage("");

    // Validation สำหรับแบบร่าง - ยืดหยุ่นกว่า
    const hasJobName = jobName?.trim() || jobQuery?.trim();
    console.log('🔧 Has job name:', hasJobName);
    
    if (!hasJobName) {
      console.log('🔧 No job name provided');
      setMessage("กรุณากรอกชื่องาน");
      setIsSubmitting(false);
      return;
    }
    
    // ตรวจสอบเวลาถ้ามีการกรอก
    if (startTime?.trim() && endTime?.trim() && !isEndTimeAfterStartTime(startTime, endTime)) {
      console.log('🔧 Invalid time range');
      setMessage("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      setIsSubmitting(false);
      return;
    }
    
    // ตรวจสอบชื่องานซ้ำเฉพาะถ้ามีการกรอกชื่องาน
    const finalJobName = hasJobName || "";
    console.log('🔧 Final job name:', finalJobName);
    
    if (finalJobName && isJobNameDuplicate(finalJobName)) {
      console.log('🔧 Duplicate job name');
      setMessage("ชื่องานนี้มีอยู่แล้ว");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔧 Starting API call');
      console.log('📅 Saving draft with date:', selectedDate);
      console.log('📅 selectedDate type:', typeof selectedDate);
      console.log('📅 selectedDate value:', selectedDate);
      
      // ไม่ใส่ค่า default ถ้าไม่ได้กรอก
      const finalStartTime = startTime?.trim() || "";
      const finalEndTime = endTime?.trim() || "";
      
      // สร้างเลขงานอัตโนมัติถ้าไม่มี job_code
      const finalJobCode = jobCode || generateJobCode();
      
      const requestBody = {
        production_date: selectedDate,
        job_code: finalJobCode,
        job_name: finalJobName,
        start_time: finalStartTime,
        end_time: finalEndTime,
        machine_id: machines.find(m => m.machine_code === selectedMachine)?.id || null,
        production_room_id: rooms.find(r => r.room_code === selectedRoom)?.id || null,
        notes: note || "",
        workflow_status_id: 1, // 1 = draft
        operators: operators.filter(Boolean).map(name => {
          const user = users.find(u => u.name === name);
          return user ? { id_code: user.id_code, name: user.name } : { name };
        })
      };
      
      console.log('📅 Request body:', requestBody);
      console.log('📅 API URL:', `/api/work-plans/drafts`);
      
      const res = await fetch(`/api/work-plans/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📅 Response status:', res.status);
      const data = await res.json();
      console.log('📅 Response data:', data);
      
      setMessage(data.success ? 'บันทึกแบบร่างสำเร็จ' : 'เกิดข้อผิดพลาด');
      if (data.success) {
        console.log('🔧 Success - resetting form and reloading data');
        resetForm(); // ล้างค่าฟอร์มหลังบันทึกแบบร่างสำเร็จ
        await loadAllProductionData();
      } else {
        console.log('🔧 API returned success: false');
      }
    } catch (err) {
      console.error('📅 Error saving draft:', err);
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    }
    console.log('🔧 Setting isSubmitting to false');
    setIsSubmitting(false);
  };

  // Helper function to get room name from room code or ID
  const getRoomName = (roomCodeOrId: string | number) => {
    if (!roomCodeOrId || roomCodeOrId === 'ไม่ระบุ') {
      console.log('🏠 [DEBUG] getRoomName - No room data:', roomCodeOrId);
      return 'ไม่ระบุ';
    }
    
    console.log('🏠 [DEBUG] getRoomName input:', roomCodeOrId, 'type:', typeof roomCodeOrId);
    console.log('🏠 [DEBUG] Available rooms:', rooms.map(r => ({ id: r.id, room_code: r.room_code, room_name: r.room_name })));
    
    // ลองหาโดยใช้ room_code ก่อน
    let room = rooms.find(r => r.room_code === roomCodeOrId);
    
    // หากไม่เจอ ลองหาโดยใช้ ID (รองรับทั้ง string และ number)
    if (!room) {
      room = rooms.find(r => r.id.toString() === roomCodeOrId.toString());
    }
    
    // หากไม่เจอ ลองหาโดยใช้ room_name (กรณีที่ส่งชื่อมาเลย)
    if (!room) {
      room = rooms.find(r => r.room_name === roomCodeOrId);
    }
    
    const result = room ? room.room_name : (typeof roomCodeOrId === 'number' ? roomCodeOrId.toString() : roomCodeOrId);
    console.log('🏠 [DEBUG] getRoomName result:', result);
    return result;
  };

  // Helper function to render notes
  const renderNotes = (item: any, isFormCollapsed: boolean) => {
    if (!item.notes && !item.note) return null;
    
    return (
      <div
        className={`flex items-start space-x-1 sm:space-x-2 ${
          isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"
        }`}
      >
        <span className="text-red-600 font-semibold flex-shrink-0">หมายเหตุ:</span>
        <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded border-l-2 border-red-400">
          {item.notes || item.note}
        </span>
      </div>
    );
  };





  // Helper function to render staff avatars
  const renderStaffAvatars = (staff: string, isFormCollapsed: boolean) => {
    if (!staff || staff.trim() === "") {
      return (
        <span className="text-sm sm:text-base text-gray-500">
          ไม่มีผู้ปฏิบัติงาน
        </span>
      );
    }
    const staffList = staff.split(", ");
    
    return (
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex -space-x-2">
          {staffList.map((person, index) => (
            <Avatar
              key={index}
              className={`${isFormCollapsed ? "w-12 h-12 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-12 sm:h-12"} border-2 border-white shadow-sm`}
              >
                <AvatarImage
                src={staffImages[person] || `/placeholder.svg?height=80&width=80&text=${person.charAt(0)}`}
                  alt={person}
                  className="object-cover object-center avatar-image"
                  style={{ imageRendering: "crisp-edges" }}
                />
              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-800">
                {person.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className={`${isFormCollapsed ? "text-base sm:text-lg" : "text-sm sm:text-base"} truncate text-slate-900`}>
          ผู้ปฏิบัติงาน: {staff}
        </span>
      </div>
    )
  }

  const [editDraftModalOpen, setEditDraftModalOpen] = useState(false);
  const [editDraftData, setEditDraftData] = useState<any | null>(null);
  const [editDraftId, setEditDraftId] = useState<string>("");
  
  // State สำหรับ modal แสดงรายละเอียดการผลิต
  const [productionDetailsModalOpen, setProductionDetailsModalOpen] = useState(false);
  const [productionDetailsData, setProductionDetailsData] = useState<any | null>(null);
  const [productionLogs, setProductionLogs] = useState<any[]>([]);

  // State สำหรับฟอร์มใน modal edit draft
  const [editJobName, setEditJobName] = useState("");
  const [editOperators, setEditOperators] = useState(["", "", "", ""]);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [editMachine, setEditMachine] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");

  // ฟังก์ชัน normalize เวลาให้เป็น HH:mm
  const normalizeTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  // Prefill ข้อมูลเมื่อเปิด modal
  useEffect(() => {
    if (editDraftModalOpen && editDraftData && users.length > 0) {
      console.log('🔧 Setting up edit form with data:', editDraftData);
      
      setEditJobName(editDraftData.job_name || "");
      
      // ตั้งค่าผู้ปฏิบัติงาน
      let operatorNames = ["", "", "", ""];
      if (editDraftData.operators) {
        console.log('🔧 Processing operators:', editDraftData.operators);
        
        try {
          if (Array.isArray(editDraftData.operators)) {
            // ถ้าเป็น array อยู่แล้ว
            operatorNames = editDraftData.operators.map((op: any, index: number) => {
              if (index >= 4) return ""; // จำกัดแค่ 4 ตำแหน่ง
              return typeof op === "object" ? op?.name || "" : op || "";
            });
          } else if (typeof editDraftData.operators === "string") {
            // ลอง parse เป็น JSON ก่อน
            try {
              const parsed = JSON.parse(editDraftData.operators);
              if (Array.isArray(parsed)) {
                operatorNames = parsed.map((op: any, index: number) => {
                  if (index >= 4) return ""; // จำกัดแค่ 4 ตำแหน่ง
                  return typeof op === "object" ? op?.name || "" : op || "";
                });
              }
            } catch {
              // ถ้าไม่ใช่ JSON ให้แยกด้วย comma
              const names = editDraftData.operators.split(',').map((name: string) => name.trim());
              operatorNames = names.slice(0, 4); // จำกัดแค่ 4 ตำแหน่ง
            }
          }
          
          // เติม array ให้ครบ 4 ตำแหน่ง
          while (operatorNames.length < 4) {
            operatorNames.push("");
          }
          
          console.log('🔧 Final operator names:', operatorNames);
        } catch (error) {
          console.error('Error processing operators:', error);
          operatorNames = ["", "", "", ""];
        }
      }
      
      setEditOperators(operatorNames);
      setEditStartTime(normalizeTime(editDraftData.start_time) || "");
      setEditEndTime(normalizeTime(editDraftData.end_time) || "");

      // Prefill เครื่องบันทึกข้อมูลการผลิต (machine)
      let machineCode = "";
      if (editDraftData.machine_code) {
        machineCode = editDraftData.machine_code;
      } else if (editDraftData.machine_id) {
        const m = machines.find(m => m.id === editDraftData.machine_id || m.id?.toString() === editDraftData.machine_id?.toString());
        machineCode = m?.machine_code || "";
      } else if (editDraftData.machine) {
        machineCode = editDraftData.machine;
      }
      setEditMachine(machineCode);

      // Prefill ห้องผลิต (room)
      let roomCode = "";
      if (editDraftData.room_code) {
        roomCode = editDraftData.room_code;
      } else if (editDraftData.production_room_id) {
        const r = rooms.find(r => r.id === editDraftData.production_room_id || r.id?.toString() === editDraftData.production_room_id?.toString());
        roomCode = r?.room_code || "";
      } else if (editDraftData.production_room) {
        roomCode = editDraftData.production_room;
      }
      setEditRoom(roomCode);

      setEditNote(editDraftData.notes || editDraftData.note || "");
      setEditDate(editDraftData.production_date ? (editDraftData.production_date.split("T")[0]) : "");
      
      console.log('🔧 Form setup complete:', {
        jobName: editDraftData.job_name,
        operators: operatorNames,
        startTime: editDraftData.start_time,
        endTime: editDraftData.end_time,
        machine: machineCode,
        room: roomCode,
        note: editDraftData.notes || editDraftData.note
      });
    }
  }, [editDraftModalOpen, editDraftData, users, machines, rooms]);

  const handleEditDraft = (draftItem: any) => {
    console.log('✏️ Opening edit modal for draft item:', draftItem);
    
    // ใช้ข้อมูลจริงแทนข้อมูล test
    const realData = {
      id: draftItem.id,
      job_name: draftItem.job_name,
      job_code: draftItem.job_code,
      operators: draftItem.operators || [],
      start_time: draftItem.start_time,
      end_time: draftItem.end_time,
      production_date: draftItem.production_date,
      machine_id: draftItem.machine_id,
      production_room_id: draftItem.production_room_id,
      production_room: draftItem.production_room,
      machine_code: draftItem.machine_code,
      notes: draftItem.notes || draftItem.note || "",
      workflow_status_id: draftItem.workflow_status_id
    };
    
    console.log('✏️ Using real data:', realData);
    
    // ตั้งค่า state ก่อน
    setEditDraftData(realData);
    setEditDraftId(realData.id.toString());
    
    // เปิด modal หลังจากตั้งค่า state แล้ว
    console.log('✏️ Setting modal open to true');
    setEditDraftModalOpen(true);
    
    // ตรวจสอบ state หลังจากตั้งค่า
    setTimeout(() => {
      console.log('✏️ Modal state check:', {
        editDraftModalOpen: true,
        editDraftData: realData,
        editDraftId: realData.id.toString()
      });
    }, 100);
  };

  const validateEditDraft = () => {
    // ต้องมีชื่องาน, ผู้ปฏิบัติงานอย่างน้อย 1, เวลาเริ่ม/สิ้นสุด, ห้อง (เครื่องไม่เป็น required)
    const jobNameValid = editJobName.trim() !== "";
    const operatorsValid = editOperators.filter(Boolean).length > 0;
    const startTimeValid = editStartTime.trim() !== "";
    const endTimeValid = editEndTime.trim() !== "";
    const roomValid = editRoom.trim() !== "";
    
    console.log('🔍 Validating edit draft:');
    console.log('  - editJobName:', editJobName, 'valid:', jobNameValid);
    console.log('  - editOperators:', editOperators, 'valid:', operatorsValid);
    console.log('  - editStartTime:', editStartTime, 'valid:', startTimeValid);
    console.log('  - editEndTime:', editEndTime, 'valid:', endTimeValid);
    console.log('  - editRoom:', editRoom, 'valid:', roomValid);
    console.log('  - editMachine:', editMachine, 'valid:', editMachine.trim() !== ""); // แสดงแต่ไม่ใช้ในการ validate
    
    const isValid = jobNameValid && operatorsValid && startTimeValid && endTimeValid && roomValid;
    console.log('  - Overall validation result:', isValid);
    
    return isValid;
  };

  const handleSaveEditDraft = async (isDraft = false) => {
    if (!editDraftData) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      // map operators เป็น object { id_code, name }
      const operatorsToSend = editOperators
        .filter(Boolean)
        .map(name => {
          const user = users.find(u => u.name === name);
          return user ? { id_code: user.id_code, name: user.name } : { name };
        });
      const isValid = validateEditDraft();
      const workflowStatusId = isDraft ? 1 : (isValid ? 2 : 1); // 2 = บันทึกเสร็จสิ้น, 1 = แบบร่าง
      if (!isDraft && !isValid) {
        setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
        setIsSubmitting(false);
        return;
      }
      const requestBody = {
        production_date: editDate,
        job_code: editDraftData.job_code,
        job_name: editJobName,
        start_time: editStartTime,
        end_time: editEndTime,
        machine_id: machines.find(m => m.machine_code === editMachine)?.id || null,
        production_room_id: rooms.find(r => r.room_code === editRoom)?.id || null,
        notes: editNote,
        workflow_status_id: workflowStatusId,
        operators: operatorsToSend
      };
      // ตรวจสอบว่า editDraftData.id เป็น string และมี replace method
      const draftId = editDraftData.id && typeof editDraftData.id === 'string' 
        ? editDraftData.id.replace('draft_', '') 
        : String(editDraftData.id || '');
      
      const res = await fetch(`/api/work-plans/drafts/${draftId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (data.success) {
        const successMessage = isDraft ? "บันทึกแบบร่างสำเร็จ" : "บันทึกเสร็จสิ้น";
        setMessage(successMessage);
        setSuccessDialogMessage(successMessage);
        setShowSuccessDialog(true);
        setEditDraftModalOpen(false);
        await loadAllProductionData();
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
    setIsSubmitting(false);
  };

  // เพิ่มฟังก์ชัน Sync Drafts
  const handleSyncDrafts = async () => {
    // เปิด Google Sheet ก่อน
    console.log("🟢 [DEBUG] กำลังเปิด Google Sheet...");
    try {
      window.open("https://docs.google.com/spreadsheets/d/1lzsYNoIbTd1Uy5r37xUtK5PuOHyNlYYiqS7xZvrU8C8", "_blank");
      console.log("🟢 [DEBUG] เปิด Google Sheet สำเร็จ");
    } catch (err) {
      console.error("🔴 [DEBUG] ไม่สามารถเปิด Google Sheet ได้:", err);
      // ลองเปิดด้วยวิธีอื่น
      const link = document.createElement('a');
      link.href = "https://docs.google.com/spreadsheets/d/1lzsYNoIbTd1Uy5r37xUtK5PuOHyNlYYiqS7xZvrU8C8/edit?gid=1601393572#gid=1601393572";
      link.target = "_blank";
      link.click();
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await fetch(getApiUrl('/api/work-plans/sync-drafts-to-plans'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: selectedDate })
      });
      // 1. เตรียมข้อมูล summaryRows สำหรับ 1.ใบสรุปงาน v.4 (ไม่เอา A, B, C, D)
      const defaultCodes = ['A', 'B', 'C', 'D'];
          // ฟังก์ชันแปลงรหัส/ID ห้องเป็นชื่อห้อง
    const getRoomNameByCodeOrId = (codeOrId: string | undefined) => {
      if (!codeOrId) return "";
      // ใช้ข้อมูลจาก Frontend
      const room = rooms.find(r => r.room_code === codeOrId || r.id?.toString() === codeOrId?.toString());
      return room?.room_name || codeOrId;
    };
    // ฟังก์ชันแปลง ID เครื่องเป็นชื่อเครื่อง
    const getMachineNameById = (machineId: string | undefined) => {
      if (!machineId) return "";
      // ใช้ข้อมูลจาก Frontend
      const machine = machines.find(m => m.id?.toString() === machineId?.toString());
      return machine?.machine_name || machineId;
    };
      // แยกงานปกติและงานพิเศษ (ใช้ is_special = 1 หรือ workflow_status_id = 10)
      const normalJobs = productionData.filter(item => 
        item.production_date === selectedDate && 
        !(item.isDraft && defaultCodes.includes(item.job_code)) &&
        item.is_special !== 1 && 
        item.workflow_status_id !== 10 // ไม่ใช่งานพิเศษ
      );
      
      const specialJobs = productionData.filter(item => 
        item.production_date === selectedDate && 
        !(item.isDraft && defaultCodes.includes(item.job_code)) &&
        (item.is_special === 1 || item.workflow_status_id === 10) // งานพิเศษ
      );
      
      // เรียงงานปกติตาม logic หน้าเว็บ
      const sortedNormalJobs = normalJobs.sort((a, b) => {
        const timeA = a.start_time || "00:00";
        const timeB = b.start_time || "00:00";
        const timeComparison = timeA.localeCompare(timeB);
        if (timeComparison !== 0) return timeComparison;
        const operatorA = getOperatorsArray(a.operators)[0] || "";
        const operatorB = getOperatorsArray(b.operators)[0] || "";
        const indexA = operatorA.indexOf("อ");
        const indexB = operatorB.indexOf("อ");
        if (indexA === 0 && indexB !== 0) return -1;
        if (indexB === 0 && indexA !== 0) return 1;
        return operatorA.localeCompare(operatorB);
      });
      
      // เรียงงานพิเศษตามเวลา
      const sortedSpecialJobs = specialJobs.sort((a, b) => {
        const timeA = a.start_time || "00:00";
        const timeB = b.start_time || "00:00";
        return timeA.localeCompare(timeB);
      });
      
      // Debug: แสดงข้อมูลการแยกงาน
      console.log("🔍 [DEBUG] แยกงานพิเศษ:");
      console.log("🔍 [DEBUG] งานปกติ:", normalJobs.length, "รายการ");
      console.log("🔍 [DEBUG] งานพิเศษ:", specialJobs.length, "รายการ");
      console.log("🔍 [DEBUG] งานปกติ:", normalJobs.map(item => ({ 
        job_name: item.job_name, 
        is_special: item.is_special, 
        workflow_status_id: item.workflow_status_id 
      })));
      console.log("🔍 [DEBUG] งานพิเศษ:", specialJobs.map(item => ({ 
        job_name: item.job_name, 
        is_special: item.is_special, 
        workflow_status_id: item.workflow_status_id 
      })));
      
      // รวมงานปกติ + งานพิเศษ (งานพิเศษอยู่ด้านล่างสุด)
      const filtered = [...sortedNormalJobs, ...sortedSpecialJobs];
      
      // Debug: แสดงข้อมูลที่ส่งไป Google Sheet
      console.log("🔍 [DEBUG] ข้อมูลที่ส่งไป Google Sheet:");
      console.log("🔍 [DEBUG] จำนวนงานทั้งหมด:", filtered.length);
      console.log("🔍 [DEBUG] ลำดับงาน:", filtered.map((item, idx) => ({
        ลำดับ: idx + 1,
        job_name: item.job_name,
        is_special: item.is_special,
        workflow_status_id: item.workflow_status_id,
        start_time: item.start_time
      })));
              const summaryRows = filtered.map((item, idx) => {
          let ops = getOperatorsArray(item.operators);
          while (ops.length < 4) ops.push("");
        return [
          idx + 1, // ลำดับ (A)
          item.job_code || "", // รหัสวัตถุดิบ (B)
          item.job_name || "", // รายการ (C)
          ops[0], // ผู้ปฏิบัติงาน 1 (D)
          ops[1], // ผู้ปฏิบัติงาน 2 (E)
          ops[2], // ผู้ปฏิบัติงาน 3 (F)
          ops[3], // ผู้ปฏิบัติงาน 4 (G)
          item.start_time || "", // เริ่มต้น (H)
          item.end_time || "", // สิ้นสุด (I)
          getMachineNameById(item.machine_id || ""), // เครื่องที่ (J)
          getRoomNameByCodeOrId(item.production_room || "") // ห้องผลิต (K)
        ];
      });
      // 2. ส่ง batch ไป 1.ใบสรุปงาน v.4
      console.log("🟡 [DEBUG] ส่งข้อมูลไป 1.ใบสรุปงาน v.4:", summaryRows.length, "แถว");
      console.log("🟡 [DEBUG] ข้อมูล summaryRows:", summaryRows);
      try {
        await sendToGoogleSheet({
          sheetName: "1.ใบสรุปงาน v.4",
          rows: summaryRows,
          clearSheet: true
        });
        console.log("🟢 [DEBUG] ส่งข้อมูลไป 1.ใบสรุปงาน v.4 สำเร็จ");
      } catch (error) {
        console.error("🔴 [DEBUG] เกิดข้อผิดพลาดในการส่งข้อมูลไป 1.ใบสรุปงาน v.4:", error);
        throw error; // Re-throw เพื่อให้ caller จับได้
      }

      // 3. เตรียมข้อมูลสำหรับ Log_แผนผลิต (แยกแถวตามผู้ปฏิบัติงาน)
      const logRows: string[][] = [];
      
      // ใช้ selectedDate แทน today เพื่อให้วันที่ตรงกับข้อมูลงาน
       const selectedDateObj = createSafeDate(selectedDate);
       const dateString = selectedDateObj ? formatDateForGoogleSheet(selectedDateObj) : 'Invalid Date';
       const dateValue = selectedDateObj ? formatDateForValue(selectedDateObj) : 'Invalid Date';
      const timeStamp = new Date().toLocaleString('en-GB') + ', ' + new Date().toLocaleTimeString('en-GB');

      console.log("🟡 [DEBUG] Date processing:");
      console.log("🟡 [DEBUG] selectedDate (input):", selectedDate);
      console.log("🟡 [DEBUG] selectedDateObj:", selectedDateObj);
      console.log("🟡 [DEBUG] dateString:", dateString);
      console.log("🟡 [DEBUG] dateValue:", dateValue);
      console.log("🟡 [DEBUG] timeStamp:", timeStamp);

      // หาข้อมูลงาน A B C D ที่มีข้อมูลจริงๆ ในฐานข้อมูล (ทั้ง work_plans และ work_plan_drafts)
      const defaultJobsData = productionData.filter(item => 
        item.production_date === selectedDate && 
        defaultCodes.includes(item.job_code)
      );

      console.log("🔍 [DEBUG] ข้อมูลงาน A B C D ที่หาได้:", defaultJobsData);
      console.log("🔍 [DEBUG] selectedDate:", selectedDate);
      console.log("🔍 [DEBUG] defaultCodes:", defaultCodes);
      console.log("🔍 [DEBUG] productionData ทั้งหมด:", productionData.filter(item => item.production_date === selectedDate));

      // ถ้าไม่มีข้อมูลงาน A B C D ในฐานข้อมูล ให้ใช้ข้อมูล default
      if (defaultJobsData.length === 0) {
        const defaultJobs = [
          { job_code: 'A', job_name: 'เบิกของส่งสาขา  - ผัก' },
          { job_code: 'B', job_name: 'เบิกของส่งสาขา  - สด' },
          { job_code: 'C', job_name: 'เบิกของส่งสาขา  - แห้ง' },
          { job_code: 'D', job_name: 'ตวงสูตร' }
        ];

        // เพิ่มงาน A B C D ใน Log_แผนผลิต (ไม่มีข้อมูลคนและเวลา)
        defaultJobs.forEach((defaultJob) => {
          logRows.push([
            dateString, // วันที่
            dateValue, // Date Value
            defaultJob.job_code, // เลขที่งาน (A, B, C, D)
            defaultJob.job_name, // ชื่องาน
            "", // ผู้ปฏิบัติงาน (ว่าง)
            "", // เวลาเริ่มต้น (ว่าง)
            "", // เวลาสิ้นสุด (ว่าง)
            "" // ห้อง (ว่าง)
          ]);
        });
      } else {
        // ถ้ามีข้อมูลงาน A B C D ในฐานข้อมูล ให้ใช้ข้อมูลจริง
        defaultJobsData.forEach((item) => {
          const operators = (typeof item.operators === 'string' ? item.operators : "").split(", ").map((s: string) => s.trim()).filter(Boolean);
          
          if (operators.length === 0) {
            // ถ้าไม่มีผู้ปฏิบัติงาน ส่ง 1 แถว (8 คอลัมน์)
            logRows.push([
              dateString, // วันที่
              dateValue, // Date Value
              item.job_code || "", // เลขที่งาน (A, B, C, D)
              item.job_name || "", // ชื่องาน
              "", // ผู้ปฏิบัติงาน (ว่าง)
              item.start_time || "", // เวลาเริ่มต้น
              item.end_time || "", // เวลาสิ้นสุด
              getRoomNameByCodeOrId(item.production_room) // ห้อง
            ]);
          } else {
            // ถ้ามีผู้ปฏิบัติงาน ส่งแถวละคน (8 คอลัมน์)
            operators.forEach((operator: string) => {
              logRows.push([
                dateString, // วันที่
                dateValue, // Date Value
                item.job_code || "", // เลขที่งาน (A, B, C, D)
                item.job_name || "", // ชื่องาน
                operator, // ผู้ปฏิบัติงาน
                item.start_time || "", // เวลาเริ่มต้น
                item.end_time || "", // เวลาสิ้นสุด
                getRoomNameByCodeOrId(item.production_room) // ห้อง
              ]);
            });
          }
        });
      }

      // เพิ่มข้อมูลงานอื่นๆ
      filtered.forEach((item) => {
        const operators = (typeof item.operators === 'string' ? item.operators : "").split(", ").map((s: string) => s.trim()).filter(Boolean);
        
        if (operators.length === 0) {
          // ถ้าไม่มีผู้ปฏิบัติงาน ส่ง 1 แถว (8 คอลัมน์)
          logRows.push([
            dateString, // วันที่
            dateValue, // Date Value
            item.job_code || "", // เลขที่งาน (รหัสจริง)
            item.job_name || "", // ชื่องาน (ชื่อจริง)
            "", // ผู้ปฏิบัติงาน (ว่าง)
            item.start_time || "", // เวลาเริ่มต้น
            item.end_time || "", // เวลาสิ้นสุด
            getRoomNameByCodeOrId(item.production_room) // ห้อง (ไม่รวม notes)
          ]);
        } else {
          // ถ้ามีผู้ปฏิบัติงาน ส่งแถวละคน (8 คอลัมน์)
          operators.forEach((operator: string) => {
            logRows.push([
              dateString, // วันที่
              dateValue, // Date Value
              item.job_code || "", // เลขที่งาน (รหัสจริง)
              item.job_name || "", // ชื่องาน (ชื่อจริง)
              operator, // ผู้ปฏิบัติงาน
              item.start_time || "", // เวลาเริ่มต้น
              item.end_time || "", // เวลาสิ้นสุด
              getRoomNameByCodeOrId(item.production_room) // ห้อง (ไม่รวม notes)
            ]);
          });
        }
      });

      // 4. ส่ง batch ไป Log_แผนผลิต (แยกการส่ง)
      if (logRows.length > 0) {
        console.log("🟡 [DEBUG] ส่งข้อมูลไป Log_แผนผลิต:", logRows.length, "แถว");
        console.log("🟡 [DEBUG] ข้อมูล logRows:", logRows);
        try {
          await sendToGoogleSheet({
            sheetName: "Log_แผนผลิต",
            rows: logRows,
            clearSheet: true
          });
          console.log("🟢 [DEBUG] ส่งข้อมูลไป Log_แผนผลิต สำเร็จ");
        } catch (error) {
          console.error("🔴 [DEBUG] เกิดข้อผิดพลาดในการส่งข้อมูลไป Log_แผนผลิต:", error);
          throw error; // Re-throw เพื่อให้ caller จับได้
        }
      } else {
        console.log("🟡 [DEBUG] ไม่มีข้อมูล logRows ที่จะส่ง");
      }
      // 5. อัปเดตวันที่ใน D1 ของ sheet รายงาน-เวลาผู้ปฏิบัติงาน
      const reportSheetName = "รายงาน-เวลาผู้ปฏิบัติงาน";
      console.log("🟡 [DEBUG] อัปเดตวันที่ในรายงาน-เวลาผู้ปฏิบัติงาน:", dateValue);
      console.log("🟡 [DEBUG] Sheet name:", reportSheetName);
      console.log("🟡 [DEBUG] Sheet name length:", reportSheetName.length);
      console.log("🟡 [DEBUG] selectedDate:", selectedDate);
      console.log("🟡 [DEBUG] dateValue:", dateValue);
      try {
        await sendToGoogleSheet({
          sheetName: reportSheetName,
          "Date Value": dateValue,
          "วันที่": dateString
        });
        console.log("🟢 [DEBUG] อัปเดตวันที่ในรายงาน-เวลาผู้ปฏิบัติงาน สำเร็จ");
      } catch (error) {
        console.error("🔴 [DEBUG] เกิดข้อผิดพลาดในการอัปเดตวันที่ในรายงาน-เวลาผู้ปฏิบัติงาน:", error);
        throw error; // Re-throw เพื่อให้ caller จับได้
      }
      setIsSubmitting(false);
      
      // เพิ่มการ reload productionData หลัง sync สำเร็จ
      console.log("🔄 [DEBUG] Sync completed, reloading production data...");
      await loadAllProductionData();
      console.log("🟢 [DEBUG] Production data reloaded successfully");
      
      // แสดงข้อความสำเร็จ
      setMessage("Sync และพิมพ์ใบงานผลิตสำเร็จ");
      setSuccessDialogMessage("Sync และพิมพ์ใบงานผลิตสำเร็จ");
      setShowSuccessDialog(true);
      
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
      setIsSubmitting(false);
    }
  };

  // เพิ่มฟังก์ชันยกเลิกการผลิต
  const handleCancelProduction = async (workPlanId: string) => {
    console.log('🔴 [DEBUG] handleCancelProduction called with workPlanId:', workPlanId);
    
    if (!confirm("คุณต้องการยกเลิกการผลิตนี้หรือไม่?")) {
      console.log('🔴 [DEBUG] User cancelled the confirmation dialog');
      return;
    }
    
    console.log('🔴 [DEBUG] User confirmed cancellation, proceeding...');
    setIsSubmitting(true);
    setMessage("");
    
    try {
          const url = `http://192.168.0.94:3101/api/work-plans/${workPlanId}/cancel`;
    console.log('🔴 [DEBUG] Making PATCH request to:', url);
    
    const res = await fetch(url, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: 'cors'
    });
      
      console.log('🔴 [DEBUG] Response status:', res.status);
      console.log('🔴 [DEBUG] Response ok:', res.ok);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('🔴 [DEBUG] Response data:', data);
      
      if (data.success) {
        console.log('🔴 [DEBUG] Cancel successful, reloading production data...');
        setMessage("ยกเลิกการผลิตสำเร็จ");
        await loadAllProductionData(); // reload ข้อมูลหลังจากยกเลิก
        console.log('🔴 [DEBUG] Production data reloaded');
      } else {
        console.log('🔴 [DEBUG] Cancel failed:', data.message);
        setMessage(data.message || "เกิดข้อผิดพลาดในการยกเลิกการผลิต");
      }
    } catch (err) {
      console.error('🔴 [DEBUG] Error in handleCancelProduction:', err);
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
    setIsSubmitting(false);
    console.log('🔴 [DEBUG] handleCancelProduction completed');
  };

  const handleViewProductionDetails = async (item: any) => {
    console.log('👁️ [DEBUG] handleViewProductionDetails called with item:', item);
    
    setProductionDetailsData(item);
    setProductionDetailsModalOpen(true);
    
    // ดึงข้อมูล logs สำหรับงานนี้
    try {
      const response = await fetch(`/api/logs?work_plan_id=${item.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProductionLogs(data.data || []);
        console.log('👁️ [DEBUG] Production logs loaded:', data.data);
      } else {
        console.log('👁️ [DEBUG] Failed to load logs:', data.message);
        setProductionLogs([]);
      }
    } catch (error) {
      console.error('👁️ [DEBUG] Error loading production logs:', error);
      setProductionLogs([]);
    }
  };

  // ฟังก์ชันช่วยแปลงเวลาจาก seconds เป็นรูปแบบที่อ่านได้
  const formatDuration = (seconds: number) => {
    if (!seconds) return "ไม่ระบุ";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    } else if (minutes > 0) {
      return `${minutes} นาที ${remainingSeconds} วินาที`;
    } else {
      return `${remainingSeconds} วินาที`;
    }
  };

  // ฟังก์ชันช่วยแปลง timestamp เป็นเวลา
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "ไม่ระบุ";
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleDeleteDraft = async (draftId: string) => {
    console.log('🗑️ Attempting to delete draft with ID:', draftId);
    console.log('🗑️ Edit draft data:', editDraftData);
    
    if (!confirm("คุณต้องการลบแบบร่างนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้")) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");
    try {
          console.log('🗑️ Making DELETE request to:', `/api/work-plans/drafts/${draftId}`);
    const res = await fetch(`/api/work-plans/drafts/${draftId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
      console.log('🗑️ Response status:', res.status);
      const data = await res.json();
      console.log('🗑️ Response data:', data);
      
      if (data.success) {
        setMessage("ลบแบบร่างสำเร็จ");
        setEditDraftModalOpen(false); // ปิด modal
        await loadAllProductionData(); // reload ข้อมูลหลังจากลบ
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาดในการลบแบบร่าง");
      }
    } catch (err) {
      console.error('🗑️ Error deleting draft:', err);
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
    setIsSubmitting(false);
  };

  // เพิ่ม useEffect สำหรับ auto-create draft jobs (A, B, C, D) แบบละเอียด
  useEffect(() => {
    if (viewMode !== "daily") return;
    if (!selectedDate) return;
    if (isCreatingRef.current) return;
    
    // ไม่ต้องใช้ sessionStorage แล้ว เพราะจะเช็คจาก database โดยตรง
    const defaultDrafts = [
      { job_code: 'A', job_name: 'เบิกของส่งสาขา  - ผัก' },
      { job_code: 'B', job_name: 'เบิกของส่งสาขา  - สด' },
      { job_code: 'C', job_name: 'เบิกของส่งสาขา  - แห้ง' },
      { job_code: 'D', job_name: 'ตวงสูตร' },
    ];
    const createMissingDrafts = async () => {
      isCreatingRef.current = true;
      
      try {
        // ดึงข้อมูล drafts จาก database โดยตรง
        const draftsResponse = await fetch(getApiUrl('/api/work-plans/drafts'));
        const draftsData = await draftsResponse.json();
        const existingDrafts = draftsData.data || [];
        
        // กรอง drafts ที่มีในวันที่เลือก
        const dayDrafts = existingDrafts.filter((draft: any) => draft.production_date === selectedDate);
        
        console.log(`[AUTO-DRAFT] Checking drafts for date: ${selectedDate}`);
        console.log(`[AUTO-DRAFT] Found ${dayDrafts.length} existing drafts`);
        
        for (const draft of defaultDrafts) {
          // เช็คว่ามี draft นี้ใน database แล้วหรือไม่
          const exists = dayDrafts.some((existingDraft: any) => 
            existingDraft.job_code === draft.job_code && 
            existingDraft.job_name === draft.job_name
          );
          
          if (!exists) {
            console.log(`[AUTO-DRAFT] Creating draft: ${draft.job_code} ${draft.job_name}`);
            const response = await fetch(getApiUrl('/api/work-plans/drafts'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                production_date: selectedDate,
                job_code: draft.job_code,
                job_name: draft.job_name,
                workflow_status_id: 1,
                operators: [],
                start_time: '',
                end_time: '',
                machine_id: null,
                production_room_id: null,
                notes: '',
              })
            });
            
            if (response.ok) {
              console.log(`[AUTO-DRAFT] Successfully created: ${draft.job_code} ${draft.job_name}`);
            } else {
              console.error(`[AUTO-DRAFT] Failed to create: ${draft.job_code} ${draft.job_name}`);
            }
          } else {
            console.log(`[AUTO-DRAFT] Already exists in database: ${draft.job_code} ${draft.job_name}`);
          }
        }
        
        // โหลดข้อมูลใหม่หลังจากสร้าง drafts
        await loadAllProductionData();
        
        console.log(`[AUTO-DRAFT] Completed creating drafts for date: ${selectedDate}`);
      } catch (error) {
        console.error('[AUTO-DRAFT] Error creating drafts:', error);
      } finally {
        isCreatingRef.current = false;
      }
    };
    createMissingDrafts();
  }, [selectedDate]);

  // เพิ่มฟังก์ชัน syncWorkOrder
  const syncWorkOrder = async (date: string) => {
    if (!date) return;
    try {
              const res = await fetch(getApiUrl(`/api/work-plans/sync-work-order?date=${date}`), {
        method: 'POST'
      });
      if (res.ok) {
        console.log(`[SYNC] work_order synced for date: ${date}`);
      } else {
        console.warn(`[SYNC] Failed to sync work_order for date: ${date}`);
      }
    } catch (err) {
      console.warn('Failed to sync work order:', err);
    }
  };

  // เพิ่มฟังก์ชัน resetForm สำหรับล้างค่าฟอร์ม
  const resetForm = () => {
    setJobName("");
    setOperators(["", "", "", ""]);
    setStartTime("");
    setEndTime("");
    setNote("");
    setSelectedMachine("");
    setSelectedRoom("");
    setJobQuery("");
    setJobCode("");
  };

  // เพิ่มฟังก์ชันโหลดข้อมูลทั้งหมด
  const loadAllProductionData = async () => {
    try {
      setIsLoadingData(true);
      // if (selectedDate) {
      //   await syncWorkOrder(selectedDate);
      // }
      const [plans, drafts] = await Promise.all([
        fetch(getApiUrl('/api/work-plans')).then(res => res.json()),
        fetch(getApiUrl('/api/work-plans/drafts')).then(res => res.json())
      ]);
      
      // ดึงสถานะจาก logs สำหรับ work plans ที่ sync แล้ว
      const workPlanIds = (plans.data || []).map((p: any) => p.id).filter(Boolean);
      let logsStatusMap: { [key: number]: any } = {};
      
      if (workPlanIds.length > 0) {
        try {
          console.log('[DEBUG] Fetching logs status for workPlanIds:', workPlanIds);
          const logsResponse = await fetch(
            getApiUrl(`/api/logs/work-plans/status?workPlanIds=${workPlanIds.join(',')}`)
          );
          const logsData = await logsResponse.json();
          console.log('[DEBUG] Logs response:', logsData);
          if (logsData.success) {
            logsStatusMap = logsData.data;
            console.log('[DEBUG] Logs status map:', logsStatusMap);
          }
        } catch (error) {
          console.error('Error fetching logs status:', error);
        }
      }
      // สร้าง map สำหรับ lookup draft ตาม job_code+job_name+production_date
      const draftMap = new Map();
      (drafts.data || []).forEach((d: any) => {
        const key = `${d.production_date}__${d.job_code}__${d.job_name}`;
        draftMap.set(key, d);
      });
      let allData = [
        ...(drafts.data || []).map((d: any) => {
          // Parse operators จาก JSON string
          let operatorNames = '';
          try {
            if (d.operators) {
              const operators = typeof d.operators === 'string' ? JSON.parse(d.operators) : d.operators;
              if (Array.isArray(operators)) {
                operatorNames = operators.map((o: any) => o.name || o).join(', ');
              }
            }
          } catch (e) {
            operatorNames = '';
          }
          let status = 'แบบร่าง';
          let recordStatus = 'แบบร่าง';
          let isPrinted = false;
          if (d.workflow_status_id === 2) {
            status = 'บันทึกเสร็จสิ้น';
            recordStatus = 'บันทึกเสร็จสิ้น';
            isPrinted = false; // งานที่บันทึกเสร็จสิ้นยังไม่ถือว่าพิมพ์แล้ว
          } else if (d.workflow_status_id === 1) {
            status = 'แบบร่าง';
            recordStatus = 'แบบร่าง';
          }
          return {
            ...d,
            id: `draft_${d.id}`,
            isDraft: true,
            production_date: d.production_date,
            job_name: d.job_name,
            start_time: d.start_time,
            end_time: d.end_time,
            operators: operatorNames,
            status: status,
            recordStatus: recordStatus,
            isPrinted: isPrinted,
            production_room: d.production_room_name || d.production_room_id || d.production_room || 'ไม่ระบุ',
            machine_id: d.machine_id || '',
            notes: d.notes || '',
          };
        }),
        ...(plans.data || []).map((p: any) => {
          // Workaround: หา draft ที่ตรงกันมาเติมข้อมูลห้อง/เครื่อง/หมายเหตุ
          const key = `${p.production_date}__${p.job_code}__${p.job_name}`;
          const draft = draftMap.get(key);
          
          // ใช้สถานะจาก logs ถ้ามี
          const logsStatus = logsStatusMap[p.id];
          let status = 'รอดำเนินการ';
          let status_name = 'รอดำเนินการ';
          
          console.log(`[DEBUG] Work plan ${p.id} logs status:`, logsStatus);
          console.log(`[DEBUG] Work plan ${p.id} status_id:`, p.status_id);
          
          // ตรวจสอบ status_id จากฐานข้อมูลก่อน
          if (p.status_id === 9) {
            status = 'ยกเลิกการผลิต';
            status_name = 'ยกเลิกการผลิต';
            console.log(`[DEBUG] Work plan ${p.id} is cancelled (status_id: 9)`);
          } else if (logsStatus) {
            status = logsStatus.message;
            status_name = logsStatus.message;
            console.log(`[DEBUG] Using logs status for work plan ${p.id}: ${status}`);
          } else {
            status = p.status === 'แผนจริง' || !p.status ? 'บันทึกสำเร็จ' : p.status;
            status_name = p.status === 'แผนจริง' || !p.status ? 'บันทึกสำเร็จ' : p.status;
            console.log(`[DEBUG] Using default status for work plan ${p.id}: ${status}`);
          }
          
          // Parse operators จาก draft หรือจาก work plan
          let operatorNames = '';
          try {
            if (draft && draft.operators) {
              // ใช้ operators จาก draft ก่อน
              const operators = typeof draft.operators === 'string' ? JSON.parse(draft.operators) : draft.operators;
              if (Array.isArray(operators)) {
                operatorNames = operators.map((o: any) => o.name || o).join(', ');
              }
            } else if (p.operators) {
              // ใช้ operators จาก work plan
              const operators = typeof p.operators === 'string' ? JSON.parse(p.operators) : p.operators;
              if (Array.isArray(operators)) {
                operatorNames = operators.map((o: any) => o.name || o).join(', ');
              }
            }
          } catch (e) {
            console.error('Error parsing operators for work plan', p.id, e);
            operatorNames = '';
          }
          
          return {
            ...p,
            isDraft: false,
            status: status,
            status_name: status_name,
            recordStatus: p.recordStatus === 'แผนจริง' || !p.recordStatus ? 'บันทึกสำเร็จ' : p.recordStatus,
            isPrinted: true, // งานที่ sync แล้วถือว่าพิมพ์แล้ว
            operators: operatorNames, // เพิ่ม operators ที่ parse แล้ว
            production_room: (draft && (draft.production_room_name || draft.production_room_id || draft.production_room)) || p.production_room_name || p.production_room_id || p.production_room || 'ไม่ระบุ',
            machine_id: (draft && draft.machine_id) || p.machine_id || '',
            notes: (draft && draft.notes) || p.notes || '',
            // เพิ่มข้อมูลสำหรับการแยกงานพิเศษ
            is_special: p.status_id === 10 ? 1 : 0, // งานพิเศษถ้า status_id = 10
            workflow_status_id: p.status_id || 1, // ใช้ status_id เป็น workflow_status_id
          };
        })
      ];
             setProductionData(allData);
       console.log('📊 [DEBUG] All production data loaded:', allData.length, 'items');
       console.log('📊 [DEBUG] Sample data:', allData.slice(0, 3));
       isCreatingRef.current = false; // reset flag หลังโหลดข้อมูลเสร็จ
     } catch (error) {
       console.error('Error loading production data:', error);
     } finally {
       setIsLoadingData(false);
     }
  };

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successDialogMessage, setSuccessDialogMessage] = useState("");

  // ฟังก์ชันแปลงชื่อแสดงผลงาน (เติม prefix เฉพาะตอนแสดงผลเท่านั้น, ใช้ is_special)
  const getDisplayJobName = (item: any, jobsOfDay: any[]) => {
    const defaultCodes = ['A', 'B', 'C', 'D'];
    
    // ถ้าเป็นงาน A, B, C, D ให้แสดงแค่ job_code
    if (defaultCodes.includes(item.job_code)) {
      return item.job_code;
    }
    
    // สำหรับงานอื่นๆ ให้หาลำดับในรายการของวันนั้น
    const sameDayJobs = jobsOfDay.filter(j => 
      j.production_date === item.production_date && 
      !defaultCodes.includes(j.job_code)
    );
    
    // เรียงตามลำดับการแสดงผล
    const sortedJobs = getSortedDailyProduction(sameDayJobs);
    const jobIndex = sortedJobs.findIndex(j => j.id === item.id);
    
    return jobIndex >= 0 ? `งานที่ ${jobIndex + 1}` : `งานที่ ${item.id}`;
  };

  // ฟังก์ชันคำนวณข้อมูลสรุปการลงคนลงเวลา
  const calculateDailySummary = (jobs: any[]) => {
    // กรองเฉพาะงานที่มีผู้ปฏิบัติงานและเวลา
    const validJobs = jobs.filter(job => 
      job.operators && 
      job.operators.length > 0 && 
      job.start_time && 
      job.end_time
    );

    // รวบรวมผู้ปฏิบัติงานทั้งหมดที่ไม่ซ้ำในวันนั้น
    const allWorkers = new Set<string>();
    
    // คำนวณเวลาที่ใช้จริง (คน-ชั่วโมง)
    let totalUsedTime = 0;
    let totalWorkHours = 0;

    // สร้าง Map สำหรับเก็บเวลาของแต่ละคน
    const workerHours = new Map<string, number>();

    validJobs.forEach(job => {
      // เพิ่มผู้ปฏิบัติงานในงานนี้เข้าไปใน Set (ไม่ซ้ำ)
      const workers = job.operators.split(', ').filter((w: string) => w.trim());
      workers.forEach((worker: string) => allWorkers.add(worker));

      // คำนวณเวลาที่ใช้ในงานนี้ (หักเวลาพักเที่ยง)
      const startTime = new Date(`2000-01-01 ${job.start_time}`);
      const endTime = new Date(`2000-01-01 ${job.end_time}`);
      let durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // ตรวจสอบว่าข้ามเที่ยงหรือไม่ (12:00-13:00)
      const lunchStart = new Date(`2000-01-01 12:00`);
      const lunchEnd = new Date(`2000-01-01 13:00`);
      
      // ถ้างานข้ามเที่ยง ให้หัก 45 นาที (0.75 ชั่วโมง)
      if (startTime < lunchEnd && endTime > lunchStart) {
        durationHours -= 0.75; // หัก 45 นาที
      }
      
      // คำนวณคน-ชั่วโมง (จำนวนคน × เวลาที่ใช้)
      const workerCount = workers.length;
      totalUsedTime += durationHours * workerCount;

      // เพิ่มเวลาสำหรับแต่ละคน
      workers.forEach((worker: string) => {
        const currentHours = workerHours.get(worker) || 0;
        workerHours.set(worker, currentHours + durationHours);
      });
    });

    // จำนวนผู้ปฏิบัติงานที่ไม่ซ้ำในวันนั้น
    const totalWorkers = allWorkers.size;

    // คำนวณชั่วโมงงาน (จำนวนผู้ปฏิบัติงาน × 8 ชั่วโมง)
    totalWorkHours = totalWorkers * 8;

    // คำนวณ Capacity (%)
    const capacityPercentage = totalWorkHours > 0 ? (totalUsedTime / totalWorkHours) * 100 : 0;

    // สร้างรายการข้อมูลของแต่ละคน
    const workerDetails = Array.from(allWorkers).map(worker => {
      const hours = workerHours.get(worker) || 0;
      const quota = 8; // โคต้า 8 ชั่วโมง
      const maxQuota = 8.5; // เกิน 8 ชั่วโมง 30 นาที ให้ถือว่าเต็มเวลา
      const remaining = Math.max(0, quota - hours);
      
      let status, displayHours, displayText;
      
      if (hours >= maxQuota) {
        // เกิน 8.5 ชั่วโมง ให้แสดงว่าเต็มเวลา
        status = 'full';
        displayHours = quota;
        displayText = 'ได้รับงานเต็มเวลา';
      } else if (remaining <= 2) {
        // เหลือ 0-2 ชั่วโมง
        status = 'limited';
        displayHours = hours;
        displayText = `เหลือ ${remaining.toFixed(1)} ชม.`;
      } else {
        // เหลือมากกว่า 2 ชั่วโมง
        status = 'available';
        displayHours = hours;
        displayText = `เหลือ ${remaining.toFixed(1)} ชม.`;
      }
      
      return {
        name: worker,
        hours: hours,
        quota: quota,
        remaining: remaining,
        status: status,
        displayHours: displayHours,
        displayText: displayText
      };
    }).sort((a, b) => b.hours - a.hours); // เรียงตามเวลาจากมากไปน้อย

    return {
      totalWorkers,
      totalWorkHours,
      totalUsedTime,
      capacityPercentage,
      validJobsCount: validJobs.length,
      uniqueWorkers: Array.from(allWorkers), // เพิ่มรายชื่อผู้ปฏิบัติงานที่ไม่ซ้ำ
      lunchBreakDeduction: 0.75, // ข้อมูลเวลาพักเที่ยงที่หัก
      availableWorkers: users
        .filter(user => !allWorkers.has(user.name)) // คนที่ไม่ได้ทำงาน
        .filter(user => !['RD', 'จรัญ', 'พี่สัญญา'].includes(user.name)) // กรองพนักงานเสริมออก
        .map(user => user.name), // คนที่ว่างงาน (เฉพาะผู้ปฏิบัติงานหลัก)
      availableSupportStaff: users
        .filter(user => !allWorkers.has(user.name)) // คนที่ไม่ได้ทำงาน
        .filter(user => ['RD', 'จรัญ', 'พี่สัญญา'].includes(user.name)) // เฉพาะพนักงานเสริม
        .map(user => user.name), // พนักงานเสริมที่ว่าง
      workerDetails: workerDetails // รายละเอียดของแต่ละคน
    };
  };

  // เพิ่มฟังก์ชันเรียงลำดับงานแบบเดียวกับ Draft
  const sortJobsForDisplay = (jobs: any[]) => {
    return [...jobs].sort((a, b) => {
      const timeA = a.start_time || "00:00";
      const timeB = b.start_time || "00:00";
      const timeComparison = timeA.localeCompare(timeB);
      if (timeComparison !== 0) return timeComparison;
      // เรียงผู้ปฏิบัติงานที่ขึ้นต้นด้วย 'อ' ขึ้นก่อน
      const opA = (typeof a.operators === 'string' ? a.operators : "").split(", ")[0] || "";
      const opB = (typeof b.operators === 'string' ? b.operators : "").split(", ")[0] || "";
      const indexA = opA.indexOf("อ");
      const indexB = opB.indexOf("อ");
      if (indexA === 0 && indexB !== 0) return -1;
      if (indexB === 0 && indexA !== 0) return 1;
      return opA.localeCompare(opB);
    });
  };

  // ฟังก์ชันสำหรับ Daily View: งานปกติเรียงก่อน งานพิเศษต่อท้าย (ใช้ is_special)
  const getSortedDailyProduction = (jobs: any[]) => {
    const defaultCodes = ['A', 'B', 'C', 'D'];
    
    // แยกงานเป็นกลุ่มต่างๆ
    const defaultDrafts = jobs.filter(j => defaultCodes.includes(j.job_code));
    const normalJobs = jobs.filter(j => !defaultCodes.includes(j.job_code) && j.is_special !== 1);
    const specialJobs = jobs.filter(j => j.is_special === 1 && !defaultCodes.includes(j.job_code));
    
    // แยกงานแบบร่าง (isDraft = true) ออกจากงานปกติ
    const normalDrafts = normalJobs.filter(j => j.isDraft);
    const normalCompleted = normalJobs.filter(j => !j.isDraft);
    const specialDrafts = specialJobs.filter(j => j.isDraft);
    const specialCompleted = specialJobs.filter(j => !j.isDraft);
    
    // เรียงงาน default ตามลำดับ A, B, C, D
    defaultDrafts.sort((a, b) => defaultCodes.indexOf(a.job_code) - defaultCodes.indexOf(b.job_code));
    
    // เรียงงานปกติและงานพิเศษที่เสร็จแล้วตามเวลา
    const sortFn = (a: any, b: any) => {
      const timeA = a.start_time || "00:00";
      const timeB = b.start_time || "00:00";
      const timeComparison = timeA.localeCompare(timeB);
      if (timeComparison !== 0) return timeComparison;
      const opA = getOperatorsArray(a.operators)[0] || "";
      const opB = getOperatorsArray(b.operators)[0] || "";
      const indexA = opA.indexOf("อ");
      const indexB = opB.indexOf("อ");
      if (indexA === 0 && indexB !== 0) return -1;
      if (indexB === 0 && indexA !== 0) return 1;
      return opA.localeCompare(opB);
    };
    
    normalCompleted.sort(sortFn);
    specialCompleted.sort(sortFn);
    
    // เรียงงานแบบร่างตามเวลาที่สร้าง (ใหม่สุดอยู่ล่างสุด)
    const sortDraftsByCreatedAt = (a: any, b: any) => {
      const createdAtA = new Date(a.created_at || a.updated_at || 0);
      const createdAtB = new Date(b.created_at || b.updated_at || 0);
      return createdAtA.getTime() - createdAtB.getTime(); // เรียงจากเก่าไปใหม่
    };
    
    normalDrafts.sort(sortDraftsByCreatedAt);
    specialDrafts.sort(sortDraftsByCreatedAt);
    
    // ส่งคืนตามลำดับ: default -> งานปกติเสร็จแล้ว -> งานปกติแบบร่าง -> งานพิเศษเสร็จแล้ว -> งานพิเศษแบบร่าง (งานพิเศษอยู่ล่างสุดเสมอ)
    return [
      ...defaultDrafts,
      ...normalCompleted,
      ...normalDrafts,
      ...specialCompleted,
      ...specialDrafts
    ];
  };

  // ฟังก์ชันสำหรับ Weekly View: ไม่รวมงาน A, B, C, D
  const getSortedWeeklyProduction = (jobs: any[]) => {
    const defaultCodes = ['A', 'B', 'C', 'D'];
    // กรองออกงาน A, B, C, D ทั้งหมด
    const filteredJobs = jobs.filter(j => !defaultCodes.includes(j.job_code));
    
    // งานพิเศษ (is_special === 1)
    const specialJobs = filteredJobs.filter(j => j.is_special === 1);
    // งานปกติ (is_special !== 1)
    const normalJobs = filteredJobs.filter(j => j.is_special !== 1);
    
    const sortFn = (a: any, b: any) => {
      const timeA = a.start_time || "00:00";
      const timeB = b.start_time || "00:00";
      const timeComparison = timeA.localeCompare(timeB);
      if (timeComparison !== 0) return timeComparison;
      const opA = getOperatorsArray(a.operators)[0] || "";
      const opB = getOperatorsArray(b.operators)[0] || "";
      const indexA = opA.indexOf("อ");
      const indexB = opB.indexOf("อ");
      if (indexA === 0 && indexB !== 0) return -1;
      if (indexB === 0 && indexA !== 0) return 1;
      return opA.localeCompare(opB);
    };
    
    normalJobs.sort(sortFn);
    specialJobs.sort(sortFn);
    
    return [
      ...normalJobs,
      ...specialJobs
    ];
  };

  // ฟังก์ชันสร้าง time slots 30 นาที
  function generateTimeSlots(start = "08:00", end = "17:00", step = 30) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const result = [];
    let [h, m] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    
    while (h < endH || (h === endH && m <= endM)) {
      const timeSlot = `${pad(h)}:${pad(m)}`;
      
      // ข้ามเวลาพักเที่ยง 12:30-13:15
      if (timeSlot === "12:30") {
        result.push("12:30-13:15"); // เพิ่มคอลัมน์เวลาพักเที่ยง
        // ข้ามไปที่ 13:15
        h = 13;
        m = 15;
        continue;
      }
      
      result.push(timeSlot);
      m += step;
      if (m >= 60) { h++; m = m - 60; }
    }
    return result;
  }

  // ฟังก์ชันเตรียมข้อมูล Time Table
  function getTimeTableData(jobs: any[], users: any[]) {
    // กรองเฉพาะผู้ปฏิบัติงานหลัก
    const mainUsers = users.filter(u => !["RD", "จรัญ", "พี่สัญญา"].includes(u.name));
    const timeSlots = generateTimeSlots();
    
    // สลับตำแหน่ง แมน กับ แจ็ค (แมนขึ้นก่อน)
    const sortedUsers = mainUsers.sort((a, b) => {
      if (a.name === "แมน") return -1;
      if (b.name === "แมน") return 1;
      if (a.name === "แจ็ค") return 1;
      if (b.name === "แจ็ค") return -1;
      return a.name.localeCompare(b.name);
    });
    
    // เตรียมข้อมูลแต่ละคน
    const data = sortedUsers.map(user => {
      // หางานที่ user นี้ทำ
      const userJobs = jobs.filter(job => {
        if (!job.operators || !job.start_time || !job.end_time) return false;
        return job.operators.split(", ").includes(user.name);
      });
      
      // สร้างข้อมูล slot ที่มีการ merge งานต่อเนื่อง
      const slots = timeSlots.map((slot, slotIndex) => {
        // ตรวจสอบว่าเป็นเวลาพักเที่ยงหรือไม่
        if (slot === "12:30-13:15") {
          return {
            hasJob: false,
            jobName: "",
            jobCode: "",
            isStart: false,
            isEnd: false,
            colspan: 1,
            isLunchBreak: true
          };
        }
        
        // หางานที่ตรงกับ slot นี้
        const jobInfo = userJobs.find(job => {
          return slot >= job.start_time && slot < job.end_time;
        });
        
        if (!jobInfo) {
          return {
            hasJob: false,
            jobName: "",
            jobCode: "",
            isStart: false,
            isEnd: false,
            colspan: 1,
            isLunchBreak: false
          };
        }
        
        // คำนวณ colspan สำหรับงานต่อเนื่อง
        const jobStartSlotIndex = timeSlots.findIndex(s => s >= jobInfo.start_time);
        const jobEndSlotIndex = timeSlots.findIndex(s => s >= jobInfo.end_time);
        const colspan = jobEndSlotIndex > jobStartSlotIndex ? jobEndSlotIndex - jobStartSlotIndex : 1;
        
        // ตรวจสอบว่าเป็น slot แรกของงานนี้หรือไม่
        const isStart = slotIndex === jobStartSlotIndex;
        
        // ตรวจสอบว่าเป็น slot สุดท้ายของงานนี้หรือไม่
        const isEnd = slotIndex === jobStartSlotIndex + colspan - 1;
        
        return {
          hasJob: true,
          jobName: jobInfo.job_name,
          jobCode: jobInfo.job_code,
          isStart,
          isEnd,
          colspan: isStart ? colspan : 1,
          isLunchBreak: false
        };
      });
      
      return { name: user.name, slots };
    });
    return { timeSlots, data };
  }

  // สีสำหรับแต่ละคน
  const workerColors = {
    "ป้าน้อย": "bg-blue-400",
    "พี่ตุ่น": "bg-green-400", 
    "พี่ภา": "bg-yellow-400",
    "สาม": "bg-purple-400",
    "อาร์ม": "bg-pink-400",
    "เอ": "bg-indigo-400",
    "แจ็ค": "bg-orange-400",
    "แมน": "bg-red-400",
    "โอเล่": "bg-teal-400"
  };

  // คอมโพเนนต์ TimeTable
  function TimeTable({ jobs, users, staffImages }: { jobs: any[], users: any[], staffImages: any }) {
    const { timeSlots, data } = getTimeTableData(jobs, users);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-max border text-sm shadow-lg">
          <thead>
            <tr>
              <th className="p-2 border bg-gray-100 text-left font-semibold text-sm">ชื่อ</th>
              {timeSlots.map((slot, idx) => (
                <th 
                  key={slot} 
                  className={`p-2 border text-center font-bold text-base min-w-[80px] ${
                    slot === "12:30-13:15" 
                      ? "bg-orange-200 text-orange-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {slot === "12:30-13:15" ? "พักเที่ยง" : slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.name}>
                <td className="p-2 border bg-white whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <img src={staffImages[row.name] || "/placeholder-user.jpg"} alt={row.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-semibold text-sm">{row.name}</span>
                  </div>
                </td>
                {row.slots.map((slot, i) => {
                  // ข้าม slot ที่ไม่ใช่จุดเริ่มต้นของงาน
                  if (slot.hasJob && !slot.isStart) {
                    return null;
                  }
                  
                  return (
                    <td 
                      key={i} 
                      colSpan={slot.hasJob ? slot.colspan : 1}
                      className={`border p-3 relative min-h-[50px] ${
                        slot.isLunchBreak 
                          ? "bg-gray-200 text-gray-600" 
                          : slot.hasJob 
                            ? workerColors[row.name as keyof typeof workerColors] || "bg-green-400" 
                            : "bg-white"
                      }`}
                    >
                      {slot.isLunchBreak && (
                        <div className="flex items-center justify-center text-base font-bold min-h-[50px]">
                          <span className="text-center leading-tight">
                            พักเที่ยง
                          </span>
                        </div>
                      )}
                      {slot.hasJob && (
                        <div className="flex items-center justify-center text-white text-sm font-medium min-h-[50px] overflow-hidden">
                          <span className="text-center leading-tight" title={slot.jobName}>
                            {slot.jobName}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Debug Modal state
  useEffect(() => {
    console.log('🔍 Modal state changed:', { editDraftModalOpen, editDraftData: !!editDraftData });
  }, [editDraftModalOpen, editDraftData]);

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadAllProductionData();
    loadSettings(); // เพิ่มการโหลดการตั้งค่า
  }, []);

  // ฟังก์ชันโหลดการตั้งค่า
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSyncModeEnabled(data.data.syncModeEnabled || false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // ฟังก์ชันจัดการสถานะงาน
  const getJobStatus = (item: any) => {
    // งานที่มี workflow_status_id = 2 (บันทึกเสร็จสิ้น) ควรแสดงเป็น "บันทึกเสร็จสิ้น"
    if (item.workflow_status_id === 2 || item.workflow_status_id === "2") {
      return "บันทึกเสร็จสิ้น";
    }
    
    // งานที่มี workflow_status_id = 1 (แบบร่าง) ควรแสดงเป็น "แบบร่าง"
    if (item.workflow_status_id === 1 || item.workflow_status_id === "1") {
      return "แบบร่าง";
    }
    
    // งานพิเศษที่มี status_id = 10 และ "บันทึกเสร็จสิ้น"
    if ((item.status_id === 10 || item.status_id === "10") && 
        (item.recordStatus === "บันทึกเสร็จสิ้น" || item.recordStatus === "เสร็จสิ้น" || item.recordStatus === "บันทึกสำเร็จ")) {
      return "พิมพ์แล้ว";
    }
    
    // งานที่มี recordStatus เป็น "บันทึกสำเร็จ" ควรเป็น "พิมพ์แล้ว"
    if (item.recordStatus === "บันทึกสำเร็จ") {
      return "พิมพ์แล้ว";
    }
    
    // งานที่มี status_id = 3 หรือ recordStatus เป็น "กำลังดำเนินการ"
    if ((item.status_id === 3 || item.status_id === "3") || 
        (item.recordStatus === "กำลังดำเนินการ" || item.recordStatus === "ดำเนินการ")) {
      return "กำลังดำเนินการ";
    }
    
    // งานปกติที่มีใน Table work_plans (ไม่ใช่ draft) และไม่มี workflow_status_id = 2 ควรเป็น "พิมพ์แล้ว"
    if (!item.isDraft && item.workflow_status_id && item.workflow_status_id !== 2) {
      return "พิมพ์แล้ว";
    }
    
    return item.recordStatus;
  };

  // ฟังก์ชันตรวจสอบว่าควรแสดง label "งานพิเศษ" หรือไม่
  const shouldShowSpecialJobLabel = (item: any) => {
    // แสดง label "งานพิเศษ" ทุกครั้งที่ status_id เป็น 10
    return (item.status_id === 10 || item.status_id === "10");
  };

  return (
    <div className={`min-h-screen bg-gray-200 ${notoSansThai.className} flex flex-col`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-800 via-green-700 to-green-600 border-b border-green-600 shadow-md">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate">
                ระบบจัดการแผนการผลิตครัวกลาง บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)
              </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center space-x-1 text-sm text-green-100 hover:text-white hover:bg-white/10 transition-colors duration-200 p-2"
                  >
                    <span>ระบบจัดการข้อมูล</span>
                    <ChevronDownIcon className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>หน้าหลัก</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/logs" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>ระบบจัดการ Logs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tracker" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>ติดตามการผลิต</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/reports" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>รายงาน</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/users" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>จัดการผู้ใช้</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>ตั้งค่าระบบ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/monitoring" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span>ติดตามสถานะ</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="hidden sm:block text-xs sm:text-sm text-white">ผู้ใช้: Admin</span>
                <span className="sm:hidden text-xs text-white">Admin</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8 pt-17 sm:pt-20 md:pt-24">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                    {/* Left Panel - Schedule Form */}
          <div
            className={`transition-all duration-300 ${isFormCollapsed ? "lg:w-0 lg:overflow-hidden" : "w-full lg:w-2/5"}`}
          >
            <Card className="shadow-lg bg-white h-fit">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="leading-7 text-2xl">เพิ่มงานที่ต้องการผลิต</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                    className="text-white bg-green-600 hover:bg-green-700 border-2 border-green-500 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </CardHeader>

              {!isFormCollapsed && (
                <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">วันที่ผลิต</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-8 sm:pl-10 text-sm"
                      />
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Autocomplete Job Name/Code */}
                  <div className="space-y-2 relative">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เพิ่มงานผลิต</Label>
                    <div className="relative">
                      <SearchBox
                        value={jobQuery}
                        onChange={setJobQuery}
                        onSelect={(item: SearchOption) => {
                          justSelectedFromDropdownRef.current = true;
                          setJobCode(item.job_code);
                          setJobName(item.job_name);
                          setJobQuery(item.job_name);
                        }}
                        cacheRef={searchCacheRef}
                        onError={(error) => {
                          console.error('SearchBox error:', error);
                          setMessage(`ข้อผิดพลาดในการค้นหา: ${error}`);
                        }}
                      />
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Staff Positions */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">ผู้ปฏิบัติงาน (1-4 คน)</Label>
                      <Button variant="link" size="sm" className="text-green-600 p-0 h-auto text-xs">
                        ล้างข้อมูลทั้งหมด
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[1, 2, 3, 4].map((position) => (
                        <div key={position} className="space-y-1 sm:space-y-2">
                          <Label className="text-xs text-gray-600">ผู้ปฏิบัติงาน {position}</Label>
                          <Select
                            value={operators[position - 1] || "__none__"}
                            onValueChange={(val) => {
                              const newOps = [...operators];
                              newOps[position - 1] = val === "__none__" ? "" : val;
                              setOperators(newOps);
                            }}
                          >
                            <SelectTrigger className="h-8 sm:h-9 text-sm">
                              <SelectValue placeholder="เลือก" />
                            </SelectTrigger>
                            <SelectContent className={notoSansThai.className}>
                              <SelectItem value="__none__" className={notoSansThai.className}>กรุณาเลือก</SelectItem>
                              {users.map(u => (
                                <SelectItem key={u.id_code} value={u.name} className={notoSansThai.className}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เครื่องบันทึกข้อมูลการผลิต</Label>
                    <Select
                      value={selectedMachine || "__none__"}
                      onValueChange={val => setSelectedMachine(val === "__none__" ? "" : val)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="เลือก..." />
                      </SelectTrigger>
                      <SelectContent className={notoSansThai.className}>
                        <SelectItem value="__none__" className={notoSansThai.className}>กรุณาเลือก</SelectItem>
                        {machines.map(m => (
                          <SelectItem key={m.machine_code} value={m.machine_code} className={notoSansThai.className}>{m.machine_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาเริ่ม</Label>
                      <div className="relative">
                        <Select value={startTime || "__none__"} onValueChange={val => setStartTime(val === "__none__" ? "" : val)}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="เลือกเวลาเริ่ม..." />
                          </SelectTrigger>
                          <SelectContent className={notoSansThai.className}>
                            <SelectItem value="__none__" className={notoSansThai.className}>เลือกเวลาเริ่ม...</SelectItem>
                            {timeOptions.map(t => (
                              <SelectItem key={t} value={t} className={notoSansThai.className}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาสิ้นสุด</Label>
                      <div className="relative">
                        <Select value={endTime || "__none__"} onValueChange={val => setEndTime(val === "__none__" ? "" : val)}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="เลือกเวลาสิ้นสุด..." />
                          </SelectTrigger>
                          <SelectContent className={notoSansThai.className}>
                            <SelectItem value="__none__" className={notoSansThai.className}>เลือกเวลาสิ้นสุด...</SelectItem>
                            {timeOptions.map(t => (
                              <SelectItem key={t} value={t} className={notoSansThai.className}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">หมายเหตุ</Label>
                    <Textarea
                      placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับการผลิต..."
                      className="min-h-[60px] sm:min-h-[80px] resize-none text-sm"
                      value={note}
                      onChange={debouncedNoteChange}
                    />
                  </div>

                  {/* ห้องผลิต (dropdown จริง ใต้เวลาเริ่ม-สิ้นสุด) */}
                  <div className="space-y-2 mt-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">ห้องผลิต</Label>
                    <Select
                      value={selectedRoom || "__none__"}
                      onValueChange={val => setSelectedRoom(val === "__none__" ? "" : val)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="เลือกห้องผลิต..." />
                      </SelectTrigger>
                      <SelectContent className={notoSansThai.className}>
                        <SelectItem value="__none__" className={notoSansThai.className}>กรุณาเลือก</SelectItem>
                        {rooms.map(r => (
                          <SelectItem key={r.room_code} value={r.room_code} className={notoSansThai.className}>{r.room_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 bg-white text-sm font-medium py-2 px-4"
                        onClick={() => {
                          console.log('🔧 Button clicked!');
                          handleSaveDraft();
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "กำลังบันทึก..." : "บันทึกแบบร่าง"}
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 shadow-md"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "กำลังบันทึก..." : "บันทึกเสร็จสิ้น"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            {/* Dashboard Card แยกออกมา */}
            {!isFormCollapsed && (
              <Card className="shadow-lg bg-white mt-8">
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span>Dashboard การลงคนลงเวลา</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTimeTable(true)}
                    className="text-xs px-2 py-1 whitespace-nowrap border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    แสดงตารางเวลาการทำงาน
                  </Button>
                </CardHeader>
                <CardContent>
                  {(() => {
                      const summary = calculateDailySummary(getSelectedDayProduction());
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="text-blue-600 font-medium">จำนวนผู้ปฏิบัติงาน</div>
                              <div className="text-2xl font-bold text-blue-700">{summary.totalWorkers} คน</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="text-green-600 font-medium">ชั่วโมงงาน</div>
                              <div className="text-2xl font-bold text-green-700">{summary.totalWorkHours.toFixed(1)} ชม.</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <div className="text-orange-600 font-medium">เวลาที่ใช้ลงงาน</div>
                              <div className="text-2xl font-bold text-orange-700">{summary.totalUsedTime.toFixed(1)} ชม.</div>
                              <div className="text-xs text-orange-600 mt-1">(หักพักเที่ยง 45 นาที)</div>
                            </div>
                            <div className={`p-3 rounded-lg border ${
                              summary.capacityPercentage > 100 
                                ? 'bg-red-50 border-red-200' 
                                : summary.capacityPercentage >= 80 
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-yellow-50 border-yellow-200'
                            }`}>
                              <div className={`font-medium ${
                                summary.capacityPercentage > 100 
                                  ? 'text-red-600' 
                                  : summary.capacityPercentage >= 80 
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                              }`}>Capacity</div>
                              <div className={`text-2xl font-bold ${
                                summary.capacityPercentage > 100 
                                  ? 'text-red-700' 
                                  : summary.capacityPercentage >= 80 
                                    ? 'text-green-700'
                                    : 'text-yellow-700'
                              }`}>
                                {summary.capacityPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          {/* รายชื่อผู้ปฏิบัติงาน */}
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <div className="text-gray-600 font-bold text-base mb-2">รายชื่อผู้ปฏิบัติงาน ({summary.totalWorkers} คน)</div>
                            <div className="text-sm text-gray-700">
                              {summary.uniqueWorkers.join(', ')}
                            </div>
                          </div>

                          {/* คนที่ว่างงาน - แสดงเฉพาะเมื่อมีคนว่าง */}
                          {summary.availableWorkers.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="text-blue-600 font-medium mb-2">ผู้ปฏิบัติงานหลักที่ว่าง ({summary.availableWorkers.length} คน)</div>
                              <div className="text-sm text-blue-700">
                                {summary.availableWorkers.join(', ')}
                              </div>
                            </div>
                          )}

                          {/* รายละเอียดของแต่ละคน */}
                          <div 
                            className="bg-gray-50 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setShowWorkerDetails(!showWorkerDetails)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-gray-600 font-medium">รายละเอียดการทำงานของแต่ละคน</div>
                              {/* ลบปุ่มแสดงตารางเวลาการทำงานออก เหลือแค่ปุ่ม toggle รายละเอียด */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // ป้องกันการ trigger onClick ของ parent
                                  setShowWorkerDetails(!showWorkerDetails);
                                }}
                                className="p-1 h-6 w-6"
                              >
                                {showWorkerDetails ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            {showWorkerDetails && (
                              <div className="space-y-2">
                                {summary.workerDetails.map((worker, index) => (
                                <div key={index} className={`p-3 rounded border text-xs ${
                                  worker.status === 'full' 
                                    ? 'bg-red-50 border-red-200'
                                    : worker.status === 'limited'
                                      ? 'bg-yellow-50 border-yellow-200'
                                      : 'bg-green-50 border-green-200'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage
                                          src={staffImages[worker.name] || "/placeholder-user.jpg"}
                                          alt={worker.name}
                                          className="object-cover object-center"
                                        />
                                        <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-800">
                                          {worker.name.substring(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium text-sm">{worker.name}</span>
                                    </div>
                                    <span className={`font-bold text-sm ${
                                      worker.status === 'full' 
                                        ? 'text-red-600'
                                        : worker.status === 'limited'
                                          ? 'text-yellow-600'
                                          : 'text-green-600'
                                    }`}>
                                      {worker.displayHours.toFixed(1)} / {worker.quota} ชม.
                                    </span>
                                  </div>
                                  <div className={`text-xs mt-2 ml-11 ${
                                    worker.status === 'full' 
                                      ? 'text-red-600'
                                      : worker.status === 'limited'
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                  }`}>
                                    {worker.displayText}
                                  </div>
                                </div>
                              ))}
                              </div>
                            )}
                          </div>

                          {/* Status Indicator */}
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <div className="text-gray-600 font-medium mb-2">สถานะการลงคนลงเวลา</div>
                            <div className={`text-sm font-medium p-2 rounded ${
                              summary.capacityPercentage > 100 
                                ? 'text-red-700 bg-red-100 border border-red-200' 
                                : summary.capacityPercentage >= 80 
                                  ? 'text-green-700 bg-green-100 border border-green-200'
                                  : 'text-yellow-700 bg-yellow-100 border border-yellow-200'
                            }`}>
                              {summary.capacityPercentage > 100 
                                ? '⚠️ เกินความสามารถ (เกิน 100%) - ควรเพิ่มคนหรือลดงาน' 
                                : summary.capacityPercentage >= 80 
                                  ? '✅ การลงคนลงเวลาสมบูรณ์ (80-100%) - ใช้งานเต็มที่'
                                  : '⚡ การลงคนลงเวลาต่ำ (ต่ำกว่า 80%) - ควรเพิ่มงานหรือลดคน'
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </CardContent>
              </Card>
            )}
          </div>



          {/* Mobile Toggle Button */}
          {isFormCollapsed && (
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsFormCollapsed(false)}
                className="text-white bg-green-800 hover:bg-green-900 border-2 border-green-600 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Desktop Toggle Button - Tab Style */}
          {isFormCollapsed && (
            <div className="hidden lg:block fixed left-0 top-32 z-40 group">
              <div className="bg-white rounded-r-lg shadow-lg border-r-2 border-green-200 hover:w-64 transition-all duration-300 w-10 h-20 flex items-center justify-center cursor-pointer hover:shadow-xl hover:bg-green-50" onClick={() => setIsFormCollapsed(false)}>
                <div className="flex items-center justify-center w-full h-full group-hover:justify-start group-hover:px-4">
                  <PanelLeftOpen className="w-4 h-4 text-green-600 group-hover:mr-3 group-hover:w-5 group-hover:h-5 transition-all duration-300" />
                  <span className="hidden group-hover:inline text-green-600 font-semibold whitespace-nowrap text-sm animate-fade-in">เพิ่มรายการใหม่</span>
                </div>
              </div>
            </div>
          )}

          {/* Right Panel - Schedule View */}
          <div className={`transition-all duration-300 ${isFormCollapsed ? "w-full lg:ml-0" : "w-full lg:w-3/5"}`}>
            <Card className="shadow-lg bg-white">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <CardTitle
                    className={`flex items-center space-x-2 ${
                      isFormCollapsed ? "text-lg sm:text-xl md:text-2xl" : "text-sm sm:text-base md:text-lg"
                    }`}
                  >
                    <Calendar
                      className={`${isFormCollapsed ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5"} text-green-600`}
                    />
                    <span className="text-2xl">รายการแผนผลิต</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {viewMode === "daily" && (
                                          <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncDrafts}
                      disabled={isSubmitting}
                      className="bg-white border-green-600 text-green-700 hover:bg-green-50 flex items-center space-x-1 sm:space-x-2"
                    >
                      <RefreshCw className={`${isFormCollapsed ? "w-3 h-3 sm:w-4 sm:h-4" : "w-3 h-3"}`} />
                      <span className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"}`}>พิมพ์ใบงานผลิต</span>
                    </Button>
                    )}
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === "daily" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("daily")}
                        className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} px-2 sm:px-3 py-1 ${
                          viewMode === "daily" ? "bg-green-600 text-white" : "text-gray-600"
                        }`}
                      >
                        รายวัน
                      </Button>
                      <Button
                        variant={viewMode === "weekly" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("weekly")}
                        className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} px-2 sm:px-3 py-1 ${
                          viewMode === "weekly" ? "bg-green-600 text-white" : "text-gray-600"
                        }`}
                      >
                        รายสัปดาห์
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "weekly" ? (
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {/* Week Navigation */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <Button
                        variant="outline"
                        size={isFormCollapsed ? "default" : "sm"}
                        onClick={() => navigateWeek("prev")}
                        className="flex items-center justify-center space-x-1 text-xs sm:text-sm"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">สัปดาห์ก่อนหน้า</span>
                        <span className="sm:hidden">ก่อน</span>
                      </Button>
                      <div className="text-center">
                        <h3
                          className={`font-medium text-gray-900 ${
                            isFormCollapsed ? "text-sm sm:text-lg md:text-xl" : "text-xs sm:text-sm md:text-base"
                          }`}
                        >
                          {weekRange}
                        </h3>
                        <p className={`text-gray-600 mt-1 ${isFormCollapsed ? "text-sm" : "text-xs"}`}>
                          รวมงานทั้งสัปดาห์: {weekProduction.length} งาน
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size={isFormCollapsed ? "default" : "sm"}
                        onClick={() => navigateWeek("next")}
                        className="flex items-center justify-center space-x-1 text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">สัปดาห์ถัดไป</span>
                        <span className="sm:hidden">หน้า</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>

                    {/* Loading Indicator */}
                    {isLoadingData && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                      </div>
                    )}

                    {/* Weekly Calendar Table */}
                    {!isLoadingData && (
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          {/* Header Row */}
                          <div className="grid grid-cols-6 gap-1 mb-2">
                            {weekDates.map((date, index) => {
                              const dateStr = formatDateForAPI(date)
                              const dayProduction = productionData.filter((item) => formatDateForAPI(item.production_date) === dateStr)
                              const filteredDayProduction = getSortedWeeklyProduction(dayProduction)

                              return (
                                <div key={index} className={`${getDayBackgroundColor(date)} rounded-lg p-2 text-center`}>
                                  {/* ชื่อวัน - ขนาดใหญ่ขึ้น */}
                                  <div
                                    className={`${isFormCollapsed ? "text-lg sm:text-xl font-bold" : "text-base sm:text-lg font-bold"} ${getDayTextColor(date)} mb-2`}
                                  >
                                    {getDayName(date)}
                                  </div>

                                  {/* วันที่และเดือนในบรรทัดเดียวกัน */}
                                  <div className="flex items-center justify-center space-x-1 mb-2">
                                    <div
                                      className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} font-semibold ${getDayTextColor(date)}`}
                                    >
                                      {date.getDate()}
                                    </div>
                                    <div
                                      className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} ${getDayTextColor(date)} opacity-90`}
                                    >
                                      {date.toLocaleDateString("th-TH", { month: "short" })}
                                    </div>
                                  </div>

                                  <div
                                    className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${getDayTextColor(date)} opacity-75 mt-1`}
                                  >
                                    {filteredDayProduction.length} งาน
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Production Content Grid */}
                          <div className="grid grid-cols-6 gap-1">
                            {weekDates.map((date, index) => {
                              const dateStr = formatDateForAPI(date)
                              const dayProduction = productionData.filter((item) => formatDateForAPI(item.production_date) === dateStr)
                              const filteredDayProduction = getSortedWeeklyProduction(dayProduction)

                              return (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-lg p-2 bg-white min-h-[200px] sm:min-h-[400px] flex flex-col"
                                >
                                  {filteredDayProduction.length > 0 ? (
                                    <div className="space-y-2 flex-1">
                                      {filteredDayProduction.map((item, itemIndex) => (
                                        <div
                                          key={item.id}
                                          className={`p-2 border-l-4 min-h-[140px] flex flex-col ${
                                            item.status === "งานผลิตถูกยกเลิก" || item.status_name === "ยกเลิกการผลิต"
                                              ? "border-l-red-500 bg-red-50"
                                              : item.status_name === "งานผลิตเสร็จสิ้น" || item.status_name === "เสร็จสิ้น"
                                                ? "border-l-green-500 bg-green-50"
                                                : (item.status_name && (item.status_name.includes("รอดำเนินการ") || item.status_name.toLowerCase().includes("pending")))
                                                  ? "border-l-gray-500 bg-gray-50"
                                                  : "border-l-gray-500 bg-gray-50"
                                          }`}
                                        >
                                          {/* ชื่องานผลิต */}
                                          <div
                                            className={`font-medium text-gray-900 ${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} mb-1 leading-tight flex-1`}
                                          >
                                            <span className="underline">งานที่ {itemIndex + 1} :</span> {item.job_name}
                                          </div>

                                          {/* เวลา */}
                                          <div
                                            className={`flex items-center space-x-1 ${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} text-gray-600 mb-2`}
                                          >
                                            <Clock
                                              className={`${isFormCollapsed ? "w-3 h-3" : "w-2.5 h-2.5"} flex-shrink-0`}
                                            />
                                            <span>{item.start_time?.substring(0, 5) || "08:00"} - {(item.end_time || "17:00:00").substring(0, 5)}</span>
                                          </div>

                                          {/* หมายเหตุ (ถ้ามี) */}
                                          {(item.notes || item.note) && (
                                            <div
                                              className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} text-gray-500 italic mb-2`}
                                            >
                                              หมายเหตุ: {item.notes || item.note}
                                            </div>
                                          )}

                                          {/* สถานะ */}
                                          <div className="mt-auto">
                                            <span
                                              className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                                                item.status === "งานผลิตถูกยกเลิก" || item.status_name === "ยกเลิกการผลิต"
                                                  ? "bg-red-100 text-red-700"
                                                  : item.status_name === "กำลังดำเนินการ"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : item.status_name === "งานผลิตเสร็จสิ้น" || item.status_name === "เสร็จสิ้น"
                                                      ? "bg-green-100 text-green-700"
                                                      : (item.status_name && (item.status_name.includes("รอดำเนินการ") || item.status_name.toLowerCase().includes("pending")))
                                                        ? "bg-gray-100 text-gray-700"
                                                        : "bg-gray-100 text-gray-700"
                                              }`}
                                            >
                                              {item.status_name || "รอดำเนินการ"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                      <div className="text-center">
                                        <Calendar
                                          className={`${isFormCollapsed ? "w-8 h-8" : "w-6 h-6"} mx-auto mb-2 opacity-50`}
                                        />
                                        <p className={`${isFormCollapsed ? "text-xs" : "text-xs"}`}>ไม่มีงานผลิต</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {/* Loading Indicator */}
                    {isLoadingData && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                      </div>
                    )}

                    {/* Daily View */}
                    {!isLoadingData && (
                      <>
                    <div
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                        isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                      } text-gray-600`}
                    >
                      <span>รายวัน</span>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full sm:w-auto text-sm"
                      />
                    </div>

                    <Separator />

                    {/* Get production data for selected date */}
                    {(() => {
                      // ใช้ getSelectedDayProduction() แทนการ filter โดยตรง เพื่อให้แสดงเลขงาน A B C D
                      const dailyProduction = getSelectedDayProduction();
                      
                      return dailyProduction.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          <h4
                            className={`font-medium text-gray-900 ${
                              isFormCollapsed ? "text-sm sm:text-lg md:text-xl" : "text-xs sm:text-sm md:text-base"
                            }`}
                          >
                                                         งานผลิตวันที่ {formatDateForDisplay(new Date(selectedDate), 'full')} จำนวน {dailyProduction.length} งาน
                          </h4>

                          {getSortedDailyProduction(dailyProduction).map((item) => {
                            console.log('🎯 [DEBUG] Rendering card for item:', {
                              id: item.id,
                              job_name: item.job_name,
                              operators: item.operators,
                              production_room: item.production_room,
                              operators_type: typeof item.operators
                            });
                            return (
                            <div
                              key={item.id}
                              className={`border-l-4 ${
                                item.status === "งานผลิตถูกยกเลิก" || item.status_name === "ยกเลิกการผลิต"
                                  ? "border-l-red-400 bg-red-50"
                                  : item.status_name === "งานผลิตเสร็จสิ้น" || item.status_name === "เสร็จสิ้น"
                                      ? "border-l-green-400 bg-green-50"
                                      : (item.status_name && (item.status_name.includes("รอดำเนินการ") || item.status_name.toLowerCase().includes("pending")))
                                      ? "border-l-gray-400 bg-gray-50"
                                          : "border-l-gray-400 bg-gray-50"
                              } ${isFormCollapsed ? "p-3 sm:p-4 md:p-6" : "p-2 sm:p-3 md:p-4"} rounded-r-lg`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} bg-blue-50 border-blue-300 text-blue-700 font-medium flex-shrink-0`}
                                    >
                                      {formatDateThaiShort(item.production_date)}
                                    </Badge>
                                    <h3
                                      className={`font-bold text-gray-900 ${
                                        isFormCollapsed
                                          ? "text-sm sm:text-lg md:text-xl"
                                          : "text-xs sm:text-sm md:text-base"
                                      } truncate`}
                                    >
                                      {getDisplayJobName(item, dailyProduction)}: {item.job_name}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} flex-shrink-0`}
                                    >
                                      ห้องผลิต: {getRoomName(item.production_room)}
                                    </Badge>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant="outline"
                                        className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${
                                          item.status_name === "งานผลิตถูกยกเลิก" || item.status_name === "ยกเลิกการผลิต"
                                                ? "border-red-500 text-red-700"
                                            : (item.status_name && (item.status_name.includes("รอดำเนินการ") || item.status_name.toLowerCase().includes("pending")))
                                              ? "border-gray-500 text-gray-700"
                                              : item.status_name === "งานผลิตเสร็จสิ้น" || item.status_name === "เสร็จสิ้น"
                                                ? "border-green-500 text-green-700"
                                                : "border-gray-500 text-gray-700"
                                        } flex-shrink-0`}
                                      >
                                        {item.status_name}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${
                                          getJobStatus(item) === "พิมพ์แล้ว"
                                            ? "border-green-500 text-green-700 bg-green-50"
                                            : getJobStatus(item) === "บันทึกเสร็จสิ้น" || getJobStatus(item) === "บันทึกสำเร็จ"
                                              ? "border-green-500 text-green-700 bg-green-50"
                                              : "border-gray-500 text-gray-700 bg-gray-50"
                                        } flex-shrink-0`}
                                      >
                                        {getJobStatus(item)}
                                      </Badge>
                                      {/* แสดง label "งานพิเศษ" เมื่อเปิดโหมดงานพิเศษ */}
                                      {shouldShowSpecialJobLabel(item) && (
                                        <Badge
                                          variant="secondary"
                                          className="bg-yellow-100 text-yellow-800 border-yellow-300 flex-shrink-0"
                                        >
                                          งานพิเศษ
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Staff and Planner Section - ในแถวเดียวกัน */}
                                  <div className="flex items-center justify-between">
                                    {/* Staff Section - ด้านซ้าย */}
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                    {renderStaffAvatars(item.operators, isFormCollapsed)}
                                  </div>

                                    {/* ผู้วางแผนการผลิต - ด้านขวาสุด */}
                                    <div className="flex items-center space-x-2">
                                      <div className="flex -space-x-2">
                                        {/* แสดงผู้ตรวจสอบ: จิ๋ว สำหรับแบบร่าง, จิ๋ว+จรัญ สำหรับเสร็จสิ้น */}
                                        {(item.recordStatus === "บันทึกแบบร่าง" || item.recordStatus === "แบบร่าง") ? (
                                          <Avatar
                                            className={`${isFormCollapsed ? "w-12 h-12 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-12 sm:h-12"} border-2 border-white shadow-sm`}
                                          >
                                            <AvatarImage
                                              src="/images/staff/จิ๋ว.jpg"
                                              alt="จิ๋ว"
                                              className="object-cover object-center avatar-image"
                                              style={{ imageRendering: "crisp-edges" }}
                                            />
                                            <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-800">
                                              จิ
                                            </AvatarFallback>
                                          </Avatar>
                                        ) : (
                                          <>
                                            <Avatar
                                              className={`${isFormCollapsed ? "w-12 h-12 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-12 sm:h-12"} border-2 border-white shadow-sm`}
                                            >
                                              <AvatarImage
                                                src="/images/staff/จิ๋ว.jpg"
                                                alt="จิ๋ว"
                                                className="object-cover object-center avatar-image"
                                                style={{ imageRendering: "crisp-edges" }}
                                              />
                                              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-800">
                                                จิ
                                              </AvatarFallback>
                                            </Avatar>
                                            <Avatar
                                              className={`${isFormCollapsed ? "w-12 h-12 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-12 sm:h-12"} border-2 border-white shadow-sm`}
                                            >
                                              <AvatarImage
                                                src="/images/staff/จรัญ.jpg"
                                                alt="จรัญ"
                                                className="object-cover object-center avatar-image"
                                                style={{ imageRendering: "crisp-edges" }}
                                              />
                                              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-800">
                                                จ
                                              </AvatarFallback>
                                            </Avatar>
                                          </>
                                        )}
                                      </div>
                                      <span
                                        className={`${isFormCollapsed ? "text-base sm:text-lg" : "text-sm sm:text-base"} text-slate-900`}
                                      >
                                        ตรวจสอบแผนการผลิต: {(item.recordStatus === "บันทึกแบบร่าง" || item.recordStatus === "แบบร่าง") ? "จิ๋ว ✔" : "จิ๋ว, จรัญ ✔✔"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div
                                      className={`flex items-center space-x-1 sm:space-x-2 ${isFormCollapsed ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
                                  >
                                    <Clock
                                      className={`${isFormCollapsed ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"} text-gray-400 flex-shrink-0`}
                                    />
                                      <span className="text-blue-600 font-semibold">
                                        {item.start_time?.substring(0, 5) || "08:00"} - {(item.end_time || "17:00:00").substring(0, 5)}
                                      </span>
                                      {/* หมายเหตุ (ถ้ามี) - อยู่บรรทัดเดียวกับเวลา */}
                                      {item.notes && (
                                        <span
                                          className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} text-red-600 font-semibold ml-3 bg-red-50 px-2 py-1 rounded border-l-2 border-red-400`}
                                        >
                                          หมายเหตุ: {item.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                    </div>

                                <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                                  {/* ปุ่ม */}
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                      {/* เพิ่มปุ่มสำหรับรายการที่มี จิ๋ว เพียงคนเดียวในการตรวจสอบ */}
                                      {(item.recordStatus === "บันทึกแบบร่าง" || item.recordStatus === "แบบร่าง" || item.recordStatus === "รอดำเนินการ") && (
                                        <>
                                    <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditDraft(item)}
                                            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white text-xs font-medium px-2 py-1"
                                          >
                                            <Edit className="w-3 h-3" />
                                    </Button>
                                        </>
                                      )}
                                      {/* เพิ่มปุ่มสำหรับรายการที่มี จิ๋ว, จรัญ ในการตรวจสอบ */}
                                      {(item.recordStatus === "บันทึกเสร็จสิ้น" || item.recordStatus === "เสร็จสิ้น" || item.recordStatus === "บันทึกสำเร็จ") && (
                                        <>
                                      {/* แสดงปุ่มรูปตาสำหรับงานที่มีสถานะ "กำลังดำเนินการ" */}
                                      {getJobStatus(item) === "กำลังดำเนินการ" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewProductionDetails(item)}
                                            className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-white text-xs font-medium px-2 py-1"
                                          >
                                            <Eye className="w-3 h-3" />
                                        </Button>
                                      )}
                                      {/* เปลี่ยนปุ่มดินสอเป็นปุ่มกากบาทเมื่อสถานะเป็น "พิมพ์แล้ว" */}
                                      {getJobStatus(item) === "พิมพ์แล้ว" ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelProduction(item.id)}
                                            className="border-2 border-red-300 text-red-600 hover:bg-red-50 bg-white text-xs font-medium px-2 py-1"
                                          >
                                            <XCircle className="w-3 h-3" />
                                        </Button>
                                      ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditDraft(item)}
                                            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white text-xs font-medium px-2 py-1"
                                          >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                      )}
                                        </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <Calendar
                            className={`${isFormCollapsed ? "w-12 h-12 sm:w-16 sm:h-16" : "w-8 h-8 sm:w-12 sm:h-12"} mx-auto mb-3 sm:mb-4 text-gray-300`}
                          />
                          <p className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                                                         ไม่มีงานผลิตในวันที่ {formatDateForDisplay(new Date(selectedDate), 'full')}
                          </p>
                        </div>
                      );
                    })()}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 border-t border-green-600 shadow-md mt-6 sm:mt-8">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-center items-center h-10 sm:h-12">
            <p className="text-xs sm:text-sm text-white text-center">
              © 2025 แผนกเทคโนโลยีสารสนเทศ บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)
            </p>
          </div>
        </div>
      </footer>

      {/* Modal สำหรับแก้ไข draft */}
      <Dialog open={editDraftModalOpen} onOpenChange={setEditDraftModalOpen}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${notoSansThai.className}`}>
          <DialogHeader>
            <DialogTitle className={notoSansThai.className}>แก้ไขแบบร่างงานผลิต</DialogTitle>
          </DialogHeader>

      {/* Modal สำหรับแสดงรายละเอียดการผลิต */}
      <Dialog open={productionDetailsModalOpen} onOpenChange={setProductionDetailsModalOpen}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${notoSansThai.className}`}>
          <DialogHeader>
            <DialogTitle className={notoSansThai.className}>รายละเอียดการผลิต</DialogTitle>
          </DialogHeader>
          {productionDetailsData && (
            <div className="space-y-6">
              {/* ข้อมูลงาน */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>ชื่องาน</Label>
                    <p className={`text-lg font-semibold text-gray-900 ${notoSansThai.className}`}>
                      {productionDetailsData.job_name}
                    </p>
                  </div>
                  <div>
                    <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>หมายเหตุ</Label>
                    <p className={`text-sm text-gray-600 ${notoSansThai.className}`}>
                      {productionDetailsData.notes || productionDetailsData.note || "ไม่มีหมายเหตุ"}
                    </p>
                  </div>
                  <div>
                    <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>ผู้ปฏิบัติงาน</Label>
                    <p className={`text-sm text-gray-600 ${notoSansThai.className}`}>
                      {productionDetailsData.operators || "ไม่ระบุ"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>เวลาเริ่มต้นตามแผนผลิต</Label>
                    <p className={`text-lg font-semibold text-blue-600 ${notoSansThai.className}`}>
                      {productionDetailsData.start_time || "ไม่ระบุ"}
                    </p>
                  </div>
                  <div>
                    <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>เวลาสิ้นสุดตามแผนผลิต</Label>
                    <p className={`text-lg font-semibold text-blue-600 ${notoSansThai.className}`}>
                      {productionDetailsData.end_time || "ไม่ระบุ"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ข้อมูลจาก Logs */}
              <div>
                <Label className={`text-lg font-bold text-gray-700 ${notoSansThai.className}`}>ข้อมูลการผลิตตามจริง</Label>
                {productionLogs.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {productionLogs.map((log, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="mb-3">
                          <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>ขั้นตอนที่ {log.process_number}</Label>
                          <p className={`text-sm text-gray-600 ${notoSansThai.className}`}>
                            {log.process_description || "ไม่ระบุ"}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>เวลาเริ่มต้นตามจริง</Label>
                            <p className={`text-sm text-green-600 ${notoSansThai.className}`}>
                              {formatTime(log.start_time)}
                            </p>
                          </div>
                          <div>
                            <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>เวลาสิ้นสุดตามจริง</Label>
                            <p className={`text-sm text-green-600 ${notoSansThai.className}`}>
                              {formatTime(log.stop_time)}
                            </p>
                          </div>
                          <div>
                            <Label className={`text-sm font-bold text-gray-700 ${notoSansThai.className}`}>เวลาที่ใช้</Label>
                            <p className={`text-sm text-purple-600 ${notoSansThai.className}`}>
                              {formatDuration(log.used_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className={`text-sm text-gray-500 text-center ${notoSansThai.className}`}>
                      ไม่มีข้อมูลการผลิตตามจริง
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setProductionDetailsModalOpen(false)}
              className={notoSansThai.className}
            >
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-2">
            {/* คอลัมน์ซ้าย */}
            <div className="space-y-3">
              {/* วันที่ผลิต */}
              <div className="space-y-1">
                <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>วันที่ผลิต</Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className={`text-sm h-8 ${notoSansThai.className}`}
                />
              </div>
              {/* ชื่องาน */}
              <div className="space-y-1">
                <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>ชื่องาน</Label>
                <Input
                  value={editJobName}
                  onChange={e => setEditJobName(e.target.value)}
                  className={`text-sm h-8 ${notoSansThai.className}`}
                />
              </div>
              {/* เครื่องบันทึกข้อมูลการผลิต */}
              <div className="space-y-1">
                <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>เครื่องบันทึกข้อมูลการผลิต</Label>
                <Select
                  value={editMachine || "__none__"}
                  onValueChange={val => setEditMachine(val === "__none__" ? "" : val)}
                >
                  <SelectTrigger className={`text-sm h-8 ${notoSansThai.className}`}>
                    <SelectValue placeholder="เลือก..." />
                  </SelectTrigger>
                  <SelectContent className={notoSansThai.className}>
                    <SelectItem value="__none__" className={notoSansThai.className}>กรุณาเลือก</SelectItem>
                    {machines.map(m => (
                      <SelectItem key={m.machine_code} value={m.machine_code} className={notoSansThai.className}>{m.machine_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* ห้องผลิต */}
              <div className="space-y-1">
                <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>ห้องผลิต</Label>
                <Select
                  value={editRoom || "__none__"}
                  onValueChange={val => setEditRoom(val === "__none__" ? "" : val)}
                >
                  <SelectTrigger className={`text-sm h-8 ${notoSansThai.className}`}>
                    <SelectValue placeholder="เลือกห้องผลิต..." />
                  </SelectTrigger>
                  <SelectContent className={notoSansThai.className}>
                    <SelectItem value="__none__" className={notoSansThai.className}>กรุณาเลือก</SelectItem>
                    {rooms.map(r => (
                      <SelectItem key={r.room_code} value={r.room_code} className={notoSansThai.className}>{r.room_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div className="space-y-3">
              {/* ผู้ปฏิบัติงาน */}
              <div className="space-y-1">
                <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>ผู้ปฏิบัติงาน (1-4 คน)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((position) => (
                    <div key={position} className="space-y-1">
                      <Label className={`text-xs text-gray-600 ${notoSansThai.className}`}>ผู้ปฏิบัติงาน {position}</Label>
                      <Select
                        value={editOperators[position - 1] || "__none__"}
                        onValueChange={val => {
                          const newOps = [...editOperators];
                          newOps[position - 1] = val === "__none__" ? "" : val;
                          setEditOperators(newOps);
                        }}
                      >
                        <SelectTrigger className={`h-8 text-xs ${notoSansThai.className}`}>
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent className={notoSansThai.className}>
                          <SelectItem value="__none__" className={notoSansThai.className}>กรุณาเลือก</SelectItem>
                          {users && users.length > 0 ? (
                            users.map(u => (
                              <SelectItem key={u.id_code} value={u.name} className={notoSansThai.className}>{u.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="__none__" className={notoSansThai.className}>ไม่พบข้อมูลผู้ปฏิบัติงาน</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              {/* เวลาเริ่ม-สิ้นสุด */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>เวลาเริ่ม</Label>
                  <Select value={editStartTime || "__none__"} onValueChange={val => setEditStartTime(val === "__none__" ? "" : val)}>
                    <SelectTrigger className={`text-sm h-8 ${notoSansThai.className}`}>
                      <SelectValue placeholder="เลือกเวลาเริ่ม..." />
                    </SelectTrigger>
                    <SelectContent className={notoSansThai.className}>
                      <SelectItem value="__none__" className={notoSansThai.className}>เลือกเวลาเริ่ม...</SelectItem>
                      {timeOptions && timeOptions.length > 0 ? (
                        timeOptions.map(t => (
                          <SelectItem key={t} value={t} className={notoSansThai.className}>{t}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__none__" className={notoSansThai.className}>ไม่พบตัวเลือกเวลา</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>เวลาสิ้นสุด</Label>
                  <Select value={editEndTime || "__none__"} onValueChange={val => setEditEndTime(val === "__none__" ? "" : val)}>
                    <SelectTrigger className={`text-sm h-8 ${notoSansThai.className}`}>
                      <SelectValue placeholder="เลือกเวลาสิ้นสุด..." />
                    </SelectTrigger>
                    <SelectContent className={notoSansThai.className}>
                      <SelectItem value="__none__" className={notoSansThai.className}>เลือกเวลาสิ้นสุด...</SelectItem>
                      {timeOptions && timeOptions.length > 0 ? (
                        timeOptions.map(t => (
                          <SelectItem key={t} value={t} className={notoSansThai.className}>{t}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__none__" className={notoSansThai.className}>ไม่พบตัวเลือกเวลา</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* หมายเหตุ */}
              <div className="space-y-1">
                <Label className={`text-xs font-bold text-gray-700 ${notoSansThai.className}`}>หมายเหตุ</Label>
                <Textarea
                  placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับการผลิต..."
                  className={`min-h-[60px] resize-none text-sm ${notoSansThai.className}`}
                  value={editNote}
                  onChange={debouncedEditNoteChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {/* แสดงปุ่มลบเฉพาะแบบร่างเท่านั้น */}
            {(() => {
              const shouldShowDelete = editDraftData && (editDraftData.isDraft || editDraftData.id?.startsWith('draft_'));
              return shouldShowDelete ? (
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteDraft(editDraftId)} 
                  disabled={isSubmitting}
                  className={`bg-red-600 hover:bg-red-700 text-white ${notoSansThai.className}`}
                >
                  {isSubmitting ? "กำลังลบ..." : "ลบ"}
                </Button>
              ) : null;
            })()}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSaveEditDraft(true)} disabled={isSubmitting} className={notoSansThai.className}>บันทึกแบบร่าง</Button>
              <Button onClick={() => handleSaveEditDraft(false)} disabled={isSubmitting} className={`bg-green-700 hover:bg-green-800 text-white ${notoSansThai.className}`}>
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกเสร็จสิ้น"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className={`max-w-xs text-center ${notoSansThai.className}`}>
          <DialogHeader>
            <DialogTitle className={notoSansThai.className}>ข้อผิดพลาด</DialogTitle>
          </DialogHeader>
          <div className="mb-4">{errorDialogMessage}</div>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)} className={`w-full ${notoSansThai.className}`}>ตกลง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog สำหรับแสดง popup แจ้งเตือนเมื่อบันทึกเสร็จสิ้น */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className={`max-w-xs text-center ${notoSansThai.className}`}>
          <DialogHeader>
            <DialogTitle className={`${notoSansThai.className} text-green-600`}>สำเร็จ</DialogTitle>
          </DialogHeader>
          <div className="mb-4 text-green-700">{successDialogMessage}</div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className={`w-full bg-green-600 hover:bg-green-700 text-white ${notoSansThai.className}`}>ตกลง</Button>
          </DialogFooter>
        </DialogContent>
              </Dialog>

        {/* Time Table Popup Dialog */}
        <Dialog open={showTimeTable} onOpenChange={setShowTimeTable}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span>ตารางเวลาการทำงาน - {formatDateForDisplay(new Date(selectedDate), 'full')}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <TimeTable
                jobs={getSelectedDayProduction()}
                users={users}
                staffImages={staffImages}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setShowTimeTable(false)}>
                ปิด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
}
