import type {
  Translations,
  AllTranslations,
  CommonTranslation,
  MetronomeTranslation,
  DrumTranslation,
  DrumSynthTranslation,
  QRTranslation
} from '$lib/types';

// Common translations
const commonKo: CommonTranslation = {
  footer: {
    privacy: '개인정보 처리방침',
    terms: '이용약관',
    github: 'GitHub',
    sitemap: '사이트맵',
    opensource: '오픈소스',
    toolsUsed: '사용된 도구'
  },
  home: {
    searchPlaceholder: '검색...',
    searchAriaLabel: '도구 검색',
    clearSearchAriaLabel: '검색어 지우기',
    sortAriaLabel: '정렬 방식',
    noResults: '에 대한 검색 결과가 없습니다',
    sort: {
      nameAsc: '이름순 (A-Z)',
      nameDesc: '이름역순 (Z-A)',
      nameLong: '이름 긴 순',
      nameShort: '이름 짧은 순',
      sizeLarge: '용량 큰 순',
      sizeSmall: '용량 작은 순'
    }
  },
  common: {
    copyImage: '이미지 복사',
    copied: '복사 완료!',
    download: '다운로드',
    cancel: '취소',
    confirm: '확인',
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    success: '성공!',
    backButton: '← 돌아가기'
  },
  share: {
    button: '공유',
    copyLink: '링크 복사',
    copied: '복사 완료!',
    more: '더보기',
    twitter: 'X (Twitter)',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram'
  },
  embed: {
    button: '임베드',
    title: '임베드 코드',
    width: '너비',
    height: '높이',
    copyCode: '코드 복사',
    copied: '복사 완료!'
  },
  errorBoundary: {
    title: '문제가 발생했습니다',
    message: '예상치 못한 오류가 발생했습니다.',
    retry: '다시 시도'
  },
  pwa: {
    installTitle: '앱 설치',
    installMessage:
      'Productivity Tools (Beta)를 앱으로 설치하면 더 빠르고 편리하게 사용할 수 있습니다.',
    installButton: '설치',
    dismissButton: '나중에',
    updateTitle: '업데이트 가능',
    updateMessage: '새 버전이 있습니다. 지금 업데이트하시겠습니까?',
    updateButton: '업데이트',
    offlineTitle: '오프라인',
    offlineMessage: '인터넷 연결이 없습니다. 일부 기능이 제한될 수 있습니다.'
  }
};

const commonEn: CommonTranslation = {
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    github: 'GitHub',
    sitemap: 'Sitemap',
    opensource: 'Open Source',
    toolsUsed: 'Tools Used'
  },
  home: {
    searchPlaceholder: 'Search...',
    searchAriaLabel: 'Search tools',
    clearSearchAriaLabel: 'Clear search',
    sortAriaLabel: 'Sort by',
    noResults: 'No results found for',
    sort: {
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      nameLong: 'Longest name',
      nameShort: 'Shortest name',
      sizeLarge: 'Largest size',
      sizeSmall: 'Smallest size'
    }
  },
  common: {
    copyImage: 'Copy Image',
    copied: 'Copied!',
    download: 'Download',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    backButton: '← Back'
  },
  share: {
    button: 'Share',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    more: 'More',
    twitter: 'X (Twitter)',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram'
  },
  embed: {
    button: 'Embed',
    title: 'Embed Code',
    width: 'Width',
    height: 'Height',
    copyCode: 'Copy Code',
    copied: 'Copied!'
  },
  errorBoundary: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred.',
    retry: 'Try again'
  },
  pwa: {
    installTitle: 'Install App',
    installMessage:
      'Install Productivity Tools (Beta) as an app for a faster and more convenient experience.',
    installButton: 'Install',
    dismissButton: 'Later',
    updateTitle: 'Update Available',
    updateMessage: 'A new version is available. Would you like to update now?',
    updateButton: 'Update',
    offlineTitle: 'Offline',
    offlineMessage: 'No internet connection. Some features may be limited.'
  }
};

// Metronome translations
const metronomeKo: MetronomeTranslation = {
  title: '메트로놈',
  description: '음악가를 위한 정밀 메트로놈',
  seo: {
    title: '무료 온라인 메트로놈 | 음악 연습용 정밀 박자기',
    description:
      '무료 온라인 메트로놈. 20-400 BPM 정밀 조절, 다양한 박자 설정, 타이머 기능. 피아노, 기타, 드럼 등 모든 악기 연습에 완벽한 박자기. 회원가입 불필요!',
    keywords:
      '메트로놈, 온라인 메트로놈, 무료 메트로놈, 박자기, BPM 측정, 음악 연습, 피아노 메트로놈, 기타 메트로놈, metronome online, free metronome'
  },
  bpm: '속도',
  volume: '볼륨',
  timeSignature: '박자',
  timer: '타이머',
  measure: '마디',
  elapsed: '경과 시간',
  countdown: '남은 시간',
  slow: '느리게',
  fast: '빠르게',
  quiet: '조용히',
  loud: '크게',
  minutes: '분',
  seconds: '초',
  start: '시작',
  stop: '일시정지',
  reset: '초기화',
  perfectSync: '완벽 동기화',
  syncDescription: '완벽한 BPM-시간 동기화 | 60 BPM = 정확히 1초 | 120 BPM = 정확히 0.5초',
  precision: '±0.01s'
};

const metronomeEn: MetronomeTranslation = {
  title: 'Metronome',
  description: 'Precision metronome for musicians',
  seo: {
    title: 'Free Online Metronome | Precision Beat Keeper for Musicians',
    description:
      'Free online metronome. 20-400 BPM precise control, various time signatures, timer function. Perfect beat keeper for piano, guitar, drums practice. No signup required!',
    keywords:
      'metronome, online metronome, free metronome, beat keeper, BPM counter, music practice, piano metronome, guitar metronome, drum metronome'
  },
  bpm: 'Tempo',
  volume: 'Volume',
  timeSignature: 'Time Sig.',
  timer: 'Timer',
  measure: 'Measure',
  elapsed: 'Elapsed',
  countdown: 'Remaining',
  slow: 'Slow',
  fast: 'Fast',
  quiet: 'Quiet',
  loud: 'Loud',
  minutes: 'min',
  seconds: 'sec',
  start: 'Start',
  stop: 'Pause',
  reset: 'Reset',
  perfectSync: 'Perfect Sync',
  syncDescription: 'Perfect BPM-Time Sync | 60 BPM = exactly 1s | 120 BPM = exactly 0.5s',
  precision: '±0.01s'
};

// Drum translations
const drumKo: DrumTranslation = {
  title: '드럼머신',
  description: '드럼 패턴 연습용 시퀀서',
  seo: {
    title: '무료 온라인 드럼머신 | 드럼 패턴 연습 시퀀서',
    description:
      '무료 온라인 드럼머신. 16스텝 시퀀서, 테크노/하우스/트랩 프리셋, 60-180 BPM 조절. 드럼 패턴 연습과 비트 메이킹에 완벽한 도구. 회원가입 불필요!',
    keywords:
      '드럼머신, 온라인 드럼머신, 무료 드럼머신, 비트메이커, 리듬머신, 드럼 연습, 시퀀서, drum machine, beat maker'
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
  exportSuccess: 'MIDI 파일을 다운로드했습니다',
  importMidi: 'MIDI 가져오기',
  importSuccess: 'MIDI 파일을 불러왔습니다',
  importError: 'MIDI 파일을 읽을 수 없습니다',
  loop: '루프',
  loopOf: '{current} / {total}',
  addLoop: '루프 추가',
  removeLoop: '루프 삭제',
  copyLoop: '루프 복사',
  moveLoopLeft: '루프 왼쪽으로 이동',
  moveLoopRight: '루프 오른쪽으로 이동',
  maxLoopsReached: '최대 루프 수에 도달했습니다',
  clearAllLoops: '모든 루프가 초기화됩니다',
  loadedPreset: '{preset} 프리셋을 불러왔습니다',
  synthesisInfo:
    '모든 드럼 소리는 Web Audio API로 실시간 합성됩니다. 킥: 주파수 스윕 오실레이터 (150→40Hz), 스네어/클랩: 화이트 노이즈 + 엔벨로프, 하이햇: 고역 필터링된 노이즈'
};

const drumEn: DrumTranslation = {
  title: 'Drum Machine',
  description: 'Drum pattern practice sequencer',
  seo: {
    title: 'Free Online Drum Machine | Drum Pattern Sequencer',
    description:
      'Free online drum machine. 16-step sequencer, techno/house/trap presets, 60-180 BPM control. Perfect tool for drum pattern practice and beat making. No signup required!',
    keywords:
      'drum machine, online drum machine, free drum machine, beat maker, rhythm machine, drum practice, sequencer, 808, TR-808'
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
  importSuccess: 'MIDI file loaded',
  importError: 'Cannot read MIDI file',
  loop: 'Loop',
  loopOf: '{current} / {total}',
  addLoop: 'Add Loop',
  removeLoop: 'Remove Loop',
  copyLoop: 'Copy Loop',
  moveLoopLeft: 'Move loop left',
  moveLoopRight: 'Move loop right',
  maxLoopsReached: 'Maximum loops reached',
  clearAllLoops: 'All loops will be cleared',
  loadedPreset: 'Loaded {preset} preset',
  synthesisInfo:
    'All drum sounds are synthesized in real-time using Web Audio API. Kick: frequency sweep oscillator (150→40Hz), Snare/Clap: white noise + envelope, Hi-hat: high-pass filtered noise'
};

// Drum Synth translations
const drumSynthKo: DrumSynthTranslation = {
  title: '드럼 사운드 합성기',
  description: 'Web Audio API를 사용한 세밀한 드럼 사운드 합성 및 파라미터 조절',
  seo: {
    title: '드럼 사운드 합성기 - 세밀한 파라미터 조절',
    description:
      'Web Audio API를 사용하여 킥, 스네어, 하이햇, 클랩, 탐, 림샷 등 다양한 드럼 사운드를 세밀하게 조절하고 합성할 수 있는 도구입니다.',
    keywords: '드럼 합성, 드럼 사운드, Web Audio, 킥, 스네어, 하이햇, 808, 사운드 디자인'
  },
  kick: '킥',
  snare: '스네어',
  hihat: '하이햇',
  clap: '클랩',
  tom: '탐',
  rim: '림샷',
  play: '재생',
  reset: '초기화',
  parameters: '파라미터',
  master: '마스터',
  volume: '볼륨',
  pitchStart: '시작 피치',
  pitchEnd: '끝 피치',
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
  openness: '오픈',
  pitch: '피치',
  ring: '링',
  spread: '스프레드',
  reverb: '리버브',
  body: '바디',
  attack: '어택',
  metallic: '메탈릭',
  presets: '프리셋',
  presetClassic808: '클래식 808',
  presetHardTechno: '하드 테크노',
  presetLofi: '로파이',
  presetMinimal: '미니멀',
  presetAcoustic: '어쿠스틱',
  quickPlay: '퀵 플레이',
  export: '내보내기',
  exportWav: 'WAV 다운로드',
  exportCompressed: '압축 파일 다운로드',
  exportAll: '모든 드럼 내보내기',
  exporting: '내보내는 중...',
  exportSuccess: '내보내기 완료',
  exportError: '내보내기 실패'
};

const drumSynthEn: DrumSynthTranslation = {
  title: 'Drum Sound Synthesizer',
  description: 'Detailed drum sound synthesis and parameter control using Web Audio API',
  seo: {
    title: 'Drum Sound Synthesizer - Fine Parameter Control',
    description:
      'Synthesize and fine-tune various drum sounds including kick, snare, hi-hat, clap, tom, and rim shot using Web Audio API.',
    keywords: 'drum synthesis, drum sound, Web Audio, kick, snare, hi-hat, 808, sound design'
  },
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'Hi-Hat',
  clap: 'Clap',
  tom: 'Tom',
  rim: 'Rim',
  play: 'Play',
  reset: 'Reset',
  parameters: 'Parameters',
  master: 'Master',
  volume: 'Volume',
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
  presets: 'Presets',
  presetClassic808: 'Classic 808',
  presetHardTechno: 'Hard Techno',
  presetLofi: 'Lo-Fi',
  presetMinimal: 'Minimal',
  presetAcoustic: 'Acoustic',
  quickPlay: 'Quick Play',
  export: 'Export',
  exportWav: 'Download WAV',
  exportCompressed: 'Download Compressed',
  exportAll: 'Export All Drums',
  exporting: 'Exporting...',
  exportSuccess: 'Export complete',
  exportError: 'Export failed'
};

// QR translations
const qrKo: QRTranslation = {
  title: 'QR 코드 생성기',
  subtitle: '투명 배경의 고해상도 QR 코드를 생성합니다',
  seo: {
    title: '무료 QR코드 생성기 | 고해상도 투명 배경 QR코드 만들기',
    description:
      '무료 온라인 QR코드 생성기. 투명 배경, 고해상도 512x512 PNG 다운로드. URL, 텍스트, 연락처 정보 등 다양한 QR코드를 즉시 생성하세요. 회원가입 불필요!',
    keywords:
      'QR코드 생성기, 무료 QR코드, QR코드 만들기, 투명 배경 QR코드, 고해상도 QR코드, 온라인 QR코드, QR code generator, free QR code'
  },
  urlInput: 'URL 입력',
  urlLabel: '연결할 URL',
  urlPlaceholder: 'https://example.com',
  urlHelp: 'URL을 입력하면 즉시 QR 코드가 생성됩니다',
  errorCorrectionLevel: '오류 정정 레벨',
  level: '레벨',
  recoveryRate: '복원률',
  recommendedEnvironment: '권장 환경',
  description: '설명',
  onlineOnly: '온라인 전용',
  noDamageRisk: '손상 위험 없음',
  smallPrint: '소형 인쇄물',
  coatedSurface: '코팅된 표면',
  generalPrint: '일반 인쇄물',
  paperLabel: '종이, 라벨',
  outdoorLarge: '옥외/대형',
  highDamageRisk: '손상 가능성 높음',
  errorLevelInfo:
    '복원률이 낮을수록 인식률은 높아집니다. 크기가 작은 곳일수록 낮은 레벨의 복원률을 사용하는 것을 추천하지만, 위 표에 나온 대로 사용환경에 따라 적절한 균형을 찾는 것이 좋습니다.',
  qrCodeColor: 'QR 코드 색상',
  black: '검정',
  white: '흰색',
  generatedQrCode: '생성된 QR 코드',
  blackQrCode: '검정 QR 코드',
  whiteQrCode: '흰색 QR 코드',
  enterUrl: 'URL을 입력하세요',
  transparentBg: '투명 배경, 512x512 PNG',
  footer: 'QR 코드를 즉시 생성 • 데이터 저장 안함 • 무료 사용',
  imageCopyNotSupported: '이미지 복사를 지원하지 않아 다운로드되었습니다.',
  imageOpenedInNewTab: '이미지가 새 탭에서 열렸습니다. 이미지를 길게 눌러 저장하거나 복사하세요.',
  imageDownloaded: '이미지가 다운로드되었습니다.',
  imageCopyConfirm: '이미지 복사가 지원되지 않습니다. 대신 다운로드하시겠습니까?',
  popupBlocked: '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.',
  downloadFailed: '다운로드에 실패했습니다. 이미지를 우클릭하여 저장해주세요.'
};

const qrEn: QRTranslation = {
  title: 'QR Code Generator',
  subtitle: 'Generate high-resolution QR codes with transparent backgrounds',
  seo: {
    title: 'Free QR Code Generator | High-Resolution Transparent QR Codes',
    description:
      'Free online QR code generator. Create high-resolution 512x512 PNG QR codes with transparent backgrounds. Generate QR codes for URLs, text, contacts instantly. No signup required!',
    keywords:
      'QR code generator, free QR code, make QR code, transparent QR code, high resolution QR code, online QR code, QR code maker'
  },
  urlInput: 'URL Input',
  urlLabel: 'URL to connect',
  urlPlaceholder: 'https://example.com',
  urlHelp: 'QR code will be generated instantly when you enter URL',
  errorCorrectionLevel: 'Error Correction Level',
  level: 'Level',
  recoveryRate: 'Recovery',
  recommendedEnvironment: 'Recommended',
  description: 'Description',
  onlineOnly: 'Online only',
  noDamageRisk: 'No damage risk',
  smallPrint: 'Small prints',
  coatedSurface: 'Coated surface',
  generalPrint: 'General prints',
  paperLabel: 'Paper, Label',
  outdoorLarge: 'Outdoor/Large',
  highDamageRisk: 'High damage risk',
  errorLevelInfo:
    'Lower recovery rates result in higher recognition rates. Lower levels are recommended for smaller sizes, but find the right balance based on your environment as shown in the table above.',
  qrCodeColor: 'QR Code Color',
  black: 'Black',
  white: 'White',
  generatedQrCode: 'Generated QR Code',
  blackQrCode: 'Black QR Code',
  whiteQrCode: 'White QR Code',
  enterUrl: 'Enter URL',
  transparentBg: 'Transparent background, 512x512 PNG',
  footer: 'Generate QR codes instantly • No data stored • Free to use',
  imageCopyNotSupported: 'Image copy not supported, downloaded instead.',
  imageOpenedInNewTab: 'Image opened in new tab. Long press the image to save or copy.',
  imageDownloaded: 'Image downloaded.',
  imageCopyConfirm: 'Image copy not supported. Download instead?',
  popupBlocked: 'Popup blocked. Please disable popup blocking and try again.',
  downloadFailed: 'Download failed. Right-click the image to save.'
};

// Combined translations
const ko: Translations = {
  common: commonKo,
  metronome: metronomeKo,
  drum: drumKo,
  drumSynth: drumSynthKo,
  qr: qrKo
};

const en: Translations = {
  common: commonEn,
  metronome: metronomeEn,
  drum: drumEn,
  drumSynth: drumSynthEn,
  qr: qrEn
};

export const translations: AllTranslations = { ko, en };
