import type { AppConfig } from '../../types';

const config: AppConfig = {
  name: {
    ko: '드럼 툴',
    en: 'Drum Tool',
  },
  desc: {
    ko: '드럼 머신과 사운드 합성기를 결합한 올인원 드럼 도구',
    en: 'All-in-one drum tool combining drum machine and sound synthesizer',
  },
  icon: '🎹',
  size: 126976, // ~124KB (combined)
  order: 10,
};

export default config;
