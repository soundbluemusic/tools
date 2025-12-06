'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Search,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  keywords: string[];
}

const commandItems: CommandItem[] = [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    icon: <Home className="h-4 w-4" />,
    keywords: ['홈', 'home', 'main', '메인'],
  },
  {
    id: 'workspace',
    href: '/tools',
    labelKey: 'workspace',
    icon: <LayoutGrid className="h-4 w-4" />,
    keywords: ['작업', 'workspace', 'tools', '도구'],
  },
  {
    id: 'metronome',
    href: '/tools/metronome',
    labelKey: 'metronome',
    icon: <Timer className="h-4 w-4" />,
    keywords: ['메트로놈', 'metronome', 'tempo', '템포', 'bpm'],
  },
  {
    id: 'tuner',
    href: '/tools/tuner',
    labelKey: 'tuner',
    icon: <Guitar className="h-4 w-4" />,
    keywords: ['튜너', 'tuner', '기타', 'guitar', '조율'],
  },
  {
    id: 'daw',
    href: '/daw',
    labelKey: 'daw',
    icon: <Drum className="h-4 w-4" />,
    keywords: ['드럼', 'drum', 'daw', '신스', 'synth', '비트'],
  },
  {
    id: 'pianoRoll',
    href: '/tools/piano-roll',
    labelKey: 'pianoRoll',
    icon: <Piano className="h-4 w-4" />,
    keywords: ['피아노', 'piano', 'roll', 'midi', '미디'],
  },
  {
    id: 'sheetEditor',
    href: '/tools/sheet-editor',
    labelKey: 'sheetEditor',
    icon: <Music className="h-4 w-4" />,
    keywords: ['악보', 'sheet', 'music', 'score', '편집'],
  },
  {
    id: 'rhythm',
    href: '/rhythm',
    labelKey: 'rhythm',
    icon: <Gamepad2 className="h-4 w-4" />,
    keywords: ['리듬', 'rhythm', 'game', '게임'],
  },
  {
    id: 'qrGenerator',
    href: '/tools/qr-generator',
    labelKey: 'qrGenerator',
    icon: <QrCode className="h-4 w-4" />,
    keywords: ['qr', '큐알', 'code', '코드', '생성'],
  },
  {
    id: 'worldClock',
    href: '/tools/world-clock',
    labelKey: 'worldClock',
    icon: <Clock className="h-4 w-4" />,
    keywords: ['시계', 'clock', 'world', '세계', '시간'],
  },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { t } = useLanguage();

  const getLabel = (labelKey: string) => {
    if (labelKey === 'home') return t.nav.home;
    if (labelKey === 'workspace') return t.nav.workspace;
    return t.tools[labelKey as keyof typeof t.tools] || labelKey;
  };

  const filteredItems = commandItems.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const label = getLabel(item.labelKey).toLowerCase();
    return (
      label.includes(searchLower) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setSearch('');
    },
    [router, onClose]
  );

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i < filteredItems.length - 1 ? i + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i > 0 ? i - 1 : filteredItems.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleSelect(filteredItems[selectedIndex].href);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>{t.commandPalette.placeholder}</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.commandPalette.placeholder}
            className="h-12 border-0 focus-visible:ring-0"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t.commandPalette.noResults}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    index === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.icon}
                  <span>{getLabel(item.labelKey)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
