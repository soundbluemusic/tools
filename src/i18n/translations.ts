export const translations = {
  ko: {
    brand: 'Tools',
    search: '검색...',
    searchShortcut: '검색',
    sidebar: {
      open: '사이드바 열기',
      close: '사이드바 닫기',
    },
    theme: {
      light: '라이트 모드',
      dark: '다크 모드',
      system: '시스템 설정',
    },
    nav: {
      home: '홈',
      tools: '도구',
      workspace: '작업 공간',
      musicTools: '음악 도구',
      utilityTools: '유틸리티',
    },
    tools: {
      metronome: '메트로놈',
      tuner: '튜너',
      daw: '드럼머신 & 신스',
      pianoRoll: '피아노 롤',
      sheetEditor: '악보 편집기',
      qrGenerator: 'QR 생성기',
      worldClock: '세계 시계',
      rhythm: '리듬 게임',
    },
    footer: {
      privacy: '개인정보 처리방침',
      terms: '이용약관',
      github: 'GitHub',
      license: 'MIT License',
    },
    commandPalette: {
      placeholder: '도구 검색...',
      noResults: '결과 없음',
      recentlyUsed: '최근 사용',
      allTools: '모든 도구',
    },
  },
  en: {
    brand: 'Tools',
    search: 'Search...',
    searchShortcut: 'Search',
    sidebar: {
      open: 'Open sidebar',
      close: 'Close sidebar',
    },
    theme: {
      light: 'Light mode',
      dark: 'Dark mode',
      system: 'System',
    },
    nav: {
      home: 'Home',
      tools: 'Tools',
      workspace: 'Workspace',
      musicTools: 'Music Tools',
      utilityTools: 'Utilities',
    },
    tools: {
      metronome: 'Metronome',
      tuner: 'Tuner',
      daw: 'Drum Machine & Synth',
      pianoRoll: 'Piano Roll',
      sheetEditor: 'Sheet Editor',
      qrGenerator: 'QR Generator',
      worldClock: 'World Clock',
      rhythm: 'Rhythm Game',
    },
    footer: {
      privacy: 'Privacy',
      terms: 'Terms',
      github: 'GitHub',
      license: 'MIT License',
    },
    commandPalette: {
      placeholder: 'Search tools...',
      noResults: 'No results',
      recentlyUsed: 'Recently used',
      allTools: 'All tools',
    },
  },
} as const;

export type Language = keyof typeof translations;
export type Translations = (typeof translations)[Language];
