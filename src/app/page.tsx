import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Tool definitions matching README structure
const tools = [
  {
    id: 'metronome',
    href: '/tools/metronome',
    title: 'Metronome',
    titleKo: '메트로놈',
    description: 'Precision metronome for musicians',
    descriptionKo: '뮤지션을 위한 정밀 메트로놈',
    icon: '⏱️',
  },
  {
    id: 'piano-roll',
    href: '/tools/piano-roll',
    title: 'Piano Roll',
    titleKo: '피아노 롤',
    description: 'Visual MIDI note editor',
    descriptionKo: 'MIDI 노트 시각 편집기',
    icon: '🎹',
  },
  {
    id: 'sheet-editor',
    href: '/tools/sheet-editor',
    title: 'Sheet Editor',
    titleKo: '악보 편집기',
    description: 'Create and edit sheet music',
    descriptionKo: '악보 작성 및 편집',
    icon: '🎼',
  },
  {
    id: 'tuner',
    href: '/tools/tuner',
    title: 'Tuner',
    titleKo: '튜너',
    description: 'Chromatic tuner for instruments',
    descriptionKo: '악기 튜닝용 크로매틱 튜너',
    icon: '🎸',
  },
  {
    id: 'qr-generator',
    href: '/tools/qr-generator',
    title: 'QR Generator',
    titleKo: 'QR 생성기',
    description: 'Generate QR codes from text or URLs',
    descriptionKo: '텍스트/URL을 QR 코드로 변환',
    icon: '📱',
  },
  {
    id: 'world-clock',
    href: '/tools/world-clock',
    title: 'World Clock',
    titleKo: '세계 시계',
    description: 'View multiple time zones',
    descriptionKo: '여러 시간대를 한눈에',
    icon: '🌍',
  },
] as const;

// Additional pages
const additionalLinks = [
  { href: '/daw', title: 'DAW', titleKo: '통합 DAW', icon: '🎛️' },
  { href: '/tools', title: 'Workspace', titleKo: '작업 공간', icon: '🧰' },
];

function ToolCard({
  href,
  titleKo,
  descriptionKo,
  icon,
}: {
  href: string;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h2 className="mb-1 text-lg font-semibold">{titleKo}</h2>
      <p className="text-sm text-muted-foreground">{descriptionKo}</p>
      <div className="mt-4 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="sm">
          열기 →
        </Button>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tools
          </span>
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-muted-foreground">
          모든 창작자를 위한 프로급 웹 도구
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Next.js', 'Pixi.js', 'Rust/WASM', 'AudioWorklet'].map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </header>

      {/* Tool Grid */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>

        {/* Additional Links */}
        <div className="mt-8 flex justify-center gap-4">
          {additionalLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="outline" className="gap-2">
                <span>{link.icon}</span>
                {link.titleKo}
              </Button>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          Built with 🎵 by{' '}
          <a
            href="https://soundbluemusic.com"
            className="underline hover:text-foreground"
          >
            Sound Blue Music
          </a>
        </p>
      </footer>
    </div>
  );
}
