'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import { useLanguage } from '@/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();

  const toolLinks = [
    { href: '/tools/metronome', label: t.tools.metronome },
    { href: '/tools/tuner', label: t.tools.tuner },
    { href: '/daw', label: t.tools.daw },
    { href: '/tools/qr-generator', label: t.tools.qrGenerator },
  ];

  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="mb-2 text-lg font-bold">
              {t.brand}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                by SoundBlueMusic
              </span>
            </h3>
            <a
              href="https://github.com/soundbluemusic/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              <Github className="h-4 w-4" />
              {t.footer.github}
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">{t.nav.tools}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">
              {language === 'ko' ? '정보' : 'Info'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/soundbluemusic/tools/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {t.footer.license}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>
            © {currentYear}{' '}
            <a
              href="https://soundbluemusic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground"
            >
              SoundBlueMusic
            </a>
          </p>
          <span>{t.footer.license}</span>
        </div>
      </div>
    </footer>
  );
}
