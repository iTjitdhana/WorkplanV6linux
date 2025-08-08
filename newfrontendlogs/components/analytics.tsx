"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react'

export default function Analytics() {
  // Mock data for charts
  const mostFrequentJobs = [
    { productName: "Oyakodon (คัดไก่)", totalCount: 45, perWeek: 11.3 },
    { productName: "ลูกรอก", totalCount: 38, perWeek: 9.5 },
    { productName: "ลาบหมูนึ่ง 6 ชิ้น(40 กรัม: ชิ้น)", totalCount: 32, perWeek: 8.0 },
    { productName: "กุ้งต้มยำ 12-13 ตัว/กก. (Repack)", totalCount: 25, perWeek: 6.3 },
    { productName: "ชุดกระดูกซุป (Repack)", totalCount: 20, perWeek: 5.0 },
  ]

  const leastFrequentJobs = [
    { productName: "ข้าวผัดพิเศษ", frequency: 3, percentage: 1.9, lastProduced: "5 วันที่แล้ว" },
    { productName: "ต้มยำกุ้งพิเศษ", frequency: 5, percentage: 3.1, lastProduced: "3 วันที่แล้ว" },
    { productName: "สลัดผลไม้", frequency: 7, percentage: 4.4, lastProduced: "2 วันที่แล้ว" },
    { productName: "เมนูทดลอง", frequency: 8, percentage: 5.0, lastProduced: "1 วันที่แล้ว" },
  ]

  const delayReasons = [
    { reason: "เตรียมวัตถุดิบ", count: 8, percentage: 32 },
    { reason: "รอวัตถุดิบ", count: 5, percentage: 20 },
    { reason: "อุปกรณ์ครัวขัดข้อง", count: 4, percentage: 16 },
    { reason: "เปลี่ยนเมนู", count: 3, percentage: 12 },
    { reason: "อื่นๆ", count: 5, percentage: 20 },
  ]

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรองข้อมูล</CardTitle>
          <CardDescription>เลือกช่วงเวลาและเงื่อนไขสำหรับการวิเคราะห์</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select defaultValue="month">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
                <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="เครื่องจักร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกเครื่อง</SelectItem>
                <SelectItem value="Kitchen-01">Kitchen-01</SelectItem>
                <SelectItem value="Kitchen-02">Kitchen-02</SelectItem>
                <SelectItem value="Kitchen-03">Kitchen-03</SelectItem>
                <SelectItem value="Kitchen-04">Kitchen-04</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              กำหนดช่วงเวลา
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานทั้งหมดเดือนนี้</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              +2.3% จากสัปดาห์ที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่ผลิตบ่อยสุด</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5 นาที</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-green-600 mr-1" />
              -3.2 นาที จากสัปดาห์ที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่ผลิตน้อยสุด</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-green-600 mr-1" />
              -0.5% จากสัปดาห์ที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความหลากหลายงาน</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.2%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              +4.1% จากสัปดาห์ที่แล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Efficiency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>งานที่ผลิตบ่อยสุด</CardTitle>
            <CardDescription>ความถี่ในการผลิตแต่ละงาน (เดือนนี้)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostFrequentJobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{job.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.totalCount} ครั้ง • {job.perWeek} ครั้ง/สัปดาห์
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{job.totalCount}</div>
                    <div className="text-xs text-muted-foreground">ครั้ง</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Machine Performance */}
        <Card>
          <CardHeader>
            <CardTitle>งานที่ผลิตไม่ค่อยบ่อย</CardTitle>
            <CardDescription>สถานะและประสิทธิภาพของแต่ละเครื่องจักร</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leastFrequentJobs.map((job, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{job.productName}</h4>
                    <span className="text-sm text-muted-foreground">{job.frequency} ครั้ง</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Percentage:</span>
                      <span className="ml-2 font-medium">{job.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Produced:</span>
                      <span className="ml-2 font-medium">{job.lastProduced}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delay Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>การวิเคราะห์สาเหตุความล่าช้า</CardTitle>
          <CardDescription>สาเหตุหลักที่ทำให้การผลิตล่าช้า</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {delayReasons.map((reason, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{reason.reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{reason.count} ครั้ง</span>
                    <span className="text-sm font-bold">{reason.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${reason.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
