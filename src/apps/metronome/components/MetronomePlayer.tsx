import {
  type Component,
  createEffect,
  onMount,
  onCleanup,
  For,
} from 'solid-js';
import { useTranslations } from '../../../i18n';
import type { MetronomeTranslation } from '../../../i18n/types';
import { useMetronomeStore } from '../../../stores';
import {
  DEFAULTS,
  BPM_RANGE,
  VOLUME_RANGE,
  FREQUENCIES,
  TIMING,
  PENDULUM,
} from '../constants';
import './MetronomePlayer.css';

/**
 * Props for MetronomePlayer component
 * When translations are provided, they are used directly (standalone mode)
 * When not provided, useTranslations hook is used (main site mode)
 */
export interface MetronomePlayerProps {
  /** Optional translations for standalone mode */
  translations?: MetronomeTranslation;
}

/**
 * Note icon component for beat visualization
 */
const NoteIcon: Component<{
  unit: number;
  isActive: boolean;
  isFirstBeat: boolean;
}> = (props) => {
  const size = () => (props.isActive ? (props.isFirstBeat ? 28 : 24) : 16);
  const color = () =>
    props.isActive
      ? props.isFirstBeat
        ? 'var(--color-error)'
        : 'var(--color-text-primary)'
      : 'var(--color-text-tertiary)';

  // Half note (2)
  if (props.unit === 2) {
    return (
      <svg
        width={size()}
        height={size() * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        class="metronome-note"
      >
        <ellipse
          cx="12"
          cy="24"
          rx="7"
          ry="5"
          fill="var(--color-bg-tertiary)"
          stroke={color()}
          stroke-width="2"
        />
        <line
          x1="19"
          y1="24"
          x2="19"
          y2="4"
          stroke={color()}
          stroke-width="2"
        />
      </svg>
    );
  }
  // Quarter note (4)
  if (props.unit === 4) {
    return (
      <svg
        width={size()}
        height={size() * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        class="metronome-note"
      >
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color()} />
        <line
          x1="19"
          y1="24"
          x2="19"
          y2="4"
          stroke={color()}
          stroke-width="2"
        />
      </svg>
    );
  }
  // Eighth note (8)
  if (props.unit === 8) {
    return (
      <svg
        width={size()}
        height={size() * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        class="metronome-note"
      >
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color()} />
        <line
          x1="19"
          y1="24"
          x2="19"
          y2="4"
          stroke={color()}
          stroke-width="2"
        />
        <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color()} />
      </svg>
    );
  }
  // Sixteenth note (16)
  if (props.unit === 16) {
    return (
      <svg
        width={size()}
        height={size() * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        class="metronome-note"
      >
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color()} />
        <line
          x1="19"
          y1="24"
          x2="19"
          y2="4"
          stroke={color()}
          stroke-width="2"
        />
        <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color()} />
        <path d="M19 8 L19 14 L24 12 L24 6 Z" fill={color()} />
      </svg>
    );
  }

  return null;
};

/**
 * MetronomePlayer component
 * Features accurate BPM timing, timer, and beat visualization
 * Supports both main site mode (using i18n context) and standalone mode (using props)
 */
const MetronomePlayer: Component<MetronomePlayerProps> = (props) => {
  // Zustand store state
  const store = useMetronomeStore();

  // Use provided translations (standalone) or i18n context (main site)
  const contextTranslations = useTranslations();
  const t = () => props.translations ?? contextTranslations().metronome;

  // Timing refs
  let audioContext: AudioContext | null = null;
  let nextNoteTime = 0;
  let schedulerBeat = 0;
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let bpmValue: number = DEFAULTS.BPM;
  let volumeValue: number = DEFAULTS.VOLUME;
  let beatsPerMeasureValue: number = DEFAULTS.BEATS_PER_MEASURE;
  let animationId: number | null = null;
  let startAudioTime = 0;
  let elapsedTimeValue = 0;

  // Get accent pattern - only first beat of each measure is accented
  const isAccentBeat = (beatIndex: number) => beatIndex === 0;

  // Update refs when state changes
  createEffect(() => {
    bpmValue = store.bpm;
  });

  createEffect(() => {
    volumeValue = store.volume;
  });

  createEffect(() => {
    beatsPerMeasureValue = store.beatsPerMeasure;
  });

  createEffect(() => {
    elapsedTimeValue = store.elapsedTime;
  });

  // Animation loop for visual updates - synced with audio scheduler
  createEffect(() => {
    if (store.isPlaying && audioContext) {
      const animate = () => {
        if (!audioContext) {
          animationId = requestAnimationFrame(animate);
          return;
        }

        // Wait for startAudioTime to be set by handleStart
        if (startAudioTime === 0) {
          animationId = requestAnimationFrame(animate);
          return;
        }

        const currentTime = audioContext.currentTime;
        const secondsPerBeat = 60 / bpmValue;
        const elapsed = currentTime - startAudioTime;
        const totalBeats = elapsed / secondsPerBeat;
        const currentBeatIndex = Math.floor(totalBeats) % beatsPerMeasureValue;

        // Calculate measure count from elapsed time (synced with beat visualization)
        const currentMeasure =
          Math.floor(totalBeats / beatsPerMeasureValue) + 1;

        // Pendulum swing (one cycle per 2 beats)
        const swingCycle = totalBeats % 2;
        const angle =
          swingCycle < 1
            ? -PENDULUM.MAX_ANGLE + swingCycle * PENDULUM.SWING_RANGE
            : PENDULUM.MAX_ANGLE - (swingCycle - 1) * PENDULUM.SWING_RANGE;

        // Batch visual updates
        store.updateVisuals(currentBeatIndex, currentMeasure, angle);

        const elapsedMs = elapsed * 1000;

        if (store.countdownTime > 0) {
          const remaining = store.countdownTime - elapsedMs;
          if (remaining <= 0) {
            store.updateElapsed(elapsedMs, store.countdownTime);
            store.setIsPlaying(false);
            return;
          }
          store.updateElapsed(elapsedMs, elapsedMs);
        } else {
          store.updateElapsed(elapsedMs);
        }

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
    } else {
      if (animationId) cancelAnimationFrame(animationId);
      if (!store.isPlaying) store.setPendulumAngle(0);
    }
  });

  // Initialize AudioContext
  onMount(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }

    onCleanup(() => {
      if (audioContext) audioContext.close();
    });
  });

  const playClick = (time: number, beatNumber: number) => {
    const ctx = audioContext;
    if (!ctx) return;

    const isFirst = isAccentBeat(beatNumber);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const volumeMultiplier = volumeValue / 100;

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
  };

  // Scheduler effect - timing is already initialized in handleStart
  createEffect(() => {
    if (store.isPlaying && audioContext) {
      const scheduleNotes = () => {
        if (!audioContext) return;

        const secondsPerBeat = 60.0 / bpmValue;
        const now = audioContext.currentTime;

        while (nextNoteTime < now + TIMING.LOOK_AHEAD_SECONDS) {
          // Only schedule sound - measure count is calculated in animation loop
          playClick(nextNoteTime, schedulerBeat);

          nextNoteTime += secondsPerBeat;
          schedulerBeat = (schedulerBeat + 1) % beatsPerMeasureValue;
        }
      };

      schedulerInterval = setInterval(
        scheduleNotes,
        TIMING.SCHEDULER_INTERVAL_MS
      );
    } else {
      if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
      }
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });

  const handleStart = async () => {
    // Ensure AudioContext exists
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }

    // Resume AudioContext if suspended (required for mobile browsers)
    if (audioContext?.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (err) {
        console.error('AudioContext resume failed:', err);
        return;
      }
    }

    const timerEnded =
      store.countdownTime > 0 && store.countdownElapsed >= store.countdownTime;

    if (!store.isPlaying) {
      // Initialize timing BEFORE setIsPlaying so both effects use the same start time
      if (audioContext) {
        const currentTime = audioContext.currentTime;

        if (store.elapsedTime === 0 && store.countdownTime === 0) {
          const totalMinutes = parseInt(store.timerMinutes) || 0;
          const totalSeconds = parseInt(store.timerSeconds) || 0;
          const totalMs = (totalMinutes * 60 + totalSeconds) * 1000;

          if (totalMs > 0) {
            store.startCountdown(totalMs);
          }
          // Fresh start
          startAudioTime = currentTime;
          nextNoteTime = currentTime;
          schedulerBeat = 0;
          store.updateVisuals(0, 0, 0);
        } else if (timerEnded) {
          // Timer ended, restart fresh
          store.updateElapsed(0, 0);
          store.updateVisuals(0, 0, 0);
          schedulerBeat = 0;
          startAudioTime = currentTime;
          nextNoteTime = currentTime;
        } else {
          // Resume from pause - adjust start time to maintain elapsed time
          const elapsedSeconds = elapsedTimeValue / 1000;
          startAudioTime = currentTime - elapsedSeconds;

          // Calculate which beat we're on and when the next beat should occur
          const secondsPerBeat = 60 / bpmValue;
          const totalBeats = elapsedSeconds / secondsPerBeat;
          const currentBeatNumber = Math.floor(totalBeats);

          schedulerBeat = (currentBeatNumber + 1) % beatsPerMeasureValue;

          // Next beat should occur at the next whole beat number
          const nextBeatTime =
            startAudioTime + (currentBeatNumber + 1) * secondsPerBeat;
          nextNoteTime = nextBeatTime;
        }
      }

      store.setIsPlaying(true);
    } else {
      store.setIsPlaying(false);
    }
  };

  const reset = () => {
    store.resetPlayback();
    store.resetTimer();
    schedulerBeat = 0;
    startAudioTime = 0;

    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  // Format time as MM:SS.cc (centiseconds)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const currentCountdown = () =>
    store.countdownTime > 0
      ? Math.max(0, store.countdownTime - store.countdownElapsed)
      : 0;

  return (
    <div class="metronome">
      {/* Top controls */}
      <div class="metronome-controls">
        {/* Time signature */}
        <div class="metronome-control-group">
          <span class="metronome-label">{t().timeSignature}</span>
          <input
            type="number"
            min="1"
            max="12"
            value={store.beatsPerMeasure}
            onInput={(e) =>
              store.setBeatsPerMeasure(
                Math.max(
                  1,
                  Math.min(
                    12,
                    parseInt((e.target as HTMLInputElement).value) || 1
                  )
                )
              )
            }
            class="metronome-input metronome-input--small"
            disabled={store.isPlaying}
          />
          <span class="metronome-divider">/</span>
          <select
            value={store.beatUnit}
            onChange={(e) =>
              store.setBeatUnit(parseInt((e.target as HTMLSelectElement).value))
            }
            class="metronome-select"
            disabled={store.isPlaying}
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="16">16</option>
          </select>
        </div>

        {/* Timer */}
        <div class="metronome-control-group">
          <span class="metronome-label">{t().timer}</span>
          <input
            type="number"
            min="0"
            max="99"
            value={store.timerMinutes}
            onInput={(e) =>
              store.setTimerMinutes((e.target as HTMLInputElement).value)
            }
            placeholder="0"
            class="metronome-input metronome-input--small"
            disabled={store.isPlaying || store.elapsedTime > 0}
          />
          <span class="metronome-unit">{t().minutes}</span>
          <input
            type="number"
            min="0"
            max="59"
            value={store.timerSeconds}
            onInput={(e) =>
              store.setTimerSeconds((e.target as HTMLInputElement).value)
            }
            placeholder="0"
            class="metronome-input metronome-input--small"
            disabled={store.isPlaying || store.elapsedTime > 0}
          />
          <span class="metronome-unit">{t().seconds}</span>
          <span class="metronome-separator" />
          <div class="metronome-countdown">
            <span class="metronome-countdown-label">{t().countdown}</span>
            <span
              class={`metronome-countdown-value ${store.countdownTime > 0 ? 'active' : ''}`}
            >
              {formatTime(currentCountdown())}
            </span>
          </div>
        </div>
      </div>

      {/* Main display */}
      <div class="metronome-main">
        {/* BPM display */}
        <div class="metronome-display">
          <div class="metronome-display-label">{t().bpm}</div>
          <div class="metronome-display-value">{store.bpm}</div>
        </div>

        {/* Pendulum */}
        <div class="metronome-pendulum">
          <svg viewBox="0 0 100 120" class="metronome-pendulum-svg">
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
              style={{
                'transform-origin': '50px 108px',
                transform: `rotate(${store.pendulumAngle}deg)`,
              }}
              class="metronome-pendulum-arm"
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
              <circle cx="50" cy="55" r="4" fill="var(--color-text-primary)" />
            </g>
            <circle
              cx="50"
              cy="108"
              r="2.5"
              fill="var(--color-text-tertiary)"
            />
          </svg>
        </div>

        {/* Volume display */}
        <div class="metronome-display">
          <div class="metronome-display-label">{t().volume}</div>
          <div class="metronome-display-value">{store.volume}</div>
        </div>
      </div>

      {/* Sliders */}
      <div class="metronome-sliders">
        <div class="metronome-slider-group">
          <input
            type="range"
            min={BPM_RANGE.MIN}
            max={BPM_RANGE.MAX}
            value={store.bpm}
            onInput={(e) =>
              store.setBpm(parseInt((e.target as HTMLInputElement).value))
            }
            class="metronome-slider"
          />
          <div class="metronome-slider-labels">
            <span>{t().slow}</span>
            <span>{t().fast}</span>
          </div>
        </div>

        <div class="metronome-slider-group">
          <input
            type="range"
            min={VOLUME_RANGE.MIN}
            max={VOLUME_RANGE.MAX}
            value={store.volume}
            onInput={(e) =>
              store.setVolume(parseInt((e.target as HTMLInputElement).value))
            }
            class="metronome-slider"
          />
          <div class="metronome-slider-labels">
            <span>{t().quiet}</span>
            <span>{t().loud}</span>
          </div>
        </div>
      </div>

      {/* Beat visualization */}
      <div class="metronome-beats">
        <For each={[...Array(store.beatsPerMeasure).keys()]}>
          {(i) => (
            <div class="metronome-beat">
              <NoteIcon
                unit={store.beatUnit}
                isActive={store.isPlaying && i === store.beat}
                isFirstBeat={i === 0}
              />
            </div>
          )}
        </For>
      </div>

      {/* Info display */}
      <div class="metronome-info">
        <div class="metronome-info-item">
          <div class="metronome-info-label">{t().measure}</div>
          <div class="metronome-info-value">{store.measureCount}</div>
        </div>
        <div class="metronome-info-item">
          <div class="metronome-info-label">{t().elapsed}</div>
          <div class="metronome-info-value metronome-info-value--mono">
            {formatTime(store.elapsedTime)}
          </div>
          <div class="metronome-info-precision">{t().precision}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div class="metronome-actions">
        <button
          onClick={handleStart}
          class="metronome-btn metronome-btn--primary"
        >
          {store.isPlaying ? (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>{t().stop}</span>
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{t().start}</span>
            </>
          )}
        </button>
        <button onClick={reset} class="metronome-btn metronome-btn--secondary">
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

      {/* Sync info */}
      <div class="metronome-sync">
        <div class="metronome-sync-title">{t().perfectSync}</div>
        <div class="metronome-sync-desc">{t().syncDescription}</div>
      </div>
    </div>
  );
};

export { MetronomePlayer };
