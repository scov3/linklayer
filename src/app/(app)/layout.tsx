'use client';

import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useVaultStore } from '@/store/vault-store';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const vaults = useVaultStore((state) => state.vaults);
  const fetchVaults = useVaultStore((state) => state.fetchVaults);
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const fetchedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user && fetchedForUserRef.current !== user.id) {
      fetchedForUserRef.current = user.id;
      void fetchVaults();
    }

    if (!user) {
      fetchedForUserRef.current = null;
    }
  }, [fetchVaults, user]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, router, user]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar vaults={vaults} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
