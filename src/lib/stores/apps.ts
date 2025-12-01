import { readable } from 'svelte/store';
import type { App, AppConfig } from '$lib/types';

// App configurations
const appConfigs: Record<string, AppConfig> = {
  metronome: {
    name: { ko: '메트로놈', en: 'Metronome' },
    desc: { ko: '음악가를 위한 정밀 메트로놈', en: 'Precision metronome for musicians' },
    icon: '🎵',
    size: 51200,
    order: 1
  },
  drum: {
    name: { ko: '드럼머신', en: 'Drum Machine' },
    desc: { ko: '드럼 패턴 연습용 시퀀서', en: 'Drum pattern practice sequencer' },
    icon: '🥁',
    size: 61440,
    order: 2
  },
  'drum-synth': {
    name: { ko: '드럼 사운드 합성기', en: 'Drum Sound Synth' },
    desc: { ko: '세밀한 파라미터 조절이 가능한 드럼 사운드 합성기', en: 'Web Audio drum sound synthesizer with detailed parameter control' },
    icon: '🎛️',
    size: 65536,
    order: 3
  },
  qr: {
    name: { ko: 'QR 코드 생성기', en: 'QR Code Generator' },
    desc: { ko: '투명 배경의 고해상도 QR 코드 생성', en: 'Generate high-resolution QR codes with transparent backgrounds' },
    icon: '📱',
    size: 153600,
    order: 4
  }
};

// Convert configs to App objects
const appList: App[] = Object.entries(appConfigs)
  .map(([key, config], index) => ({
    ...config,
    id: index + 1,
    url: `/${key}`
  }))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

// Music app paths for grouping
export const MUSIC_APP_PATHS = ['/metronome', '/drum', '/drum-synth'];

// Create a readable store for apps
export const apps = readable<App[]>(appList);

// Export app configs for direct access
export { appConfigs };
