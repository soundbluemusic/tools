import Link from 'next/link';
import { Button } from '@/components/ui/button';

const tools = [
  {
    id: 'tools',
    name: 'Tools Workspace',
    nameKo: '도구 작업 공간',
    description: 'Customizable workspace with modular tools',
    descriptionKo: '모듈식 도구를 조합하는 커스텀 작업 공간',
    href: '/tools',
    icon: '🧰',
    status: 'new' as const,
  },
  {
    id: 'daw',
    name: 'Web DAW',
    nameKo: '웹 DAW',
    description: 'Professional digital audio workstation',
    descriptionKo: '프로페셔널 디지털 오디오 워크스테이션',
    href: '/daw',
    icon: '🎹',
    status: 'beta' as const,
  },
  {
    id: 'rhythm',
    name: 'Rhythm Game',
    nameKo: '리듬 게임',
    description: 'Pro-grade rhythm game engine',
    descriptionKo: '프로급 리듬 게임 엔진',
    href: '/rhythm',
    icon: '🎮',
    status: 'beta' as const,
  },
  {
    id: 'metronome',
    name: 'Metronome',
    nameKo: '메트로놈',
    description: 'Precision metronome for musicians',
    descriptionKo: '뮤지션을 위한 정밀 메트로놈',
    href: '/metronome',
    icon: '⏱️',
    status: 'ready' as const,
  },
  {
    id: 'drum',
    name: 'Drum Machine',
    nameKo: '드럼 머신',
    description: 'Pattern-based drum sequencer',
    descriptionKo: '패턴 기반 드럼 시퀀서',
    href: '/drum',
    icon: '🥁',
    status: 'ready' as const,
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tools
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          모든 창작자를 위한 프로급 웹 도구
          <br />
          <span className="text-sm">Pro-grade web tools for every creator</span>
        </p>

        {/* Tech Stack Badge */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {['Next.js', 'Pixi.js', 'Rust/WASM', 'AudioWorklet'].map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {tool.status === 'beta' && (
                <span className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Beta
                </span>
              )}
              {tool.status === 'new' && (
                <span className="absolute right-2 top-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                  New
                </span>
              )}
              <div className="mb-4 text-4xl">{tool.icon}</div>
              <h2 className="mb-1 text-lg font-semibold">{tool.nameKo}</h2>
              <p className="text-sm text-muted-foreground">
                {tool.descriptionKo}
              </p>
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  열기 →
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
    </main>
  );
}
