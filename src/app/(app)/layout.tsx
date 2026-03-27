'use client';

import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useVaultStore } from '@/store/vault-store';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading: authIsLoading, isInitialized, initialize } = useAuthStore();
  const { vaults, fetchVaults, isLoading: vaultsIsLoading } = useVaultStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (user) {
      fetchVaults();
    }
  }, [user, fetchVaults]);

  if (!mounted || !isInitialized || authIsLoading || vaultsIsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
