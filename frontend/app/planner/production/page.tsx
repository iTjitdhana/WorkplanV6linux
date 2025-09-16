'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlannerProductionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/planner/home');
  }, [router]);
  return null;
}









