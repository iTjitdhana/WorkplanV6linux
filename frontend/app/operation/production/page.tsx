'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperationProductionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/operation/home');
  }, [router]);
  return null;
}









