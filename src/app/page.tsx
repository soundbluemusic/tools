'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/i18n';

// Tool data
const musicToolIds = [
  'metronome',
  'tuner',
  'daw',
  'pianoRoll',
  'sheetEditor',
  'rhythm',
] as const;
const utilityToolIds = ['qrGenerator', 'worldClock'] as const;

const toolData: Record<
  string,
  { href: string; icon: string; descKo: string; descEn: string }
> = {
  metronome: {
    href: '/tools/metronome',
    icon: '⏱️',
    descKo: '정확한 템포 연습',
    descEn: 'Practice with precision',
  },
  tuner: {
    href: '/tools/tuner',
    icon: '🎸',
    descKo: '악기 튜닝',
    descEn: 'Tune your instrument',
  },
  daw: {
    href: '/daw',
    icon: '🥁',
    descKo: '비트 메이킹',
    descEn: 'Make beats',
  },
  pianoRoll: {
    href: '/tools/piano-roll',
    icon: '🎹',
    descKo: 'MIDI 노트 편집',
    descEn: 'Edit MIDI notes',
  },
  sheetEditor: {
    href: '/tools/sheet-editor',
    icon: '🎼',
    descKo: '악보 작성',
    descEn: 'Write sheet music',
  },
  rhythm: {
    href: '/rhythm',
    icon: '🎮',
    descKo: '리듬 게임',
    descEn: 'Rhythm game',
  },
  qrGenerator: {
    href: '/tools/qr-generator',
    icon: '📱',
    descKo: 'QR 코드 생성',
    descEn: 'Generate QR codes',
  },
  worldClock: {
    href: '/tools/world-clock',
    icon: '🌍',
    descKo: '시간대 비교',
    descEn: 'Compare timezones',
  },
};

function ToolCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center rounded-xl border bg-card p-5 text-center transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="mb-2 text-3xl">{icon}</div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Music Tools */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">🎵 {t.nav.musicTools}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {musicToolIds.map((id) => {
              const data = toolData[id];
              return (
                <ToolCard
                  key={id}
                  href={data.href}
                  title={t.tools[id]}
                  description={language === 'ko' ? data.descKo : data.descEn}
                  icon={data.icon}
                />
              );
            })}
          </div>
        </section>

        {/* Utility Tools */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">
            🛠️ {t.nav.utilityTools}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {utilityToolIds.map((id) => {
              const data = toolData[id];
              return (
                <ToolCard
                  key={id}
                  href={data.href}
                  title={t.tools[id]}
                  description={language === 'ko' ? data.descKo : data.descEn}
                  icon={data.icon}
                />
              );
            })}
          </div>
        </section>

        {/* Workspace Link */}
        <section className="rounded-xl border bg-card p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">🧰 {t.nav.workspace}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {language === 'ko'
              ? '여러 도구를 한 화면에서 사용하세요'
              : 'Use multiple tools in one workspace'}
          </p>
          <Link href="/tools">
            <Button>
              {language === 'ko' ? '작업 공간 열기' : 'Open Workspace'}
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
