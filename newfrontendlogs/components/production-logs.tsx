"use client"

import { useState } from "react"
import { Search, Filter, Edit, Trash2, Plus, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProductionStep {
  stepNumber: number;
  stepName: string;
  status: "start" | "stop" | "pause";
}

interface ProductionLog {
  id: string
  jobId: string
  productName: string
  startTime: string
  endTime: string
  plannedDuration: number
  actualDuration: number
  status: "completed" | "in-progress" | "delayed" | "failed"
  operator: string
  machine: string
  notes: string
  quantity: number
  defects: number
  currentStep: ProductionStep
}

export default function ProductionLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<ProductionLog | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Mock data
  const logs: ProductionLog[] = [
    {
      id: "1",
      jobId: "JOB-001",
      productName: "Oyakodon (คัดไก่)",
      startTime: "2024-01-08 08:00",
      endTime: "2024-01-08 10:30",
      plannedDuration: 120,
      actualDuration: 150,
      status: "completed",
      operator: "เชฟสมชาย",
      machine: "Kitchen-01",
      notes: "ใช้เวลานานกว่าปกติเนื่องจากต้องเตรียมวัตถุดิบเพิ่มเติม",
      quantity: 50,
      defects: 2,
      currentStep: { stepNumber: 5, stepName: "เสร็จสิ้น", status: "stop" }
    },
    {
      id: "2",
      jobId: "JOB-002",
      productName: "ลูกรอก",
      startTime: "2024-01-08 10:45",
      endTime: "2024-01-08 12:15",
      plannedDuration: 90,
      actualDuration: 90,
      status: "completed",
      operator: "เชฟสมหญิง",
      machine: "Kitchen-02",
      notes: "ทำอาหารได้ตามแผน",
      quantity: 80,
      defects: 0,
      currentStep: { stepNumber: 5, stepName: "เสร็จสิ้น", status: "stop" }
    },
    {
      id: "3",
      jobId: "JOB-003",
      productName: "ลาบหมูนึ่ง 6 ชิ้น(40 กรัม: ชิ้น)",
      startTime: "2024-01-08 13:00",
      endTime: "",
      plannedDuration: 180,
      actualDuration: 0,
      status: "in-progress",
      operator: "เชฟสมศักดิ์",
      machine: "Kitchen-03",
      notes: "กำลังปรุงอาหาร",
      quantity: 30,
      defects: 0,
      currentStep: { stepNumber: 3, stepName: "การปรุงรส", status: "start" }
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "เสร็จแล้ว", variant: "default" as const, className: "bg-green-100 text-green-800" },
      "in-progress": { label: "กำลังทำ", variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      delayed: { label: "ล่าช้า", variant: "destructive" as const, className: "bg-orange-100 text-orange-800" },
      failed: { label: "ล้มเหลว", variant: "destructive" as const, className: "bg-red-100 text-red-800" }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getDelayInfo = (planned: number, actual: number, status: string) => {
    if (status !== "completed") return "-"
    const delay = actual - planned
    if (delay > 0) {
      return <span className="text-red-600">+{delay} นาที</span>
    } else if (delay < 0) {
      return <span className="text-green-600">{delay} นาที</span>
    }
    return <span className="text-green-600">ตรงเวลา</span>
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.operator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (log: ProductionLog) => {
    setSelectedLog(log)
    setIsEditDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Production Logs
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่ม Log
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          จัดการและติดตาม logs การผลิตแบบเรียลไทม์
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาด้วยชื่อสินค้า, Job ID, หรือชื่อพนักงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="กรองตามสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="completed">เสร็จแล้ว</SelectItem>
              <SelectItem value="in-progress">กำลังทำ</SelectItem>
              <SelectItem value="delayed">ล่าช้า</SelectItem>
              <SelectItem value="failed">ล้มเหลว</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สินค้า</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>ขั้นตอนที่</TableHead>
                <TableHead>ขั้นตอนอะไร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>เริ่ม/หยุด</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.productName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>เริ่ม: {log.startTime}</div>
                      {log.endTime && <div>จบ: {log.endTime}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {log.currentStep.stepNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{log.currentStep.stepName}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={log.currentStep.status === "start" ? "default" : "secondary"}
                      className={
                        log.currentStep.status === "start" 
                          ? "bg-green-100 text-green-800" 
                          : log.currentStep.status === "pause"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {log.currentStep.status === "start" ? "เริ่ม" : 
                       log.currentStep.status === "pause" ? "หยุดชั่วคราว" : "หยุด"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(log)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>แก้ไข Production Log</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลการผลิตสำหรับ {selectedLog?.jobId}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="jobId">Job ID</Label>
                    <Input id="jobId" value={selectedLog.jobId} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="productName">ชื่อสินค้า</Label>
                    <Input id="productName" defaultValue={selectedLog.productName} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="operator">พนักงาน</Label>
                    <Input id="operator" defaultValue={selectedLog.operator} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="machine">เครื่องจักร</Label>
                    <Input id="machine" defaultValue={selectedLog.machine} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">จำนวนผลิต</Label>
                    <Input id="quantity" type="number" defaultValue={selectedLog.quantity} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="defects">ของเสีย</Label>
                    <Input id="defects" type="number" defaultValue={selectedLog.defects} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea id="notes" defaultValue={selectedLog.notes} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
