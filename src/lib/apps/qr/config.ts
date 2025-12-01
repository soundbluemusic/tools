import type { AppConfig } from '../../types';

const config: AppConfig = {
  name: {
    ko: 'QR 코드 생성기',
    en: 'QR Code Generator',
  },
  desc: {
    ko: '투명 배경의 고해상도 QR 코드 생성',
    en: 'Generate high-resolution QR codes with transparent backgrounds',
  },
  icon: '📱',
  size: 153600, // 150KB
  order: 2, // Display order
};

export default config;
