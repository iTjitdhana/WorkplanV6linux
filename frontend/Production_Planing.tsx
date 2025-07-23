"use client"

import { useState, useEffect, useRef } from "react"
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

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export default function MedicalAppointmentDashboard() {
  const [selectedDate, setSelectedDate] = useState("2025-07-16")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("weekly")
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
    fetch("http://192.168.0.94:3101/api/users")
      .then(res => res.json())
      .then(data => setUsers(data.data || []));
    fetch("http://192.168.0.94:3101/api/machines")
      .then(res => res.json())
      .then(data => setMachines(data.data || []));
    fetch("http://192.168.0.94:3101/api/production-rooms")
      .then(res => res.json())
      .then(data => setRooms(data.data || []));
  }, []);

  // Autocomplete job name/code
  useEffect(() => {
    if (jobQuery.length > 0) {
      fetch(`http://192.168.0.94:3101/api/process-steps/search?query=${encodeURIComponent(jobQuery)}`)
        .then(res => res.json())
        .then(data => setJobOptions(data.data || []));
      setShowJobDropdown(true);
    } else {
      setShowJobDropdown(false);
      setJobOptions([]);
    }
  }, [jobQuery]);

  // ฟังก์ชันสร้าง job_code ใหม่ (TempXXX)
  const handleAddNewJob = () => {
    // หา TempXXX ที่ยังไม่ซ้ำ
    let idx = 1;
    let tempCode = "Temp001";
    const allCodes = jobOptions.map(j => j.job_code.toLowerCase());
    while (allCodes.includes(tempCode.toLowerCase())) {
      idx++;
      tempCode = `Temp${idx.toString().padStart(3, "0")}`;
    }
    setJobCode(tempCode);
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

  const weekDates = getWeekDates(currentWeek)
  const weekRange = `${formatFullDate(weekDates[0])} - ${formatFullDate(weekDates[6])}`

  // Get production data for current week
  const getWeekProduction = () => {
    const weekStart = weekDates[0].toISOString().split("T")[0]
    const weekEnd = weekDates[6].toISOString().split("T")[0]

    return productionData
      .filter((item) => {
        return item.production_date >= weekStart && item.production_date <= weekEnd
      })
      .sort((a, b) => {
        // เรียงตามวันที่ก่อน
        const dateComparison = new Date(a.production_date).getTime() - new Date(b.production_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        // หากวันที่เหมือนกัน เรียงตามเวลาเริ่ม
        const timeA = a.start_time || "00:00";
        const timeB = b.start_time || "00:00";
        const timeComparison = timeA.localeCompare(timeB);
        if (timeComparison !== 0) return timeComparison;
        // หากเวลาเริ่มเหมือนกัน เรียงตามผู้ปฏิบัติงานคนที่ 1 ที่มีตัวอักษร "อ" ตำแหน่งแรก
        const operatorA = (a.operators || "").split(", ")[0] || "";
        const operatorB = (b.operators || "").split(", ")[0] || "";
        const indexA = operatorA.indexOf("อ");
        const indexB = operatorB.indexOf("อ");
        if (indexA === 0 && indexB !== 0) return -1;
        if (indexB === 0 && indexA !== 0) return 1;
        return operatorA.localeCompare(operatorB);
      });
  }

  // Get production data for selected day
  const getSelectedDayProduction = () => {
    if (!selectedWeekDay) return [];
    // job list ที่ต้องขึ้นก่อน
    const defaultCodes = ['A', 'B', 'C', 'D'];
    const dayData = productionData.filter(item => item.production_date === selectedWeekDay);
    // งาน draft 4 งานนี้
    let defaultDrafts = dayData.filter(item => item.isDraft && defaultCodes.includes(item.job_code));
    // งานอื่นๆ
    const otherJobs = dayData.filter(item => !(item.isDraft && defaultCodes.includes(item.job_code)));
    // sort งาน draft 4 งานนี้ตามลำดับ code
    defaultDrafts.sort((a, b) => defaultCodes.indexOf(a.job_code) - defaultCodes.indexOf(b.job_code));
    // เพิ่ม code นำหน้าชื่อ
    const displayDefaultDrafts = defaultDrafts.map(draft => ({
      ...draft,
      job_name: draft.job_code && !draft.job_name.startsWith(draft.job_code + ' ')
        ? `${draft.job_code} ${draft.job_name}`
        : draft.job_name
    }));
    // sort งานอื่นตาม logic เดิม
    otherJobs.sort((a, b) => {
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
    return [...displayDefaultDrafts, ...otherJobs];
  };

  const weekProduction = getWeekProduction()
  const selectedDayProduction = getSelectedDayProduction()

  // เพิ่มฟังก์ชันส่งข้อมูลไป Google Sheet
  const sendToGoogleSheet = async (data: any) => {
    console.log("🟡 [DEBUG] call sendToGoogleSheet", data);
    const url = "http://192.168.0.94:3101/api/send-to-google-sheet";
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
      
      return 0
    });

    console.log('🔍 [DEBUG] Sorted week data:', sortedData.map(item => ({
      job_name: item.job_name,
      start_time: item.start_time,
      operators: item.operators,
      first_operator: (item.operators || "").split(", ")[0] || ""
    })));

    return sortedData;
  }

  // ฟังก์ชัน handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage("");
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
      
      // ใช้ค่าเริ่มต้นหากไม่มีการใส่เวลา
      const finalStartTime = startTime.trim() || "08:00";
      const finalEndTime = endTime.trim() || "17:00";
      
      // คำนวณลำดับงาน
      const workOrder = calculateWorkOrder(selectedDate, finalStartTime, operators.filter(Boolean).join(", "));
      
      const requestBody = {
        production_date: selectedDate,
        job_code: jobCode || jobName,
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
      
      console.log('💾 Saving with workflow_status_id:', requestBody.workflow_status_id, 'work_order:', workOrder);
      
      const res = await fetch("http://192.168.0.94:3101/api/work-plans/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isValid ? "บันทึกเสร็จสิ้น" : "บันทึกแบบร่าง");
        // reset ฟอร์ม
        setJobName("");
        setOperators(["", "", "", ""]);
        setStartTime("");
        setEndTime("");
        setNote("");
        setSelectedMachine("");
        setSelectedRoom("");
        setJobQuery("");
        setJobCode("");
        
        // reload ข้อมูลทั้งหมด
        await loadAllProductionData();
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
    setIsSubmitting(false);
  };

  // ฟังก์ชันโหลดข้อมูลทั้งหมด
  const loadAllProductionData = async () => {
    try {
      if (selectedDate) {
        await syncWorkOrder(selectedDate);
      }
      const [plans, drafts] = await Promise.all([
        fetch('http://192.168.0.94:3101/api/work-plans').then(res => res.json()),
        fetch('http://192.168.0.94:3101/api/work-plans/drafts').then(res => res.json())
      ]);
      
      console.log('📋 Loaded drafts:', drafts.data);
      console.log('📋 Loaded plans:', plans.data);
      
      // ตรวจสอบวันที่ใน drafts
      if (drafts.data && drafts.data.length > 0) {
        drafts.data.forEach((draft: any, index: number) => {
          console.log(`📅 Draft ${index + 1}:`, {
            id: draft.id,
            production_date: draft.production_date,
            production_date_type: typeof draft.production_date,
            job_name: draft.job_name,
            workflow_status_id: draft.workflow_status_id,
            workflow_status_id_type: typeof draft.workflow_status_id
          });
        });
      }
      
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
            console.warn('Error parsing operators:', e);
            operatorNames = '';
          }
          
          // กำหนดสถานะตาม workflow_status_id
          let status = 'แบบร่าง';
          let recordStatus = 'แบบร่าง';
          
          if (d.workflow_status_id === 2) {
            status = 'บันทึกเสร็จสิ้น';
            recordStatus = 'บันทึกเสร็จสิ้น';
          } else if (d.workflow_status_id === 1) {
            status = 'แบบร่าง';
            recordStatus = 'แบบร่าง';
          }
          
          console.log(`📋 Draft ${d.id} status mapping:`, {
            workflow_status_id: d.workflow_status_id,
            status: status,
            recordStatus: recordStatus
          });
          
          return {
            ...d,
            id: `draft_${d.id}`, // เพิ่ม prefix เพื่อแยกจาก plans
            isDraft: true,
            production_date: d.production_date,
            job_name: d.job_name,
            start_time: d.start_time,
            end_time: d.end_time,
            operators: operatorNames,
            status: status,
            recordStatus: recordStatus,
            production_room: d.production_room_id || d.production_room || 'ไม่ระบุ'
          };
        }),
        ...(plans.data || []).map((p: any) => ({
          ...p,
          isDraft: false,
          status: p.status === 'แผนจริง' || !p.status ? 'บันทึกสำเร็จ' : p.status,
          recordStatus: p.recordStatus === 'แผนจริง' || !p.recordStatus ? 'บันทึกสำเร็จ' : p.recordStatus
        }))
      ];

      // === เพิ่มส่วนนี้: ตรวจสอบว่างานไหนมี process step ที่ start อยู่ ===
      // เฉพาะงานที่ไม่ใช่ draft และมี id จริง
      console.log('📋 [DEBUG] Checking logs for status updates...');
      await Promise.all(
        allData.map(async (item: any) => {
          if (!item.isDraft && item.id) {
            try {
              const logsRes = await fetch(`http://192.168.0.94:3101/api/logs/work-plan/${item.id}`);
              const logsData = await logsRes.json();
              const logs = logsData.data || [];
              // เช็คว่ามี log ไหนที่ start_time มีค่า (ไม่ต้องสนใจ stop_time)
              const hasStarted = logs.some((log: any) => !!log.start_time);
              console.log(`📋 [DEBUG] Item ${item.id} (${item.job_name}):`, {
                originalStatus: item.status_name,
                hasStarted,
                logsCount: logs.length
              });
              if (hasStarted) {
                item.status_name = 'กำลังดำเนินการ';
                item.status_color = '#FFD600'; // สีเหลือง
              } else {
                item.status_name = 'รอดำเนินการ';
                item.status_color = '#BDBDBD'; // สีเทา
              }
            } catch (e) {
              // ignore error
            }
          }
        })
      );
      console.log('📋 [DEBUG] Final production data:', allData.map(item => ({ id: item.id, job_name: item.job_name, status_name: item.status_name })));
      // === END ===

      setProductionData(allData);
    } catch (error) {
      console.error('Error loading production data:', error);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      console.log('📅 Saving draft with date:', selectedDate);
      console.log('📅 selectedDate type:', typeof selectedDate);
      console.log('📅 selectedDate value:', selectedDate);
      
      // ใช้ค่าเริ่มต้นหากไม่มีการใส่เวลา
      const finalStartTime = startTime.trim() || "08:00";
      const finalEndTime = endTime.trim() || "17:00";
      
      const requestBody = {
        production_date: selectedDate,
        job_code: jobCode || jobName,
        job_name: jobName || jobQuery,
        start_time: finalStartTime,
        end_time: finalEndTime,
        machine_id: machines.find(m => m.machine_code === selectedMachine)?.id || null,
        production_room_id: rooms.find(r => r.room_code === selectedRoom)?.id || null,
        notes: note,
        workflow_status_id: 1, // 1 = draft
        operators: operators.filter(Boolean).map(name => {
          const user = users.find(u => u.name === name);
          return user ? { id_code: user.id_code, name: user.name } : { name };
        })
      };
      
      console.log('📅 Request body:', requestBody);
      
      const res = await fetch('http://192.168.0.94:3101/api/work-plans/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      console.log('📅 Response data:', data);
      
      setMessage(data.success ? 'บันทึกแบบร่างสำเร็จ' : 'เกิดข้อผิดพลาด');
      // reload ข้อมูลทั้งหมด
      if (data.success) {
        await loadAllProductionData();
      }
    } catch (err) {
      console.error('📅 Error saving draft:', err);
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    }
    setIsSubmitting(false);
  };

  // Helper function to get room name from room code or ID
  const getRoomName = (roomCodeOrId: string) => {
    if (!roomCodeOrId || roomCodeOrId === 'ไม่ระบุ') return 'ไม่ระบุ';
    
    console.log('🔍 getRoomName input:', roomCodeOrId, 'type:', typeof roomCodeOrId);
    console.log('🔍 Available rooms:', rooms.map(r => ({ id: r.id, room_code: r.room_code, room_name: r.room_name })));
    
    // ลองหาโดยใช้ room_code ก่อน
    let room = rooms.find(r => r.room_code === roomCodeOrId);
    
    // หากไม่เจอ ลองหาโดยใช้ ID
    if (!room) {
      room = rooms.find(r => r.id.toString() === roomCodeOrId.toString());
    }
    
    const result = room ? room.room_name : roomCodeOrId;
    console.log('🔍 getRoomName result:', result);
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
      <div className="flex items-center space-x-1 sm:space-x-2">
        <div className="flex -space-x-1">
          {staffList.map((person, index) => (
            <Avatar
              key={index}
              className={`${isFormCollapsed ? "w-6 h-6 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6"} border-2 border-white`}
            >
              <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${person.charAt(0)}`} />
              <AvatarFallback className="text-xs font-medium bg-green-100 text-green-800">
                {person.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} text-gray-600 truncate`}>
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

  // Prefill ข้อมูลเมื่อเปิด modal
  useEffect(() => {
    if (editDraftModalOpen && editDraftData) {
      setEditJobName(editDraftData.job_name || "");
      // operators อาจเป็น string หรือ array
      if (Array.isArray(editDraftData.operators)) {
        setEditOperators([
          editDraftData.operators[0]?.name || "",
          editDraftData.operators[1]?.name || "",
          editDraftData.operators[2]?.name || "",
          editDraftData.operators[3]?.name || "",
        ]);
      } else if (typeof editDraftData.operators === "string") {
        try {
          const ops = JSON.parse(editDraftData.operators);
          setEditOperators([
            ops[0]?.name || "",
            ops[1]?.name || "",
            ops[2]?.name || "",
            ops[3]?.name || "",
          ]);
        } catch {
          setEditOperators(["", "", "", ""]);
        }
      } else {
        setEditOperators(["", "", "", ""]);
      }
      setEditStartTime(editDraftData.start_time || "");
      setEditEndTime(editDraftData.end_time || "");
      setEditRoom(editDraftData.production_room || editDraftData.production_room_id || "");
      setEditMachine(editDraftData.machine || editDraftData.machine_id || "");
      setEditNote(editDraftData.notes || editDraftData.note || "");
      setEditDate(editDraftData.production_date ? (editDraftData.production_date.split("T")[0]) : "");
    }
  }, [editDraftModalOpen, editDraftData]);

  const handleEditDraft = (draftItem: any) => {
    console.log('✏️ Opening edit modal for draft item:', draftItem);
    console.log('✏️ Operators data:', {
      operators: draftItem.operators,
      operatorsType: typeof draftItem.operators,
      operatorsLength: draftItem.operators?.length
    });
    setEditDraftData(draftItem);
    setEditDraftId(draftItem.id.replace('draft_', ''));
    
    // ตั้งค่าข้อมูลในฟอร์ม
    setEditDate(draftItem.production_date);
    setEditJobName(draftItem.job_name || '');
    setEditNote(draftItem.notes || draftItem.note || '');
    setEditStartTime(draftItem.start_time || '');
    setEditEndTime(draftItem.end_time || '');
    
    // ตั้งค่าห้องผลิต
    const room = rooms.find(r => r.id === draftItem.production_room_id);
    setEditRoom(room?.room_code || '');
    
    // ตั้งค่าเครื่อง
    const machine = machines.find(m => m.id === draftItem.machine_id);
    setEditMachine(machine?.machine_code || '');
    
    // ตั้งค่าผู้ปฏิบัติงาน
    let operatorNames: string[] = ['', '', '', ''];
    if (draftItem.operators) {
      console.log('🔍 Processing operators:', draftItem.operators);
      try {
        // ตรวจสอบว่าเป็น JSON string หรือไม่
        if (typeof draftItem.operators === 'string') {
          console.log('🔍 Operators is string, trying JSON.parse...');
          // ลอง parse เป็น JSON ก่อน
          try {
            const operators = JSON.parse(draftItem.operators);
            console.log('🔍 JSON.parse successful:', operators);
            if (Array.isArray(operators)) {
              operatorNames = operators.map((o: any) => o.name || o).slice(0, 4);
              console.log('🔍 Extracted names from JSON array:', operatorNames);
            }
          } catch (jsonError) {
            console.log('🔍 JSON.parse failed, treating as comma-separated string');
            // ถ้าไม่ใช่ JSON string ให้แยกด้วย comma
            operatorNames = draftItem.operators.split(',').map((name: string) => name.trim()).slice(0, 4);
            console.log('🔍 Extracted names from comma-separated:', operatorNames);
          }
        } else if (Array.isArray(draftItem.operators)) {
          console.log('🔍 Operators is already array:', draftItem.operators);
          // ถ้าเป็น array อยู่แล้ว
          operatorNames = draftItem.operators.map((o: any) => o.name || o).slice(0, 4);
          console.log('🔍 Extracted names from array:', operatorNames);
        }
        
        // เติม array ให้ครบ 4 ตำแหน่ง
        while (operatorNames.length < 4) {
          operatorNames.push('');
        }
        console.log('🔍 Final operatorNames:', operatorNames);
      } catch (error) {
        console.error('Error parsing operators:', error);
        // ถ้าเกิด error ให้ใช้ค่าเริ่มต้น
        operatorNames = ['', '', '', ''];
      }
    } else {
      console.log('🔍 No operators data found');
    }
    setEditOperators(operatorNames);
    
    console.log('✏️ Set form data:', {
      editDate: draftItem.production_date,
      editJobName: draftItem.job_name,
      editNote: draftItem.notes || draftItem.note,
      editStartTime: draftItem.start_time,
      editEndTime: draftItem.end_time,
      editRoom: room?.room_code,
      editMachine: machine?.machine_code,
      editOperators: operatorNames
    });
    
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

  const handleSaveEditDraft = async () => {
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
      const workflowStatusId = isValid ? 2 : 1; // 2 = บันทึกเสร็จสิ้น, 1 = แบบร่าง
      
      console.log('💾 Saving edit draft:');
      console.log('  - Validation result:', isValid);
      console.log('  - Workflow status ID:', workflowStatusId);
      console.log('  - Machine ID:', machines.find(m => m.machine_code === editMachine)?.id);
      console.log('  - Room ID:', rooms.find(r => r.room_code === editRoom)?.id);
      
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
      
      console.log('  - Request body:', requestBody);
      
      const res = await fetch(`http://192.168.0.94:3101/api/work-plans/drafts/${editDraftData.id.replace('draft_', '')}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("บันทึกแบบร่างสำเร็จ");
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
      await fetch("http://192.168.0.94:3101/api/work-plans/sync-drafts-to-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: selectedDate })
      });
      // 1. เตรียมข้อมูล summaryRows สำหรับ 1.ใบสรุปงาน v.4 (ไม่เอา A, B, C, D)
      const defaultCodes = ['A', 'B', 'C', 'D'];
          // ฟังก์ชันแปลงรหัส/ID ห้องเป็นชื่อห้อง
    const getRoomNameByCodeOrId = (codeOrId) => {
      const room = rooms.find(
        r => r.room_code === codeOrId || r.id?.toString() === codeOrId?.toString()
      );
      return room ? room.room_name : codeOrId || "";
    };
    // ฟังก์ชันแปลง ID เครื่องเป็นชื่อเครื่อง
    const getMachineNameById = (machineId) => {
      if (!machineId) return "";
      const machine = machines.find(m => m.id?.toString() === machineId?.toString());
      return machine ? machine.machine_name : "";
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
        let ops = (item.operators || "").split(", ").map((s) => s.trim());
        while (ops.length < 4) ops.push("");
        return [
          idx + 1, // ลำดับ
          item.job_code || "",
          item.job_name || "",
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
      const logRows = [];
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
        const operators = (item.operators || "").split(", ").map(s => s.trim()).filter(Boolean);
        
        if (operators.length === 0) {
          // ถ้าไม่มีผู้ปฏิบัติงาน ส่ง 1 แถว
          logRows.push([
            dateString, // วันที่
            dateValue, // Date Value
            item.job_code || "", // เลขที่งาน
            item.job_name || "", // ชื่องาน
            "", // ผู้ปฏิบัติงาน (ว่าง)
            item.start_time || "", // เวลาเริ่มต้น
            item.end_time || "", // เวลาสิ้นสุด
            getRoomNameByCodeOrId(item.production_room) // ห้อง
          ]);
        } else {
          // ถ้ามีผู้ปฏิบัติงาน ส่งแถวละคน
          operators.forEach(operator => {
            logRows.push([
              dateString, // วันที่
              dateValue, // Date Value
              item.job_code || "", // เลขที่งาน
              item.job_name || "", // ชื่องาน
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
      setIsSubmitting(false);
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
          console.log('🗑️ Making DELETE request to:', `http://192.168.0.94:3101/api/work-plans/drafts/${draftId}`);
    const res = await fetch(`http://192.168.0.94:3101/api/work-plans/drafts/${draftId}`, {
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

  // เพิ่ม useEffect สำหรับ auto-create draft jobs
  useEffect(() => {
    if (viewMode !== "daily") return;
    if (!selectedDate || !productionData) return;
    // job list ที่ต้องสร้าง
    const defaultDrafts = [
      { job_code: 'A', job_name: 'เบิกของส่งสาขา  - ผัก' },
      { job_code: 'B', job_name: 'เบิกของส่งสาขา  - สด' },
      { job_code: 'C', job_name: 'เบิกของส่งสาขา  - แห้ง' },
      { job_code: 'D', job_name: 'ตวงสูตร' },
    ];
    // หาเฉพาะ draft ของวันนั้น
    const dayDrafts = productionData.filter(
      item => item.production_date === selectedDate && item.isDraft
    );
    // หา draft ที่ยังไม่มีในวันนั้น
    const missingDrafts = defaultDrafts.filter(draft =>
      !dayDrafts.some(item => item.job_code === draft.job_code)
    );
    if (missingDrafts.length === 0) return;
    // สร้าง draft ที่ขาด
    Promise.all(missingDrafts.map(draft =>
      fetch('http://192.168.0.94:3101/api/work-plans/drafts', {
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
      })
    )).then(() => {
      // reload ข้อมูลใหม่หลังสร้าง
      loadAllProductionData();
    });
  }, [viewMode, selectedDate, productionData]);

  // เพิ่มฟังก์ชัน syncWorkOrder
  const syncWorkOrder = async (date: string) => {
    if (!date) return;
    try {
      const res = await fetch(`http://192.168.0.94:3101/api/work-plans/sync-work-order?date=${date}`, {
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

  return (
    <div className={`min-h-screen bg-green-50/30 ${notoSansThai.className} flex flex-col`}>
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
            <Card className="shadow-lg bg-white/80 backdrop-blur-sm h-fit">
              <CardHeader
                className={`pb-3 sm:pb-4 ${isFormCollapsed ? "flex justify-center items-center min-h-[60px] sm:min-h-[80px]" : ""}`}
              >
                <div className={`flex items-center ${isFormCollapsed ? "justify-center" : "justify-between"}`}>
                  {!isFormCollapsed && (
                    <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span>เพิ่มงานที่ต้องการผลิต</span>
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
                        className="pl-8 sm:pl-10 text-sm"
                      />
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Autocomplete Job Name/Code */}
                  <div className="space-y-2 relative">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เพิ่มงานผลิต (ค้นหาชื่องาน/รหัสงาน)</Label>
                    <div className="relative">
                      <Input
                        ref={jobInputRef}
                        placeholder="ค้นหาชื่องานผลิต หรือรหัสงาน..."
                        value={jobQuery}
                        onChange={e => {
                          setJobQuery(e.target.value);
                          setJobName("");
                          setJobCode("");
                        }}
                        onFocus={() => setShowJobDropdown(jobQuery.length > 0)}
                        onBlur={() => setTimeout(() => setShowJobDropdown(false), 100)}
                        className="pl-8 sm:pl-10 text-sm"
                        autoComplete="off"
                      />
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      {showJobDropdown && (
                        <div className="absolute z-50 bg-white border rounded shadow w-full max-h-60 overflow-auto mt-1">
                          {jobOptions.length > 0 ? (
                            jobOptions.map((opt, idx) => (
                              <div
                                key={opt.job_code + idx}
                                className="px-3 py-2 hover:bg-green-100 cursor-pointer text-sm"
                                onClick={() => {
                                  setJobCode(opt.job_code);
                                  setJobName(opt.job_name);
                                  setJobQuery(opt.job_name);
                                  setShowJobDropdown(false);
                                  jobInputRef.current?.blur();
                                }}
                              >
                                <span className="font-bold">{opt.job_code}</span> <span className="text-gray-600">{opt.job_name}</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">ไม่พบงานผลิตนี้</div>
                          )}
                          {(() => {
                            const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, "");
                            const isExactMatch = jobOptions.some(
                              (opt) =>
                                normalize(opt.job_name) === normalize(jobQuery) ||
                                normalize(opt.job_code) === normalize(jobQuery)
                            );
                            return jobQuery.length > 0 && !isExactMatch ? (
                              <div className="px-3 py-2 bg-gray-50 border-t">
                                <button
                                  className="text-green-700 hover:underline text-sm"
                                  onMouseDown={e => { e.preventDefault(); handleAddNewJob(); }}
                                >
                                  + เพิ่มสินค้าใหม่ "{jobQuery}"
                                </button>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
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
                            value={operators[position - 1]}
                            onValueChange={(val) => {
                              const newOps = [...operators];
                              newOps[position - 1] = val;
                              setOperators(newOps);
                            }}
                          >
                            <SelectTrigger className="h-8 sm:h-9 text-sm">
                              <SelectValue placeholder="เลือก" />
                            </SelectTrigger>
                            <SelectContent className={notoSansThai.className}>
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
                      value={selectedMachine}
                      onValueChange={val => setSelectedMachine(val)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="เลือก..." />
                      </SelectTrigger>
                      <SelectContent className={notoSansThai.className}>
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
                        <Input 
                          type="text" 
                          value={startTime} 
                          onChange={e => setStartTime(e.target.value)} 
                          className="pl-8 sm:pl-10 text-sm" 
                          placeholder="08:00" 
                        />
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาสิ้นสุด</Label>
                      <div className="relative">
                        <Input 
                          type="text" 
                          value={endTime} 
                          onChange={e => setEndTime(e.target.value)} 
                          className="pl-8 sm:pl-10 text-sm" 
                          placeholder="17:00" 
                        />
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
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>

                  {/* ห้องผลิต (dropdown จริง ใต้เวลาเริ่ม-สิ้นสุด) */}
                  <div className="space-y-2 mt-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">ห้องผลิต</Label>
                    <Select
                      value={selectedRoom}
                      onValueChange={val => setSelectedRoom(val)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="เลือกห้องผลิต..." />
                      </SelectTrigger>
                      <SelectContent className={notoSansThai.className}>
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
                        onClick={handleSaveDraft}
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
                    {message && <div className="text-green-700 text-sm mt-2">{message}</div>}
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
            <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncDrafts}
                        disabled={isSubmitting}
                        className="flex items-center space-x-1 text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <span className="text-xs">Sync พิมพ์ใบงานผลิต</span>
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

                    {/* Weekly Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {weekDates.map((date, index) => {
                        const dateStr = date.toISOString().split("T")[0]
                        const dayProduction = productionData.filter((item) => item.production_date === dateStr)
                        const isSelected = selectedWeekDay === dateStr

                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            onClick={() => setSelectedWeekDay(selectedWeekDay === dateStr ? null : dateStr)}
                            className={`border rounded-lg p-1 sm:p-2 md:p-3 text-center h-auto ${
                              isFormCollapsed
                                ? "min-h-[80px] sm:min-h-[120px] md:min-h-[140px]"
                                : "min-h-[60px] sm:min-h-[80px] md:min-h-[100px]"
                            } ${
                              isSelected
                                ? "border-green-600 bg-green-100 hover:bg-green-200"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            } transition-colors duration-200`}
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <div
                                className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} font-medium ${
                                  isSelected ? "text-green-800" : "text-gray-600"
                                }`}
                              >
                                {getDayName(date)}
                              </div>
                              <div
                                className={`${
                                  isFormCollapsed ? "text-sm sm:text-lg md:text-2xl" : "text-xs sm:text-sm md:text-lg"
                                } font-bold ${isSelected ? "text-green-900" : "text-gray-900"}`}
                              >
                                {formatDate(date)}
                              </div>
                              {dayProduction.length > 0 && (
                                <div className="mt-1 sm:mt-2">
                                  <div
                                    className={`${
                                      isFormCollapsed ? "w-2 h-2 sm:w-3 sm:h-3" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
                                    } bg-green-500 rounded-full mx-auto`}
                                  ></div>
                                  <div
                                    className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} text-gray-500 mt-1`}
                                  >
                                    {dayProduction.length} งาน
                                  </div>
                                </div>
                              )}
                            </div>
                          </Button>
                        )
                      })}
                    </div>

                    <Separator />

                    {/* Production Cards - Show selected day or all week */}
                    <div className="space-y-1 sm:space-y-2">
                      <h4
                        className={`font-medium text-gray-900 ${
                          isFormCollapsed ? "text-sm sm:text-lg md:text-xl" : "text-xs sm:text-sm md:text-base"
                        }`}
                      >
                        {selectedWeekDay
                          ? `งานผลิตวันที่ ${formatFullDate(new Date(selectedWeekDay))} จำนวน ${selectedDayProduction.length} งาน`
                          : `สัปดาห์นี้มีงานผลิตจำนวน ${weekProduction.length} งาน`}
                      </h4>

                      {selectedWeekDay && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWeekDay(null)}
                          className="text-green-600 border-green-300 hover:bg-green-50 text-xs sm:text-sm"
                        >
                          ← กลับไปดูทั้งสัปดาห์
                        </Button>
                      )}

                      {(selectedWeekDay ? selectedDayProduction : weekProduction).length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {(selectedWeekDay ? selectedDayProduction : weekProduction).map((item) => (
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
                                      {item.job_name}
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
                            {selectedWeekDay ? "ไม่มีงานผลิตในวันนี้" : "ไม่มีงานผลิตในสัปดาห์นี้"}
                          </p>
                        </div>
                      )}
                    </div>
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
                      const dailyProduction = productionData
                        .filter((item) => {
                          // แปลง production_date ให้เป็น YYYY-MM-DD format
                          const itemDate = item.production_date ? item.production_date.split('T')[0] : '';
                          console.log('🔍 Daily View Filter:', {
                            selectedDate,
                            itemDate,
                            rawProductionDate: item.production_date,
                            jobName: item.job_name,
                            match: itemDate === selectedDate
                          });
                          return itemDate === selectedDate;
                        })
                        .sort((a, b) => {
                          // เรียงตามเวลาเริ่ม
                          const timeA = a.start_time || "00:00"
                          const timeB = b.start_time || "00:00"
                          const timeComparison = timeA.localeCompare(timeB)
                          if (timeComparison !== 0) return timeComparison
                          
                          // หากเวลาเริ่มเหมือนกัน เรียงตามผู้ปฏิบัติงานคนที่ 1 ที่มีตัวอักษร "อ" ตำแหน่งแรก
                          const operatorA = (a.operators || "").split(", ")[0] || ""
                          const operatorB = (b.operators || "").split(", ")[0] || ""
                          const indexA = operatorA.indexOf("อ")
                          const indexB = operatorB.indexOf("อ")
                          if (indexA === 0 && indexB !== 0) return -1
                          if (indexB === 0 && indexA !== 0) return 1
                          return operatorA.localeCompare(operatorB)
                        });
                      
                      console.log('📅 Daily Production Results:', {
                        selectedDate,
                        totalItems: productionData.length,
                        filteredItems: dailyProduction.length,
                        dailyProduction
                      });
                      
                      return dailyProduction.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          <h4
                            className={`font-medium text-gray-900 ${
                              isFormCollapsed ? "text-sm sm:text-lg md:text-xl" : "text-xs sm:text-sm md:text-base"
                            }`}
                          >
                            งานผลิตวันที่ {formatFullDate(new Date(selectedDate))} จำนวน {dailyProduction.length} งาน
                          </h4>

                          {dailyProduction.map((item) => (
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
                                      {item.job_name}
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
                  value={editMachine}
                  onValueChange={val => setEditMachine(val)}
                >
                  <SelectTrigger className="text-sm h-8">
                    <SelectValue placeholder="เลือก..." />
                  </SelectTrigger>
                  <SelectContent className={notoSansThai.className}>
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
                  value={editRoom}
                  onValueChange={val => setEditRoom(val)}
                >
                  <SelectTrigger className="text-sm h-8">
                    <SelectValue placeholder="เลือกห้องผลิต..." />
                  </SelectTrigger>
                  <SelectContent className={notoSansThai.className}>
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
                        value={editOperators[position - 1]}
                        onValueChange={val => {
                          const newOps = [...editOperators];
                          newOps[position - 1] = val;
                          setEditOperators(newOps);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent className={notoSansThai.className}>
                          {users.map(u => (
                            <SelectItem key={u.id_code} value={u.name} className={notoSansThai.className}>{u.name}</SelectItem>
                          ))}
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
                  <Input 
                    type="text" 
                    value={editStartTime} 
                    onChange={e => setEditStartTime(e.target.value)} 
                    className="text-sm h-8" 
                    placeholder="08:00" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-700">เวลาสิ้นสุด</Label>
                  <Input 
                    type="text" 
                    value={editEndTime} 
                    onChange={e => setEditEndTime(e.target.value)} 
                    className="text-sm h-8" 
                    placeholder="17:00" 
                  />
                </div>
              </div>
              {/* หมายเหตุ */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">หมายเหตุ</Label>
                <Textarea
                  placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับการผลิต..."
                  className="min-h-[60px] resize-none text-sm"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {/* แสดงปุ่มลบเฉพาะแบบร่างเท่านั้น */}
            {(() => {
              console.log('🔍 Checking delete button visibility:');
              console.log('  - editDraftData:', editDraftData);
              console.log('  - editDraftData?.isDraft:', editDraftData?.isDraft);
              console.log('  - editDraftData?.id:', editDraftData?.id);
              console.log('  - editDraftData?.id?.startsWith("draft_"):', editDraftData?.id?.startsWith('draft_'));
              console.log('  - editDraftId:', editDraftId);
              
              const shouldShowDelete = editDraftData && (editDraftData.isDraft || editDraftData.id?.startsWith('draft_'));
              console.log('  - shouldShowDelete:', shouldShowDelete);
              
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
              <Button variant="outline" onClick={() => setEditDraftModalOpen(false)} disabled={isSubmitting}>ยกเลิก</Button>
              <Button onClick={handleSaveEditDraft} disabled={isSubmitting} className="bg-green-700 hover:bg-green-800 text-white">
                {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
