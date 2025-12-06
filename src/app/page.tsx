import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';

// Tool categories
const musicTools = [
  {
    id: 'metronome',
    href: '/tools/metronome',
    titleKo: '메트로놈',
    descriptionKo: '정확한 템포 연습',
    icon: '⏱️',
  },
  {
    id: 'tuner',
    href: '/tools/tuner',
    titleKo: '튜너',
    descriptionKo: '악기 튜닝',
    icon: '🎸',
  },
  {
    id: 'daw',
    href: '/daw',
    titleKo: '드럼머신 & 신스',
    descriptionKo: '비트 메이킹',
    icon: '🥁',
  },
  {
    id: 'piano-roll',
    href: '/tools/piano-roll',
    titleKo: '피아노 롤',
    descriptionKo: 'MIDI 노트 편집',
    icon: '🎹',
  },
  {
    id: 'sheet-editor',
    href: '/tools/sheet-editor',
    titleKo: '악보 편집기',
    descriptionKo: '악보 작성',
    icon: '🎼',
  },
];

const utilityTools = [
  {
    id: 'qr-generator',
    href: '/tools/qr-generator',
    titleKo: 'QR 생성기',
    descriptionKo: 'QR 코드 생성',
    icon: '📱',
  },
  {
    id: 'world-clock',
    href: '/tools/world-clock',
    titleKo: '세계 시계',
    descriptionKo: '시간대 비교',
    icon: '🌍',
  },
];

function ToolCard({
  href,
  titleKo,
  descriptionKo,
  icon,
}: {
  href: string;
  titleKo: string;
  descriptionKo: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center rounded-xl border bg-card p-5 text-center transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="mb-2 text-3xl">{icon}</div>
      <h3 className="mb-1 font-semibold">{titleKo}</h3>
      <p className="text-xs text-muted-foreground">{descriptionKo}</p>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <header className="container mx-auto px-4 py-12 text-center md:py-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
          Tools
        </h1>
        <p className="text-sm text-muted-foreground">by SoundBlueMusic</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 pb-12">
        {/* Music Tools */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">🎵 음악 도구</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {musicTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </section>

        {/* Utility Tools */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">🛠️ 유틸리티</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {utilityTools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>
        </section>

        {/* Workspace Link */}
        <section className="rounded-xl border bg-card p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">🧰 작업 공간</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            여러 도구를 한 화면에서 사용하세요
          </p>
          <Link href="/tools">
            <Button>작업 공간 열기</Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
