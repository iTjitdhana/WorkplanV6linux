"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Search, Plus, Save, Trash2, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WorkPlan {
  id: number;
  job_code: string;
  job_name: string;
  production_date: string;
  status: string;
}

interface ProductionLog {
  id?: number;
  work_plan_id: number;
  production_date: string;
  job_code: string;
  job_name: string;
  input_material_quantity?: number;
  input_material_unit?: string;
  output_quantity?: number;
  output_unit?: string;
  notes?: string;
}

interface PreviousMaterialData {
  input_material_quantity: number;
  input_material_unit: string;
  output_unit: string;
}

export default function ProductionLogsPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterJob, setFilterJob] = useState('');
  const { toast } = useToast();
  const cacheRef = useRef(new Map<string, any[]>());

  // Local fields for cost view (in-page only)
  const [unitCostMap, setUnitCostMap] = useState<Record<number, number>>({});
  const [timeUsedMinutesMap, setTimeUsedMinutesMap] = useState<Record<number, number>>({});
  const [operatorsCountMap, setOperatorsCountMap] = useState<Record<number, number>>({});
  const LABOR_RATE_PER_HOUR = 480; // บาท/ชั่วโมง

  // Load work plans for selected date
  const loadWorkPlans = async (date: string) => {
    if (!date) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs-workplans/workplans/${date}`);
      const data = await response.json();
      
      if (data.success) {
        setWorkPlans(data.data);
      }
    } catch (error) {
      console.error('Error loading work plans:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลงานได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load existing logs for selected date
  const loadLogs = async (date: string) => {
    if (!date) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs-workplans/date/${date}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  // Get previous material data for auto-fill
  const getPreviousMaterialData = async (jobCode: string): Promise<PreviousMaterialData | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs-workplans/previous-material/${jobCode}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
    } catch (error) {
      console.error('Error getting previous material data:', error);
    }
    return null;
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadWorkPlans(date);
    loadLogs(date);
  };

  // Initialize log entry for a work plan
  const initializeLogEntry = async (workPlan: WorkPlan) => {
    const existingLog = logs.find(log => log.work_plan_id === workPlan.id);
    
    if (existingLog) {
      return existingLog;
    }

    // Get previous material data for auto-fill
    const previousData = await getPreviousMaterialData(workPlan.job_code);
    
    const newLog: ProductionLog = {
      work_plan_id: workPlan.id,
      production_date: workPlan.production_date,
      job_code: workPlan.job_code,
      job_name: workPlan.job_name,
      input_material_quantity: previousData?.input_material_quantity,
      input_material_unit: previousData?.input_material_unit,
      output_unit: previousData?.output_unit
    };

    setLogs(prev => [...prev, newLog]);
    return newLog;
  };

  // Update log entry
  const updateLogEntry = (workPlanId: number, field: keyof ProductionLog, value: any) => {
    setLogs(prev => prev.map(log => 
      log.work_plan_id === workPlanId 
        ? { ...log, [field]: value }
        : log
    ));
  };

  // Save all logs
  const saveLogs = async () => {
    if (logs.length === 0) {
      toast({
        title: "แจ้งเตือน",
        description: "ไม่มีข้อมูลให้บันทึก",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs-workplans/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: data.message,
        });
        // Reload logs to get updated data
        loadLogs(selectedDate);
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving logs:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete log entry
  const deleteLogEntry = async (logId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs-workplans/${logId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: "ลบข้อมูลสำเร็จ",
        });
        setLogs(prev => prev.filter(log => log.id !== logId));
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive"
      });
    }
  };

  // Filter work plans
  const filteredWorkPlans = workPlans.filter(workPlan => 
    workPlan.job_name.toLowerCase().includes(filterJob.toLowerCase()) ||
    workPlan.job_code.toLowerCase().includes(filterJob.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">บันทึกข้อมูลการผลิตรายวัน</h1>
          <p className="text-gray-600 mt-2">บันทึกข้อมูลการผลิตรายวัน พร้อมฟีเจอร์ Auto-fill ข้อมูลวัตถุดิบ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={saveLogs} disabled={saving || logs.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </div>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            เลือกวันที่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="date">วันที่ผลิต</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="filter">กรองงาน</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="filter"
                  placeholder="ค้นหาชื่องานหรือรหัสงาน..."
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Plans and Logs */}
      {selectedDate && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredWorkPlans.length === 0 ? (
            <Alert>
              <AlertDescription>
                ไม่พบงานในวันที่เลือก หรือไม่มีงานที่ตรงกับเงื่อนไขการค้นหา
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {filteredWorkPlans.map((workPlan) => {
                const log = logs.find(l => l.work_plan_id === workPlan.id);
                
                return (
                  <Card key={workPlan.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{workPlan.job_name}</CardTitle>
                          <p className="text-sm text-gray-600">รหัส: {workPlan.job_code}</p>
                        </div>
                        <Badge variant={workPlan.status === 'completed' ? 'default' : 'secondary'}>
                          {workPlan.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Input Material */}
                        <div className="space-y-2">
                          <Label htmlFor={`input_qty_${workPlan.id}`}>จำนวนวัตถุดิบเข้า</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`input_qty_${workPlan.id}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={log?.input_material_quantity || ''}
                              onChange={(e) => updateLogEntry(workPlan.id, 'input_material_quantity', parseFloat(e.target.value) || null)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="หน่วย"
                              value={log?.input_material_unit || ''}
                              onChange={(e) => updateLogEntry(workPlan.id, 'input_material_unit', e.target.value)}
                              className="w-24"
                            />
                          </div>
                        </div>

                        {/* Output */}
                        <div className="space-y-2">
                          <Label htmlFor={`output_qty_${workPlan.id}`}>จำนวนที่ผลิตได้</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`output_qty_${workPlan.id}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={log?.output_quantity || ''}
                              onChange={(e) => updateLogEntry(workPlan.id, 'output_quantity', parseFloat(e.target.value) || null)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="หน่วย"
                              value={log?.output_unit || ''}
                              onChange={(e) => updateLogEntry(workPlan.id, 'output_unit', e.target.value)}
                              className="w-24"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`notes_${workPlan.id}`}>หมายเหตุ</Label>
                          <Input
                            id={`notes_${workPlan.id}`}
                            placeholder="บันทึกหมายเหตุเพิ่มเติม..."
                            value={log?.notes || ''}
                            onChange={(e) => updateLogEntry(workPlan.id, 'notes', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                        {log?.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteLogEntry(log.id!)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบ
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => initializeLogEntry(workPlan)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มข้อมูล
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cost Table View */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ตารางต้นทุนการผลิต (มุมมองตาราง)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2} className="min-w-[220px] bg-gray-50">รายการสินค้า</TableHead>
                    <TableHead rowSpan={2} className="min-w-[120px] bg-gray-50">รหัสงาน</TableHead>
                    <TableHead colSpan={2} className="text-center bg-rose-50 text-rose-800">ต้นทุนวัตถุดิบตั้งต้น (บาท)</TableHead>
                    <TableHead colSpan={2} className="text-center bg-emerald-50 text-emerald-800">ต้นทุนที่ผลิตได้ (บาท)</TableHead>
                    <TableHead colSpan={4} className="text-center bg-amber-50 text-amber-800">ผลการผลิต</TableHead>
                    <TableHead colSpan={2} className="text-center bg-sky-50 text-sky-800">ต้นทุนแรงงาน</TableHead>
                    <TableHead colSpan={2} className="text-center bg-indigo-50 text-indigo-800">ค่าใช้จ่ายเพิ่ม</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="bg-rose-50">จำนวนรวม</TableHead>
                    <TableHead className="bg-rose-50">หน่วย</TableHead>
                    <TableHead className="bg-emerald-50">มูลค่าต่อหน่วย</TableHead>
                    <TableHead className="bg-emerald-50">หน่วย</TableHead>
                    <TableHead className="bg-amber-50">จำนวนผลิตได้</TableHead>
                    <TableHead className="bg-amber-50">%</TableHead>
                    <TableHead className="bg-amber-50">เวลาที่ใช้ (นาที)</TableHead>
                    <TableHead className="bg-amber-50">จำนวนผู้ปฏิบัติงาน</TableHead>
                    <TableHead className="bg-sky-50">ค่าจ้าง/ชั่วโมง</TableHead>
                    <TableHead className="bg-sky-50">ต้นทุนรวมค่าแรง</TableHead>
                    <TableHead className="bg-indigo-50">ค่าสูญหาย 10%</TableHead>
                    <TableHead className="bg-indigo-50">ค่าน้ำ/ไฟ/แก๊ส 1%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkPlans.map((workPlan, idx) => {
                    const log = logs.find(l => l.work_plan_id === workPlan.id);
                    const inputQty = Number(log?.input_material_quantity || 0);
                    const outputQty = Number(log?.output_quantity || 0);
                    const unitCost = unitCostMap[workPlan.id] || 0;
                    const minutes = timeUsedMinutesMap[workPlan.id] || 0;
                    const operators = operatorsCountMap[workPlan.id] || 0;
                    const yieldPercent = inputQty > 0 ? (outputQty / inputQty) * 100 : 0;
                    const laborTotal = (minutes / 60) * operators * LABOR_RATE_PER_HOUR;
                    const loss10 = outputQty * unitCost * 0.10;
                    const util1 = outputQty * unitCost * 0.01;
                    return (
                      <TableRow key={workPlan.id}>
                        <TableCell className="font-medium">{workPlan.job_name}</TableCell>
                        <TableCell className="text-xs text-gray-600">{workPlan.job_code}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={inputQty || ''}
                            onChange={(e) => updateLogEntry(workPlan.id, 'input_material_quantity', parseFloat(e.target.value) || null)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={log?.input_material_unit || ''}
                            onChange={(e) => updateLogEntry(workPlan.id, 'input_material_unit', e.target.value)}
                            placeholder="หน่วย"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={unitCostMap[workPlan.id] ?? ''}
                            onChange={(e) => setUnitCostMap(prev => ({ ...prev, [workPlan.id]: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={log?.output_unit || ''}
                            onChange={(e) => updateLogEntry(workPlan.id, 'output_unit', e.target.value)}
                            placeholder="หน่วย"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={outputQty || ''}
                            onChange={(e) => updateLogEntry(workPlan.id, 'output_quantity', parseFloat(e.target.value) || null)}
                          />
                        </TableCell>
                        <TableCell>{yieldPercent.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step={1}
                            value={timeUsedMinutesMap[workPlan.id] ?? ''}
                            onChange={(e) => setTimeUsedMinutesMap(prev => ({ ...prev, [workPlan.id]: parseInt(e.target.value || '0', 10) }))}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step={1}
                            value={operatorsCountMap[workPlan.id] ?? ''}
                            onChange={(e) => setOperatorsCountMap(prev => ({ ...prev, [workPlan.id]: parseInt(e.target.value || '0', 10) }))}
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="text-right">{LABOR_RATE_PER_HOUR.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{laborTotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{loss10.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{util1.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="text-xs text-gray-500 mt-2">หมายเหตุ: มุมมองนี้เป็นการคำนวณชั่วคราวสำหรับการวิเคราะห์ต้นทุน (ไม่ได้บันทึกลงฐานข้อมูล)</div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!selectedDate && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">เลือกวันที่เพื่อเริ่มบันทึกข้อมูล</h3>
              <p className="text-gray-600">
                เลือกวันที่ที่ต้องการบันทึกข้อมูลการผลิตรายวัน<br />
                ระบบจะแสดงงานทั้งหมดในวันที่เลือก พร้อมฟีเจอร์ Auto-fill ข้อมูลวัตถุดิบจากงานที่เคยบันทึกไว้
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
