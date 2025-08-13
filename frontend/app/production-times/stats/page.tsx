'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, BarChart3, Clock, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface JobStats {
  jobCode: string;
  jobName: string;
  totalProductions: number;
  totalProcesses: number;
  avgDurationMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  avgDurationFormatted: string;
  minDurationFormatted: string;
  maxDurationFormatted: string;
}

interface ProductionStats {
  totalJobs: number;
  totalProductions: number;
  totalProcesses: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  jobStats: JobStats[];
}

export default function ProductionStatsPage() {
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [jobCode, setJobCode] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      let url = '/api/logs/production-times/stats?';
      
      if (startDate && endDate) {
        url += `startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`;
      }
      
      if (jobCode) {
        url += `&jobCode=${jobCode}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching production stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = () => {
    fetchStats();
  };

  const getDurationColor = (minutes: number) => {
    if (minutes <= 30) return 'bg-green-100 text-green-800';
    if (minutes <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0 นาที';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ชม. ${mins} นาที`;
    } else {
      return `${mins} นาที`;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">สถิติเวลาการผลิต</h1>
        <Button onClick={fetchStats} disabled={loading}>
          <BarChart3 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>วันที่เริ่มต้น</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={th}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label>วันที่สิ้นสุด</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={th}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label>Job Code (ไม่บังคับ)</Label>
              <Input
                value={jobCode}
                onChange={(e) => setJobCode(e.target.value)}
                placeholder="ใส่ Job Code เพื่อกรอง"
              />
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              <BarChart3 className="w-4 h-4 mr-2" />
              ค้นหา
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">ประเภทงาน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การผลิตทั้งหมด</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProductions}</div>
              <p className="text-xs text-muted-foreground">ครั้ง</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กระบวนการทั้งหมด</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProcesses}</div>
              <p className="text-xs text-muted-foreground">ขั้นตอน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เวลาเฉลี่ย</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(Math.round(stats.avgDuration))}</div>
              <p className="text-xs text-muted-foreground">ต่อการผลิต</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Stats Table */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              สถิติรายละเอียดตามงาน
              <Badge variant="secondary">{stats.jobStats.length} รายการ</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : stats.jobStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Code</TableHead>
                    <TableHead>Job Name</TableHead>
                    <TableHead>การผลิต</TableHead>
                    <TableHead>กระบวนการ</TableHead>
                    <TableHead>เวลาเฉลี่ย</TableHead>
                    <TableHead>เวลาต่ำสุด</TableHead>
                    <TableHead>เวลาสูงสุด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.jobStats.map((job, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{job.jobCode}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={job.jobName}>
                        {job.jobName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{job.totalProductions}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.totalProcesses}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDurationColor(job.avgDurationMinutes)}>
                          {job.avgDurationFormatted}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {job.minDurationFormatted}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {job.maxDurationFormatted}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                ไม่พบข้อมูลสถิติ
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Time Range Summary */}
      {stats && startDate && endDate && (
        <Card>
          <CardHeader>
            <CardTitle>สรุปช่วงเวลา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">ช่วงวันที่</p>
                <p className="font-semibold">
                  {format(startDate, 'dd/MM/yyyy', { locale: th })} - {format(endDate, 'dd/MM/yyyy', { locale: th })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">เวลาต่ำสุด</p>
                <p className="font-semibold text-green-600">
                  {formatDuration(stats.minDuration)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">เวลาสูงสุด</p>
                <p className="font-semibold text-red-600">
                  {formatDuration(stats.maxDuration)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
