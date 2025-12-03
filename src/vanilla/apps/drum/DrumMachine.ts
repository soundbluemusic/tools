/**
 * Drum Machine Component - Vanilla TypeScript
 * 16-step drum sequencer with Web Audio synthesis
 */
import { Component, html } from '../../../core';
import { languageStore } from '../../../core/Store';
import {
  STEPS,
  INSTRUMENTS,
  TEMPO_RANGE,
  VOLUME_RANGE,
  VELOCITY,
  AUDIO,
  PRESETS,
  DEFAULT_VOLUMES,
  MAX_LOOPS,
  createEmptyPattern,
  copyPattern,
  type Instrument,
  type InstrumentVolumes,
  type Pattern,
} from './constants';

interface DrumMachineProps {
  [key: string]: unknown;
}

interface DrumMachineState {
  [key: string]: unknown;
  loops: Pattern[];
  loopIds: number[];
  currentLoopIndex: number;
  tempo: number;
  volumes: InstrumentVolumes;
  isPlaying: boolean;
  currentStep: number;
  playingLoopIndex: number;
  statusMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
}

const translations = {
  ko: {
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    clear: '초기화',
    tempo: '템포',
    loop: '루프',
    addLoop: '루프 추가',
    removeLoop: '루프 삭제',
    copyLoop: '루프 복사',
    moveLoopLeft: '왼쪽으로 이동',
    moveLoopRight: '오른쪽으로 이동',
    presets: '프리셋',
    presetTechno: '테크노',
    presetHouse: '하우스',
    presetTrap: '트랩',
    presetBreakbeat: '브레이크비트',
    presetMinimal: '미니멀',
    kick: '킥',
    snare: '스네어',
    hihat: '하이햇',
    openhat: '오픈햇',
    clap: '클랩',
    volume: '볼륨',
    step: '스텝',
    synthesisInfo:
      '내장 Web Audio 신시사이저를 사용합니다. 노트 버튼을 클릭하면 토글, 이미 활성화된 노트를 드래그하면 벨로시티를 조절할 수 있습니다.',
    maxLoopsReached: '최대 루프 개수에 도달했습니다.',
    loadedPreset: '{preset} 프리셋을 불러왔습니다.',
    clearAllLoops: '모든 루프가 초기화됩니다.',
  },
  en: {
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    clear: 'Clear',
    tempo: 'Tempo',
    loop: 'Loop',
    addLoop: 'Add Loop',
    removeLoop: 'Remove Loop',
    copyLoop: 'Copy Loop',
    moveLoopLeft: 'Move Left',
    moveLoopRight: 'Move Right',
    presets: 'Presets',
    presetTechno: 'Techno',
    presetHouse: 'House',
    presetTrap: 'Trap',
    presetBreakbeat: 'Breakbeat',
    presetMinimal: 'Minimal',
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'Hi-hat',
    openhat: 'Open Hat',
    clap: 'Clap',
    volume: 'Volume',
    step: 'Step',
    synthesisInfo:
      'Uses built-in Web Audio synthesizer. Click notes to toggle, drag active notes to adjust velocity.',
    maxLoopsReached: 'Maximum number of loops reached.',
    loadedPreset: 'Loaded {preset} preset.',
    clearAllLoops: 'All loops will be cleared.',
  },
};

export class DrumMachine extends Component<DrumMachineProps, DrumMachineState> {
  private audioContext: AudioContext | null = null;
  private schedulerFrame: number | null = null;
  private nextStepTime = 0;
  private schedulerStep = 0;
  private schedulerLoop = 0;
  private noiseBufferCache: Map<string, AudioBuffer> = new Map();
  private languageUnsubscribe: (() => void) | null = null;
  private statusTimeout: number | null = null;
  private nextLoopId = 2;
  private isDragging = false;
  private paintMode: boolean | null = null;
  private velocityDrag: {
    inst: Instrument;
    step: number;
    startY: number;
    startVelocity: number;
    hasMoved: boolean;
  } | null = null;

  protected getInitialState(): DrumMachineState {
    return {
      loops: [createEmptyPattern()],
      loopIds: [1],
      currentLoopIndex: 0,
      tempo: TEMPO_RANGE.DEFAULT,
      volumes: { ...DEFAULT_VOLUMES },
      isPlaying: false,
      currentStep: 0,
      playingLoopIndex: 0,
      statusMessage: null,
    };
  }

  private getT() {
    const lang = languageStore.getState().language;
    return translations[lang];
  }

  private getInstrumentLabel(inst: Instrument): string {
    const t = this.getT();
    const labels: Record<Instrument, string> = {
      kick: t.kick,
      snare: t.snare,
      hihat: t.hihat,
      openhat: t.openhat,
      clap: t.clap,
    };
    return labels[inst];
  }

  private getPresetLabel(preset: string): string {
    const t = this.getT();
    const labels: Record<string, string> = {
      techno: t.presetTechno,
      house: t.presetHouse,
      trap: t.presetTrap,
      breakbeat: t.presetBreakbeat,
      minimal: t.presetMinimal,
    };
    return labels[preset] || preset;
  }

  protected render(): string {
    const t = this.getT();
    const {
      loops,
      loopIds,
      currentLoopIndex,
      tempo,
      volumes,
      isPlaying,
      currentStep,
      playingLoopIndex,
      statusMessage,
    } = this.state;

    const displayLoopIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
    const pattern = loops[displayLoopIndex];

    return html`
      <div class="flex flex-col gap-8 md:gap-6 sm:gap-5 py-2 sm:py-1">
        <!-- Transport Controls -->
        <div
          class="flex flex-wrap items-center justify-between gap-4 md:flex-col md:items-stretch"
        >
          <div class="flex gap-2 md:justify-center sm:flex-wrap">
            <button
              id="play-btn"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px] ${isPlaying
                ? 'bg-accent-primary border-accent-primary text-text-inverse hover:bg-accent-hover hover:border-accent-hover'
                : ''}"
            >
              ${isPlaying ? this.renderPauseIcon() : this.renderPlayIcon()}
              <span>${isPlaying ? t.pause : t.play}</span>
            </button>
            <button
              id="stop-btn"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]"
            >
              ${this.renderStopIcon()}
              <span>${t.stop}</span>
            </button>
            <button
              id="clear-btn"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]"
            >
              ${this.renderClearIcon()}
              <span>${t.clear}</span>
            </button>
          </div>

          <div
            class="flex items-center gap-3 md:justify-center sm:flex-wrap sm:gap-2"
          >
            <span
              class="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap"
            >
              ${t.tempo}
            </span>
            <input
              type="range"
              id="tempo-slider"
              class="w-[120px] sm:w-[100px] h-1 bg-border-primary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
              min="${TEMPO_RANGE.MIN}"
              max="${TEMPO_RANGE.MAX}"
              value="${tempo}"
            />
            <span
              class="font-mono text-sm text-text-primary min-w-[70px] text-right"
            >
              ${tempo} BPM
              <span class="ml-2 text-text-tertiary text-xs">
                ${loops.length > 1 ? `x${loops.length} ` : ''}(${(
                  (240 / tempo) *
                  loops.length
                ).toFixed(1)}s)
              </span>
            </span>
          </div>
        </div>

        <!-- Loop Controls -->
        <div
          class="flex items-center gap-4 px-4 py-3 bg-bg-tertiary border border-border-primary rounded-md flex-wrap md:justify-center sm:flex-col sm:items-stretch sm:gap-3 sm:p-3"
        >
          <div
            class="flex items-center gap-3 flex-1 min-w-0 sm:w-full sm:justify-start"
          >
            <span
              class="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap"
            >
              ${t.loop}
            </span>
            <div
              class="flex items-center gap-2 flex-1 min-w-0 flex-wrap sm:gap-1 sm:justify-start"
              id="loop-buttons"
            >
              ${loops
                .map(
                  (_, index) => html`
                    <button
                      data-loop-index="${index}"
                      class="inline-flex items-center justify-center w-8 h-8 font-mono text-sm font-medium text-text-secondary bg-bg-secondary border-2 border-border-primary rounded-md cursor-pointer transition-all duration-150 select-none hover:border-border-hover hover:scale-105 md:w-7 md:h-7 md:text-xs sm:text-[0.7rem] ${index ===
                      currentLoopIndex
                        ? 'text-text-primary border-accent-primary bg-bg-tertiary'
                        : ''} ${isPlaying && index === playingLoopIndex
                        ? 'bg-accent-primary border-accent-primary text-text-inverse'
                        : ''}"
                    >
                      ${loopIds[index]}
                    </button>
                  `
                )
                .join('')}
            </div>
          </div>
          <div class="flex gap-2 sm:w-full sm:justify-center">
            <button
              id="move-left-btn"
              class="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
              ${currentLoopIndex <= 0 ? 'disabled' : ''}
              title="${t.moveLoopLeft}"
            >
              ${this.renderChevronLeftIcon()}
            </button>
            <button
              id="move-right-btn"
              class="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
              ${currentLoopIndex >= loops.length - 1 ? 'disabled' : ''}
              title="${t.moveLoopRight}"
            >
              ${this.renderChevronRightIcon()}
            </button>
            <button
              id="add-loop-btn"
              class="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
              ${loops.length >= MAX_LOOPS ? 'disabled' : ''}
              title="${t.addLoop}"
            >
              ${this.renderPlusIcon()}
            </button>
            <button
              id="copy-loop-btn"
              class="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
              ${loops.length >= MAX_LOOPS ? 'disabled' : ''}
              title="${t.copyLoop}"
            >
              ${this.renderCopyIcon()}
            </button>
            <button
              id="remove-loop-btn"
              class="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
              ${loops.length <= 1 ? 'disabled' : ''}
              title="${t.removeLoop}"
            >
              ${this.renderMinusIcon()}
            </button>
          </div>
        </div>

        <!-- Sequencer Grid -->
        <div
          id="sequencer-grid"
          class="bg-bg-tertiary border border-border-primary rounded-lg p-4 touch-none select-none sm:p-3 xs:p-2"
        >
          ${INSTRUMENTS.map(
            (inst) => html`
              <div
                class="grid grid-cols-[90px_1fr] md:grid-cols-[80px_1fr] sm:grid-cols-[60px_1fr] xs:grid-cols-[45px_1fr] gap-3 md:gap-3 sm:gap-2 items-center py-2 sm:py-1 first:pt-0 last:pb-0"
              >
                <div class="flex flex-col gap-1">
                  <div
                    class="text-xs uppercase tracking-wide text-text-secondary whitespace-nowrap sm:text-[0.625rem]"
                  >
                    ${this.getInstrumentLabel(inst)}
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      type="range"
                      data-volume-inst="${inst}"
                      class="w-[50px] md:w-[40px] sm:w-[35px] xs:w-[28px] h-[3px] bg-border-primary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                      min="${VOLUME_RANGE.MIN}"
                      max="${VOLUME_RANGE.MAX}"
                      value="${volumes[inst]}"
                    />
                  </div>
                </div>
                <div
                  class="flex gap-1 flex-1 min-w-0 [&>:nth-child(5)]:ml-1.5 [&>:nth-child(9)]:ml-1.5 [&>:nth-child(13)]:ml-1.5 sm:gap-[3px] sm:[&>:nth-child(5)]:ml-1 sm:[&>:nth-child(9)]:ml-1 sm:[&>:nth-child(13)]:ml-1 xs:gap-[2px] xs:[&>:nth-child(5)]:ml-[3px] xs:[&>:nth-child(9)]:ml-[3px] xs:[&>:nth-child(13)]:ml-[3px]"
                >
                  ${Array.from({ length: STEPS })
                    .map((_, step) => {
                      const velocity = pattern[inst][step];
                      const isActive = velocity > 0;
                      const opacity = isActive
                        ? 0.3 + (velocity / VELOCITY.MAX) * 0.7
                        : 1;
                      const isCurrentStep = isPlaying && currentStep === step;
                      return html`
                        <button
                          class="drum-step flex-1 min-w-0 aspect-square max-w-[32px] md:max-w-[28px] sm:max-w-[24px] xs:max-w-[18px] border-[1.5px] rounded-md cursor-pointer transition-all duration-150 hover:border-accent-primary hover:scale-105 sm:rounded-sm ${isActive
                            ? 'bg-accent-primary border-accent-primary'
                            : 'bg-bg-secondary border-border-primary'} ${isCurrentStep
                            ? 'shadow-[0_0_0_2px_var(--color-bg-tertiary),0_0_0_4px_var(--color-accent-primary)] scale-[1.08]'
                            : ''} ${isActive && isCurrentStep
                            ? 'bg-accent-hover border-accent-hover'
                            : ''}"
                          style="${isActive ? `opacity: ${opacity}` : ''}"
                          data-instrument="${inst}"
                          data-step="${step}"
                        ></button>
                      `;
                    })
                    .join('')}
                </div>
              </div>
            `
          ).join('')}
        </div>

        <!-- Presets -->
        <div class="flex flex-wrap items-center gap-3 sm:gap-2">
          <span class="text-text-tertiary text-xs uppercase tracking-wide">
            ${t.presets}
          </span>
          <div class="flex flex-wrap gap-2">
            ${Object.keys(PRESETS)
              .map(
                (preset) => html`
                  <button
                    data-preset="${preset}"
                    class="px-4 py-2 min-h-[36px] text-xs font-medium uppercase tracking-wide text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:text-[0.625rem] sm:min-h-[32px]"
                  >
                    ${this.getPresetLabel(preset)}
                  </button>
                `
              )
              .join('')}
          </div>
        </div>

        <!-- Synthesis Info -->
        <div
          class="px-4 py-3 bg-bg-tertiary border border-border-primary rounded-md text-xs text-text-tertiary leading-relaxed"
        >
          ${t.synthesisInfo}
        </div>

        <!-- Status Message -->
        ${statusMessage
          ? html`
              <div
                id="status-message"
                class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border-primary rounded-md px-4 py-2 text-sm text-text-primary shadow-lg z-[700] ${statusMessage.type ===
                'success'
                  ? 'border-success-border text-success'
                  : ''} ${statusMessage.type === 'error'
                  ? 'border-error-border text-error'
                  : ''}"
              >
                ${statusMessage.text}
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Icon render methods
  private renderPlayIcon(): string {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  }

  private renderPauseIcon(): string {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  }

  private renderStopIcon(): string {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';
  }

  private renderClearIcon(): string {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>';
  }

  private renderPlusIcon(): string {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  }

  private renderMinusIcon(): string {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  }

  private renderCopyIcon(): string {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  }

  private renderChevronLeftIcon(): string {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  }

  private renderChevronRightIcon(): string {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  }

  protected bindEvents(): void {
    // Setup event listeners (called after each render)
    this.setupEventListeners();
  }

  protected onMount(): void {
    this.languageUnsubscribe = languageStore.subscribe(() => {
      this.update();
    });

    this.initAudioContext();
    this.setupGlobalListeners();
  }

  protected onDestroy(): void {
    this.stop();
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
      this.languageUnsubscribe = null;
    }
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.noiseBufferCache.clear();
    this.removeGlobalListeners();
  }

  private initAudioContext(): void {
    const AudioContextClass =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass();
    }
  }

  private setupEventListeners(): void {
    // Play button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      this.addEventListener(playBtn, 'click', () => this.togglePlay());
    }

    // Stop button
    const stopBtn = document.getElementById('stop-btn');
    if (stopBtn) {
      this.addEventListener(stopBtn, 'click', () => this.stop());
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', () => this.clear());
    }

    // Tempo slider
    const tempoSlider = document.getElementById(
      'tempo-slider'
    ) as HTMLInputElement;
    if (tempoSlider) {
      this.addEventListener(tempoSlider, 'input', (e: Event) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.setState({ tempo: value });
      });
    }

    // Loop buttons
    const loopButtons = document.getElementById('loop-buttons');
    if (loopButtons) {
      this.addEventListener(loopButtons, 'click', (e: Event) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('[data-loop-index]') as HTMLElement;
        if (btn) {
          const index = parseInt(btn.dataset.loopIndex || '0');
          this.setState({ currentLoopIndex: index });
        }
      });
    }

    // Loop control buttons
    const addLoopBtn = document.getElementById('add-loop-btn');
    if (addLoopBtn) {
      this.addEventListener(addLoopBtn, 'click', () => this.addLoop());
    }

    const copyLoopBtn = document.getElementById('copy-loop-btn');
    if (copyLoopBtn) {
      this.addEventListener(copyLoopBtn, 'click', () => this.copyCurrentLoop());
    }

    const removeLoopBtn = document.getElementById('remove-loop-btn');
    if (removeLoopBtn) {
      this.addEventListener(removeLoopBtn, 'click', () =>
        this.removeCurrentLoop()
      );
    }

    const moveLeftBtn = document.getElementById('move-left-btn');
    if (moveLeftBtn) {
      this.addEventListener(moveLeftBtn, 'click', () => this.moveLoopLeft());
    }

    const moveRightBtn = document.getElementById('move-right-btn');
    if (moveRightBtn) {
      this.addEventListener(moveRightBtn, 'click', () => this.moveLoopRight());
    }

    // Sequencer grid
    const grid = document.getElementById('sequencer-grid');
    if (grid) {
      this.addEventListener(grid, 'mousedown', (e: Event) => {
        const me = e as MouseEvent;
        const target = me.target as HTMLElement;
        if (target.classList.contains('drum-step')) {
          me.preventDefault();
          const inst = target.dataset.instrument as Instrument;
          const step = parseInt(target.dataset.step || '0');
          this.handleStepMouseDown(inst, step, me.clientY);
        }
      });

      this.addEventListener(
        grid,
        'mouseenter',
        (e: Event) => {
          const target = (e as MouseEvent).target as HTMLElement;
          if (
            target.classList.contains('drum-step') &&
            this.isDragging &&
            this.paintMode
          ) {
            const inst = target.dataset.instrument as Instrument;
            const step = parseInt(target.dataset.step || '0');
            this.setStepVelocity(inst, step, VELOCITY.DEFAULT);
          }
        },
        { capture: true }
      );

      // Volume sliders
      this.addEventListener(grid, 'input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.dataset.volumeInst) {
          const inst = target.dataset.volumeInst as Instrument;
          const value = parseInt(target.value);
          this.setState({
            volumes: { ...this.state.volumes, [inst]: value },
          });
        }
      });
    }

    // Preset buttons
    this.addEventListener(this.element!, 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      const presetBtn = target.closest('[data-preset]') as HTMLElement;
      if (presetBtn) {
        const preset = presetBtn.dataset.preset as string;
        this.loadPreset(preset);
      }
    });
  }

  private globalMouseMoveHandler = (e: MouseEvent) => {
    if (!this.velocityDrag) return;
    const { inst, step, startY, startVelocity } = this.velocityDrag;
    const deltaY = e.clientY - startY;
    if (Math.abs(deltaY) > 3) {
      this.velocityDrag.hasMoved = true;
      const velocityChange = Math.round(-deltaY);
      const newVelocity = Math.max(
        VELOCITY.OFF,
        Math.min(VELOCITY.MAX, startVelocity + velocityChange)
      );
      this.setStepVelocity(inst, step, newVelocity);
    }
  };

  private globalMouseUpHandler = () => {
    if (this.velocityDrag && !this.velocityDrag.hasMoved) {
      const { inst, step } = this.velocityDrag;
      this.setStepVelocity(inst, step, VELOCITY.OFF);
    }
    this.isDragging = false;
    this.paintMode = null;
    this.velocityDrag = null;
  };

  private setupGlobalListeners(): void {
    window.addEventListener('mousemove', this.globalMouseMoveHandler);
    window.addEventListener('mouseup', this.globalMouseUpHandler);
  }

  private removeGlobalListeners(): void {
    window.removeEventListener('mousemove', this.globalMouseMoveHandler);
    window.removeEventListener('mouseup', this.globalMouseUpHandler);
  }

  private handleStepMouseDown(
    inst: Instrument,
    step: number,
    clientY: number
  ): void {
    const { loops, currentLoopIndex, playingLoopIndex, isPlaying } = this.state;
    const displayIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
    const currentValue = loops[displayIndex][inst][step];

    if (currentValue > 0) {
      this.velocityDrag = {
        inst,
        step,
        startY: clientY,
        startVelocity: currentValue,
        hasMoved: false,
      };
      this.isDragging = false;
      this.paintMode = null;
    } else {
      this.isDragging = true;
      this.paintMode = true;
      this.velocityDrag = null;
      this.setStepVelocity(inst, step, VELOCITY.DEFAULT);
    }
  }

  private setStepVelocity(
    inst: Instrument,
    step: number,
    velocity: number
  ): void {
    const { loops, currentLoopIndex, playingLoopIndex, isPlaying } = this.state;
    const targetIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
    const newLoops = [...loops];
    const newPattern = { ...newLoops[targetIndex] };
    newPattern[inst] = [...newPattern[inst]];
    newPattern[inst][step] = velocity;
    newLoops[targetIndex] = newPattern;
    this.setState({ loops: newLoops });
  }

  private togglePlay(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private play(): void {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.nextStepTime = this.audioContext.currentTime;
    this.schedulerStep = this.state.currentStep;
    this.schedulerLoop = this.state.playingLoopIndex;
    this.setState({ isPlaying: true });
    this.scheduler();
  }

  private pause(): void {
    this.setState({ isPlaying: false });
    if (this.schedulerFrame) {
      cancelAnimationFrame(this.schedulerFrame);
      this.schedulerFrame = null;
    }
  }

  private stop(): void {
    this.setState({
      isPlaying: false,
      currentStep: 0,
      playingLoopIndex: 0,
    });
    this.schedulerStep = 0;
    this.schedulerLoop = 0;
    if (this.schedulerFrame) {
      cancelAnimationFrame(this.schedulerFrame);
      this.schedulerFrame = null;
    }
  }

  private clear(): void {
    const t = this.getT();
    if (this.state.loops.length > 1) {
      this.showStatus(t.clearAllLoops, 'info');
    }
    this.setState({
      loops: [createEmptyPattern()],
      loopIds: [1],
      currentLoopIndex: 0,
      playingLoopIndex: 0,
    });
    this.nextLoopId = 2;
    this.schedulerLoop = 0;
  }

  private scheduler = (): void => {
    if (!this.audioContext || !this.state.isPlaying) return;

    const scheduleAheadTime = 0.1;
    const stepDuration = 60 / this.state.tempo / 4;

    while (
      this.nextStepTime <
      this.audioContext.currentTime + scheduleAheadTime
    ) {
      this.scheduleStep(
        this.schedulerStep,
        this.schedulerLoop,
        this.nextStepTime
      );

      const stepToShow = this.schedulerStep;
      const loopToShow = this.schedulerLoop;
      const timeUntilStep =
        (this.nextStepTime - this.audioContext.currentTime) * 1000;

      setTimeout(
        () => {
          if (this.state.isPlaying) {
            this.setState({
              currentStep: stepToShow,
              playingLoopIndex: loopToShow,
            });
          }
        },
        Math.max(0, timeUntilStep)
      );

      this.schedulerStep++;
      if (this.schedulerStep >= STEPS) {
        this.schedulerStep = 0;
        this.schedulerLoop = (this.schedulerLoop + 1) % this.state.loops.length;
      }

      this.nextStepTime += stepDuration;
    }

    this.schedulerFrame = requestAnimationFrame(this.scheduler);
  };

  private scheduleStep(
    stepIndex: number,
    loopIndex: number,
    time: number
  ): void {
    const pattern = this.state.loops[loopIndex];
    if (!pattern) return;

    INSTRUMENTS.forEach((inst) => {
      const velocity = pattern[inst][stepIndex];
      if (velocity > 0) {
        this.playSound(inst, time, velocity);
      }
    });
  }

  private getNoiseBuffer(duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context');

    const key = `noise-${duration}`;
    const cached = this.noiseBufferCache.get(key);
    if (cached && cached.sampleRate === this.audioContext.sampleRate) {
      return cached;
    }

    const buffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * duration,
      this.audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBufferCache.set(key, buffer);
    return buffer;
  }

  private playSound(inst: Instrument, time: number, velocity: number): void {
    const ctx = this.audioContext;
    if (!ctx || velocity <= 0) return;

    const volumeMultiplier =
      (this.state.volumes[inst] / 100) * (velocity / 100);

    switch (inst) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(AUDIO.KICK.FREQUENCY_START, time);
        osc.frequency.exponentialRampToValueAtTime(
          AUDIO.KICK.FREQUENCY_END,
          time + AUDIO.KICK.DURATION
        );
        gain.gain.setValueAtTime(AUDIO.KICK.GAIN * volumeMultiplier, time);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          time + AUDIO.KICK.DURATION
        );
        osc.start(time);
        osc.stop(time + AUDIO.KICK.DURATION);
        break;
      }
      case 'snare': {
        const buffer = this.getNoiseBuffer(AUDIO.SNARE.DURATION);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(AUDIO.SNARE.GAIN * volumeMultiplier, time);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          time + AUDIO.SNARE.DURATION
        );
        source.start(time);
        break;
      }
      case 'hihat':
      case 'openhat': {
        const isOpen = inst === 'openhat';
        const duration = isOpen ? AUDIO.OPENHAT.DURATION : AUDIO.HIHAT.DURATION;
        const buffer = this.getNoiseBuffer(duration);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = isOpen
          ? AUDIO.OPENHAT.FILTER_FREQUENCY
          : AUDIO.HIHAT.FILTER_FREQUENCY;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(
          (isOpen ? AUDIO.OPENHAT.GAIN : AUDIO.HIHAT.GAIN) * volumeMultiplier,
          time
        );
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        source.start(time);
        break;
      }
      case 'clap': {
        const buffer = this.getNoiseBuffer(AUDIO.CLAP.DURATION);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(AUDIO.CLAP.GAIN * volumeMultiplier, time);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          time + AUDIO.CLAP.DURATION
        );
        source.start(time);
        break;
      }
    }
  }

  private loadPreset(presetName: string): void {
    const preset = PRESETS[presetName];
    if (!preset) return;

    const t = this.getT();
    const { loops, currentLoopIndex } = this.state;
    const newLoops = [...loops];
    newLoops[currentLoopIndex] = copyPattern(preset);
    this.setState({ loops: newLoops });
    this.showStatus(
      t.loadedPreset.replace('{preset}', this.getPresetLabel(presetName)),
      'success'
    );
  }

  private addLoop(): void {
    const t = this.getT();
    if (this.state.loops.length >= MAX_LOOPS) {
      this.showStatus(t.maxLoopsReached, 'error');
      return;
    }
    this.setState({
      loops: [...this.state.loops, createEmptyPattern()],
      loopIds: [...this.state.loopIds, this.nextLoopId],
      currentLoopIndex: this.state.loops.length,
    });
    this.nextLoopId++;
  }

  private copyCurrentLoop(): void {
    const t = this.getT();
    if (this.state.loops.length >= MAX_LOOPS) {
      this.showStatus(t.maxLoopsReached, 'error');
      return;
    }
    const { loops, currentLoopIndex, loopIds } = this.state;
    this.setState({
      loops: [...loops, copyPattern(loops[currentLoopIndex])],
      loopIds: [...loopIds, this.nextLoopId],
      currentLoopIndex: loops.length,
    });
    this.nextLoopId++;
  }

  private removeCurrentLoop(): void {
    const { loops, loopIds, currentLoopIndex } = this.state;
    if (loops.length <= 1) return;
    this.setState({
      loops: loops.filter((_, i) => i !== currentLoopIndex),
      loopIds: loopIds.filter((_, i) => i !== currentLoopIndex),
      currentLoopIndex: currentLoopIndex > 0 ? currentLoopIndex - 1 : 0,
    });
  }

  private moveLoopLeft(): void {
    const { loops, loopIds, currentLoopIndex } = this.state;
    if (currentLoopIndex <= 0) return;

    const newLoops = [...loops];
    const newLoopIds = [...loopIds];
    [newLoops[currentLoopIndex - 1], newLoops[currentLoopIndex]] = [
      newLoops[currentLoopIndex],
      newLoops[currentLoopIndex - 1],
    ];
    [newLoopIds[currentLoopIndex - 1], newLoopIds[currentLoopIndex]] = [
      newLoopIds[currentLoopIndex],
      newLoopIds[currentLoopIndex - 1],
    ];

    this.setState({
      loops: newLoops,
      loopIds: newLoopIds,
      currentLoopIndex: currentLoopIndex - 1,
    });
  }

  private moveLoopRight(): void {
    const { loops, loopIds, currentLoopIndex } = this.state;
    if (currentLoopIndex >= loops.length - 1) return;

    const newLoops = [...loops];
    const newLoopIds = [...loopIds];
    [newLoops[currentLoopIndex], newLoops[currentLoopIndex + 1]] = [
      newLoops[currentLoopIndex + 1],
      newLoops[currentLoopIndex],
    ];
    [newLoopIds[currentLoopIndex], newLoopIds[currentLoopIndex + 1]] = [
      newLoopIds[currentLoopIndex + 1],
      newLoopIds[currentLoopIndex],
    ];

    this.setState({
      loops: newLoops,
      loopIds: newLoopIds,
      currentLoopIndex: currentLoopIndex + 1,
    });
  }

  private showStatus(text: string, type: 'success' | 'error' | 'info'): void {
    // Clear any existing status timeout
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
    this.setState({ statusMessage: { text, type } });
    this.statusTimeout = window.setTimeout(() => {
      this.statusTimeout = null;
      this.setState({ statusMessage: null });
    }, 3000);
  }
}
