"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  Search,
  User,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
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
import Link from 'next/link'
import { 
  formatDateForDisplay, 
  getWeekDates, 
  getDayName,
  formatDateForAPI
} from "@/lib/dateUtils"

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
  const [productionData, setProductionData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Load production data from API
  const loadProductionData = async () => {
    setLoading(true);
    try {
      console.log('🔄 [DEBUG] Loading production data for weekly view...');
      
      // ดึงข้อมูลจาก work plans และ drafts ผ่าน frontend API routes
      const [plansResponse, draftsResponse] = await Promise.all([
        fetch('/api/work-plans'),
        fetch('/api/work-plans/drafts')
      ]);

      const plans = await plansResponse.json();
      const drafts = await draftsResponse.json();

      console.log('📊 [DEBUG] Plans response:', plans);
      console.log('📊 [DEBUG] Drafts response:', drafts);

      // สร้าง map สำหรับ lookup draft ตาม job_code+job_name+production_date
      const draftMap = new Map();
      (drafts.data || []).forEach((d: any) => {
        const key = `${d.production_date}__${d.job_code}__${d.job_name}`;
        draftMap.set(key, d);
      });

      // รวมข้อมูลจาก drafts และ plans
      const allData = [
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
            id: `draft_${d.id}`,
            date: d.production_date,
            title: d.job_name,
            room: d.production_room_id || d.production_room || 'ไม่ระบุ',
            staff: operatorNames,
            time: `${d.start_time || ''} - ${d.end_time || ''}`,
            status: status,
            recordStatus: recordStatus,
            notes: d.notes || '',
            isDraft: true,
          };
        }),
        ...(plans.data || []).map((p: any) => {
          // Workaround: หา draft ที่ตรงกันมาเติมข้อมูลห้อง/เครื่อง/หมายเหตุ
          const key = `${p.production_date}__${p.job_code}__${p.job_name}`;
          const draft = draftMap.get(key);

          let status = 'รอดำเนินการ';
          let status_name = 'รอดำเนินการ';

          // ตรวจสอบ status_id จากฐานข้อมูล
          if (p.status_id === 9) {
            status = 'ยกเลิกการผลิต';
            status_name = 'ยกเลิกการผลิต';
          } else if (p.status_id === 2) {
            status = 'เสร็จสิ้น';
            status_name = 'เสร็จสิ้น';
          } else if (p.status_id === 1) {
            status = 'กำลังดำเนินการ';
            status_name = 'กำลังดำเนินการ';
          }

          return {
            id: p.id,
            date: p.production_date,
            title: p.job_name,
            room: draft?.production_room_name || draft?.production_room_id || draft?.production_room || 'ไม่ระบุ',
            staff: p.operators || '',
            time: `${p.start_time || ''} - ${p.end_time || ''}`,
            status: status,
            recordStatus: status_name,
            notes: draft?.notes || '',
            isDraft: false,
          };
        })
      ];

      console.log('📊 [DEBUG] Combined data:', allData);
      setProductionData(allData);
    } catch (error) {
      console.error('Error loading production data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or week changes
  useEffect(() => {
    loadProductionData();
  }, [currentWeek]);

  // Staff image mapping
  const staffImages: { [key: string]: string } = {
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
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
    setSelectedWeekDay(null) // Reset selected day when navigating weeks
  }

  const formatDate = (date: Date) => {
    return formatDateForDisplay(date, 'short');
  }

  const formatFullDate = (date: Date) => {
    return formatDateForDisplay(date, 'full');
  }

  const formatProductionDate = (dateStr: string) => {
    return formatDateForDisplay(dateStr, 'full');
  }

  // เพิ่มฟังก์ชันนี้หลังจาก getDayName function
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

  const weekDates = getWeekDates(currentWeek)
  const weekRange = `${formatFullDate(weekDates[0])} - ${formatFullDate(weekDates[6])}`

  // Get production data for current week
  const getWeekProduction = () => {
    const weekStart = formatDateForAPI(weekDates[0]);
    const weekEnd = formatDateForAPI(weekDates[6]);

    console.log('🔍 [DEBUG] Week range:', weekStart, 'to', weekEnd);
    console.log('🔍 [DEBUG] Available dates in productionData:', productionData.map(item => item.date));

    return productionData
      .filter((item) => {
        const itemDate = item.date;
        const isInWeek = itemDate >= weekStart && itemDate <= weekEnd;
        console.log(`🔍 [DEBUG] Item date: ${itemDate}, in week: ${isInWeek}`);
        return isInWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get production data for selected day
  const getSelectedDayProduction = () => {
    if (!selectedWeekDay) return []
    return productionData.filter((item) => item.date === selectedWeekDay)
  }

  const weekProduction = getWeekProduction()
  const selectedDayProduction = getSelectedDayProduction()

  console.log('📊 [DEBUG] Week production data:', weekProduction);
  console.log('📊 [DEBUG] Selected day production data:', selectedDayProduction);

  // Helper function to render staff avatars
  const renderStaffAvatars = (staff: string, isFormCollapsed: boolean) => {
    const staffList = (typeof staff === 'string' ? staff : "").split(", ")

    return (
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
        <div className="flex -space-x-1 sm:-space-x-2">
          {staffList.map((person, index) => (
            <Avatar
              key={index}
              className={`${
                isFormCollapsed
                  ? "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
                  : "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
              } border-2 border-white shadow-sm flex-shrink-0`}
            >
              <AvatarImage
                src={staffImages[person] || `/placeholder.svg?height=80&width=80&text=${person.charAt(0)}`}
                alt={person}
                className="object-cover object-center avatar-image"
                style={{ imageRendering: "crisp-edges" }}
              />
              <AvatarFallback className="text-xs font-medium bg-green-100 text-green-800">
                {person.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
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

  return (
    <div className={`min-h-screen bg-gray-200 ${notoSansThai.className} flex flex-col`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-800 via-green-700 to-green-600 border-b border-green-600 shadow-md">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-18">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h1 className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-semibold text-white truncate">
                ระบบจัดการแผนการผลิตครัวกลาง บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)
              </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadProductionData}
                disabled={loading}
                className="text-white hover:bg-green-700 border border-green-500 rounded-lg px-2 py-1 text-xs"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-1">รีเฟรช</span>
              </Button>
              {loading && (
                <span className="text-xs text-green-100">กำลังโหลด...</span>
              )}
              <Link 
                href="/dashboard"
                className="hidden lg:block text-xs md:text-sm text-green-100 hover:text-white underline cursor-pointer transition-colors duration-200"
              >
                ระบบจัดการข้อมูล
              </Link>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="hidden sm:block text-xs md:text-sm text-white">ผู้ใช้: Admin</span>
                <span className="sm:hidden text-xs text-white">Admin</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 pt-14 sm:pt-16 md:pt-20 lg:pt-22">
        <div className="flex flex-col xl:flex-row gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Left Panel - Schedule Form */}
          <div
            className={`transition-all duration-300 ${
              isFormCollapsed ? "xl:w-16 2xl:w-20" : "w-full xl:w-2/5"
            } ${isFormCollapsed && "hidden xl:block"}`}
          >
            <Card className="shadow-lg bg-white h-fit">
              <CardHeader
                className={`pb-2 sm:pb-3 md:pb-4 ${
                  isFormCollapsed ? "flex justify-center items-center min-h-[50px] sm:min-h-[60px] md:min-h-[80px]" : ""
                }`}
              >
                <div className={`flex items-center ${isFormCollapsed ? "justify-center" : "justify-between"}`}>
                  {!isFormCollapsed && (
                    <CardTitle className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base lg:text-lg">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                      <span>เพิ่มงานที่ต้องการผลิต</span>
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                    className="text-white bg-green-800 hover:bg-green-900 border-2 border-green-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 p-0 flex items-center justify-center flex-shrink-0"
                  >
                    {isFormCollapsed ? (
                      <PanelLeftOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <PanelLeftClose className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {!isFormCollapsed && (
                <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">วันที่ผลิต</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-7 sm:pl-8 md:pl-10 text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                      />
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Staff Search */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เพิ่มงานผลิต</Label>
                    <div className="relative">
                      <Input
                        placeholder="ค้นหาชื่องานผลิต หรือรหัสงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 sm:pl-8 md:pl-10 text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                      />
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Staff Positions */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">ผู้ปฏิบัติงาน (1-4 คน)</Label>
                      <Button variant="link" size="sm" className="text-green-600 p-0 h-auto text-xs">
                        ล้างข้อมูลทั้งหมด
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      {[1, 2, 3, 4].map((position) => (
                        <div key={position} className="space-y-1 sm:space-y-2">
                          <Label className="text-xs text-gray-600">ผู้ปฏิบัติงาน {position}</Label>
                          <Select>
                            <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                              <SelectValue placeholder="เลือก" />
                            </SelectTrigger>
                            <SelectContent className={notoSansThai.className}>
                              <SelectItem value="staff1" className={notoSansThai.className}>
                                พี่ตุ่น
                              </SelectItem>
                              <SelectItem value="staff2" className={notoSansThai.className}>
                                อาร์ม
                              </SelectItem>
                              <SelectItem value="staff3" className={notoSansThai.className}>
                                แมน
                              </SelectItem>
                              <SelectItem value="staff4" className={notoSansThai.className}>
                                สาม
                              </SelectItem>
                              <SelectItem value="staff5" className={notoSansThai.className}>
                                พี่ภา
                              </SelectItem>
                              <SelectItem value="staff6" className={notoSansThai.className}>
                                ป้าน้อย
                              </SelectItem>
                              <SelectItem value="staff7" className={notoSansThai.className}>
                                เอ
                              </SelectItem>
                              <SelectItem value="staff8" className={notoSansThai.className}>
                                โอเล่
                              </SelectItem>
                              <SelectItem value="staff9" className={notoSansThai.className}>
                                แจ็ค
                              </SelectItem>
                              <SelectItem value="staff10" className={notoSansThai.className}>
                                จรัญ
                              </SelectItem>
                              <SelectItem value="staff11" className={notoSansThai.className}>
                                เกลือ
                              </SelectItem>
                              <SelectItem value="staff12" className={notoSansThai.className}>
                                เป้ง
                              </SelectItem>
                              <SelectItem value="staff13" className={notoSansThai.className}>
                                แผนก RD
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เครื่องบันทึกข้อมูลการผลิต</Label>
                    <Select>
                      <SelectTrigger className="text-xs sm:text-sm h-7 sm:h-8 md:h-9">
                        <SelectValue placeholder="เลือก..." />
                      </SelectTrigger>
                      <SelectContent className={notoSansThai.className}>
                        <SelectItem value="machine1" className={notoSansThai.className}>
                          NEC-01
                        </SelectItem>
                        <SelectItem value="machine2" className={notoSansThai.className}>
                          iPad-01
                        </SelectItem>
                        <SelectItem value="machine3" className={notoSansThai.className}>
                          FUJI-01
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาเริ่ม</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          defaultValue="08:00"
                          className="pl-7 sm:pl-8 md:pl-10 text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                        />
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาสิ้นสุด</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          defaultValue="17:00"
                          className="pl-7 sm:pl-8 md:pl-10 text-xs sm:text-sm h-7 sm:h-8 md:h-9"
                        />
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">หมายเหตุ</Label>
                    <Textarea
                      placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับการผลิต..."
                      className="min-h-[50px] sm:min-h-[60px] md:min-h-[80px] resize-none text-xs sm:text-sm"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-2 sm:pt-3 md:pt-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                      >
                        บันทึกแบบร่าง
                      </Button>
                      <Button className="flex-1 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm h-8 sm:h-9 md:h-10">
                        เสร็จสิ้น
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Mobile Toggle Button */}
          {isFormCollapsed && (
            <div className="xl:hidden fixed bottom-4 right-4 z-40">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsFormCollapsed(false)}
                className="text-white bg-green-800 hover:bg-green-900 border-2 border-green-600 rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 flex items-center justify-center shadow-lg"
              >
                <PanelLeftOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>
          )}

          {/* Right Panel - Schedule View */}
          <div className={`transition-all duration-300 ${isFormCollapsed ? "flex-1" : "w-full xl:w-3/5"}`}>
            <Card className="shadow-lg bg-white">
              <CardHeader className="pb-2 sm:pb-3 md:pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3 md:gap-4">
                  <CardTitle
                    className={`flex items-center space-x-1 sm:space-x-2 ${
                      isFormCollapsed
                        ? "text-sm sm:text-lg md:text-xl lg:text-2xl"
                        : "text-xs sm:text-sm md:text-base lg:text-lg"
                    }`}
                  >
                    <Calendar
                      className={`${
                        isFormCollapsed
                          ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                          : "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
                      } text-green-600`}
                    />
                    <span>รายการแผนผลิต</span>
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === "daily" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("daily")}
                        className={`${
                          isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                        } px-2 sm:px-3 py-1 h-7 sm:h-8 ${
                          viewMode === "daily" ? "bg-green-600 text-white" : "text-gray-600"
                        }`}
                      >
                        รายวัน
                      </Button>
                      <Button
                        variant={viewMode === "weekly" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("weekly")}
                        className={`${
                          isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                        } px-2 sm:px-3 py-1 h-7 sm:h-8 ${
                          viewMode === "weekly" ? "bg-green-600 text-white" : "text-gray-600"
                        }`}
                      >
                        รายสัปดาห์
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
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
              <CardContent className="px-2 sm:px-4 md:px-6">
                {viewMode === "weekly" ? (
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {/* Week Navigation */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("prev")}
                        className="flex items-center justify-center space-x-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden md:inline">สัปดาห์ก่อนหน้า</span>
                        <span className="md:hidden">ก่อน</span>
                      </Button>
                      <div className="text-center flex-1">
                        <h3
                          className={`font-medium text-gray-900 ${
                            isFormCollapsed
                              ? "text-xs sm:text-sm md:text-lg lg:text-xl"
                              : "text-xs sm:text-sm md:text-base"
                          }`}
                        >
                          {weekRange}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("next")}
                        className="flex items-center justify-center space-x-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <span className="hidden md:inline">สัปดาห์ถัดไป</span>
                        <span className="md:hidden">หน้า</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>

                    {/* Weekly Calendar Table */}
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        {/* Header Row */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDates.map((date, index) => {
                            const dateStr = formatDateForAPI(date)
                            const dayProduction = productionData.filter((item) => item.date === dateStr)

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
                                  {dayProduction.length} งาน
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Production Content Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {weekDates.map((date, index) => {
                            const dateStr = formatDateForAPI(date)
                            const dayProduction = productionData.filter((item) => item.date === dateStr)

                            return (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-1 sm:p-2 bg-white min-h-[150px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] overflow-hidden"
                              >
                                {dayProduction.length > 0 ? (
                                  <div className="space-y-1 sm:space-y-2">
                                    {dayProduction.map((item) => (
                                      <div
                                        key={item.id}
                                        className={`p-1 sm:p-2 rounded-md border-l-2 sm:border-l-3 ${
                                          item.status === "งานผลิตถูกยกเลิก"
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
                                          {item.title}
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
                                          <span className="truncate">{item.time}</span>
                                        </div>

                                        {/* หมายเหตุ (ถ้ามี) */}
                                        {item.notes && (
                                          <div
                                            className={`${
                                              isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"
                                            } text-gray-500 italic line-clamp-1`}
                                          >
                                            หมายเหตุ: {item.notes}
                                          </div>
                                        )}

                                        {/* สถานะ */}
                                        <div className="mt-1">
                                          <span
                                            className={`inline-block px-1 sm:px-1.5 py-0.5 rounded text-xs ${
                                              item.status === "รอดำเนินการ"
                                                ? "bg-gray-100 text-gray-700"
                                                : item.status === "กำลังดำเนินการ"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : item.status === "เสร็จสิ้น"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.status === "งานผลิตถูกยกเลิก"
                                                      ? "bg-red-100 text-red-700"
                                                      : "bg-gray-100 text-gray-700"
                                            } truncate`}
                                          >
                                            {item.status}
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
                        className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>

                    <Separator />

                    {/* Production Plan Card */}
                    <div
                      className={`border-l-4 border-l-gray-400 bg-gray-100 ${
                        isFormCollapsed ? "p-2 sm:p-3 md:p-4 lg:p-6" : "p-2 sm:p-3 md:p-4"
                      } rounded-r-lg`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-2 sm:gap-3">
                        <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <Badge
                              variant="outline"
                              className={`${
                                isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                              } bg-blue-50 border-blue-300 text-blue-700 font-medium flex-shrink-0`}
                            >
                              17 ก.ค. 2568
                            </Badge>
                            <h3
                              className={`font-bold text-gray-900 ${
                                isFormCollapsed
                                  ? "text-sm sm:text-base md:text-lg lg:text-xl"
                                  : "text-xs sm:text-sm md:text-base"
                              } truncate`}
                            >
                              น้ำแกงส้ม 450 กรัม (1*5 แพ็ค)
                            </h3>
                            <Badge
                              variant="outline"
                              className={`${
                                isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                              } flex-shrink-0`}
                            >
                              ห้องผลิต: ครัวร้อน A
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${
                                isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                              } border-green-500 text-green-700 flex-shrink-0`}
                            >
                              เสร็จสิ้น
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2 sm:space-x-4">
                            {renderStaffAvatars("อาร์ม", isFormCollapsed)}
                          </div>

                          <div
                            className={`flex items-center space-x-1 sm:space-x-2 ${
                              isFormCollapsed ? "text-sm sm:text-base md:text-lg" : "text-xs sm:text-sm"
                            }`}
                          >
                            <Clock
                              className={`${
                                isFormCollapsed ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" : "w-3 h-3 sm:w-4 sm:h-4"
                              } text-gray-400 flex-shrink-0`}
                            />
                            <span className="text-gray-600">09:00:00 - 15:00:00</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 bg-gray-200 hover:bg-gray-300 px-2 sm:px-3 py-1 h-7 sm:h-8"
                          >
                            <span
                              className={`${
                                isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
                              }`}
                            >
                              บันทึกแบบร่าง
                            </span>
                          </Button>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${
                                isFormCollapsed ? "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" : "w-6 h-6 sm:w-8 sm:h-8"
                              }`}
                            >
                              <Eye
                                className={`${
                                  isFormCollapsed ? "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" : "w-3 h-3 sm:w-4 sm:h-4"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${
                                isFormCollapsed ? "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" : "w-6 h-6 sm:w-8 sm:h-8"
                              }`}
                            >
                              <Edit
                                className={`${
                                  isFormCollapsed ? "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" : "w-3 h-3 sm:w-4 sm:h-4"
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Empty State */}
                    <div className="text-center py-4 sm:py-6 md:py-8 text-gray-500">
                      <Calendar
                        className={`${
                          isFormCollapsed ? "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" : "w-8 h-8 sm:w-12 sm:h-12"
                        } mx-auto mb-2 sm:mb-3 md:mb-4 text-gray-300`}
                      />
                      <p className={`${isFormCollapsed ? "text-sm sm:text-base md:text-lg" : "text-xs sm:text-sm"}`}>
                        ไม่มีการผลิตเพิ่มเติมในวันนี้
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 border-t border-green-600 shadow-md mt-4 sm:mt-6 md:mt-8">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-center items-center h-8 sm:h-10 md:h-12">
            <p className="text-xs sm:text-sm text-white text-center">
              © 2025 แผนกเทคโนโลยีสารสนเทศ บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
