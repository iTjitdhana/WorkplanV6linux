'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load heavy pages
const TrackerPage = dynamic(() => import('../../tracker/page'));

export default function RoleMenuRedirectPage() {
  const router = useRouter();
  const params = useParams<{ role: string; menu: string }>();

  const role = (params?.role || '').toString();
  const menu = (params?.menu || '').toString().toLowerCase();

  if (menu === 'home') {
    // keep role-prefix home
    useEffect(() => {
      router.replace(`/${role}/home`);
    }, [role, router]);
    return null;
  }

  if (menu === 'tracker' || menu === 'production') {
    // Render tracker directly under role-prefixed URL
    return <TrackerPage />;
  }

  // For global pages, redirect to their canonical paths
  useEffect(() => {
    const mapping: Record<string, string> = {
      logs: '/logs',
      reports: '/reports',
      users: '/users',
      settings: '/settings',
      status: '/monitoring',
    };
    const target = mapping[menu] || `/${role}/home`;
    router.replace(target);
  }, [menu, role, router]);

  return null;
}
