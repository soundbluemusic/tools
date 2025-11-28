import type { AppList } from '../types';

/**
 * Static app data - Object.freeze prevents mutations
 * Defined outside component to prevent recreation on re-renders
 */
export const APPS: AppList = Object.freeze([
  Object.freeze({ id: 1, name: '계약서 분석 도구', desc: 'Contract Risk Analysis', icon: '📄', url: '/contract' }),
  Object.freeze({ id: 2, name: '메트로놈', desc: 'Metronome', icon: '🎵', url: '/metronome' }),
  Object.freeze({ id: 3, name: 'QR 코드 생성기', desc: 'QR Code Generator', icon: '📱', url: '/qr' }),
]);

// Precompute length for iteration optimization
export const APPS_COUNT = APPS.length;
