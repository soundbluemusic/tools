/**
 * Standalone drum i18n
 * Compatible with DrumTranslation type from main app
 */
import type { DrumTranslation } from '../../i18n/types';

export type Language = 'ko' | 'en';

/** Extended translations for standalone app (includes header controls) */
export interface StandaloneTranslations extends DrumTranslation {
  lightMode: string;
  darkMode: string;
  language: string;
}

export const translations: Record<Language, StandaloneTranslations> = {
  ko: {
    title: '드럼머신',
    description: '16스텝 드럼 시퀀서',
    seo: {
      title: '드럼머신',
      description: '16스텝 드럼 시퀀서',
      keywords: '드럼머신',
    },
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    clear: '초기화',
    tempo: '템포',
    kick: '킥',
    snare: '스네어',
    hihat: '하이햇',
    openhat: '오픈햇',
    clap: '클랩',
    step: '스텝',
    volume: '볼륨',
    presets: '프리셋',
    presetTechno: '테크노',
    presetHouse: '하우스',
    presetTrap: '트랩',
    presetBreakbeat: '브레이크비트',
    presetMinimal: '미니멀',
    exportMidi: 'MIDI 내보내기',
    exportSuccess: 'MIDI 파일이 다운로드되었습니다',
    importMidi: 'MIDI 가져오기',
    importSuccess: 'MIDI 파일을 가져왔습니다',
    importError: 'MIDI 파일을 가져오는 데 실패했습니다',
    loop: '루프',
    loopOf: '/',
    addLoop: '루프 추가',
    removeLoop: '루프 삭제',
    copyLoop: '루프 복사',
    moveLoopLeft: '왼쪽으로 이동',
    moveLoopRight: '오른쪽으로 이동',
    maxLoopsReached: '최대 루프 수에 도달했습니다',
    clearAllLoops: '모든 루프가 초기화됩니다',
    loadedPreset: '{preset} 프리셋을 불러왔습니다',
    synthesisInfo: '모든 드럼 소리는 Web Audio API로 실시간 합성됩니다',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    language: '언어',
  },
  en: {
    title: 'Drum Machine',
    description: '16-step drum sequencer',
    seo: {
      title: 'Drum Machine',
      description: '16-step drum sequencer',
      keywords: 'drum machine',
    },
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    clear: 'Clear',
    tempo: 'Tempo',
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'HiHat',
    openhat: 'OpenHat',
    clap: 'Clap',
    step: 'Step',
    volume: 'Volume',
    presets: 'Presets',
    presetTechno: 'Techno',
    presetHouse: 'House',
    presetTrap: 'Trap',
    presetBreakbeat: 'Breakbeat',
    presetMinimal: 'Minimal',
    exportMidi: 'Export MIDI',
    exportSuccess: 'MIDI file downloaded',
    importMidi: 'Import MIDI',
    importSuccess: 'MIDI file imported',
    importError: 'Failed to import MIDI file',
    loop: 'Loop',
    loopOf: '/',
    addLoop: 'Add Loop',
    removeLoop: 'Remove Loop',
    copyLoop: 'Copy Loop',
    moveLoopLeft: 'Move Left',
    moveLoopRight: 'Move Right',
    maxLoopsReached: 'Maximum loops reached',
    clearAllLoops: 'All loops will be cleared',
    loadedPreset: 'Loaded {preset} preset',
    synthesisInfo:
      'All drum sounds are synthesized in real-time using Web Audio API',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

export function getTranslations(lang: Language): StandaloneTranslations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const stored = localStorage.getItem('drum-lang');
  if (stored === 'ko' || stored === 'en') return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}
