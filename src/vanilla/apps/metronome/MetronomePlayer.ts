/**
 * Metronome Player Component - Vanilla TypeScript
 * Accurate BPM timing with Web Audio API
 */
import { Component, html } from '../../../core';
import { languageStore } from '../../../core/Store';
import {
  DEFAULTS,
  BPM_RANGE,
  VOLUME_RANGE,
  FREQUENCIES,
  TIMING,
  PENDULUM,
} from './constants';

interface MetronomeProps {
  [key: string]: unknown;
}

interface MetronomeState {
  [key: string]: unknown;
  bpm: number;
  volume: number;
  beatsPerMeasure: number;
  beatUnit: number;
  isPlaying: boolean;
  beat: number;
  measureCount: number;
  pendulumAngle: number;
  timerMinutes: string;
  timerSeconds: string;
  countdownTime: number;
  countdownElapsed: number;
  elapsedTime: number;
}

const translations = {
  ko: {
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
    perfectSync: '완벽 동기화',
    syncDescription:
      '완벽한 BPM-시간 동기화 | 60 BPM = 정확히 1초 | 120 BPM = 정확히 0.5초',
    precision: '±0.01s',
  },
  en: {
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
    perfectSync: 'Perfect Sync',
    syncDescription:
      'Perfect BPM-Time Sync | 60 BPM = exactly 1s | 120 BPM = exactly 0.5s',
    precision: '±0.01s',
  },
};

export class MetronomePlayer extends Component<MetronomeProps, MetronomeState> {
  private audioContext: AudioContext | null = null;
  private nextNoteTime = 0;
  private schedulerBeat = 0;
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private animationFrame: number | null = null;
  private startAudioTime = 0;
  private languageUnsubscribe: (() => void) | null = null;

  protected getInitialState(): MetronomeState {
    return {
      bpm: DEFAULTS.BPM,
      volume: DEFAULTS.VOLUME,
      beatsPerMeasure: DEFAULTS.BEATS_PER_MEASURE,
      beatUnit: DEFAULTS.BEAT_UNIT,
      isPlaying: false,
      beat: 0,
      measureCount: 0,
      pendulumAngle: 0,
      timerMinutes: '',
      timerSeconds: '',
      countdownTime: 0,
      countdownElapsed: 0,
      elapsedTime: 0,
    };
  }

  private getT() {
    const lang = languageStore.getState().language;
    return translations[lang];
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  private renderNoteIcon(
    unit: number,
    isActive: boolean,
    isFirstBeat: boolean
  ): string {
    const size = isActive ? (isFirstBeat ? 28 : 24) : 16;
    const color = isActive
      ? isFirstBeat
        ? 'var(--color-error)'
        : 'var(--color-text-primary)'
      : 'var(--color-text-tertiary)';

    // Half note (2)
    if (unit === 2) {
      return html`
        <svg
          width="${size}"
          height="${size * 1.4}"
          viewBox="0 0 24 34"
          fill="none"
          class="block"
        >
          <ellipse
            cx="12"
            cy="24"
            rx="7"
            ry="5"
            fill="var(--color-bg-tertiary)"
            stroke="${color}"
            stroke-width="2"
          />
          <line
            x1="19"
            y1="24"
            x2="19"
            y2="4"
            stroke="${color}"
            stroke-width="2"
          />
        </svg>
      `;
    }
    // Quarter note (4)
    if (unit === 4) {
      return html`
        <svg
          width="${size}"
          height="${size * 1.4}"
          viewBox="0 0 24 34"
          fill="none"
          class="block"
        >
          <ellipse cx="12" cy="24" rx="7" ry="5" fill="${color}" />
          <line
            x1="19"
            y1="24"
            x2="19"
            y2="4"
            stroke="${color}"
            stroke-width="2"
          />
        </svg>
      `;
    }
    // Eighth note (8)
    if (unit === 8) {
      return html`
        <svg
          width="${size}"
          height="${size * 1.4}"
          viewBox="0 0 24 34"
          fill="none"
          class="block"
        >
          <ellipse cx="12" cy="24" rx="7" ry="5" fill="${color}" />
          <line
            x1="19"
            y1="24"
            x2="19"
            y2="4"
            stroke="${color}"
            stroke-width="2"
          />
          <path d="M19 4 L19 10 L24 8 L24 2 Z" fill="${color}" />
        </svg>
      `;
    }
    // Sixteenth note (16)
    if (unit === 16) {
      return html`
        <svg
          width="${size}"
          height="${size * 1.4}"
          viewBox="0 0 24 34"
          fill="none"
          class="block"
        >
          <ellipse cx="12" cy="24" rx="7" ry="5" fill="${color}" />
          <line
            x1="19"
            y1="24"
            x2="19"
            y2="4"
            stroke="${color}"
            stroke-width="2"
          />
          <path d="M19 4 L19 10 L24 8 L24 2 Z" fill="${color}" />
          <path d="M19 8 L19 14 L24 12 L24 6 Z" fill="${color}" />
        </svg>
      `;
    }

    return '';
  }

  protected render(): string {
    const t = this.getT();
    const {
      bpm,
      volume,
      beatsPerMeasure,
      beatUnit,
      isPlaying,
      beat,
      measureCount,
      pendulumAngle,
      timerMinutes,
      timerSeconds,
      countdownTime,
      countdownElapsed,
      elapsedTime,
    } = this.state;

    const currentCountdown =
      countdownTime > 0 ? Math.max(0, countdownTime - countdownElapsed) : 0;

    const beatIcons = [];
    for (let i = 0; i < beatsPerMeasure; i++) {
      beatIcons.push(html`
        <div
          class="flex items-center justify-center w-8 h-14 flex-shrink-0 max-sm:w-5 max-sm:h-8 max-xs:w-4 max-xs:h-7"
        >
          ${this.renderNoteIcon(beatUnit, isPlaying && i === beat, i === 0)}
        </div>
      `);
    }

    return html`
      <div class="flex flex-col gap-6">
        <!-- Top controls -->
        <div
          class="flex flex-wrap gap-4 justify-between max-sm:flex-col max-sm:gap-3"
        >
          <!-- Time signature -->
          <div
            class="flex items-center gap-2 bg-bg-tertiary p-3 px-4 rounded-lg max-sm:w-full max-sm:justify-between max-sm:p-3 max-xs:p-2"
          >
            <span
              class="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap max-xs:text-[0.625rem]"
            >
              ${t.timeSignature}
            </span>
            <input
              type="number"
              id="beats-input"
              min="1"
              max="12"
              value="${beatsPerMeasure}"
              class="w-10 p-1 px-2 text-base font-medium text-center bg-transparent border-none text-text-primary outline-none disabled:opacity-50 max-sm:w-10 max-xs:text-sm"
              ${isPlaying ? 'disabled' : ''}
            />
            <span class="text-text-primary text-lg font-medium">/</span>
            <select
              id="beat-unit-select"
              class="w-10 p-1 text-base font-medium text-center bg-transparent border-none text-text-primary cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              ${isPlaying ? 'disabled' : ''}
            >
              <option value="2" ${beatUnit === 2 ? 'selected' : ''}>2</option>
              <option value="4" ${beatUnit === 4 ? 'selected' : ''}>4</option>
              <option value="8" ${beatUnit === 8 ? 'selected' : ''}>8</option>
              <option value="16" ${beatUnit === 16 ? 'selected' : ''}>
                16
              </option>
            </select>
          </div>

          <!-- Timer -->
          <div
            class="flex items-center gap-2 bg-bg-tertiary p-3 px-4 rounded-lg max-sm:w-full max-sm:justify-between max-sm:p-3 max-xs:p-2"
          >
            <span
              class="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap max-xs:text-[0.625rem]"
            >
              ${t.timer}
            </span>
            <input
              type="number"
              id="timer-minutes"
              min="0"
              max="99"
              value="${timerMinutes}"
              placeholder="0"
              class="w-10 p-1 px-2 text-base font-medium text-center bg-transparent border-none text-text-primary outline-none disabled:opacity-50 max-sm:w-10 max-xs:text-sm"
              ${isPlaying || elapsedTime > 0 ? 'disabled' : ''}
            />
            <span class="text-text-tertiary text-xs whitespace-nowrap"
              >${t.minutes}</span
            >
            <input
              type="number"
              id="timer-seconds"
              min="0"
              max="59"
              value="${timerSeconds}"
              placeholder="0"
              class="w-10 p-1 px-2 text-base font-medium text-center bg-transparent border-none text-text-primary outline-none disabled:opacity-50 max-sm:w-10 max-xs:text-sm"
              ${isPlaying || elapsedTime > 0 ? 'disabled' : ''}
            />
            <span class="text-text-tertiary text-xs whitespace-nowrap"
              >${t.seconds}</span
            >
            <span class="w-px h-6 bg-border-secondary mx-2"></span>
            <div class="flex flex-col items-center min-w-[4.5rem]">
              <span
                class="text-text-tertiary text-[0.625rem] uppercase tracking-wide whitespace-nowrap"
              >
                ${t.countdown}
              </span>
              <span
                class="font-mono text-sm font-bold tabular-nums ${countdownTime >
                0
                  ? 'text-text-primary'
                  : 'text-text-tertiary'}"
              >
                ${this.formatTime(currentCountdown)}
              </span>
            </div>
          </div>
        </div>

        <!-- Main display -->
        <div
          class="grid grid-cols-[1fr_auto_1fr] gap-6 items-end max-md:gap-4 max-sm:grid-cols-[1fr_1fr_1fr] max-sm:gap-2 max-sm:items-center"
        >
          <!-- BPM display -->
          <div
            class="text-center first:text-left last:text-right max-sm:first:text-center max-sm:last:text-center"
          >
            <div
              class="text-text-tertiary text-xs uppercase tracking-wide mb-2 max-sm:text-[0.625rem]"
            >
              ${t.bpm}
            </div>
            <div
              class="text-[clamp(2.5rem,8vw,4.5rem)] font-extralight text-text-primary tracking-tight leading-none max-md:text-[clamp(2rem,7vw,3.5rem)] max-sm:text-[1.75rem] max-xs:text-[1.5rem]"
            >
              ${bpm}
            </div>
          </div>

          <!-- Pendulum -->
          <div
            class="w-28 h-32 max-md:w-[5.5rem] max-md:h-[6.5rem] max-sm:w-14 max-sm:h-[4.5rem] max-xs:w-12 max-xs:h-16"
          >
            <svg viewBox="0 0 100 120" class="w-full h-full">
              <rect
                x="15"
                y="112"
                width="70"
                height="4"
                rx="2"
                fill="var(--color-border-secondary)"
              />
              <path
                d="M 50 22 L 22 112 L 78 112 Z"
                fill="var(--color-bg-tertiary)"
                stroke="var(--color-border-secondary)"
                stroke-width="1.5"
              />
              <g
                id="pendulum-arm"
                style="transform-origin: 50px 108px; transform: rotate(${pendulumAngle}deg); will-change: transform; backface-visibility: hidden;"
              >
                <line
                  x1="50"
                  y1="28"
                  x2="50"
                  y2="108"
                  stroke="var(--color-text-primary)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle
                  cx="50"
                  cy="55"
                  r="4"
                  fill="var(--color-text-primary)"
                />
              </g>
              <circle
                cx="50"
                cy="108"
                r="2.5"
                fill="var(--color-text-tertiary)"
              />
            </svg>
          </div>

          <!-- Volume display -->
          <div
            class="text-center first:text-left last:text-right max-sm:first:text-center max-sm:last:text-center"
          >
            <div
              class="text-text-tertiary text-xs uppercase tracking-wide mb-2 max-sm:text-[0.625rem]"
            >
              ${t.volume}
            </div>
            <div
              class="text-[clamp(2.5rem,8vw,4.5rem)] font-extralight text-text-primary tracking-tight leading-none max-md:text-[clamp(2rem,7vw,3.5rem)] max-sm:text-[1.75rem] max-xs:text-[1.5rem]"
            >
              ${volume}
            </div>
          </div>
        </div>

        <!-- Sliders -->
        <div class="flex flex-col gap-6 max-sm:gap-4">
          <div class="flex flex-col gap-2">
            <input
              type="range"
              id="bpm-slider"
              min="${BPM_RANGE.MIN}"
              max="${BPM_RANGE.MAX}"
              value="${bpm}"
              class="w-full h-1 bg-border-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-fast [&::-webkit-slider-thumb:hover]:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
            />
            <div
              class="flex justify-between text-[0.625rem] text-text-tertiary uppercase tracking-wide"
            >
              <span>${t.slow}</span>
              <span>${t.fast}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <input
              type="range"
              id="volume-slider"
              min="${VOLUME_RANGE.MIN}"
              max="${VOLUME_RANGE.MAX}"
              value="${volume}"
              class="w-full h-1 bg-border-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-fast [&::-webkit-slider-thumb:hover]:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
            />
            <div
              class="flex justify-between text-[0.625rem] text-text-tertiary uppercase tracking-wide"
            >
              <span>${t.quiet}</span>
              <span>${t.loud}</span>
            </div>
          </div>
        </div>

        <!-- Beat visualization -->
        <div
          class="flex justify-center items-center gap-4 min-h-14 overflow-x-auto p-2 px-4 max-sm:gap-2 max-sm:min-h-12 max-sm:p-1 max-sm:px-2"
        >
          ${beatIcons.join('')}
        </div>

        <!-- Info display -->
        <div
          class="grid grid-cols-2 gap-8 max-md:gap-6 max-sm:grid-cols-1 max-sm:gap-4"
        >
          <div
            class="text-center p-4 border-t border-border-secondary max-sm:p-3"
          >
            <div
              class="text-text-tertiary text-xs uppercase tracking-wide mb-2"
            >
              ${t.measure}
            </div>
            <div
              class="text-3xl font-light text-text-primary max-md:text-2xl max-sm:text-xl"
            >
              ${measureCount}
            </div>
          </div>
          <div
            class="text-center p-4 border-t border-border-secondary max-sm:p-3"
          >
            <div
              class="text-text-tertiary text-xs uppercase tracking-wide mb-2"
            >
              ${t.elapsed}
            </div>
            <div
              class="font-mono font-bold text-2xl tabular-nums text-text-primary max-sm:text-lg"
            >
              ${this.formatTime(elapsedTime)}
            </div>
            <div class="text-text-tertiary text-xs mt-1">${t.precision}</div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-3 max-sm:gap-2">
          <button
            id="play-btn"
            class="flex flex-1 items-center justify-center gap-3 p-4 px-6 text-lg font-medium rounded-lg transition-colors duration-fast bg-accent-primary text-text-inverse hover:bg-accent-hover max-sm:p-3 max-sm:px-4 max-sm:text-base max-sm:min-h-12"
          >
            ${isPlaying
              ? html`
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>${t.stop}</span>
                `
              : html`
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>${t.start}</span>
                `}
          </button>
          <button
            id="reset-btn"
            class="flex items-center justify-center p-4 text-lg font-medium rounded-lg transition-colors duration-fast bg-bg-tertiary text-text-primary hover:bg-interactive-hover max-sm:text-base max-sm:min-h-12 max-sm:min-w-12"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>

        <!-- Sync info -->
        <div class="text-center text-text-tertiary text-xs">
          <div class="font-bold text-text-primary mb-1">${t.perfectSync}</div>
          <div>${t.syncDescription}</div>
        </div>
      </div>
    `;
  }

  protected onMount(): void {
    // Subscribe to language changes
    this.languageUnsubscribe = languageStore.subscribe(() => {
      this.update();
    });

    // Initialize AudioContext
    this.initAudioContext();

    // Setup event listeners
    this.setupEventListeners();
  }

  protected onDestroy(): void {
    this.stopMetronome();

    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
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
    // BPM slider
    const bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
    if (bpmSlider) {
      this.addEventListener(bpmSlider, 'input', (e: Event) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.setState({ bpm: value });
      });
    }

    // Volume slider
    const volumeSlider = document.getElementById(
      'volume-slider'
    ) as HTMLInputElement;
    if (volumeSlider) {
      this.addEventListener(volumeSlider, 'input', (e: Event) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.setState({ volume: value });
      });
    }

    // Beats per measure input
    const beatsInput = document.getElementById(
      'beats-input'
    ) as HTMLInputElement;
    if (beatsInput) {
      this.addEventListener(beatsInput, 'change', (e: Event) => {
        const value = Math.max(
          1,
          Math.min(12, parseInt((e.target as HTMLInputElement).value) || 1)
        );
        this.setState({ beatsPerMeasure: value });
      });
    }

    // Beat unit select
    const beatUnitSelect = document.getElementById(
      'beat-unit-select'
    ) as HTMLSelectElement;
    if (beatUnitSelect) {
      this.addEventListener(beatUnitSelect, 'change', (e: Event) => {
        const value = parseInt((e.target as HTMLSelectElement).value);
        this.setState({ beatUnit: value });
      });
    }

    // Timer inputs
    const timerMinutes = document.getElementById(
      'timer-minutes'
    ) as HTMLInputElement;
    if (timerMinutes) {
      this.addEventListener(timerMinutes, 'input', (e: Event) => {
        this.setState({ timerMinutes: (e.target as HTMLInputElement).value });
      });
    }

    const timerSeconds = document.getElementById(
      'timer-seconds'
    ) as HTMLInputElement;
    if (timerSeconds) {
      this.addEventListener(timerSeconds, 'input', (e: Event) => {
        this.setState({ timerSeconds: (e.target as HTMLInputElement).value });
      });
    }

    // Play button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      this.addEventListener(playBtn, 'click', () => {
        this.handlePlayPause();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      this.addEventListener(resetBtn, 'click', () => {
        this.reset();
      });
    }
  }

  private async handlePlayPause(): Promise<void> {
    const {
      isPlaying,
      countdownTime,
      countdownElapsed,
      elapsedTime,
      timerMinutes,
      timerSeconds,
    } = this.state;

    // Ensure AudioContext exists
    if (!this.audioContext) {
      this.initAudioContext();
    }

    // Resume AudioContext if suspended
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.error('AudioContext resume failed:', err);
        return;
      }
    }

    const timerEnded = countdownTime > 0 && countdownElapsed >= countdownTime;

    if (!isPlaying) {
      // Starting
      if (this.audioContext) {
        const currentTime = this.audioContext.currentTime;

        if (elapsedTime === 0 && countdownTime === 0) {
          // Check if timer is set
          const totalMinutes = parseInt(timerMinutes) || 0;
          const totalSecs = parseInt(timerSeconds) || 0;
          const totalMs = (totalMinutes * 60 + totalSecs) * 1000;

          if (totalMs > 0) {
            this.setState({ countdownTime: totalMs, countdownElapsed: 0 });
          }

          // Fresh start
          this.startAudioTime = currentTime;
          this.nextNoteTime = currentTime;
          this.schedulerBeat = 0;
          this.setState({
            beat: 0,
            measureCount: 0,
            pendulumAngle: 0,
          });
        } else if (timerEnded) {
          // Timer ended, restart fresh
          this.setState({
            elapsedTime: 0,
            countdownElapsed: 0,
            beat: 0,
            measureCount: 0,
            pendulumAngle: 0,
          });
          this.schedulerBeat = 0;
          this.startAudioTime = currentTime;
          this.nextNoteTime = currentTime;
        } else {
          // Resume from pause
          const elapsedSeconds = elapsedTime / 1000;
          this.startAudioTime = currentTime - elapsedSeconds;

          const secondsPerBeat = 60 / this.state.bpm;
          const totalBeats = elapsedSeconds / secondsPerBeat;
          const currentBeatNumber = Math.floor(totalBeats);

          this.schedulerBeat =
            (currentBeatNumber + 1) % this.state.beatsPerMeasure;
          this.nextNoteTime =
            this.startAudioTime + (currentBeatNumber + 1) * secondsPerBeat;
        }
      }

      this.setState({ isPlaying: true });
      this.startScheduler();
      this.startAnimation();
    } else {
      // Pausing
      this.stopMetronome();
      this.setState({ isPlaying: false });
    }
  }

  private reset(): void {
    this.stopMetronome();
    this.setState({
      isPlaying: false,
      beat: 0,
      measureCount: 0,
      pendulumAngle: 0,
      countdownTime: 0,
      countdownElapsed: 0,
      elapsedTime: 0,
      timerMinutes: '',
      timerSeconds: '',
    });
    this.schedulerBeat = 0;
    this.startAudioTime = 0;
  }

  private stopMetronome(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private startScheduler(): void {
    if (!this.audioContext) return;

    const scheduleNotes = () => {
      if (!this.audioContext) return;

      const { bpm, beatsPerMeasure, volume } = this.state;
      const secondsPerBeat = 60.0 / bpm;
      const now = this.audioContext.currentTime;

      while (this.nextNoteTime < now + TIMING.LOOK_AHEAD_SECONDS) {
        this.playClick(this.nextNoteTime, this.schedulerBeat, volume);
        this.nextNoteTime += secondsPerBeat;
        this.schedulerBeat = (this.schedulerBeat + 1) % beatsPerMeasure;
      }
    };

    this.schedulerInterval = setInterval(
      scheduleNotes,
      TIMING.SCHEDULER_INTERVAL_MS
    );
  }

  private playClick(time: number, beatNumber: number, volume: number): void {
    if (!this.audioContext) return;

    const isFirst = beatNumber === 0;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    const volumeMultiplier = volume / 100;

    if (isFirst) {
      osc.frequency.value = FREQUENCIES.ACCENT;
      gain.gain.setValueAtTime(0.8 * volumeMultiplier, time);
    } else {
      osc.frequency.value = FREQUENCIES.REGULAR;
      gain.gain.setValueAtTime(0.4 * volumeMultiplier, time);
    }

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, 0.01 * volumeMultiplier),
      time + TIMING.CLICK_DURATION_SECONDS
    );

    osc.start(time);
    osc.stop(time + TIMING.CLICK_DURATION_SECONDS);
  }

  private startAnimation(): void {
    const animate = () => {
      if (!this.audioContext || !this.state.isPlaying) {
        return;
      }

      if (this.startAudioTime === 0) {
        this.animationFrame = requestAnimationFrame(animate);
        return;
      }

      const { bpm, beatsPerMeasure, countdownTime } = this.state;
      const currentTime = this.audioContext.currentTime;
      const secondsPerBeat = 60 / bpm;
      const elapsed = currentTime - this.startAudioTime;
      const totalBeats = elapsed / secondsPerBeat;
      const currentBeatIndex = Math.floor(totalBeats) % beatsPerMeasure;
      const currentMeasure = Math.floor(totalBeats / beatsPerMeasure) + 1;

      // Pendulum swing
      const swingCycle = totalBeats % 2;
      const angle =
        swingCycle < 1
          ? -PENDULUM.MAX_ANGLE + swingCycle * PENDULUM.SWING_RANGE
          : PENDULUM.MAX_ANGLE - (swingCycle - 1) * PENDULUM.SWING_RANGE;

      const elapsedMs = elapsed * 1000;

      if (countdownTime > 0) {
        const remaining = countdownTime - elapsedMs;
        if (remaining <= 0) {
          this.setState({
            countdownElapsed: countdownTime,
            isPlaying: false,
          });
          this.stopMetronome();
          return;
        }
        this.setState({
          beat: currentBeatIndex,
          measureCount: currentMeasure,
          pendulumAngle: angle,
          elapsedTime: elapsedMs,
          countdownElapsed: elapsedMs,
        });
      } else {
        this.setState({
          beat: currentBeatIndex,
          measureCount: currentMeasure,
          pendulumAngle: angle,
          elapsedTime: elapsedMs,
        });
      }

      // Update pendulum directly for smooth animation
      const pendulumArm = document.getElementById('pendulum-arm');
      if (pendulumArm) {
        pendulumArm.style.transform = `rotate(${angle}deg)`;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }
}
