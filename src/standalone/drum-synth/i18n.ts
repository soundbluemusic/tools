/**
 * Standalone drum-synth i18n
 * Compatible with DrumSynthTranslation type from main app
 */
import type { DrumSynthTranslation } from '../../i18n/types';

export type Language = 'ko' | 'en';

/** Extended translations for standalone app (includes header controls) */
export interface StandaloneTranslations extends DrumSynthTranslation {
  lightMode: string;
  darkMode: string;
  language: string;
}

export const translations: Record<Language, StandaloneTranslations> = {
  ko: {
    title: '드럼 사운드 신스',
    description: '웹 오디오 드럼 사운드 합성기',
    seo: {
      title: '드럼 사운드 신스',
      description: '웹 오디오 드럼 사운드 합성기',
      keywords: '드럼 신스',
    },
    quickPlay: '퀵 플레이',
    play: '재생',
    reset: '초기화',
    parameters: '파라미터',
    master: '마스터',
    volume: '볼륨',
    presets: '프리셋',
    kick: '킥',
    snare: '스네어',
    hihat: '하이햇',
    clap: '클랩',
    tom: '탐',
    rim: '림',
    pitchStart: '시작 피치',
    pitchEnd: '종료 피치',
    pitchDecay: '피치 디케이',
    ampDecay: '앰프 디케이',
    click: '클릭',
    drive: '드라이브',
    tone: '톤',
    toneFreq: '톤 주파수',
    toneDecay: '톤 디케이',
    noiseDecay: '노이즈 디케이',
    noiseFilter: '노이즈 필터',
    toneMix: '톤 믹스',
    snappy: '스내피',
    filterFreq: '필터 주파수',
    filterQ: '필터 Q',
    decay: '디케이',
    openness: '오픈도',
    pitch: '피치',
    ring: '링',
    spread: '스프레드',
    reverb: '리버브',
    body: '바디',
    attack: '어택',
    metallic: '메탈릭',
    presetClassic808: '클래식 808',
    presetHardTechno: '하드 테크노',
    presetLofi: '로파이',
    presetMinimal: '미니멀',
    presetAcoustic: '어쿠스틱',
    export: '내보내기',
    exportWav: 'WAV 내보내기',
    exportCompressed: '압축 내보내기',
    exportAll: '전체 내보내기',
    exporting: '내보내는 중...',
    exportSuccess: '내보내기 성공',
    exportError: '내보내기 실패',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    language: '언어',
  },
  en: {
    title: 'Drum Sound Synth',
    description: 'Web Audio drum sound synthesizer',
    seo: {
      title: 'Drum Sound Synth',
      description: 'Web Audio drum sound synthesizer',
      keywords: 'drum synth',
    },
    quickPlay: 'Quick Play',
    play: 'Play',
    reset: 'Reset',
    parameters: 'Parameters',
    master: 'Master',
    volume: 'Volume',
    presets: 'Presets',
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'HiHat',
    clap: 'Clap',
    tom: 'Tom',
    rim: 'Rim',
    pitchStart: 'Pitch Start',
    pitchEnd: 'Pitch End',
    pitchDecay: 'Pitch Decay',
    ampDecay: 'Amp Decay',
    click: 'Click',
    drive: 'Drive',
    tone: 'Tone',
    toneFreq: 'Tone Freq',
    toneDecay: 'Tone Decay',
    noiseDecay: 'Noise Decay',
    noiseFilter: 'Noise Filter',
    toneMix: 'Tone Mix',
    snappy: 'Snappy',
    filterFreq: 'Filter Freq',
    filterQ: 'Filter Q',
    decay: 'Decay',
    openness: 'Openness',
    pitch: 'Pitch',
    ring: 'Ring',
    spread: 'Spread',
    reverb: 'Reverb',
    body: 'Body',
    attack: 'Attack',
    metallic: 'Metallic',
    presetClassic808: 'Classic 808',
    presetHardTechno: 'Hard Techno',
    presetLofi: 'Lo-Fi',
    presetMinimal: 'Minimal',
    presetAcoustic: 'Acoustic',
    export: 'Export',
    exportWav: 'Export WAV',
    exportCompressed: 'Export Compressed',
    exportAll: 'Export All',
    exporting: 'Exporting...',
    exportSuccess: 'Export successful',
    exportError: 'Export failed',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

export function getTranslations(lang: Language): StandaloneTranslations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const stored = localStorage.getItem('drum-synth-lang');
  if (stored === 'ko' || stored === 'en') return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}
