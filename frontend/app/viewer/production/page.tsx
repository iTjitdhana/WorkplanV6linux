'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ViewerProductionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/viewer/home');
  }, [router]);
  return null;
}









