'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Search, RefreshCw, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProductionTime {
  workPlanId: number;
  processNumber: number;
  jobCode: string;
  jobName: string;
  productionDate: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  durationMinutes: number;
  durationHours: number;
  durationFormatted: string;
}

interface LogEntry {
  id: number;
  work_plan_id: number;
  process_number: number;
  status: string;
  timestamp: string;
  job_code: string;
  job_name: string;
  production_date: string;
  start_time: string;
  end_time: string;
}

export default function ProductionTimesPage() {
  const [productionTimes, setProductionTimes] = useState<ProductionTime[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'workPlanId' | 'productionDate' | 'jobCode'>('productionDate');
  const [searchValue, setSearchValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showLogs, setShowLogs] = useState(false);

  const fetchProductionTimes = async () => {
    setLoading(true);
    try {
      let url = '/api/logs/production-times?';
      
      if (searchType === 'workPlanId' && searchValue) {
        url += `workPlanId=${searchValue}`;
      } else if (searchType === 'productionDate' && selectedDate) {
        url += `productionDate=${format(selectedDate, 'yyyy-MM-dd')}`;
      } else if (searchType === 'jobCode' && searchValue) {
        url += `jobCode=${searchValue}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProductionTimes(data.data.productionTimes);
        setLogs(data.data.logs);
      }
    } catch (error) {
      console.error('Error fetching production times:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchType === 'productionDate' && selectedDate) {
      fetchProductionTimes();
    }
  }, [selectedDate, searchType]);

  const handleSearch = () => {
    if (searchType === 'productionDate' && selectedDate) {
      fetchProductionTimes();
    } else if (searchValue) {
      fetchProductionTimes();
    }
  };

  const getDurationColor = (minutes: number) => {
    if (minutes <= 30) return 'bg-green-100 text-green-800';
    if (minutes <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'dd/MM/yyyy HH:mm:ss', { locale: th });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">เวลาการผลิต</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/production-times/stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              สถิติ
            </Link>
          </Button>
          <Button onClick={fetchProductionTimes} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาข้อมูล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>ประเภทการค้นหา</Label>
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productionDate">วันที่ผลิต</SelectItem>
                  <SelectItem value="workPlanId">Work Plan ID</SelectItem>
                  <SelectItem value="jobCode">Job Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchType === 'productionDate' ? (
              <div className="flex-1 min-w-[200px]">
                <Label>วันที่ผลิต</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      locale={th}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="flex-1 min-w-[200px]">
                <Label>{searchType === 'workPlanId' ? 'Work Plan ID' : 'Job Code'}</Label>
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'workPlanId' ? 'ใส่ Work Plan ID' : 'ใส่ Job Code'}
                />
              </div>
            )}

            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              ค้นหา
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Production Times Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            สรุปเวลาการผลิต
            <Badge variant="secondary">{productionTimes.length} รายการ</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : productionTimes.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่ผลิต</TableHead>
                    <TableHead>Job Code</TableHead>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>เวลาเริ่ม</TableHead>
                    <TableHead>เวลาสิ้นสุด</TableHead>
                    <TableHead>ระยะเวลา</TableHead>
                    <TableHead>Work Plan ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionTimes.map((time, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(time.productionDate), 'dd/MM/yyyy', { locale: th })}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{time.jobCode}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={time.jobName}>
                        {time.jobName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Process {time.processNumber}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(time.startTime)}</TableCell>
                      <TableCell>{formatDateTime(time.endTime)}</TableCell>
                      <TableCell>
                        <Badge className={getDurationColor(time.durationMinutes)}>
                          {time.durationFormatted}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{time.workPlanId}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Toggle Logs View */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowLogs(!showLogs)}
                  className="mt-4"
                >
                  {showLogs ? 'ซ่อน' : 'แสดง'} Raw Logs
                </Button>
              </div>

              {/* Raw Logs View */}
              {showLogs && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Raw Logs Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Work Plan ID</TableHead>
                          <TableHead>Process</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Job Code</TableHead>
                          <TableHead>Job Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.id}</TableCell>
                            <TableCell>{log.work_plan_id}</TableCell>
                            <TableCell>{log.process_number}</TableCell>
                            <TableCell>
                              <Badge variant={log.status === 'start' ? 'default' : 'destructive'}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                            <TableCell>{log.job_code}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={log.job_name}>
                              {log.job_name}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูลเวลาการผลิต
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
