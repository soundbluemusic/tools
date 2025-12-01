import type { AppConfig } from '../../types';

const config: AppConfig = {
  name: {
    ko: '드럼 사운드 합성기',
    en: 'Drum Sound Synth',
  },
  desc: {
    ko: '세밀한 파라미터 조절이 가능한 드럼 사운드 합성기',
    en: 'Web Audio drum sound synthesizer with detailed parameter control',
  },
  icon: '🎛️',
  size: 65536, // ~64KB
  order: 3,
};

export default config;
