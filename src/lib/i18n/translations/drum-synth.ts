import type { DrumSynthTranslation } from '../types';

/**
 * Drum Synth Korean translations
 */
export const drumSynthKo: DrumSynthTranslation = {
  title: '드럼 사운드 합성기',
  description: 'Web Audio API를 사용한 세밀한 드럼 사운드 합성 및 파라미터 조절',
  seo: {
    title: '드럼 사운드 합성기 - 세밀한 파라미터 조절',
    description:
      'Web Audio API를 사용하여 킥, 스네어, 하이햇, 클랩, 탐, 림샷 등 다양한 드럼 사운드를 세밀하게 조절하고 합성할 수 있는 도구입니다.',
    keywords: '드럼 합성, 드럼 사운드, Web Audio, 킥, 스네어, 하이햇, 808, 사운드 디자인',
  },
  // Drum types
  kick: '킥',
  snare: '스네어',
  hihat: '하이햇',
  clap: '클랩',
  tom: '탐',
  rim: '림샷',
  // Actions
  play: '재생',
  reset: '초기화',
  // Parameters
  parameters: '파라미터',
  master: '마스터',
  volume: '볼륨',
  // Kick parameters
  pitchStart: '시작 피치',
  pitchEnd: '끝 피치',
  pitchDecay: '피치 디케이',
  ampDecay: '앰프 디케이',
  click: '클릭',
  drive: '드라이브',
  tone: '톤',
  // Snare parameters
  toneFreq: '톤 주파수',
  toneDecay: '톤 디케이',
  noiseDecay: '노이즈 디케이',
  noiseFilter: '노이즈 필터',
  toneMix: '톤 믹스',
  snappy: '스내피',
  // Hihat parameters
  filterFreq: '필터 주파수',
  filterQ: '필터 Q',
  decay: '디케이',
  openness: '오픈',
  pitch: '피치',
  ring: '링',
  // Clap parameters
  spread: '스프레드',
  reverb: '리버브',
  // Tom parameters
  body: '바디',
  attack: '어택',
  // Rim parameters
  metallic: '메탈릭',
  // Presets
  presets: '프리셋',
  presetClassic808: '클래식 808',
  presetHardTechno: '하드 테크노',
  presetLofi: '로파이',
  presetMinimal: '미니멀',
  presetAcoustic: '어쿠스틱',
  // Quick play
  quickPlay: '퀵 플레이',
  // Export
  export: '내보내기',
  exportWav: 'WAV 다운로드',
  exportCompressed: '압축 파일 다운로드',
  exportAll: '모든 드럼 내보내기',
  exporting: '내보내는 중...',
  exportSuccess: '내보내기 완료',
  exportError: '내보내기 실패',
};

/**
 * Drum Synth English translations
 */
export const drumSynthEn: DrumSynthTranslation = {
  title: 'Drum Sound Synthesizer',
  description: 'Detailed drum sound synthesis and parameter control using Web Audio API',
  seo: {
    title: 'Drum Sound Synthesizer - Fine Parameter Control',
    description:
      'Synthesize and fine-tune various drum sounds including kick, snare, hi-hat, clap, tom, and rim shot using Web Audio API.',
    keywords: 'drum synthesis, drum sound, Web Audio, kick, snare, hi-hat, 808, sound design',
  },
  // Drum types
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'Hi-Hat',
  clap: 'Clap',
  tom: 'Tom',
  rim: 'Rim',
  // Actions
  play: 'Play',
  reset: 'Reset',
  // Parameters
  parameters: 'Parameters',
  master: 'Master',
  volume: 'Volume',
  // Kick parameters
  pitchStart: 'Pitch Start',
  pitchEnd: 'Pitch End',
  pitchDecay: 'Pitch Decay',
  ampDecay: 'Amp Decay',
  click: 'Click',
  drive: 'Drive',
  tone: 'Tone',
  // Snare parameters
  toneFreq: 'Tone Freq',
  toneDecay: 'Tone Decay',
  noiseDecay: 'Noise Decay',
  noiseFilter: 'Noise Filter',
  toneMix: 'Tone Mix',
  snappy: 'Snappy',
  // Hihat parameters
  filterFreq: 'Filter Freq',
  filterQ: 'Filter Q',
  decay: 'Decay',
  openness: 'Openness',
  pitch: 'Pitch',
  ring: 'Ring',
  // Clap parameters
  spread: 'Spread',
  reverb: 'Reverb',
  // Tom parameters
  body: 'Body',
  attack: 'Attack',
  // Rim parameters
  metallic: 'Metallic',
  // Presets
  presets: 'Presets',
  presetClassic808: 'Classic 808',
  presetHardTechno: 'Hard Techno',
  presetLofi: 'Lo-Fi',
  presetMinimal: 'Minimal',
  presetAcoustic: 'Acoustic',
  // Quick play
  quickPlay: 'Quick Play',
  // Export
  export: 'Export',
  exportWav: 'Download WAV',
  exportCompressed: 'Download Compressed',
  exportAll: 'Export All Drums',
  exporting: 'Exporting...',
  exportSuccess: 'Export complete',
  exportError: 'Export failed',
};
