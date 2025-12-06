'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Timer,
  Guitar,
  Drum,
  Piano,
  Music,
  QrCode,
  Clock,
  Gamepad2,
  LayoutGrid,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  href: string;
  labelKey:
    | keyof typeof import('@/i18n/translations').translations.ko.tools
    | 'home'
    | 'workspace';
  icon: React.ReactNode;
  category?: 'main' | 'music' | 'utility';
}

const navItems: NavItem[] = [
  {
    href: '/',
    labelKey: 'home',
    icon: <Home className="h-4 w-4" />,
    category: 'main',
  },
  {
    href: '/tools',
    labelKey: 'workspace',
    icon: <LayoutGrid className="h-4 w-4" />,
    category: 'main',
  },
  {
    href: '/tools/metronome',
    labelKey: 'metronome',
    icon: <Timer className="h-4 w-4" />,
    category: 'music',
  },
  {
    href: '/tools/tuner',
    labelKey: 'tuner',
    icon: <Guitar className="h-4 w-4" />,
    category: 'music',
  },
  {
    href: '/daw',
    labelKey: 'daw',
    icon: <Drum className="h-4 w-4" />,
    category: 'music',
  },
  {
    href: '/tools/piano-roll',
    labelKey: 'pianoRoll',
    icon: <Piano className="h-4 w-4" />,
    category: 'music',
  },
  {
    href: '/tools/sheet-editor',
    labelKey: 'sheetEditor',
    icon: <Music className="h-4 w-4" />,
    category: 'music',
  },
  {
    href: '/rhythm',
    labelKey: 'rhythm',
    icon: <Gamepad2 className="h-4 w-4" />,
    category: 'music',
  },
  {
    href: '/tools/qr-generator',
    labelKey: 'qrGenerator',
    icon: <QrCode className="h-4 w-4" />,
    category: 'utility',
  },
  {
    href: '/tools/world-clock',
    labelKey: 'worldClock',
    icon: <Clock className="h-4 w-4" />,
    category: 'utility',
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const getLabel = (labelKey: NavItem['labelKey']) => {
    if (labelKey === 'home') return t.nav.home;
    if (labelKey === 'workspace') return t.nav.workspace;
    return t.tools[labelKey as keyof typeof t.tools];
  };

  const mainItems = navItems.filter((item) => item.category === 'main');
  const musicItems = navItems.filter((item) => item.category === 'music');
  const utilityItems = navItems.filter((item) => item.category === 'utility');

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-60 border-r bg-background transition-transform duration-200 ease-in-out',
        'hidden md:block',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="flex h-full flex-col gap-2 overflow-y-auto p-4">
        {/* Main */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              <span>{getLabel(item.labelKey)}</span>
            </Link>
          ))}
        </div>

        {/* Music Tools */}
        <div className="mt-4">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.nav.musicTools}
          </h3>
          <div className="space-y-1">
            {musicItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                <span>{getLabel(item.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Utility Tools */}
        <div className="mt-4">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.nav.utilityTools}
          </h3>
          <div className="space-y-1">
            {utilityItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                <span>{getLabel(item.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
