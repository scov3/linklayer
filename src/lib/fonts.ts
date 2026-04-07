import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-mono',
});
