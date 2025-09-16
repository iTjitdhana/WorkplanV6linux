'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number>(2); // Default to Admin
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 1, name: 'Planner', color: 'bg-blue-500' },
    { id: 2, name: 'Admin', color: 'bg-red-500' },
    { id: 4, name: 'Viewer', color: 'bg-gray-500' },
    { id: 5, name: 'Operation', color: 'bg-green-500' }
  ];

  const handleLogin = async () => {
    setLoading(true);

    setTimeout(() => {
      // Save to cookie for middleware; 1 day
      document.cookie = `userRole=${selectedRole}; path=/; max-age=${60 * 60 * 24}`;
      // Optional: keep localStorage for debugging
      localStorage.setItem('userRole', selectedRole.toString());

      router.push('/');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <p className="text-gray-600">เลือกบทบาทเพื่อเข้าสู่ระบบ</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>เลือกบทบาท</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                    <span className="font-medium">{role.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input id="username" placeholder="กรอกชื่อผู้ใช้" defaultValue="demo" />
            </div>
            <div>
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" placeholder="กรอกรหัสผ่าน" defaultValue="123456" />
            </div>
          </div>

          <Button onClick={handleLogin} className="w-full" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>บทบาทที่เลือก: <strong>{roles.find(r => r.id === selectedRole)?.name}</strong></p>
            <p className="mt-2">ระบบจะ redirect ไปยัง: <code>/[role]/home</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
