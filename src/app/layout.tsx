import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/i18n';
import { NavigationLayout } from '@/components/navigation';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tools - Free Creative Tools',
    template: '%s | Tools',
  },
  description:
    'Free web-based tools for everyone. Metronome, tuner, drum machine, QR generator, and more.',
  keywords: [
    'Tools',
    'Metronome',
    'Tuner',
    'Drum Machine',
    'QR Generator',
    'Web Audio',
    'Music Tools',
    'Creative Tools',
  ],
  authors: [{ name: 'SoundBlueMusic' }],
  creator: 'SoundBlueMusic',
  metadataBase: new URL('https://tools.soundbluemusic.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tools',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    siteName: 'Tools',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <NavigationLayout>{children}</NavigationLayout>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
