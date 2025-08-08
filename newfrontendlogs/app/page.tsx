"use client"

import { useState } from "react"
import { CalendarDays, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductionLogs from "@/components/production-logs"
import Analytics from "@/components/analytics"
import DailySummary from "@/components/daily-summary"

export default function ProductionDashboard() {
  const [activeTab, setActiveTab] = useState("logs")

  // Mock data for overview cards
  const overviewData = {
    totalJobs: 45,
    completedJobs: 38,
    delayedJobs: 5,
    onTimeJobs: 33,
    averageDelay: 15, // minutes
    efficiency: 84.4 // percentage
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ระบบจัดการ Logs การผลิต</h1>
          <p className="text-muted-foreground">
            ติดตาม วิเคราะห์ และจัดการข้อมูลการผลิตแบบเรียลไทม์
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานทั้งหมดวันนี้</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                เสร็จแล้ว {overviewData.completedJobs} งาน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานที่เสร็จตรงเวลา</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overviewData.onTimeJobs}</div>
              <p className="text-xs text-muted-foreground">
                {((overviewData.onTimeJobs / overviewData.completedJobs) * 100).toFixed(1)}% ของงานที่เสร็จ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานที่ล่าช้า</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{overviewData.delayedJobs}</div>
              <p className="text-xs text-muted-foreground">
                เฉลี่ย {overviewData.averageDelay} นาที
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ประสิทธิภาพรวม</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overviewData.efficiency}%</div>
              <p className="text-xs text-muted-foreground">
                เทียบกับเป้าหมาย 90%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Production Logs</TabsTrigger>
            <TabsTrigger value="analytics">วิเคราะห์รายงาน</TabsTrigger>
            <TabsTrigger value="summary">สรุปรายวัน</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <ProductionLogs />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="summary">
            <DailySummary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
