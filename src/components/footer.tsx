import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="mb-2 text-lg font-bold">
              Tools{' '}
              <span className="text-sm font-normal text-muted-foreground">
                by SoundBlueMusic
              </span>
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              모든 창작자를 위한 무료 오픈소스 도구
              <br />
              Free open-source tools for every creator
            </p>
            <a
              href="https://github.com/soundbluemusic/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              <Github className="h-4 w-4" />
              GitHub에서 보기
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">도구</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tools/metronome" className="hover:text-foreground">
                  메트로놈
                </Link>
              </li>
              <li>
                <Link href="/tools/tuner" className="hover:text-foreground">
                  튜너
                </Link>
              </li>
              <li>
                <Link href="/daw" className="hover:text-foreground">
                  DAW (드럼머신/신스)
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/qr-generator"
                  className="hover:text-foreground"
                >
                  QR 생성기
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">정보</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/soundbluemusic/tools/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  MIT License
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
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Open Source
            </span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
