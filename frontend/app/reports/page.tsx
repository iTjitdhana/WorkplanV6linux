'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, BarChart3, TrendingUp, Clock, Users, Target, Award, AlertTriangle, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface JobStats {
  job_code: string;
  job_name: string;
  frequency: number;
  avg_planned_duration: number;
  avg_actual_duration: number;
  avg_time_variance: number;
  accuracy_rate: number;
  accuracy_level: string;
  recommended_time: number;
  best_time: number | null;
  worst_time: number | null;
  best_time_operators: string;
  total_completed: number;
  total_planned: number;
}

interface ReportData {
  summary: {
    total_jobs: number;
    completed_jobs: number;
    in_progress_jobs: number;
    not_started_jobs: number;
    completion_rate: number;
    avg_planned_duration_minutes: number;
    avg_actual_duration_minutes: number;
    avg_time_variance_minutes: number;
    jobs_with_time_data: number;
  };
  jobs: any[];
  time_variance_jobs: any[];
  job_statistics?: JobStats[];
}

interface JobDetail {
  work_plan_id: number;
  job_code: string;
  job_name: string;
  production_date: string;
  planned_start: string;
  planned_end: string;
  actual_start_time: string;
  actual_end_time: string;
  planned_duration_minutes: number;
  actual_duration_minutes: number;
  time_variance_minutes: number;
  time_variance_percentage: number;
  production_status: string;
  actual_operators: string;
  production_room_name: string;
  notes: string;
  has_logs: boolean;
  has_completed_sessions: boolean;
  completed_sessions: number;
  has_incomplete_session: boolean;
  total_logs: number;
  start_logs: number;
  stop_logs: number;
}

export default function ReportsPage() {
  // ตั้งค่าวันที่เริ่มต้นเป็นวันที่ 1 ของเดือนปัจจุบัน
  const getFirstDayOfCurrentMonth = () => {
    const now = new Date();
    return startOfMonth(now);
  };

  const [startDate, setStartDate] = useState<Date | undefined>(getFirstDayOfCurrentMonth());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [sortBy, setSortBy] = useState<'frequency' | 'accuracy'>('frequency');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccuracy, setFilterAccuracy] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [jobDetails, setJobDetails] = useState<Map<string, JobDetail[]>>(new Map());

  // เรียกข้อมูลรายงานอัตโนมัติเมื่อเข้าหน้า
  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = '/api/reports/production-analysis?limit=10000';
      
      if (startDate && endDate) {
        const startDateStr = format(startDate, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');
        url += `&start_date=${startDateStr}&end_date=${endDateStr}`;
        // console.log('Generating report for date range:', { startDateStr, endDateStr });
      } else {
        // console.log('Generating report for all data (no date filter)');
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
        // console.log('Report generated successfully');
        // console.log('Total jobs found:', data.data.job_statistics?.length || 0);
        // console.log('Summary:', data.data.summary);
        
        if (data.data.job_statistics && data.data.job_statistics.length > 0) {
          // console.log('Sample job statistics:', data.data.job_statistics.slice(0, 3));
        }
      } else {
        console.error('Failed to generate report:', data.message);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedJobStats = () => {
    if (!reportData?.job_statistics) return [];
    
    let filteredStats = [...reportData.job_statistics];
    
    if (searchTerm) {
      filteredStats = filteredStats.filter(job => 
        job.job_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterAccuracy !== 'all') {
      filteredStats = filteredStats.filter(job => {
        switch (filterAccuracy) {
          case 'high':
            return job.accuracy_rate >= 80;
          case 'medium':
            return job.accuracy_rate >= 60 && job.accuracy_rate < 80;
          case 'low':
            return job.accuracy_rate < 60;
          default:
            return true;
        }
      });
    }
    
    return filteredStats.sort((a, b) => {
      if (sortBy === 'frequency') {
        return b.frequency - a.frequency;
      } else {
        return b.accuracy_rate - a.accuracy_rate;
      }
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 30) return 'text-green-600';
    if (Math.abs(variance) <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracyLevel: string, accuracyRate: number) => {
    switch (accuracyLevel) {
      case 'ดี':
        return <Badge className="bg-green-100 text-green-800">ความแม่นยำดี ({accuracyRate}%)</Badge>;
      case 'กลาง':
        return <Badge className="bg-yellow-100 text-yellow-800">ความแม่นยำกลาง ({accuracyRate}%)</Badge>;
      case 'ต่ำ':
        return <Badge className="bg-red-100 text-red-800">ความแม่นยำต่ำ ({accuracyRate}%)</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">ไม่ระบุ</Badge>;
    }
  };

  const getFrequencyBadge = (frequency: number) => {
    if (frequency >= 10) return <Badge className="bg-blue-100 text-blue-800">สูงมาก</Badge>;
    if (frequency >= 5) return <Badge className="bg-green-100 text-green-800">สูง</Badge>;
    if (frequency >= 2) return <Badge className="bg-yellow-100 text-yellow-800">ปานกลาง</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">ต่ำ</Badge>;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} นาที`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ชั่วโมง`;
    }
    return `${hours} ชม. ${mins} นาที`;
  };

  const formatOperators = (operators: string) => {
    if (!operators || operators === 'ไม่ระบุ') return 'ไม่ระบุ';
    
    try {
      // ถ้าเป็น JSON string
      if (operators.startsWith('[') || operators.startsWith('{')) {
        const parsed = JSON.parse(operators);
        if (Array.isArray(parsed)) {
          return parsed.map(op => {
            if (typeof op === 'object' && op.name) {
              return op.name;
            } else if (typeof op === 'string') {
              return op;
            }
            return null;
          }).filter(name => name).join(', ');
        } else if (typeof parsed === 'object' && parsed.name) {
          return parsed.name;
        }
      }
      
      // ถ้าเป็น string ที่มี comma
      if (operators.includes(',')) {
        return operators.split(',').map(op => op.trim()).join(', ');
      }
      
      // ถ้าเป็น string เดียว
      return operators;
    } catch (error) {
      // ถ้า parse ไม่ได้ ให้แสดงเป็น string เดิม
      return operators;
    }
  };

  const getOperatorCount = (operators: string) => {
    if (!operators || operators === 'ไม่ระบุ') return 0;
    
    try {
      // ถ้าเป็น JSON string
      if (operators.startsWith('[') || operators.startsWith('{')) {
        const parsed = JSON.parse(operators);
        if (Array.isArray(parsed)) {
          return parsed.filter(op => {
            if (typeof op === 'object' && op.name) return true;
            if (typeof op === 'string' && op.trim()) return true;
            return false;
          }).length;
        } else if (typeof parsed === 'object' && parsed.name) {
          return 1;
        }
      }
      
      // ถ้าเป็น string ที่มี comma
      if (operators.includes(',')) {
        return operators.split(',').filter(op => op.trim()).length;
      }
      
      // ถ้าเป็น string เดียว
      return operators.trim() ? 1 : 0;
    } catch (error) {
      // ถ้า parse ไม่ได้ ให้นับจาก comma
      return operators.split(',').filter(op => op.trim()).length;
    }
  };

  const toggleJobExpansion = async (jobCode: string) => {
    const newExpandedJobs = new Set(expandedJobs);
    
    if (newExpandedJobs.has(jobCode)) {
      newExpandedJobs.delete(jobCode);
      setExpandedJobs(newExpandedJobs);
    } else {
      newExpandedJobs.add(jobCode);
      setExpandedJobs(newExpandedJobs);
      
      try {
        const response = await fetch(`/api/reports/production-analysis?job_code=${jobCode}&limit=10000`);
        const data = await response.json();
        
        if (data.success && data.data.jobs && data.data.jobs.length > 0) {
          const newJobDetails = new Map(jobDetails);
          newJobDetails.set(jobCode, data.data.jobs);
          setJobDetails(newJobDetails);
        } else {
          console.error('ไม่พบข้อมูลรายละเอียดของงาน');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">รายงานและสถิติ</h1>
        <p className="text-muted-foreground text-lg">
          ดูรายงานและสถิติการผลิตแบบครบวงจร
        </p>
        {startDate && endDate && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📅 แสดงข้อมูลตั้งแต่วันที่ {format(startDate, 'd MMMM yyyy', { locale: th })} 
              ถึงวันที่ {format(endDate, 'd MMMM yyyy', { locale: th })}
            </p>
          </div>
        )}
      </div>

      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ตั้งค่ารายงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>ประเภทรายงาน</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">รายงานรายวัน</SelectItem>
                  <SelectItem value="weekly">รายงานรายสัปดาห์</SelectItem>
                  <SelectItem value="monthly">รายงานรายเดือน</SelectItem>
                  <SelectItem value="all">รายงานทั้งหมด</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>วันที่เริ่มต้น (ไม่บังคับ)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>วันที่สิ้นสุด (ไม่บังคับ)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={generateReport} disabled={loading} className="flex-1">
                {loading ? 'กำลังสร้างรายงาน...' : 'สร้างรายงาน (ทั้งหมด)'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStartDate(getFirstDayOfCurrentMonth());
                  setEndDate(new Date());
                  generateReport();
                }}
                disabled={loading}
              >
                รีเซ็ตเป็นเดือนปัจจุบัน
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            💡 เคล็ดลับ: ระบบจะแสดงข้อมูลตั้งแต่วันที่ 1 ของเดือนปัจจุบันจนถึงวันปัจจุบันโดยอัตโนมัติ
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.total_jobs}</div>
                <p className="text-xs text-muted-foreground">
                  งานในระบบทั้งหมด
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">งานเสร็จสิ้น</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{reportData.summary.completed_jobs}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.summary.completion_rate}% ของงานทั้งหมด
                </p>
                <Progress value={reportData.summary.completion_rate} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">เวลาเฉลี่ย</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(reportData.summary.avg_actual_duration_minutes)}</div>
                <p className="text-xs text-muted-foreground">
                  ต่องาน
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ความแม่นยำ</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.abs(reportData.summary.avg_time_variance_minutes)} นาที
                </div>
                <p className="text-xs text-muted-foreground">
                  ความคลาดเคลื่อนเฉลี่ย
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          {reportData.job_statistics && reportData.job_statistics.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>สถิติงานตามประเภท</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      พบงานทั้งหมด {reportData.job_statistics.length} ประเภท
                      {searchTerm || filterAccuracy !== 'all' ? (
                        <span className="ml-2">
                          (แสดง {getSortedJobStats().length} รายการที่กรองแล้ว)
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาชื่องานหรือรหัสงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={filterAccuracy} onValueChange={(value: any) => setFilterAccuracy(value)}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="high">แม่นยำสูง (≥80%)</SelectItem>
                        <SelectItem value="medium">แม่นยำปานกลาง (60-79%)</SelectItem>
                        <SelectItem value="low">แม่นยำต่ำ (&lt;60%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={sortBy === 'frequency' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('frequency')}
                    >
                      เรียงตามความถี่
                    </Button>
                    <Button
                      variant={sortBy === 'accuracy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('accuracy')}
                    >
                      เรียงตามความแม่นยำ
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getSortedJobStats().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ลำดับ</TableHead>
                        <TableHead>ชื่องาน</TableHead>
                        <TableHead>รหัสงาน</TableHead>
                        <TableHead>ความถี่</TableHead>
                        <TableHead>เวลาที่แนะนำ</TableHead>
                        <TableHead>เวลาที่ดีที่สุด</TableHead>
                        <TableHead>ผู้ปฏิบัติงาน (เวลาดีที่สุด)</TableHead>
                        <TableHead>ความแม่นยำ</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>รายละเอียด</TableHead>
                        <TableHead>การดำเนินการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedJobStats().map((job, index) => (
                        <React.Fragment key={job.job_code}>
                          <TableRow>
                            <TableCell>
                              <div className="flex items-center">
                                {index < 3 && (
                                  <Award className="h-4 w-4 text-yellow-500 mr-2" />
                                )}
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-bold text-lg text-gray-900">{job.job_name}</div>
                                <div className="text-xs text-muted-foreground">รหัส: {job.job_code}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {job.job_code}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getFrequencyBadge(job.frequency)}
                                <span className="text-sm">{job.frequency} ครั้ง</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-blue-600">{formatDuration(job.recommended_time)}</div>
                                <div className="text-xs text-muted-foreground">
                                  เฉลี่ย: {formatDuration(job.avg_actual_duration)}
                                </div>
                                <div className="text-xs text-green-600">
                                  ★ แม่นยำที่สุด
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {job.best_time ? (
                                  <>
                                    <div className="font-medium text-green-600">{formatDuration(job.best_time)}</div>
                                    {job.worst_time && (
                                      <div className="text-xs text-muted-foreground">
                                        ช้าสุด: {formatDuration(job.worst_time)}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">ไม่มีข้อมูล</span>
                                )}
                              </div>
                            </TableCell>
                                                         <TableCell>
                               <div className="max-w-32">
                                 <div className="text-sm font-medium truncate" title={formatOperators(job.best_time_operators)}>
                                   {formatOperators(job.best_time_operators)}
                                 </div>
                                 {job.best_time_operators && job.best_time_operators !== 'ไม่ระบุ' && (
                                   <div className="text-xs text-muted-foreground">
                                     จำนวน: {getOperatorCount(job.best_time_operators)} คน
                                   </div>
                                 )}
                                 {job.best_time && (
                                   <div className="text-xs text-muted-foreground">
                                     เวลา: {formatDuration(job.best_time)}
                                   </div>
                                 )}
                               </div>
                             </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={getAccuracyColor(job.accuracy_rate)}>
                                  {job.accuracy_rate}%
                                </span>
                                <Progress value={job.accuracy_rate} className="w-16 h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              {getAccuracyBadge(job.accuracy_level, job.accuracy_rate)}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                <div>เสร็จ: {job.total_completed}/{job.frequency}</div>
                                <div>มีแผน: {job.total_planned}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleJobExpansion(job.job_code)}
                                className="flex items-center gap-1"
                              >
                                {expandedJobs.has(job.job_code) ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                                {expandedJobs.has(job.job_code) ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Details Row */}
                          {expandedJobs.has(job.job_code) && jobDetails.has(job.job_code) && (
                            <TableRow>
                              <TableCell colSpan={11} className="p-0">
                                <div className="bg-gray-50 p-4">
                                  <h4 className="font-medium mb-3 text-gray-900">รายละเอียดแต่ละครั้งของงาน: {job.job_name}</h4>
                                  <div className="space-y-3">
                                    {jobDetails.get(job.job_code)?.map((detail, index) => (
                                      <div key={detail.work_plan_id} className="border rounded-lg p-3 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                          <div>
                                            <span className="font-medium text-gray-700">วันที่:</span>
                                            <p className="text-gray-600">
                                              {format(new Date(detail.production_date), 'd MMMM yyyy', { locale: th })}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">เวลาตามแผน:</span>
                                            <p className="text-gray-600">
                                              {detail.planned_start && detail.planned_end 
                                                ? `${detail.planned_start} - ${detail.planned_end}`
                                                : 'ไม่ระบุ'
                                              }
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">เวลาจริง:</span>
                                            <p className="text-gray-600">
                                              {detail.actual_start_time && detail.actual_end_time
                                                ? `${format(new Date(detail.actual_start_time), 'HH:mm', { locale: th })} - ${format(new Date(detail.actual_end_time), 'HH:mm', { locale: th })}`
                                                : 'ไม่มีข้อมูล'
                                              }
                                            </p>
                                          </div>
                                                                                     <div>
                                             <span className="font-medium text-gray-700">ผู้ปฏิบัติงาน:</span>
                                             <p className="text-gray-600">{formatOperators(detail.actual_operators)}</p>
                                             {detail.actual_operators && detail.actual_operators !== 'ไม่ระบุ' && (
                                               <p className="text-xs text-gray-500">
                                                 จำนวน: {getOperatorCount(detail.actual_operators)} คน
                                               </p>
                                             )}
                                           </div>
                                        </div>
                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                          <div>
                                            <span className="font-medium text-gray-700">สถานะ:</span>
                                            <Badge variant={detail.production_status === 'เสร็จสิ้น' ? 'default' : 'secondary'} className="ml-1">
                                              {detail.production_status}
                                            </Badge>
                                          </div>
                                                                                     <div>
                                             <span className="font-medium text-gray-700">เวลาจริง:</span>
                                             <span className="text-gray-600">{formatDuration(detail.actual_duration_minutes)}</span>
                                           </div>
                                                                                     <div>
                                             <span className="font-medium text-gray-700">ความคลาดเคลื่อน:</span>
                                             <span className={`${detail.time_variance_minutes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                               {detail.time_variance_minutes > 0 ? '+' : ''}{formatDuration(Math.abs(detail.time_variance_minutes))}
                                             </span>
                                           </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูล</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? `ไม่พบงานที่ตรงกับ "${searchTerm}"` : 'ไม่พบงานที่ตรงกับเงื่อนไขการกรอง'}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterAccuracy('all');
                      }}
                    >
                      ล้างตัวกรอง
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              ส่งออกรายงาน
            </Button>
          </div>
        </div>
      )}

      {/* Placeholder when no report */}
      {!reportData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีรายงาน</h3>
            <p className="text-muted-foreground text-center">
              เลือกช่วงเวลาและประเภทรายงานเพื่อสร้างรายงาน
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 