'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'admin') router.replace('/admin');
    else if (user.role === 'employee') router.replace('/employee');
    else router.replace('/login');
  }, [user, loading, router]);

  return <LoadingSpinner fullPage />;
}
