"use client"

import { useState } from "react"
import {
  BookmarkIcon,
  Calendar,
  Clock,
  Search,
  CalendarClockIcon,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Eye,
  Edit,
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

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export default function MedicalAppointmentDashboard() {
  const [selectedDate, setSelectedDate] = useState("2025-07-17")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily")
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)
  const [selectedWeekDay, setSelectedWeekDay] = useState<string | null>(null)

  // Staff image mapping
  const staffImages: { [key: string]: string } = {
    จรัญ: "/images/staff/จรัญ.jpg",
    จิ๋ว: "/images/staff/จิ๋ว.jpg",
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
      month: "long",
    })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "long",
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

  // Sample production data
  const productionData = [
    {
      id: 1,
      date: "2025-07-14",
      title: "น้ำแกงส้ม 450 กรัม (1*5 แพ็ค)",
      room: "ครัวร้อน A",
      staff: "อาร์ม",
      time: "09:00-15:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
      notes: "ใช้วัตถุดิบชุดใหม่",
    },
    {
      id: 2,
      date: "2025-07-15",
      title: "แกงเขียวหวาน 500 กรัม",
      room: "ครัวร้อน B",
      staff: "แมน",
      time: "08:00-14:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 3,
      date: "2025-07-17",
      title: "น้ำแกงส้ม 450 กรัม (1*5 แพ็ค)",
      room: "ครัวร้อน A",
      staff: "อาร์ม, แมน, สาม",
      time: "09:00-15:00",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกแบบร่าง",
    },
    {
      id: 4,
      date: "2025-07-17",
      title: "ไก่จ๋าใบเตย",
      room: "ครัวร้อน B",
      staff: "ป้าน้อย",
      time: "13:30-17:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 5,
      date: "2025-01-16",
      title: "ต้มยำกุ้ง 400 กรัม",
      room: "ครัวร้อน C",
      staff: "มิ้นต์",
      time: "10:00-16:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกแบบร่าง",
    },
    {
      id: 6,
      date: "2025-01-18",
      title: "ผัดไทย 350 กรัม",
      room: "ครัวร้อน A",
      staff: "นิค",
      time: "11:00-17:00",
      status: "กำลังดำเนินการ",
      recordStatus: "บันทึกแบบร่าง",
    },
    {
      id: 7,
      date: "2025-07-18",
      title: "มัสมั่นไก่",
      room: "ครัวร้อน A",
      staff: "พี่ตุ่น",
      time: "09:30-14:00",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกแบบร่าง",
      notes: "เตรียมเครื่องเทศพิเศษ",
    },
    {
      id: 8,
      date: "2025-07-17",
      title: "ซอสผงกะหรี่",
      room: "ครัวร้อน A",
      staff: "พี่ภา",
      time: "15:30-16:45",
      status: "งานผลิตถูกยกเลิก",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 44,
      date: "2025-07-17",
      title: "งานตวงสูตร",
      room: "ไม่ระบุ",
      staff: "พี่ภา",
      time: "08:00-11:00",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 9,
      date: "2025-07-19",
      title: "อกไก่หมัก",
      room: "ห้อง Meat",
      staff: "เอ, สาม",
      time: "09:30-11:00",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 10,
      date: "2025-07-19",
      title: "น้ำแกงส้ม 450 กรัม (1*5 แพ็ค)",
      room: "ครัวร้อน A",
      staff: "อาร์ม",
      time: "09:30-14:30",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 11,
      date: "2025-07-19",
      title: "พริกหนุ่มย่าง (แกะ)",
      room: "ครัวร้อน A",
      staff: "แมน, พี่ตุ่น",
      time: "09:30-16:30",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 12,
      date: "2025-07-19",
      title: "สตรอว์เบอร์รีอบแห้ง รสธรรมชาติ",
      room: "HOT BAKERY",
      staff: "พี่ภา",
      time: "11:00-12:30",
      status: "งานผลิตรอดำเนินการ",
      recordStatus: "บันทึกเสร็จสิ้น",
      notes: "ตรวจสอบอุณหภูมิเตาอบ",
    },
    {
      id: 13,
      date: "2025-07-16",
      title: "สตรอว์เบอร์รีอบแห้ง รสธรรมชาติ",
      room: "HOT BAKERY",
      staff: "พี่ภา",
      time: "11:00-12:30",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 14,
      date: "2025-07-21",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 15,
      date: "2025-07-22",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 16,
      date: "2025-07-23",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 17,
      date: "2025-07-24",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 18,
      date: "2025-07-25",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 19,
      date: "2025-07-26",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 20,
      date: "2025-07-27",
      title: "งาน A เบิกของส่งสาขา - ผัก",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 21,
      date: "2025-07-21",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 22,
      date: "2025-07-22",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 23,
      date: "2025-07-23",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 24,
      date: "2025-07-24",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 25,
      date: "2025-07-25",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 26,
      date: "2025-07-26",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 27,
      date: "2025-07-27",
      title: "งาน B เบิกของส่งสาขา - สด",
      room: "ห้องยิงขาย",
      staff: "โอเล่, แจ็ค, แมน, เอ",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 28,
      date: "2025-07-21",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 29,
      date: "2025-07-22",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 30,
      date: "2025-07-23",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 31,
      date: "2025-07-24",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 32,
      date: "2025-07-25",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 33,
      date: "2025-07-26",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 34,
      date: "2025-07-27",
      title: "งาน C เบิกของส่งสาขา - แห้ง",
      room: "ห้องยิงขาย",
      staff: "โอเล่, พี่ตุ่น",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 35,
      date: "2025-07-21",
      title: "งาน D ตวงสูตร",
      room: "ห้อง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 36,
      date: "2025-07-22",
      title: "งาน D ตวงสูตร",
      room: "ห้ง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 37,
      date: "2025-07-23",
      title: "งาน D ตวงสูตร",
      room: "ห้อง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 38,
      date: "2025-07-24",
      title: "งาน D ตวงสูตร",
      room: "ห้อง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 39,
      date: "2025-07-25",
      title: "งาน D ตวงสูตร",
      room: "ห้อง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 40,
      date: "2025-07-26",
      title: "งาน D ตวงสูตร",
      room: "ห้อง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 41,
      date: "2025-07-27",
      title: "งาน D ตวงสูตร",
      room: "ห้อง Premix",
      staff: "พี่ภา",
      time: "08:00-09:00",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
    {
      id: 42,
      date: "2025-07-28",
      title: "งาน Frozen saute Onion",
      room: "ห้องยิงขาย",
      staff: "แมน, เอ",
      time: "09:00-12:30",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
      notes: "หั่น 130 กก หอมมาประมาณ 9.30 น.",
    },
    {
      id: 43,
      date: "2025-07-28",
      title: "งาน น้ำจิ้มสุกี้",
      room: "ครัวร้อน A",
      staff: "พี่ตุ่น",
      time: "10:00-10:30",
      status: "งานผลิตเสร็จสิ้น",
      recordStatus: "บันทึกเสร็จสิ้น",
    },
  ]

  // Get production data for current week
  const getWeekProduction = () => {
    const weekStart = weekDates[0].toISOString().split("T")[0]
    const weekEnd = weekDates[6].toISOString().split("T")[0]

    return productionData
      .filter((item) => {
        return item.date >= weekStart && item.date <= weekEnd
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get production data for selected day
  const getSelectedDayProduction = () => {
    return productionData.filter((item) => item.date === selectedDate)
  }

  const weekProduction = getWeekProduction()
  const selectedDayProduction = getSelectedDayProduction()

  // Helper function to render staff avatars
  const renderStaffAvatars = (staff: string, isFormCollapsed: boolean) => {
    const staffList = staff.split(", ")

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
              <AvatarFallback className="text-xs font-medium bg-green-100 text-green-800">
                {person.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span
          className={`${isFormCollapsed ? "text-base sm:text-lg" : "text-sm sm:text-base"} truncate text-slate-900`}
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
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate">
                ระบบจัดการแผนผลิตครัวกลาง บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)
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
                      <CalendarClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="leading-7 text-2xl">เพิ่มงานที่ต้องการผลิต</span>
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

                  {/* Staff Search */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เพิ่มงานผลิต</Label>
                    <div className="relative">
                      <Input
                        placeholder="ค้นหาชื่องานผลิต หรือรหัสงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 sm:pl-10 text-sm"
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
                          <Select>
                            <SelectTrigger className="h-8 sm:h-9 text-sm">
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
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-xs sm:text-sm font-bold text-gray-700">เครื่องบันทึกข้อมูลการผลิต</Label>
                    <Select>
                      <SelectTrigger className="text-sm">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาเริ่ม</Label>
                      <div className="relative">
                        <Input type="time" defaultValue="08:00" className="pl-8 sm:pl-10 text-sm" />
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-gray-700">เวลาสิ้นสุด</Label>
                      <div className="relative">
                        <Input type="time" defaultValue="17:00" className="pl-8 sm:pl-10 text-sm" />
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
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 bg-white text-sm font-medium py-2 px-4"
                      >
                        บันทึกแบบร่าง
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 shadow-md">
                        บันทึกเสร็จสิ้น
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
                    <span className="text-2xl">รายการแผนผลิต</span>
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
                      className="bg-white border-green-600 text-green-700 hover:bg-green-50 flex items-center space-x-1 sm:space-x-2"
                    >
                      <RefreshCw className={`${isFormCollapsed ? "w-3 h-3 sm:w-4 sm:h-4" : "w-3 h-3"}`} />
                      <span className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"}`}>พิมพ์ใบงานผลิต</span>
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
                            const dayProduction = productionData.filter((item) => item.date === dateStr)

                            return (
                              <div key={index} className={`${getDayBackgroundColor(date)} rounded-lg p-2 text-center`}>
                                <div
                                  className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} font-medium ${getDayTextColor(date)}`}
                                >
                                  {getDayName(date)}
                                </div>
                                <div
                                  className={`${isFormCollapsed ? "text-lg sm:text-xl" : "text-sm sm:text-lg"} font-bold ${getDayTextColor(date)}`}
                                >
                                  {date.getDate()}
                                </div>
                                <div
                                  className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${getDayTextColor(date)} opacity-90 mt-1 font-medium`}
                                >
                                  {date.toLocaleDateString("th-TH", { month: "long" })}
                                </div>
                                <div
                                  className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${getDayTextColor(date)} opacity-75 mt-1`}
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
                            const dateStr = date.toISOString().split("T")[0]
                            const dayProduction = productionData.filter((item) => item.date === dateStr)

                            return (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-2 bg-white min-h-[200px] sm:min-h-[300px]"
                              >
                                {dayProduction.length > 0 ? (
                                  <div className="space-y-2">
                                    {dayProduction.map((item) => (
                                      <div
                                        key={item.id}
                                        className={`p-2 border-l-4 ${
                                          item.status === "งานผลิตถูกยกเลิก"
                                            ? "border-l-red-500 bg-red-50"
                                            : item.recordStatus === "บันทึกเสร็จสิ้น"
                                              ? "border-l-green-500 bg-green-50"
                                              : item.recordStatus === "บันทึกแบบร่าง"
                                                ? "border-l-gray-500 bg-gray-50"
                                                : "border-l-gray-500 bg-gray-50"
                                        }`}
                                      >
                                        {/* ชื่องานผลิต */}
                                        <div
                                          className={`font-medium text-gray-900 ${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} mb-1 leading-tight`}
                                        >
                                          <span className="underline">
                                            งานที่ {item.id}: {item.title}
                                          </span>
                                        </div>

                                        {/* เวลา */}
                                        <div
                                          className={`flex items-center space-x-1 ${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} text-gray-600 mb-1`}
                                        >
                                          <Clock
                                            className={`${isFormCollapsed ? "w-3 h-3" : "w-2.5 h-2.5"} flex-shrink-0`}
                                          />
                                          <span>{item.time}</span>
                                        </div>

                                        {/* หมายเหตุ (ถ้ามี) */}
                                        {item.notes && (
                                          <div
                                            className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} text-gray-500 italic`}
                                          >
                                            หมายเหตุ: {item.notes}
                                          </div>
                                        )}

                                        {/* สถานะ */}
                                        <div className="mt-1">
                                          <span
                                            className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                                              item.status === "งานผลิตถูกยกเลิก"
                                                ? "bg-red-100 text-red-700"
                                                : item.status === "กำลังดำเนินการ"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : item.status === "งานผลิตเสร็จสิ้น"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.status === "งานผลิตรอดำเนินการ"
                                                      ? "bg-gray-100 text-gray-700"
                                                      : "bg-gray-100 text-gray-700"
                                            }`}
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

                    {/* Production Plan Cards */}
                    {selectedDayProduction.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {selectedDayProduction.map((item) => (
                          <div
                            key={item.id}
                            className={`border-l-4 ${
                              item.status === "งานผลิตถูกยกเลิก"
                                ? "border-l-red-400 bg-red-50"
                                : item.recordStatus === "บันทึกเสร็จสิ้น"
                                  ? "border-l-green-400 bg-green-50"
                                  : item.recordStatus === "บันทึกแบบร่าง"
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
                                    17 ก.ค. 2568
                                  </Badge>
                                  <h3
                                    className={`font-bold text-gray-900 ${
                                      isFormCollapsed
                                        ? "text-sm sm:text-lg md:text-xl"
                                        : "text-xs sm:text-sm md:text-base"
                                    } truncate`}
                                  >
                                    <span className="underline">
                                      งานที่ {item.id}: {item.title}
                                    </span>
                                  </h3>
                                  {item.room !== "ไม่ระบุ" && (
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} flex-shrink-0`}
                                    >
                                      ห้องผลิต: {item.room}
                                    </Badge>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${
                                        item.status === "งานผลิตถูกยกเลิก"
                                          ? "border-red-500 text-red-700"
                                          : item.status === "งานผลิตรอดำเนินการ"
                                            ? "border-gray-500 text-gray-700"
                                            : item.status === "งานผลิตเสร็จสิ้น"
                                              ? "border-green-500 text-green-700"
                                              : "border-gray-500 text-gray-700"
                                      } flex-shrink-0`}
                                    >
                                      {item.status}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} ${
                                        item.recordStatus === "บันทึกเสร็จสิ้น"
                                          ? "border-green-500 text-green-700 bg-green-50"
                                          : "border-gray-500 text-gray-700 bg-gray-50"
                                      } flex-shrink-0`}
                                    >
                                      {item.recordStatus}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Staff and Planner Section - ในแถวเดียวกัน */}
                                <div className="flex items-center justify-between">
                                  {/* Staff Section - ด้านซ้าย */}
                                  <div className="flex items-center space-x-2 sm:space-x-3">
                                    {renderStaffAvatars(item.staff, isFormCollapsed)}
                                  </div>

                                  {/* ผู้วางแผนการผลิต - ด้านขวาสุด */}
                                  <div className="flex items-center space-x-2">
                                    <div className="flex -space-x-2">
                                      {/* Show only จิ๋ว for บันทึกแบบร่าง status */}
                                      {item.recordStatus === "บันทึกแบบร่าง" ? (
                                        <Avatar
                                          className={`${isFormCollapsed ? "w-12 h-12 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-12 sm:h-12"} border-2 border-white shadow-sm`}
                                        >
                                          <AvatarImage
                                            src={staffImages["จิ๋ว"] || "/placeholder.svg?height=80&width=80&text=จิ"}
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
                                              src={staffImages["จิ๋ว"] || "/placeholder.svg?height=80&width=80&text=จิ"}
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
                                              src={staffImages["จรัญ"] || "/placeholder.svg?height=80&width=80&text=จ"}
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
                                      ตรวจสอบแผนการผลิต: {item.recordStatus === "บันทึกแบบร่าง" ? "จิ๋ว ✔" : "จิ๋ว, จรัญ ✔✔"}
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
                                      {item.time.replace("-", ":00 - ")}:00
                                    </span>
                                  </div>
                                </div>

                                {/* หมายเหตุ (ถ้ามี) */}
                                {item.notes && (
                                  <div
                                    className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"} text-gray-500 italic mt-2`}
                                  >
                                    หมายเหตุ: {item.notes}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                                {/* ปุ่ม */}
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    {/* เพิ่มปุ่ม 3 ปุ่มสำหรับรายการที่มี จิ๋ว เพียงคนเดียวในการตรวจสอบ */}
                                    {item.recordStatus === "บันทึกแบบร่าง" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white text-xs font-medium px-2 py-1"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white text-xs font-medium px-2 py-1"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                    {/* เพิ่มปุ่ม 3 ปุ่มสำหรับรายการที่มี จิ๋ว, จรัญ ในการตรวจสอบ */}
                                    {item.recordStatus === "บันทึกเสร็จสิ้น" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white text-xs font-medium px-2 py-1"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white text-xs font-medium px-2 py-1"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Calendar
                          className={`${isFormCollapsed ? "w-12 h-12 sm:w-16 sm:h-16" : "w-8 h-8 sm:w-12 sm:h-12"} mx-auto mb-3 sm:mb-4 text-gray-300`}
                        />
                        <p className={`${isFormCollapsed ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                          ไม่มีการผลิตในวันนี้
                        </p>
                      </div>
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
    </div>
  )
}
