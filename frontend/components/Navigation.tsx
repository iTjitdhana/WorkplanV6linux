'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Settings, BarChart3, Users, Home, Activity, Timer } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation on production planning page (root path) and tracker page
  if (pathname === '/' || pathname === '/tracker') {
    return null;
  }

  const navItems = [
    {
      title: 'หน้าหลัก',
      href: '/dashboard',
      icon: Home
    },
    {
      title: 'แผนการผลิต',
      href: '/',
      icon: Calendar
    },
    {
      title: 'ระบบจัดการ Logs',
      href: '/logs',
      icon: Clock
    },
    {
      title: 'ติดตามการผลิต',
      href: '/tracker',
      icon: BarChart3
    },
    {
      title: 'รายงาน',
      href: '/reports',
      icon: FileText
    },
    {
      title: 'จัดการผู้ใช้',
      href: '/users',
      icon: Users
    },
    {
      title: 'ตั้งค่าระบบ',
      href: '/settings',
      icon: Settings
    },
    {
      title: 'ติดตามสถานะ',
      href: '/monitoring',
      icon: Activity
    },
    {
      title: 'เวลาการผลิต',
      href: '/production-times',
      icon: Timer
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <h1 className="text-xl font-bold text-gray-800">ระบบจัดการการผลิต</h1>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 