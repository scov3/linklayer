import { ThemeProvider } from '@/components/theme-provider-wrapper';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { inter, jetbrainsMono } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'LinkLayer',
  description: 'Умный блокнот с системой графов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
