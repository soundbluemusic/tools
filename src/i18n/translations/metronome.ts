import type { MetronomeTranslation } from '../types';

export const metronomeKo: MetronomeTranslation = {
  title: '메트로놈',
  description: '음악가를 위한 정밀 메트로놈',
  seo: {
    title: '무료 온라인 메트로놈 | 음악 연습용 정밀 박자기',
    description: '무료 온라인 메트로놈. 20-400 BPM 정밀 조절, 다양한 박자 설정, 타이머 기능. 피아노, 기타, 드럼 등 모든 악기 연습에 완벽한 박자기. 회원가입 불필요!',
    keywords: '메트로놈, 온라인 메트로놈, 무료 메트로놈, 박자기, BPM 측정, 음악 연습, 피아노 메트로놈, 기타 메트로놈, metronome online, free metronome',
  },
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
  description: 'Precision metronome for musicians',
  seo: {
    title: 'Free Online Metronome | Precision Beat Keeper for Musicians',
    description: 'Free online metronome. 20-400 BPM precise control, various time signatures, timer function. Perfect beat keeper for piano, guitar, drums practice. No signup required!',
    keywords: 'metronome, online metronome, free metronome, beat keeper, BPM counter, music practice, piano metronome, guitar metronome, drum metronome',
  },
  // Controls
  bpm: 'Tempo',
  volume: 'Volume',
  timeSignature: 'Time Sig.',
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
  minutes: 'min',
  seconds: 'sec',
  // Actions
  start: 'Start',
  stop: 'Pause',
  reset: 'Reset',
  // Status
  perfectSync: 'Perfect Sync',
  syncDescription: 'Perfect BPM-Time Sync | 60 BPM = exactly 1s | 120 BPM = exactly 0.5s',
  precision: '±0.01s',
};
