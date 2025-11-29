import type { MetronomeTranslation } from '../types';

export const metronomeKo: MetronomeTranslation = {
  title: '메트로놈',
  description: '정확한 박자를 위한 메트로놈 도구',
  // Controls
  bpm: '속도',
  volume: '볼륨',
  timeSignature: '박자',
  timer: '타이머',
  // Info
  measure: '마디',
  elapsed: '경과 시간',
  countdown: '남은 시간',
  // Slider labels
  slow: '느리게',
  fast: '빠르게',
  quiet: '조용히',
  loud: '크게',
  // Time units
  minutes: '분',
  seconds: '초',
  // Actions
  start: '시작',
  stop: '일시정지',
  reset: '초기화',
  // Status
  perfectSync: '완벽 동기화',
  syncDescription: '완벽한 BPM-시간 동기화 | 60 BPM = 정확히 1초 | 120 BPM = 정확히 0.5초',
  precision: '±0.01s',
};

export const metronomeEn: MetronomeTranslation = {
  title: 'Metronome',
  description: 'Metronome tool for accurate tempo',
  // Controls
  bpm: 'BPM',
  volume: 'Vol',
  timeSignature: 'Time',
  timer: 'Timer',
  // Info
  measure: 'Measure',
  elapsed: 'Elapsed',
  countdown: 'Remaining',
  // Slider labels
  slow: 'Slow',
  fast: 'Fast',
  quiet: 'Quiet',
  loud: 'Loud',
  // Time units
  minutes: 'm',
  seconds: 's',
  // Actions
  start: 'Start',
  stop: 'Pause',
  reset: 'Reset',
  // Status
  perfectSync: 'Perfect Sync',
  syncDescription: 'Perfect BPM-Time Sync | 60 BPM = exactly 1s | 120 BPM = exactly 0.5s',
  precision: '±0.01s',
};
