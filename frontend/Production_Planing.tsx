"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  User,
  XCircle,
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

  // เพิ่ม state สำหรับฟอร์ม
  const [operators, setOperators] = useState(["", "", "", ""]); // 4 ตำแหน่ง
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // เพิ่ม state สำหรับ dropdown และ autocomplete
  const [jobQuery, setJobQuery] = useState("");
  const [jobOptions, setJobOptions] = useState<{job_code: string, job_name: string}[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [jobCode, setJobCode] = useState("");
  const [users, setUsers] = useState<{id: number, id_code: string, name: string}[]>([]);
  const [machines, setMachines] = useState<{id: number, machine_code: string, machine_name: string}[]>([]);
  const [rooms, setRooms] = useState<{id: number, room_code: string, room_name: string}[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const jobInputRef = useRef<HTMLInputElement>(null);
  const [jobName, setJobName] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const justSelectedFromDropdownRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // เพิ่ม cache สำหรับผลลัพธ์การค้นหา
  const searchCacheRef = useRef<Map<string, {job_code: string, job_name: string}[]>>(new Map());
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
    console.log('📅 Setting initial selectedDate:', todayString);
    setSelectedDate(todayString);
  }, []);

  // state สำหรับข้อมูลแผนผลิตจริง
  const [productionData, setProductionData] = useState<any[]>([]);
  
  // ดึงข้อมูลแผนผลิตจริงและแบบร่างมารวมกัน
  useEffect(() => {
    loadAllProductionData();
  }, []);

  // Fetch dropdown data on mount
  useEffect(() => {
    console.log('🔍 Fetching dropdown data...');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    // Fetch users
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/machines`)
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/production-rooms`)
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

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process-steps/search?query=${encodeURIComponent(debouncedJobQuery)}`, {
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

    for (let i = 0; i < 7; i++) {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
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
      "bg-green-100 border-green-200", // พุธ - สีเขียว
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
      "text-green-800", // พุธ
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
  const weekRange = `${formatFullDate(weekDates[0])} - ${formatFullDate(weekDates[6])}`

  // Get production data for current week
  const getWeekProduction = () => {
    const weekStart = weekDates[0].toISOString().split("T")[0];
    const weekEnd = weekDates[6].toISOString().split("T")[0];
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
        const operatorA = (a.operators || "").split(", ")[0] || "";
        const operatorB = (b.operators || "").split(", ")[0] || "";
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
    const normalizeDate = (dateStr: string) => dateStr ? dateStr.split('T')[0] : '';
    const dayData = productionData.filter(item => normalizeDate(item.production_date) === normalizeDate(targetDate));

    // งาน default (A,B,C,D)
    let defaultDrafts = dayData.filter(item => item.isDraft && defaultCodes.includes(item.job_code));
    defaultDrafts.sort((a, b) => defaultCodes.indexOf(a.job_code) - defaultCodes.indexOf(b.job_code));

    // งานปกติ (is_special !== 1, ไม่ใช่ default, isDraft = false)
    const normalJobs = dayData.filter(item => !defaultCodes.includes(item.job_code) && item.is_special !== 1 && !item.isDraft);
    // งานพิเศษ (is_special === 1, isDraft = false)
    const specialJobs = dayData.filter(item => !defaultCodes.includes(item.job_code) && item.is_special === 1 && !item.isDraft);
    // งาน draft (isDraft = true, ไม่ใช่ default)
    const draftJobs = dayData.filter(item => !defaultCodes.includes(item.job_code) && item.isDraft);

    // ฟังก์ชันเรียงตามเวลา/คน
    const sortFn = (a: any, b: any) => {
      const timeA = a.start_time || "00:00";
      const timeB = b.start_time || "00:00";
      const timeComparison = timeA.localeCompare(timeB);
      if (timeComparison !== 0) return timeComparison;
      const operatorA = (a.operators || "").split(", ")[0] || "";
      const operatorB = (b.operators || "").split(", ")[0] || "";
      const indexA = operatorA.indexOf("อ");
      const indexB = operatorB.indexOf("อ");
      if (indexA === 0 && indexB !== 0) return -1;
      if (indexB === 0 && indexA !== 0) return 1;
      return operatorA.localeCompare(operatorB);
    };
    normalJobs.sort(sortFn);
    specialJobs.sort(sortFn);
    draftJobs.sort(sortFn);

    // รวมกลุ่มตามลำดับที่ต้องการ
    return [...defaultDrafts, ...normalJobs, ...specialJobs, ...draftJobs];
  };

  const weekProduction = getWeekProduction()
  const selectedDayProduction = getSelectedDayProduction()

  // เพิ่มฟังก์ชันส่งข้อมูลไป Google Sheet
  const sendToGoogleSheet = async (data: any) => {
    console.log("🟡 [DEBUG] call sendToGoogleSheet", data);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/send-to-google-sheet`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log("🟢 [DEBUG] Google Sheet result:", result);
    } catch (err) {
      console.error("🔴 [DEBUG] Google Sheet error:", err);
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
      const operatorA = (a.operators || "").split(", ")[0] || ""
      const operatorB = (b.operators || "").split(", ")[0] || ""
      
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts`, {
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
      console.log('📅 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts`);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts`, {
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
  const getRoomName = (roomCodeOrId: string) => {
    if (!roomCodeOrId || roomCodeOrId === 'ไม่ระบุ') return 'ไม่ระบุ';
    
    // console.log('🔍 getRoomName input:', roomCodeOrId, 'type:', typeof roomCodeOrId);
    // console.log('🔍 Available rooms:', rooms.map(r => ({ id: r.id, room_code: r.room_code, room_name: r.room_name })));
    // ลองหาโดยใช้ room_code ก่อน
    let room = rooms.find(r => r.room_code === roomCodeOrId);
    
    // หากไม่เจอ ลองหาโดยใช้ ID
    if (!room) {
      room = rooms.find(r => r.id.toString() === roomCodeOrId.toString());
    }
    
    const result = room ? room.room_name : roomCodeOrId;
    // console.log('🔍 getRoomName result:', result);
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
        <span className="text-gray-500 font-medium flex-shrink-0">หมายเหตุ:</span>
        <span className="text-gray-600 break-words">
          {item.notes || item.note}
        </span>
      </div>
    );
  };



  // Helper function to render staff avatars
  const renderStaffAvatars = (staff: string, isFormCollapsed: boolean) => {
    if (!staff) {
      return (
        <span className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} text-gray-400`}>
          ไม่มีข้อมูลผู้ปฏิบัติงาน
        </span>
      );
    }
    const staffList = staff.split(", ");
    
    return (
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
        <div className="flex -space-x-1 sm:-space-x-2">
          {staffList.map((person, index) => {
            // หา id_code จาก name
            const user = users.find(u => u.name === person);
            const idCode = user?.id_code;
            
            return (
            <Avatar
              key={index}
                className={`${
                  isFormCollapsed
                    ? "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
                    : "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                } border-2 border-white shadow-sm flex-shrink-0`}
              >
                <AvatarImage
                  src={staffImages[person] || (idCode && staffImages[idCode]) || `/placeholder.svg?height=80&width=80&text=${person.charAt(0)}`}
                  alt={person}
                  className="object-cover object-center avatar-image"
                  style={{ imageRendering: "crisp-edges" }}
                />
              <AvatarFallback className="text-xs font-medium bg-green-100 text-green-800">
                {person.charAt(0)}
              </AvatarFallback>
            </Avatar>
            );
          })}
        </div>
        <span
          className={`${
            isFormCollapsed ? "text-xs sm:text-sm md:text-base lg:text-lg" : "text-xs sm:text-sm"
          } text-gray-600 truncate min-w-0`}
        >
          ผู้ปฏิบัติงาน: {staff}
        </span>
      </div>
    )
  }

  const [editDraftModalOpen, setEditDraftModalOpen] = useState(false);
  const [editDraftData, setEditDraftData] = useState<any | null>(null);
  const [editDraftId, setEditDraftId] = useState<string>("");

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
    console.log('✏️ Operators data:', {
      operators: draftItem.operators,
      operatorsType: typeof draftItem.operators,
      operatorsLength: draftItem.operators?.length
    });
    setEditDraftData(draftItem);
    setEditDraftId(draftItem.id.replace('draft_', ''));
    setEditDraftModalOpen(true);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts/${editDraftData.id.replace('draft_', '')}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isDraft ? "บันทึกแบบร่างสำเร็จ" : "บันทึกเสร็จสิ้น");
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/sync-drafts-to-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: selectedDate })
      });
      // 1. เตรียมข้อมูล summaryRows สำหรับ 1.ใบสรุปงาน v.4 (ไม่เอา A, B, C, D)
      const defaultCodes = ['A', 'B', 'C', 'D'];
          // ฟังก์ชันแปลงรหัส/ID ห้องเป็นชื่อห้อง
    const getRoomNameByCodeOrId = (codeOrId: string) => {
      if (!codeOrId) return "";
      const room = rooms.find(r => r.room_code === codeOrId || r.id?.toString() === codeOrId?.toString());
      return room?.room_name || codeOrId;
    };
    // ฟังก์ชันแปลง ID เครื่องเป็นชื่อเครื่อง
    const getMachineNameById = (machineId: string) => {
      if (!machineId) return "";
      const machine = machines.find(m => m.id?.toString() === machineId?.toString());
      return machine?.machine_name || machineId;
    };
      // เรียงงานตาม logic หน้าเว็บ
      const filtered = productionData
        .filter(item => item.production_date === selectedDate && !(item.isDraft && defaultCodes.includes(item.job_code)))
        .sort((a, b) => {
          const timeA = a.start_time || "00:00";
          const timeB = b.start_time || "00:00";
          const timeComparison = timeA.localeCompare(timeB);
          if (timeComparison !== 0) return timeComparison;
          const operatorA = (a.operators || "").split(", ")[0] || "";
          const operatorB = (b.operators || "").split(", ")[0] || "";
          const indexA = operatorA.indexOf("อ");
          const indexB = operatorB.indexOf("อ");
          if (indexA === 0 && indexB !== 0) return -1;
          if (indexB === 0 && indexA !== 0) return 1;
          return operatorA.localeCompare(operatorB);
        });
      const summaryRows = filtered.map((item, idx) => {
        let ops = (item.operators || "").split(", ").map((s: string) => s.trim());
        while (ops.length < 4) ops.push("");
        return [
          idx + 1, // ลำดับ
          item.job_code || "",
          item.job_name || "", // ใช้ชื่อจริงเท่านั้น
          ops[0],
          ops[1],
          ops[2],
          ops[3],
          item.start_time || "",
          item.end_time || "",
          getMachineNameById(item.machine_id), // ส่งชื่อเครื่อง
          getRoomNameByCodeOrId(item.production_room) // ส่งชื่อห้อง
        ];
      });
      // 2. ส่ง batch ไป 1.ใบสรุปงาน v.4
      await sendToGoogleSheet({
        sheetName: "1.ใบสรุปงาน v.4",
        rows: summaryRows,
        clearSheet: true
      });

      // 3. เตรียมข้อมูลสำหรับ Log_แผนผลิต (แยกแถวตามผู้ปฏิบัติงาน)
      const logRows: string[][] = [];
      const today = new Date();
      const dateString = today.toLocaleDateString('th-TH', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric' 
      }).replace('พ.ศ.', '').trim();
      const dateValue = today.toLocaleDateString('en-GB'); // DD/MM/YYYY
      const timeStamp = today.toLocaleString('en-GB') + ', ' + today.toLocaleTimeString('en-GB');

      filtered.forEach((item) => {
        const operators = (item.operators || "").split(", ").map((s: string) => s.trim()).filter(Boolean);
        
        if (operators.length === 0) {
          // ถ้าไม่มีผู้ปฏิบัติงาน ส่ง 1 แถว
          logRows.push([
            dateString, // วันที่
            dateValue, // Date Value
            item.job_code || "", // เลขที่งาน (รหัสจริง)
            item.job_name || "", // ชื่องาน (ชื่อจริง)
            "", // ผู้ปฏิบัติงาน (ว่าง)
            item.start_time || "", // เวลาเริ่มต้น
            item.end_time || "", // เวลาสิ้นสุด
            getRoomNameByCodeOrId(item.production_room) // ห้อง
          ]);
        } else {
          // ถ้ามีผู้ปฏิบัติงาน ส่งแถวละคน
          operators.forEach((operator: string) => {
            logRows.push([
              dateString, // วันที่
              dateValue, // Date Value
              item.job_code || "", // เลขที่งาน (รหัสจริง)
              item.job_name || "", // ชื่องาน (ชื่อจริง)
              operator, // ผู้ปฏิบัติงาน
              item.start_time || "", // เวลาเริ่มต้น
              item.end_time || "", // เวลาสิ้นสุด
              getRoomNameByCodeOrId(item.production_room) // ห้อง
            ]);
          });
        }
      });

      // 4. ส่ง batch ไป Log_แผนผลิต (แยกการส่ง)
      if (logRows.length > 0) {
        console.log("🟡 [DEBUG] ส่งข้อมูลไป Log_แผนผลิต:", logRows.length, "แถว");
        await sendToGoogleSheet({
          sheetName: "Log_แผนผลิต",
          rows: logRows,
          clearSheet: true
        });
        console.log("🟢 [DEBUG] ส่งข้อมูลไป Log_แผนผลิต สำเร็จ");
      }
      // 5. อัปเดตวันที่ใน D1 ของ sheet รายงาน-เวลาผู้ปฏิบัติงาน
      await sendToGoogleSheet({
        sheetName: "รายงาน-เวลาผู้ปฏิบัติงาน",
        "Date Value": dateValue
      });
      setIsSubmitting(false);
      
      // เพิ่มการ reload productionData หลัง sync สำเร็จ
      console.log("🔄 [DEBUG] Sync completed, reloading production data...");
      await loadAllProductionData();
      console.log("🟢 [DEBUG] Production data reloaded successfully");
      
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
          const url = `${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/${workPlanId}/cancel`;
    console.log('🔴 [DEBUG] Making PATCH request to:', url);
    
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
      
      console.log('🔴 [DEBUG] Response status:', res.status);
      console.log('🔴 [DEBUG] Response ok:', res.ok);
      
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

  const handleDeleteDraft = async (draftId: string) => {
    console.log('🗑️ Attempting to delete draft with ID:', draftId);
    console.log('🗑️ Edit draft data:', editDraftData);
    
    if (!confirm("คุณต้องการลบแบบร่างนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้")) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");
    try {
          console.log('🗑️ Making DELETE request to:', `${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts/${draftId}`);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts/${draftId}`, {
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
        const draftsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts`);
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/sync-work-order?date=${date}`, {
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
      // if (selectedDate) {
      //   await syncWorkOrder(selectedDate);
      // }
      const [plans, drafts] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans`).then(res => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-plans/drafts`).then(res => res.json())
      ]);
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
          if (d.workflow_status_id === 2) {
            status = 'บันทึกเสร็จสิ้น';
            recordStatus = 'บันทึกเสร็จสิ้น';
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
            production_room: d.production_room_id || d.production_room || 'ไม่ระบุ',
            machine_id: d.machine_id || '',
            notes: d.notes || '',
          };
        }),
        ...(plans.data || []).map((p: any) => {
          // Workaround: หา draft ที่ตรงกันมาเติมข้อมูลห้อง/เครื่อง/หมายเหตุ
          const key = `${p.production_date}__${p.job_code}__${p.job_name}`;
          const draft = draftMap.get(key);
          return {
            ...p,
            isDraft: false,
            status: p.status === 'แผนจริง' || !p.status ? 'บันทึกสำเร็จ' : p.status,
            recordStatus: p.recordStatus === 'แผนจริง' || !p.recordStatus ? 'บันทึกสำเร็จ' : p.recordStatus,
            production_room: (draft && (draft.production_room_id || draft.production_room)) || p.production_room || 'ไม่ระบุ',
            machine_id: (draft && draft.machine_id) || p.machine_id || '',
            notes: (draft && draft.notes) || p.notes || '',
          };
        })
      ];
      setProductionData(allData);
      isCreatingRef.current = false; // reset flag หลังโหลดข้อมูลเสร็จ
    } catch (error) {
      console.error('Error loading production data:', error);
    }
  };

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  // ฟังก์ชันแปลงชื่อแสดงผลงาน (เติม prefix เฉพาะตอนแสดงผลเท่านั้น, ใช้ is_special)
  const getDisplayJobName = (item: any, jobsOfDay: any[]) => {
    const defaultCodes = ['A', 'B', 'C', 'D'];
    if (defaultCodes.includes(item.job_code)) {
      return item.job_name;
    }
    if (item.is_special === 1 && !item.isDraft) {
      // งานพิเศษ: เฉพาะที่ sync แล้ว
      const specialJobs = jobsOfDay.filter(j => j.is_special === 1 && !defaultCodes.includes(j.job_code) && !j.isDraft);
      const specialIndex = specialJobs.findIndex(j => j.id === item.id) + 1;
      return `งานพิเศษที่ ${specialIndex} ${item.job_name}`;
    } else if (item.is_special !== 1 && !item.isDraft) {
      // งานปกติ: เฉพาะที่ sync แล้ว
      const normalJobs = jobsOfDay.filter(j => j.is_special !== 1 && !defaultCodes.includes(j.job_code) && !j.isDraft);
      const normalIndex = normalJobs.findIndex(j => j.id === item.id) + 1;
      return `งานที่ ${normalIndex} ${item.job_name}`;
    }
    // งาน draft ที่ยังไม่ sync
    return item.job_name;
  };

  // เพิ่มฟังก์ชันเรียงลำดับงานแบบเดียวกับ Draft
  const sortJobsForDisplay = (jobs: any[]) => {
    return [...jobs].sort((a, b) => {
      const timeA = a.start_time || "00:00";
      const timeB = b.start_time || "00:00";
      const timeComparison = timeA.localeCompare(timeB);
      if (timeComparison !== 0) return timeComparison;
      // เรียงผู้ปฏิบัติงานที่ขึ้นต้นด้วย 'อ' ขึ้นก่อน
      const opA = (a.operators || "").split(", ")[0] || "";
      const opB = (b.operators || "").split(", ")[0] || "";
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
      const opA = (a.operators || "").split(", ")[0] || "";
      const opB = (b.operators || "").split(", ")[0] || "";
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
    
    // ส่งคืนตามลำดับ: default -> งานปกติเสร็จแล้ว -> งานพิเศษเสร็จแล้ว -> งานปกติแบบร่าง -> งานพิเศษแบบร่าง
    return [
      ...defaultDrafts,
      ...normalCompleted,
      ...specialCompleted,
      ...normalDrafts,
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
      const opA = (a.operators || "").split(", ")[0] || "";
      const opB = (b.operators || "").split(", ")[0] || "";
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
              <span className="hidden md:block text-sm text-green-100">ระบบจัดการข้อมูล</span>

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
            className={`transition-all duration-300 ${isFormCollapsed ? "lg:w-16" : "w-full lg:w-2/5"} ${isFormCollapsed && "hidden lg:block"}`}
          >
            <Card className="shadow-lg bg-white h-fit">
              <CardHeader
                className={`pb-3 sm:pb-4 ${isFormCollapsed ? "flex justify-center items-center min-h-[60px] sm:min-h-[80px]" : ""}`}
              >
                <div className={`flex items-center ${isFormCollapsed ? "justify-center" : "justify-between"}`}>
                  {!isFormCollapsed && (
                    <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span>เพิ่มรายการใหม่</span>
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                    className="text-white bg-green-800 hover:bg-green-900 border-2 border-green-600 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 flex items-center justify-center flex-shrink-0"
                  >
                    {isFormCollapsed ? (
                      <PanelLeftOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
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
                        className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm hover:border-gray-300"
                      />
                      {/* <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" /> */}
                    </div>
                  </div>

                  {/* Autocomplete Job Name/Code */}
                  <div className="space-y-2 relative">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">ค้นหารายการ (พิมพ์เพื่อค้นหา)</Label>
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
                    />
                  </div>

                  {/* Staff Positions */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">ผู้ปฏิบัติงาน (1-4 คน)</Label>
                      {/* <Button variant="link" size="sm" className="text-green-600 p-0 h-auto text-xs">
                        ล้างข้อมูลทั้งหมด
                      </Button> */}
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
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาสิ้นสุด</Label>
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
                  <div className="pt-3 sm:pt-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent text-sm"
                        onClick={() => {
                          console.log('🔧 Button clicked!');
                          handleSaveDraft();
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "กำลังบันทึก..." : "บันทึกแบบร่าง"}
                      </Button>
                      <Button
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm"
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

          {/* Right Panel - Schedule View */}
          <div className={`transition-all duration-300 ${isFormCollapsed ? "flex-1" : "w-full lg:w-3/5"}`}>
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
                    <span>รายการแผนผลิต</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncDrafts}
                        disabled={isSubmitting}
                      className="bg-white border-green-600 text-green-700 hover:bg-green-50 flex items-center space-x-1 sm:space-x-2 h-7 sm:h-8 md:h-9"
                      >
                      <RefreshCw className={`${isFormCollapsed ? "w-3 h-3 sm:w-4 sm:h-4" : "w-3 h-3"}`} />
                      <span
                        className={`${
                          isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                        } hidden sm:inline`}
                      >
                        พิมพ์ใบงานผลิต
                      </span>
                      <span className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} sm:hidden`}>พิมพ์</span>
                      </Button>
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

                    {/* Weekly Calendar Table */}
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        {/* Header Row */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDates.map((date, index) => {
                        const dateStr = date.toISOString().split("T")[0]
                        const dayProduction = productionData.filter((item) => item.production_date === dateStr)
                        const filteredDayProduction = getSortedWeeklyProduction(dayProduction)

                        return (
                              <div
                            key={index}
                                className={`${getDayBackgroundColor(date)} rounded-lg p-1 sm:p-2 text-center min-w-0`}
                          >
                              <div
                                  className={`${
                                    isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                                  } font-medium ${getDayTextColor(date)} truncate`}
                              >
                                {getDayName(date)}
                              </div>
                              <div
                                className={`${
                                    isFormCollapsed ? "text-sm sm:text-lg md:text-xl" : "text-sm sm:text-lg"
                                  } font-bold ${getDayTextColor(date)}`}
                              >
                                {formatDate(date)}
                              </div>
                                  <div
                                    className={`${
                                    isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"
                                  } ${getDayTextColor(date)} opacity-75 mt-1`}
                                  >
                                    {filteredDayProduction.length} งาน
                                  </div>
                                </div>
                        )
                      })}
                    </div>

                        {/* Production Content Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {weekDates.map((date, index) => {
                            const dateStr = date.toISOString().split("T")[0]
                            const dayProduction = productionData.filter((item) => item.production_date === dateStr)
                            const filteredDayProduction = getSortedWeeklyProduction(dayProduction)

                            return (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-1 sm:p-2 bg-white min-h-[150px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] overflow-hidden"
                              >
                                {filteredDayProduction.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                                    {filteredDayProduction.map((item) => (
                            <div
                              key={item.id}
                                        className={`p-1 sm:p-2 rounded-md border-l-2 sm:border-l-3 ${
                                item.status_name === "งานผลิตถูกยกเลิก"
                                            ? "border-l-red-400 bg-red-50"
                                    : item.recordStatus === "บันทึกเสร็จสิ้น"
                                      ? "border-l-green-400 bg-green-50"
                                      : item.recordStatus === "บันทึกแบบร่าง"
                                                ? "border-l-gray-400 bg-gray-50"
                                          : "border-l-gray-400 bg-gray-50"
                              }`}
                            >
                                        {/* ชื่องานผลิต */}
                                        <div
                                          className={`font-medium text-gray-900 ${
                                            isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                                          } mb-1 leading-tight line-clamp-2`}
                                    >
                                          {getDisplayJobName(item, dayProduction)}
                                  </div>

                                        {/* เวลา */}
                                  <div
                                          className={`flex items-center space-x-1 ${
                                            isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"
                                          } text-gray-600 mb-1`}
                                  >
                                    <Clock
                                            className={`${
                                              isFormCollapsed ? "w-2.5 h-2.5 sm:w-3 sm:h-3" : "w-2.5 h-2.5"
                                            } flex-shrink-0`}
                                    />
                                          <span className="truncate">{item.start_time} - {item.end_time}</span>
                                </div>

                                        {/* หมายเหตุ (ถ้ามี) */}
                                        {(item.notes || item.note) && (
                                          <div
                                    className={`${
                                              isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"
                                            } text-gray-500 italic line-clamp-1`}
                                  >
                                            หมายเหตุ: {item.notes || item.note}
                                          </div>
                                        )}

                                        {/* สถานะ */}
                                        <div className="mt-1">
                                          <span
                                            className={`inline-block px-1 sm:px-1.5 py-0.5 rounded text-xs ${
                                              item.status_name === "รอดำเนินการ"
                                                ? "bg-gray-100 text-gray-700"
                                                : item.status_name === "กำลังดำเนินการ"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : item.status_name === "เสร็จสิ้น"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.status_name === "งานผลิตถูกยกเลิก"
                                                      ? "bg-red-100 text-red-700"
                                                      : "bg-gray-100 text-gray-700"
                                            } truncate`}
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
                                        className={`${
                                          isFormCollapsed ? "w-6 h-6 sm:w-8 sm:h-8" : "w-4 h-4 sm:w-6 sm:h-6"
                                        } mx-auto mb-2 opacity-50`}
                          />
                                      <p className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"}`}>ไม่มีงาน</p>
                                    </div>
                        </div>
                      )}
                    </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {/* Daily View */}
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
                            งานผลิตวันที่ {formatFullDate(new Date(selectedDate))} จำนวน {dailyProduction.length} งาน
                          </h4>

                          {getSortedDailyProduction(dailyProduction).map((item) => (
                            <div
                              key={item.id}
                              className={`border-l-4 ${
                                isFormCollapsed ? "p-3 sm:p-4 md:p-6" : "p-2 sm:p-3 md:p-4"
                              } rounded-r-lg ${
                                item.status_name === "งานผลิตถูกยกเลิก"
                                  ? "border-l-red-400 bg-red-100"
                                  : item.isDraft
                                    ? "border-l-gray-400 bg-gray-100"
                                    : item.recordStatus === "บันทึกเสร็จสิ้น"
                                      ? "border-l-green-400 bg-green-50"
                                      : item.recordStatus === "บันทึกแบบร่าง"
                                        ? "border-l-gray-400 bg-gray-100"
                                        : item.recordStatus === "บันทึกสำเร็จ"
                                          ? "border-l-green-500 bg-green-100"
                                          : "border-l-gray-400 bg-gray-50"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} bg-blue-50 border-blue-300 text-blue-700 font-medium flex-shrink-0`}
                                    >
                                      {formatProductionDate(item.production_date)}
                                    </Badge>
                                    <h3
                                      className={`font-bold text-gray-900 ${
                                        isFormCollapsed
                                          ? "text-sm sm:text-lg md:text-xl"
                                          : "text-xs sm:text-sm md:text-base"
                                      } truncate`}
                                    >
                                      {getDisplayJobName(item, selectedDayProduction)}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} flex-shrink-0`}
                                    >
                                      ห้องผลิต: {getRoomName(item.production_room)}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} flex-shrink-0 ${
                                        item.status_name === "รอดำเนินการ"
                                          ? "border-gray-500 text-gray-700"
                                          : item.status_name === "กำลังดำเนินการ"
                                            ? "border-blue-500 text-blue-700"
                                            : item.status_name === "เสร็จสิ้น"
                                              ? "border-green-500 text-green-700"
                                              : item.status_name === "งานผลิตถูกยกเลิก"
                                                ? "border-red-500 text-red-700"
                                                : item.status_name === "งานพิเศษ"
                                                  ? "border-orange-500 text-orange-700"
                                                  : "border-gray-500 text-gray-700"
                                      }`}
                                      style={{
                                        borderColor: item.status_color,
                                        color: item.status_color
                                      }}
                                    >
                                      {item.status_name || "รอดำเนินการ"}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center space-x-2 sm:space-x-4">
                                    {renderStaffAvatars(item.operators, isFormCollapsed)}
                                  </div>

                                  <div
                                    className={`flex items-center space-x-1 sm:space-x-2 ${
                                      isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                                    }`}
                                  >
                                    <Clock
                                      className={`${isFormCollapsed ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"} text-gray-400 flex-shrink-0`}
                                    />
                                    <span className="text-gray-600">{item.start_time} - {item.end_time}</span>
                                    {(item.notes || item.note) && (
                                      <span className="text-gray-400 mx-2">|</span>
                                    )}
                                    {(item.notes || item.note) && (
                                      <span className="text-gray-500 truncate max-w-xs">
                                        <span className="font-medium">หมายเหตุ:</span> {item.notes || item.note}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size={isFormCollapsed ? "default" : "sm"}
                                    className={`${
                                      item.recordStatus === "บันทึกเสร็จสิ้น"
                                        ? "text-green-700 bg-green-100 hover:bg-green-200"
                                        : item.recordStatus === "บันทึกสำเร็จ"
                                          ? "text-green-700 bg-green-100 hover:bg-green-200"
                                          : "text-gray-600 bg-gray-200 hover:bg-gray-300"
                                    } px-2 sm:px-3 py-1`}
                                  >
                                    <span className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"}`}>
                                      {item.recordStatus}
                                    </span>
                                  </Button>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`${isFormCollapsed ? "w-8 h-8 sm:w-10 sm:h-10" : "w-6 h-6 sm:w-8 sm:h-8"}`}
                                    >
                                      <Eye
                                        className={`${isFormCollapsed ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"}`}
                                      />
                                    </Button>
                                    {item.isDraft && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`${isFormCollapsed ? "w-8 h-8 sm:w-10 sm:h-10" : "w-6 h-6 sm:w-8 sm:h-8"}`}
                                        onClick={() => handleEditDraft(item)}
                                        aria-label="แก้ไขแบบร่าง"
                                      >
                                        <Edit
                                          className={`${isFormCollapsed ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"}`}
                                        />
                                      </Button>
                                    )}
                                    {!item.isDraft && item.status_name !== "ยกเลิกการผลิต" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`${isFormCollapsed ? "w-8 h-8 sm:w-10 sm:h-10" : "w-6 h-6 sm:w-8 sm:h-8"} text-red-600 hover:bg-red-100`}
                                        onClick={() => handleCancelProduction(item.id)}
                                        aria-label="ยกเลิกการผลิต"
                                      >
                                        <XCircle
                                          className={`${isFormCollapsed ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4"}`}
                                        />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <Calendar
                            className={`${isFormCollapsed ? "w-12 h-12 sm:w-16 sm:h-16" : "w-8 h-8 sm:w-12 sm:h-12"} mx-auto mb-3 sm:mb-4 text-gray-300`}
                          />
                          <p className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                            ไม่มีงานผลิตในวันที่ {formatFullDate(new Date(selectedDate))}
                          </p>
                        </div>
                      );
                    })()}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขแบบร่างงานผลิต</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-2">
            {/* คอลัมน์ซ้าย */}
            <div className="space-y-3">
              {/* วันที่ผลิต */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">วันที่ผลิต</Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
              {/* ชื่องาน */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">ชื่องาน</Label>
                <Input
                  value={editJobName}
                  onChange={e => setEditJobName(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
              {/* เครื่องบันทึกข้อมูลการผลิต */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">เครื่องบันทึกข้อมูลการผลิต</Label>
                <Select
                  value={editMachine || "__none__"}
                  onValueChange={val => setEditMachine(val === "__none__" ? "" : val)}
                >
                  <SelectTrigger className="text-sm h-8">
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
                <Label className="text-xs font-bold text-gray-700">ห้องผลิต</Label>
                <Select
                  value={editRoom || "__none__"}
                  onValueChange={val => setEditRoom(val === "__none__" ? "" : val)}
                >
                  <SelectTrigger className="text-sm h-8">
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
                <Label className="text-xs font-bold text-gray-700">ผู้ปฏิบัติงาน (1-4 คน)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((position) => (
                    <div key={position} className="space-y-1">
                      <Label className="text-xs text-gray-600">ผู้ปฏิบัติงาน {position}</Label>
                      <Select
                        value={editOperators[position - 1] || "__none__"}
                        onValueChange={val => {
                          const newOps = [...editOperators];
                          newOps[position - 1] = val === "__none__" ? "" : val;
                          setEditOperators(newOps);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                  <Label className="text-xs font-bold text-gray-700">เวลาเริ่ม</Label>
                  <Select value={editStartTime || "__none__"} onValueChange={val => setEditStartTime(val === "__none__" ? "" : val)}>
                    <SelectTrigger className="text-sm h-8">
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
                  <Label className="text-xs font-bold text-gray-700">เวลาสิ้นสุด</Label>
                  <Select value={editEndTime || "__none__"} onValueChange={val => setEditEndTime(val === "__none__" ? "" : val)}>
                    <SelectTrigger className="text-sm h-8">
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
                <Label className="text-xs font-bold text-gray-700">หมายเหตุ</Label>
                <Textarea
                  placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับการผลิต..."
                  className="min-h-[60px] resize-none text-sm"
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
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? "กำลังลบ..." : "ลบ"}
                </Button>
              ) : null;
            })()}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSaveEditDraft(true)} disabled={isSubmitting}>บันทึกแบบร่าง</Button>
              <Button onClick={() => handleSaveEditDraft(false)} disabled={isSubmitting} className="bg-green-700 hover:bg-green-800 text-white">
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกเสร็จสิ้น"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>ข้อผิดพลาด</DialogTitle>
          </DialogHeader>
          <div className="mb-4">{errorDialogMessage}</div>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)} className="w-full">ตกลง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

