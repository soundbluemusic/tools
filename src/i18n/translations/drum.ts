import type { DrumTranslation } from '../types';

export const drumKo: DrumTranslation = {
  title: '드럼머신',
  description: '드럼 패턴 연습용 시퀀서',
  seo: {
    title: '무료 온라인 드럼머신 | 드럼 패턴 연습 시퀀서',
    description:
      '무료 온라인 드럼머신. 16스텝 시퀀서, 테크노/하우스/트랩 프리셋, 60-180 BPM 조절. 드럼 패턴 연습과 비트 메이킹에 완벽한 도구. 회원가입 불필요!',
    keywords:
      '드럼머신, 온라인 드럼머신, 무료 드럼머신, 비트메이커, 리듬머신, 드럼 연습, 시퀀서, drum machine, beat maker',
  },
  // Transport
  play: '재생',
  pause: '일시정지',
  stop: '정지',
  clear: '초기화',
  tempo: '템포',
  // Instruments
  kick: '킥',
  snare: '스네어',
  hihat: '하이햇',
  openhat: '오픈햇',
  clap: '클랩',
  // UI
  step: '스텝',
  volume: '볼륨',
  presets: '프리셋',
  presetTechno: '테크노',
  presetHouse: '하우스',
  presetTrap: '트랩',
  presetBreakbeat: '브레이크비트',
  presetMinimal: '미니멀',
  // Export/Import
  exportMidi: 'MIDI 내보내기',
  exportSuccess: 'MIDI 파일을 다운로드했습니다',
  importMidi: 'MIDI 가져오기',
  importSuccess: 'MIDI 파일을 불러왔습니다',
  importError: 'MIDI 파일을 읽을 수 없습니다',
  // Loop controls
  loop: '루프',
  loopOf: '{current} / {total}',
  addLoop: '루프 추가',
  removeLoop: '루프 삭제',
  copyLoop: '루프 복사',
  moveLoopLeft: '루프 왼쪽으로 이동',
  moveLoopRight: '루프 오른쪽으로 이동',
  maxLoopsReached: '최대 루프 수에 도달했습니다',
  clearAllLoops: '모든 루프가 초기화됩니다',
  // Status
  loadedPreset: '{preset} 프리셋을 불러왔습니다',
  // Synthesis info
  synthesisInfo:
    '모든 드럼 소리는 Web Audio API로 실시간 합성됩니다. 킥: 주파수 스윕 오실레이터 (150→40Hz), 스네어/클랩: 화이트 노이즈 + 엔벨로프, 하이햇: 고역 필터링된 노이즈',
};

export const drumEn: DrumTranslation = {
  title: 'Drum Machine',
  description: 'Drum pattern practice sequencer',
  seo: {
    title: 'Free Online Drum Machine | Drum Pattern Sequencer',
    description:
      'Free online drum machine. 16-step sequencer, techno/house/trap presets, 60-180 BPM control. Perfect tool for drum pattern practice and beat making. No signup required!',
    keywords:
      'drum machine, online drum machine, free drum machine, beat maker, rhythm machine, drum practice, sequencer, 808, TR-808',
  },
  // Transport
  play: 'Play',
  pause: 'Pause',
  stop: 'Stop',
  clear: 'Clear',
  tempo: 'Tempo',
  // Instruments
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'HiHat',
  openhat: 'OpenHat',
  clap: 'Clap',
  // UI
  step: 'Step',
  volume: 'Volume',
  presets: 'Presets',
  presetTechno: 'Techno',
  presetHouse: 'House',
  presetTrap: 'Trap',
  presetBreakbeat: 'Breakbeat',
  presetMinimal: 'Minimal',
  // Export/Import
  exportMidi: 'Export MIDI',
  exportSuccess: 'MIDI file downloaded',
  importMidi: 'Import MIDI',
  importSuccess: 'MIDI file loaded',
  importError: 'Cannot read MIDI file',
  // Loop controls
  loop: 'Loop',
  loopOf: '{current} / {total}',
  addLoop: 'Add Loop',
  removeLoop: 'Remove Loop',
  copyLoop: 'Copy Loop',
  moveLoopLeft: 'Move loop left',
  moveLoopRight: 'Move loop right',
  maxLoopsReached: 'Maximum loops reached',
  clearAllLoops: 'All loops will be cleared',
  // Status
  loadedPreset: 'Loaded {preset} preset',
  // Synthesis info
  synthesisInfo:
    'All drum sounds are synthesized in real-time using Web Audio API. Kick: frequency sweep oscillator (150→40Hz), Snare/Clap: white noise + envelope, Hi-hat: high-pass filtered noise',
};
