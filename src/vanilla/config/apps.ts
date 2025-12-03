/**
 * Apps Configuration - Vanilla TypeScript
 * Shared app list for navigation and home page
 */

export interface AppConfig {
  url: string;
  name: { ko: string; en: string };
  desc: { ko: string; en: string };
  icon: string;
  order?: number;
}

/**
 * All available apps
 */
export const APPS: AppConfig[] = [
  {
    url: '/metronome',
    name: { ko: '메트로놈', en: 'Metronome' },
    desc: { ko: '정밀한 박자 연습 도구', en: 'Precision tempo practice tool' },
    icon: '🎵',
    order: 1,
  },
  {
    url: '/drum',
    name: { ko: '드럼머신', en: 'Drum Machine' },
    desc: { ko: '16스텝 드럼 시퀀서', en: '16-step drum sequencer' },
    icon: '🥁',
    order: 2,
  },
  {
    url: '/drum-synth',
    name: { ko: '드럼 신스', en: 'Drum Synth' },
    desc: { ko: '드럼 사운드 신디사이저', en: 'Drum sound synthesizer' },
    icon: '🎛️',
    order: 3,
  },
  {
    url: '/qr',
    name: { ko: 'QR 코드', en: 'QR Code' },
    desc: { ko: 'QR 코드 생성기', en: 'QR code generator' },
    icon: '📱',
    order: 4,
  },
];

/**
 * Get apps sorted by order
 */
export function getAppsSorted(): AppConfig[] {
  return [...APPS].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
