'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Settings, BarChart3, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const menuItems = [
    {
      title: 'แผนการผลิต',
      description: 'จัดการแผนการผลิตและงานประจำวัน',
      icon: Calendar,
      href: '/',
      color: 'bg-blue-500'
    },
    {
      title: 'ระบบจัดการ Logs',
      description: 'ดูและแก้ไขข้อมูลการทำงาน งานไหนเริ่มกี่โมงเสร็จกี่โมง',
      icon: Clock,
      href: '/logs',
      color: 'bg-green-500'
    },
    {
      title: 'จัดการงานใหม่',
      description: 'จัดการงานที่มี job_code = "NEW" และกำหนด Process Steps',
      icon: AlertCircle,
      href: '/manage-new-jobs',
      color: 'bg-orange-500'
    },
    {
      title: 'ติดตามการผลิต',
      description: 'ติดตามสถานะการผลิตแบบ Real-time',
      icon: BarChart3,
      href: '/tracker',
      color: 'bg-purple-500'
    },
    {
      title: 'รายงาน',
      description: 'ดูรายงานและสถิติการผลิต',
      icon: FileText,
      href: '/reports',
      color: 'bg-indigo-500'
    },
    {
      title: 'จัดการผู้ใช้',
      description: 'จัดการข้อมูลพนักงานและผู้ใช้งาน',
      icon: Users,
      href: '/users',
      color: 'bg-red-500'
    },
    {
      title: 'ตั้งค่าระบบ',
      description: 'ตั้งค่าการทำงานของระบบ',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ระบบจัดการการผลิต</h1>
        <p className="text-muted-foreground text-lg">
          ยินดีต้อนรับสู่ระบบจัดการการผลิตแบบครบวงจร
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link key={index} href={item.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <div className={`p-3 rounded-lg ${item.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <Button variant="outline" className="w-full">
                    เข้าสู่ระบบ
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">150</div>
                <div className="text-sm text-muted-foreground">งานที่กำลังดำเนินการ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1,250</div>
                <div className="text-sm text-muted-foreground">Logs วันนี้</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">25</div>
                <div className="text-sm text-muted-foreground">พนักงานที่ทำงาน</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 