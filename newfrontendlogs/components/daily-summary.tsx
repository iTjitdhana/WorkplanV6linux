"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Download, Clock, Target, AlertTriangle, RefreshCw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, addDays, subDays } from 'date-fns'
import { th } from 'date-fns/locale'

interface DailyJob {
  workPlanId: number
  jobCode: string
  jobName: string
  productionDate: string
  plannedStartTime: string
  plannedEndTime: string
  plannedDurationMinutes: number
  actualStartTime: string | null
  actualEndTime: string | null
  actualDurationMinutes: number
  timeVarianceMinutes: number
  status: 'completed' | 'in-progress' | 'not-started'
  completedProcesses: number
  totalProcesses: number
  logs: any[]
}

interface DailySummary {
  productionDate: string
  totalJobs: number
  completedJobs: number
  inProgressJobs: number
  notStartedJobs: number
  totalPlannedTime: number
  totalActualTime: number
  onTimeJobs: number
  delayedJobs: number
  completionRate: number
  jobs: DailyJob[]
}

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchDailySummary = async (date: Date) => {
    setLoading(true)
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/logs/daily-summary?productionDate=${formattedDate}`)
      const data = await response.json()

      if (data.success) {
        setDailySummary(data.data)
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailySummary(selectedDate)
  }, [selectedDate])

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    let newDate = selectedDate
    if (direction === 'prev') {
      newDate = subDays(selectedDate, 1)
    } else if (direction === 'next') {
      newDate = addDays(selectedDate, 1)
    } else if (direction === 'today') {
      newDate = new Date()
    }
    setSelectedDate(newDate)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "เสร็จแล้ว", className: "bg-green-100 text-green-800" },
      "in-progress": { label: "กำลังทำ", className: "bg-blue-100 text-blue-800" },
      "not-started": { label: "รอเริ่ม", className: "bg-gray-100 text-gray-800" }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getTimeVarianceBadge = (variance: number, status: string) => {
    if (status !== 'completed') return null
    
    if (variance > 0) {
      return <Badge variant="destructive">+{variance} นาที</Badge>
    } else if (variance < 0) {
      return <Badge variant="secondary">{variance} นาที</Badge>
    }
    return <Badge variant="secondary">ตรงเวลา</Badge>
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return '-'
    return format(new Date(timeString), 'HH:mm', { locale: th })
  }

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0 นาที'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours} ชม. ${mins} นาที`
    } else {
      return `${mins} นาที`
    }
  }

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '-'
    return format(new Date(dateTime), 'dd/MM/yyyy HH:mm', { locale: th })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>กำลังโหลดข้อมูล...</span>
      </div>
    )
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
                วันที่ {format(selectedDate, 'PPP', { locale: th })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange('today')}
              >
                วันนี้
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchDailySummary(selectedDate)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                รีเฟรช
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
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailySummary.totalJobs}</div>
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
              <div className="text-2xl font-bold text-green-600">{dailySummary.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                เสร็จสมบูรณ์แล้ว ({dailySummary.completionRate}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานที่ล่าช้า</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dailySummary.delayedJobs}</div>
              <p className="text-xs text-muted-foreground">
                ล่าช้าจากแผน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานที่รอเริ่ม</CardTitle>
              <Target className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{dailySummary.notStartedJobs}</div>
              <p className="text-xs text-muted-foreground">
                ยังไม่เริ่มต้น
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Job List */}
      {dailySummary && (
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
                    <TableHead>ความแตกต่าง</TableHead>
                    <TableHead>กระบวนการ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>หมายเหตุงาน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySummary.jobs.map((job) => (
                    <TableRow key={job.workPlanId}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{job.jobName}</div>
                          <div className="text-sm text-muted-foreground">({job.jobCode})</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatTime(job.plannedStartTime)} - {formatTime(job.plannedEndTime)}</div>
                          <div className="text-muted-foreground">({formatDuration(job.plannedDurationMinutes)})</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {job.actualStartTime ? formatTime(job.actualStartTime) : 'ยังไม่เริ่ม'} - 
                            {job.actualEndTime ? formatTime(job.actualEndTime) : 'กำลังทำ'}
                          </div>
                          <div className="text-muted-foreground">
                            ({job.status === 'completed' ? formatDuration(job.actualDurationMinutes) : '...'} นาที)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>แผน: {formatDuration(job.plannedDurationMinutes)}</div>
                          <div className={job.status === 'completed' && job.timeVarianceMinutes > 0 ? "text-red-600" : "text-green-600"}>
                            จริง: {job.status === 'completed' ? formatDuration(job.actualDurationMinutes) : '...'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTimeVarianceBadge(job.timeVarianceMinutes, job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {job.completedProcesses}/{job.totalProcesses}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs text-sm text-muted-foreground">
                          {job.status === 'completed' && job.timeVarianceMinutes > 0 
                            ? `ใช้เวลานานกว่าแผน ${job.timeVarianceMinutes} นาที`
                            : job.status === 'in-progress' 
                            ? 'กำลังดำเนินการตามแผน'
                            : job.status === 'completed' && job.timeVarianceMinutes <= 0
                            ? 'ดำเนินการเสร็จเรียบร้อยตามแผน'
                            : 'รอการเริ่มต้น'
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
      )}

      {/* Performance Summary */}
      {dailySummary && (
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
                    {dailySummary.jobs
                      .filter(job => job.status === 'completed' && job.timeVarianceMinutes > 0)
                      .map((job, index) => (
                        <li key={index}>
                          • {job.jobName}: ใช้เวลานานกว่าแผน {job.timeVarianceMinutes} นาที
                        </li>
                      ))
                    }
                    {dailySummary.jobs
                      .filter(job => job.status === 'in-progress')
                      .map((job, index) => (
                        <li key={index}>
                          • {job.jobName}: กำลังดำเนินการตามแผน
                        </li>
                      ))
                    }
                    {dailySummary.jobs
                      .filter(job => job.status === 'not-started')
                      .map((job, index) => (
                        <li key={index}>
                          • {job.jobName}: ยังไม่เริ่มต้น
                        </li>
                      ))
                    }
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800 mb-1">งานที่ดำเนินการได้ดี</div>
                  <ul className="text-sm text-green-700 space-y-1">
                    {dailySummary.jobs
                      .filter(job => job.status === 'completed' && job.timeVarianceMinutes <= 0)
                      .map((job, index) => (
                        <li key={index}>
                          • {job.jobName}: ดำเนินการเสร็จเรียบร้อยตามแผน
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
                    <li>• ตรวจสอบงานที่ยังไม่เริ่มต้นและดำเนินการให้ทันเวลา</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!dailySummary && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">ไม่พบข้อมูลสำหรับวันที่เลือก</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
