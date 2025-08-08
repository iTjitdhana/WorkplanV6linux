"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Download, Clock, Target, AlertTriangle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DailyJob {
  id: string
  jobId: string
  productName: string
  plannedStart: string
  actualStart: string
  plannedEnd: string
  actualEnd: string
  plannedDuration: number
  actualDuration: number
  status: "completed" | "in-progress" | "delayed" | "cancelled"
  operator: string
  machine: string
  quantity: number
  defects: number
  efficiency: number
}

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState("2024-01-08")

  // Mock data for daily summary
  const dailyJobs: DailyJob[] = [
    {
      id: "1",
      jobId: "JOB-001",
      productName: "Oyakodon (คัดไก่)",
      plannedStart: "08:00",
      actualStart: "08:00",
      plannedEnd: "10:00",
      actualEnd: "10:30",
      plannedDuration: 120,
      actualDuration: 150,
      status: "completed",
      operator: "เชฟสมชาย",
      machine: "Kitchen-01",
      quantity: 50,
      defects: 2,
      efficiency: 80.0
    },
    {
      id: "2",
      jobId: "JOB-002",
      productName: "ลูกรอก",
      plannedStart: "10:30",
      actualStart: "10:45",
      plannedEnd: "12:00",
      actualEnd: "12:15",
      plannedDuration: 90,
      actualDuration: 90,
      status: "completed",
      operator: "เชฟสมหญิง",
      machine: "Kitchen-02",
      quantity: 80,
      defects: 0,
      efficiency: 100.0
    },
    {
      id: "3",
      jobId: "JOB-003",
      productName: "ลาบหมูนึ่ง 6 ชิ้น(40 กรัม: ชิ้น)",
      plannedStart: "13:00",
      actualStart: "13:00",
      plannedEnd: "16:00",
      actualEnd: "16:45",
      plannedDuration: 180,
      actualDuration: 225,
      status: "completed",
      operator: "เชฟสมศักดิ์",
      machine: "Kitchen-03",
      quantity: 30,
      defects: 5,
      efficiency: 80.0
    },
    {
      id: "4",
      jobId: "JOB-004",
      productName: "กุ้งต้มยำ 12-13 ตัว/กก. (Repack)",
      plannedStart: "16:00",
      actualStart: "17:00",
      plannedEnd: "18:00",
      actualEnd: "",
      plannedDuration: 120,
      actualDuration: 0,
      status: "in-progress",
      operator: "เชฟสมปอง",
      machine: "Kitchen-04",
      quantity: 25,
      defects: 0,
      efficiency: 0
    },
    {
      id: "5",
      jobId: "JOB-005",
      productName: "ชุดกระดูกซุป (Repack)",
      plannedStart: "18:00",
      actualStart: "",
      plannedEnd: "20:00",
      actualEnd: "",
      plannedDuration: 120,
      actualDuration: 0,
      status: "cancelled",
      operator: "เชฟสมใจ",
      machine: "Kitchen-01",
      quantity: 40,
      defects: 0,
      efficiency: 0
    }
  ]

  const completedJobs = dailyJobs.filter(job => job.status === "completed")
  const totalPlannedTime = dailyJobs.reduce((sum, job) => sum + job.plannedDuration, 0)
  const totalActualTime = completedJobs.reduce((sum, job) => sum + job.actualDuration, 0)
  const totalDelay = completedJobs.reduce((sum, job) => sum + Math.max(0, job.actualDuration - job.plannedDuration), 0)
  const onTimeJobs = completedJobs.filter(job => job.actualDuration <= job.plannedDuration).length
  const delayedJobs = completedJobs.filter(job => job.actualDuration > job.plannedDuration).length

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "เสร็จแล้ว", className: "bg-green-100 text-green-800" },
      "in-progress": { label: "กำลังทำ", className: "bg-blue-100 text-blue-800" },
      delayed: { label: "ล่าช้า", className: "bg-orange-100 text-orange-800" },
      cancelled: { label: "ยกเลิก", className: "bg-red-100 text-red-800" }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getDelayBadge = (planned: number, actual: number, status: string) => {
    if (status !== "completed") return null
    const delay = actual - planned
    if (delay > 0) {
      return <Badge variant="destructive">+{delay} นาที</Badge>
    } else if (delay < 0) {
      return <Badge variant="secondary">{delay} นาที</Badge>
    }
    return <Badge variant="secondary">ตรงเวลา</Badge>
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                สรุปรายการผลิตรายวัน
              </CardTitle>
              <CardDescription>
                วันที่ {new Date(selectedDate).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                วันนี้
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                ส่งออกรายงาน
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              รวมงานทั้งหมดในวันนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่เสร็จสิ้น</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              เสร็จสมบูรณ์แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่ล่าช้า</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{delayedJobs}</div>
            <p className="text-xs text-muted-foreground">
              ล่าช้าจากแผน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่ยกเลิก</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dailyJobs.filter(job => job.status === "cancelled").length}
            </div>
            <p className="text-xs text-muted-foreground">
              ยกเลิกการผลิต
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Job List */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดงานประจำวัน</CardTitle>
          <CardDescription>
            ข้อมูลการผลิตแต่ละงานพร้อมการเปรียบเทียบกับแผน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่องาน</TableHead>
                  <TableHead>เวลาแผน</TableHead>
                  <TableHead>เวลาจริง</TableHead>
                  <TableHead>ระยะเวลา</TableHead>
                  <TableHead>ผู้ปฏิบัติงาน</TableHead>
                  <TableHead>จำนวนผู้ปฏิบัติงาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุงาน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.productName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{job.plannedStart} - {job.plannedEnd}</div>
                        <div className="text-muted-foreground">({job.plannedDuration} นาที)</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{job.actualStart} - {job.actualEnd || "กำลังทำ"}</div>
                        <div className="text-muted-foreground">
                          ({job.status === "completed" ? job.actualDuration : "..."} นาที)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>แผน: {job.plannedDuration} นาที</div>
                        <div className={job.status === "completed" && job.actualDuration > job.plannedDuration ? "text-red-600" : "text-green-600"}>
                          จริง: {job.status === "completed" ? job.actualDuration : "..."} นาที
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{job.operator}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {Math.floor(Math.random() * 3) + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs text-sm text-muted-foreground">
                        {job.status === "completed" && job.actualDuration > job.plannedDuration 
                          ? "ใช้เวลานานกว่าแผน เนื่องจากต้องปรับแต่งเครื่องจักร"
                          : job.status === "in-progress" 
                          ? "กำลังดำเนินการตามแผน"
                          : "ดำเนินการเสร็จเรียบร้อย"
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>สรุปปัญหาและข้อเสนอแนะ</CardTitle>
            <CardDescription>สรุปจากหมายเหตุงานในวันนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800 mb-1">ปัญหาที่พบจากหมายเหตุงาน</div>
                <ul className="text-sm text-red-700 space-y-1">
                  {dailyJobs
                    .filter(job => job.status === "completed" && job.actualDuration > job.plannedDuration)
                    .map((job, index) => (
                      <li key={index}>
                        • {job.productName}: ใช้เวลานานกว่าแผน {job.actualDuration - job.plannedDuration} นาที - 
                        {job.status === "completed" && job.actualDuration > job.plannedDuration 
                          ? " ใช้เวลานานกว่าแผน เนื่องจากต้องปรับแต่งเครื่องจักร"
                          : ""
                        }
                      </li>
                    ))
                  }
                  {dailyJobs
                    .filter(job => job.status === "in-progress")
                    .map((job, index) => (
                      <li key={index}>
                        • {job.productName}: เริ่มงานล่าช้า - กำลังดำเนินการตามแผน
                      </li>
                    ))
                  }
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800 mb-1">งานที่ดำเนินการได้ดี</div>
                <ul className="text-sm text-green-700 space-y-1">
                  {dailyJobs
                    .filter(job => job.status === "completed" && job.actualDuration <= job.plannedDuration)
                    .map((job, index) => (
                      <li key={index}>
                        • {job.productName}: ดำเนินการเสร็จเรียบร้อยตามแผน
                      </li>
                    ))
                  }
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800 mb-1">ข้อเสนอแนะ</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• ควรเตรียมการปรับแต่งเครื่องจักรล่วงหน้าเพื่อลดเวลาที่สูญเสีย</li>
                  <li>• วางแผนการเริ่มงานให้ตรงเวลาเพื่อไม่ให้กระทบต่องานถัดไป</li>
                  <li>• ติดตามงานที่กำลังดำเนินการให้เสร็จตามกำหนด</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
