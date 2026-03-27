'use client';

import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { createClient } from '@/lib/supabase/client';
import { useVaultStore } from '@/store/vault-store';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { vaults, fetchVaults } = useVaultStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AppLayout] Session:', !!session?.user);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchVaults();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AppLayout] Auth change:', !!session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchVaults();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchVaults]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
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
