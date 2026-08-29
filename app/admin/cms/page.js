"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDashboardCMS() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/dashboard?tab=homepage');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
