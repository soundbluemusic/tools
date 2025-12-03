import {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useReducer,
} from 'react';
import { useTranslations } from '../../../i18n';
import type { MetronomeTranslation } from '../../../i18n/types';
import {
  DEFAULTS,
  BPM_RANGE,
  VOLUME_RANGE,
  FREQUENCIES,
  TIMING,
  PENDULUM,
} from '../constants';

/**
 * Props for MetronomePlayer component
 * When translations are provided, they are used directly (standalone mode)
 * When not provided, useTranslations hook is used (main site mode)
 */
export interface MetronomePlayerProps {
  /** Optional translations for standalone mode */
  translations?: MetronomeTranslation;
}

// ============================================
// Timer State Management
// ============================================

interface TimerState {
  timerMinutes: string;
  timerSeconds: string;
  countdownTime: number;
  countdownElapsed: number;
  elapsedTime: number;
}

type TimerAction =
  | { type: 'SET_TIMER_MINUTES'; payload: string }
  | { type: 'SET_TIMER_SECONDS'; payload: string }
  | { type: 'SET_COUNTDOWN_TIME'; payload: number }
  | { type: 'SET_COUNTDOWN_ELAPSED'; payload: number }
  | { type: 'SET_ELAPSED_TIME'; payload: number }
  | { type: 'START_COUNTDOWN'; payload: number }
  | {
      type: 'UPDATE_ELAPSED';
      payload: { elapsed: number; countdownElapsed?: number };
    }
  | { type: 'RESET' };

const initialTimerState: TimerState = {
  timerMinutes: '',
  timerSeconds: '',
  countdownTime: 0,
  countdownElapsed: 0,
  elapsedTime: 0,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_TIMER_MINUTES':
      return { ...state, timerMinutes: action.payload };
    case 'SET_TIMER_SECONDS':
      return { ...state, timerSeconds: action.payload };
    case 'SET_COUNTDOWN_TIME':
      return { ...state, countdownTime: action.payload };
    case 'SET_COUNTDOWN_ELAPSED':
      return { ...state, countdownElapsed: action.payload };
    case 'SET_ELAPSED_TIME':
      return { ...state, elapsedTime: action.payload };
    case 'START_COUNTDOWN':
      return { ...state, countdownTime: action.payload, countdownElapsed: 0 };
    case 'UPDATE_ELAPSED':
      return {
        ...state,
        elapsedTime: action.payload.elapsed,
        countdownElapsed:
          action.payload.countdownElapsed ?? state.countdownElapsed,
      };
    case 'RESET':
      return initialTimerState;
    default:
      return state;
  }
}

// ============================================
// Playback State Management
// ============================================

interface PlaybackState {
  isPlaying: boolean;
  beat: number;
  measureCount: number;
  pendulumAngle: number;
}

type PlaybackAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_BEAT'; payload: number }
  | { type: 'SET_MEASURE_COUNT'; payload: number }
  | { type: 'SET_PENDULUM_ANGLE'; payload: number }
  | {
      type: 'UPDATE_VISUALS';
      payload: { beat: number; measureCount: number; pendulumAngle: number };
    }
  | { type: 'RESET' };

const initialPlaybackState: PlaybackState = {
  isPlaying: false,
  beat: 0,
  measureCount: 0,
  pendulumAngle: 0,
};

function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction
): PlaybackState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_BEAT':
      return { ...state, beat: action.payload };
    case 'SET_MEASURE_COUNT':
      return { ...state, measureCount: action.payload };
    case 'SET_PENDULUM_ANGLE':
      return { ...state, pendulumAngle: action.payload };
    case 'UPDATE_VISUALS':
      return {
        ...state,
        beat: action.payload.beat,
        measureCount: action.payload.measureCount,
        pendulumAngle: action.payload.pendulumAngle,
      };
    case 'RESET':
      return initialPlaybackState;
    default:
      return state;
  }
}

/**
 * Note icon component for beat visualization
 */
const NoteIcon = memo<{
  unit: number;
  isActive: boolean;
  isFirstBeat: boolean;
}>(function NoteIcon({ unit, isActive, isFirstBeat }) {
  const size = isActive ? (isFirstBeat ? 28 : 24) : 16;
  const color = isActive
    ? isFirstBeat
      ? 'var(--color-error)'
      : 'var(--color-text-primary)'
    : 'var(--color-text-tertiary)';

  // Half note (2)
  if (unit === 2) {
    return (
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        className="block"
      >
        <ellipse
          cx="12"
          cy="24"
          rx="7"
          ry="5"
          fill="var(--color-bg-tertiary)"
          stroke={color}
          strokeWidth="2"
        />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
      </svg>
    );
  }
  // Quarter note (4)
  if (unit === 4) {
    return (
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        className="block"
      >
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
      </svg>
    );
  }
  // Eighth note (8)
  if (unit === 8) {
    return (
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        className="block"
      >
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
        <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color} />
      </svg>
    );
  }
  // Sixteenth note (16)
  if (unit === 16) {
    return (
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 24 34"
        fill="none"
        className="block"
      >
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
        <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color} />
        <path d="M19 8 L19 14 L24 12 L24 6 Z" fill={color} />
      </svg>
    );
  }

  return null;
});

NoteIcon.displayName = 'NoteIcon';

/**
 * MetronomePlayer component
 * Features accurate BPM timing, timer, and beat visualization
 * Supports both main site mode (using i18n context) and standalone mode (using props)
 */
const MetronomePlayer = memo<MetronomePlayerProps>(function MetronomePlayer({
  translations,
}) {
  // Settings state (simple values, rarely change together)
  const [bpm, setBpm] = useState<number>(DEFAULTS.BPM);
  const [volume, setVolume] = useState<number>(DEFAULTS.VOLUME);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(
    DEFAULTS.BEATS_PER_MEASURE
  );
  const [beatUnit, setBeatUnit] = useState<number>(DEFAULTS.BEAT_UNIT);

  // Playback state (frequently updated together during animation)
  const [playback, dispatchPlayback] = useReducer(
    playbackReducer,
    initialPlaybackState
  );
  const { isPlaying, beat, measureCount, pendulumAngle } = playback;

  // Timer state (interrelated values for countdown/elapsed tracking)
  const [timer, dispatchTimer] = useReducer(timerReducer, initialTimerState);
  const {
    timerMinutes,
    timerSeconds,
    countdownTime,
    countdownElapsed,
    elapsedTime,
  } = timer;

  // Use provided translations (standalone) or i18n context (main site)
  const contextTranslations = useTranslations();
  const t = translations ?? contextTranslations.metronome;

  // Timing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const schedulerBeatRef = useRef(0);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bpmRef = useRef<number>(DEFAULTS.BPM);
  const volumeRef = useRef<number>(DEFAULTS.VOLUME);
  const beatsPerMeasureRef = useRef<number>(DEFAULTS.BEATS_PER_MEASURE);
  const animationRef = useRef<number | null>(null);
  const startAudioTimeRef = useRef(0);

  // Get accent pattern - only first beat of each measure is accented
  const isAccentBeat = useCallback((beatIndex: number) => beatIndex === 0, []);

  // Update refs when state changes
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  // Animation loop for visual updates - synced with audio scheduler
  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      const animate = () => {
        if (!audioContextRef.current) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // Wait for startAudioTimeRef to be set by handleStart
        if (startAudioTimeRef.current === 0) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const currentTime = audioContextRef.current.currentTime;
        const secondsPerBeat = 60 / bpmRef.current;
        const elapsed = currentTime - startAudioTimeRef.current;
        const totalBeats = elapsed / secondsPerBeat;
        const currentBeatIndex =
          Math.floor(totalBeats) % beatsPerMeasureRef.current;

        // Calculate measure count from elapsed time (synced with beat visualization)
        const currentMeasure =
          Math.floor(totalBeats / beatsPerMeasureRef.current) + 1;

        // Pendulum swing (one cycle per 2 beats)
        const swingCycle = totalBeats % 2;
        const angle =
          swingCycle < 1
            ? -PENDULUM.MAX_ANGLE + swingCycle * PENDULUM.SWING_RANGE
            : PENDULUM.MAX_ANGLE - (swingCycle - 1) * PENDULUM.SWING_RANGE;

        // Batch visual updates
        dispatchPlayback({
          type: 'UPDATE_VISUALS',
          payload: {
            beat: currentBeatIndex,
            measureCount: currentMeasure,
            pendulumAngle: angle,
          },
        });

        const elapsedMs = elapsed * 1000;

        if (countdownTime > 0) {
          const remaining = countdownTime - elapsedMs;
          if (remaining <= 0) {
            dispatchTimer({
              type: 'SET_COUNTDOWN_ELAPSED',
              payload: countdownTime,
            });
            dispatchPlayback({ type: 'SET_PLAYING', payload: false });
            return;
          }
          dispatchTimer({
            type: 'UPDATE_ELAPSED',
            payload: { elapsed: elapsedMs, countdownElapsed: elapsedMs },
          });
        } else {
          dispatchTimer({ type: 'SET_ELAPSED_TIME', payload: elapsedMs });
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (!isPlaying)
        dispatchPlayback({ type: 'SET_PENDULUM_ANGLE', payload: 0 });
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, countdownTime]);

  // Initialize AudioContext
  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Use ref for elapsedTime to avoid dependency issues
  const elapsedTimeRef = useRef(0);
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  const playClick = useCallback(
    (time: number, beatNumber: number) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const isFirst = isAccentBeat(beatNumber);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const volumeMultiplier = volumeRef.current / 100;

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
    },
    [isAccentBeat]
  );

  // Scheduler effect - timing is already initialized in handleStart
  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      const scheduleNotes = () => {
        if (!audioContextRef.current) return;

        const secondsPerBeat = 60.0 / bpmRef.current;
        const now = audioContextRef.current.currentTime;

        while (nextNoteTimeRef.current < now + TIMING.LOOK_AHEAD_SECONDS) {
          // Only schedule sound - measure count is calculated in animation loop
          playClick(nextNoteTimeRef.current, schedulerBeatRef.current);

          nextNoteTimeRef.current += secondsPerBeat;
          schedulerBeatRef.current =
            (schedulerBeatRef.current + 1) % beatsPerMeasureRef.current;
        }
      };

      schedulerRef.current = setInterval(
        scheduleNotes,
        TIMING.SCHEDULER_INTERVAL_MS
      );
    } else {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
    }

    return () => {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
    };
  }, [isPlaying, playClick]);

  const handleStart = useCallback(async () => {
    // Ensure AudioContext exists
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    // Resume AudioContext if suspended (required for mobile browsers)
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.error('AudioContext resume failed:', err);
        return;
      }
    }

    const timerEnded = countdownTime > 0 && countdownElapsed >= countdownTime;

    if (!isPlaying) {
      // Initialize timing BEFORE setIsPlaying so both effects use the same start time
      if (audioContextRef.current) {
        const currentTime = audioContextRef.current.currentTime;

        if (elapsedTime === 0 && countdownTime === 0) {
          const totalMinutes = parseInt(timerMinutes) || 0;
          const totalSeconds = parseInt(timerSeconds) || 0;
          const totalMs = (totalMinutes * 60 + totalSeconds) * 1000;

          if (totalMs > 0) {
            dispatchTimer({ type: 'START_COUNTDOWN', payload: totalMs });
          }
          // Fresh start
          startAudioTimeRef.current = currentTime;
          nextNoteTimeRef.current = currentTime;
          schedulerBeatRef.current = 0;
          dispatchPlayback({
            type: 'UPDATE_VISUALS',
            payload: { beat: 0, measureCount: 0, pendulumAngle: 0 },
          });
        } else if (timerEnded) {
          // Timer ended, restart fresh
          dispatchTimer({
            type: 'UPDATE_ELAPSED',
            payload: { elapsed: 0, countdownElapsed: 0 },
          });
          dispatchPlayback({
            type: 'UPDATE_VISUALS',
            payload: { beat: 0, measureCount: 0, pendulumAngle: 0 },
          });
          schedulerBeatRef.current = 0;
          startAudioTimeRef.current = currentTime;
          nextNoteTimeRef.current = currentTime;
        } else {
          // Resume from pause - adjust start time to maintain elapsed time
          const elapsedSeconds = elapsedTimeRef.current / 1000;
          startAudioTimeRef.current = currentTime - elapsedSeconds;

          // Calculate which beat we're on and when the next beat should occur
          const secondsPerBeat = 60 / bpmRef.current;
          const totalBeats = elapsedSeconds / secondsPerBeat;
          const currentBeatNumber = Math.floor(totalBeats);

          schedulerBeatRef.current =
            (currentBeatNumber + 1) % beatsPerMeasureRef.current;

          // Next beat should occur at the next whole beat number
          const nextBeatTime =
            startAudioTimeRef.current +
            (currentBeatNumber + 1) * secondsPerBeat;
          nextNoteTimeRef.current = nextBeatTime;
        }
      }

      dispatchPlayback({ type: 'SET_PLAYING', payload: true });
    } else {
      dispatchPlayback({ type: 'SET_PLAYING', payload: false });
    }
  }, [
    isPlaying,
    countdownTime,
    countdownElapsed,
    elapsedTime,
    timerMinutes,
    timerSeconds,
  ]);

  const reset = useCallback(() => {
    dispatchPlayback({ type: 'RESET' });
    dispatchTimer({ type: 'RESET' });
    schedulerBeatRef.current = 0;
    startAudioTimeRef.current = 0;

    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Format time as MM:SS.cc (centiseconds)
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  const currentCountdown =
    countdownTime > 0 ? Math.max(0, countdownTime - countdownElapsed) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top controls */}
      <div className="flex flex-wrap gap-4 justify-between max-sm:flex-col max-sm:gap-3">
        {/* Time signature */}
        <div className="flex items-center gap-2 bg-bg-tertiary p-3 px-4 rounded-lg max-sm:w-full max-sm:justify-between max-sm:p-3 max-xs:p-2">
          <span className="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap max-xs:text-[0.625rem]">
            {t.timeSignature}
          </span>
          <input
            type="number"
            min="1"
            max="12"
            value={beatsPerMeasure}
            onChange={(e) =>
              setBeatsPerMeasure(
                Math.max(1, Math.min(12, parseInt(e.target.value) || 1))
              )
            }
            className="w-10 p-1 px-2 text-base font-medium text-center bg-transparent border-none text-text-primary outline-none disabled:opacity-50 max-sm:w-10 max-xs:text-sm"
            disabled={isPlaying}
          />
          <span className="text-text-primary text-lg font-medium">/</span>
          <select
            value={beatUnit}
            onChange={(e) => setBeatUnit(parseInt(e.target.value))}
            className="w-10 p-1 text-base font-medium text-center bg-transparent border-none text-text-primary cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPlaying}
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="16">16</option>
          </select>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-bg-tertiary p-3 px-4 rounded-lg max-sm:w-full max-sm:justify-between max-sm:p-3 max-xs:p-2">
          <span className="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap max-xs:text-[0.625rem]">
            {t.timer}
          </span>
          <input
            type="number"
            min="0"
            max="99"
            value={timerMinutes}
            onChange={(e) =>
              dispatchTimer({
                type: 'SET_TIMER_MINUTES',
                payload: e.target.value,
              })
            }
            placeholder="0"
            className="w-10 p-1 px-2 text-base font-medium text-center bg-transparent border-none text-text-primary outline-none disabled:opacity-50 max-sm:w-10 max-xs:text-sm"
            disabled={isPlaying || elapsedTime > 0}
          />
          <span className="text-text-tertiary text-xs whitespace-nowrap">
            {t.minutes}
          </span>
          <input
            type="number"
            min="0"
            max="59"
            value={timerSeconds}
            onChange={(e) =>
              dispatchTimer({
                type: 'SET_TIMER_SECONDS',
                payload: e.target.value,
              })
            }
            placeholder="0"
            className="w-10 p-1 px-2 text-base font-medium text-center bg-transparent border-none text-text-primary outline-none disabled:opacity-50 max-sm:w-10 max-xs:text-sm"
            disabled={isPlaying || elapsedTime > 0}
          />
          <span className="text-text-tertiary text-xs whitespace-nowrap">
            {t.seconds}
          </span>
          <span className="w-px h-6 bg-border-secondary mx-2" />
          <div className="flex flex-col items-center min-w-[4.5rem]">
            <span className="text-text-tertiary text-[0.625rem] uppercase tracking-wide whitespace-nowrap">
              {t.countdown}
            </span>
            <span
              className={`font-mono text-sm font-bold tabular-nums ${countdownTime > 0 ? 'text-text-primary' : 'text-text-tertiary'}`}
            >
              {formatTime(currentCountdown)}
            </span>
          </div>
        </div>
      </div>

      {/* Main display */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-end max-md:gap-4 max-sm:grid-cols-[1fr_1fr_1fr] max-sm:gap-2 max-sm:items-center">
        {/* BPM display */}
        <div className="text-center first:text-left last:text-right max-sm:first:text-center max-sm:last:text-center">
          <div className="text-text-tertiary text-xs uppercase tracking-wide mb-2 max-sm:text-[0.625rem]">
            {t.bpm}
          </div>
          <div className="text-[clamp(2.5rem,8vw,4.5rem)] font-extralight text-text-primary tracking-tight leading-none max-md:text-[clamp(2rem,7vw,3.5rem)] max-sm:text-[1.75rem] max-xs:text-[1.5rem]">
            {bpm}
          </div>
        </div>

        {/* Pendulum */}
        <div className="w-28 h-32 max-md:w-[5.5rem] max-md:h-[6.5rem] max-sm:w-14 max-sm:h-[4.5rem] max-xs:w-12 max-xs:h-16">
          <svg viewBox="0 0 100 120" className="w-full h-full">
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
              strokeWidth="1.5"
            />
            <g
              style={{
                transformOrigin: '50px 108px',
                transform: `rotate(${pendulumAngle}deg)`,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <line
                x1="50"
                y1="28"
                x2="50"
                y2="108"
                stroke="var(--color-text-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
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
        <div className="text-center first:text-left last:text-right max-sm:first:text-center max-sm:last:text-center">
          <div className="text-text-tertiary text-xs uppercase tracking-wide mb-2 max-sm:text-[0.625rem]">
            {t.volume}
          </div>
          <div className="text-[clamp(2.5rem,8vw,4.5rem)] font-extralight text-text-primary tracking-tight leading-none max-md:text-[clamp(2rem,7vw,3.5rem)] max-sm:text-[1.75rem] max-xs:text-[1.5rem]">
            {volume}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-6 max-sm:gap-4">
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={BPM_RANGE.MIN}
            max={BPM_RANGE.MAX}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full h-1 bg-border-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-fast [&::-webkit-slider-thumb:hover]:scale-110 motion-reduce:[&::-webkit-slider-thumb]:transition-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[0.625rem] text-text-tertiary uppercase tracking-wide">
            <span>{t.slow}</span>
            <span>{t.fast}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={VOLUME_RANGE.MIN}
            max={VOLUME_RANGE.MAX}
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full h-1 bg-border-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-fast [&::-webkit-slider-thumb:hover]:scale-110 motion-reduce:[&::-webkit-slider-thumb]:transition-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[0.625rem] text-text-tertiary uppercase tracking-wide">
            <span>{t.quiet}</span>
            <span>{t.loud}</span>
          </div>
        </div>
      </div>

      {/* Beat visualization */}
      <div className="flex justify-center items-center gap-4 min-h-14 overflow-x-auto p-2 px-4 max-sm:gap-2 max-sm:min-h-12 max-sm:p-1 max-sm:px-2">
        {[...Array(beatsPerMeasure)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center w-8 h-14 flex-shrink-0 max-sm:w-5 max-sm:h-8 max-xs:w-4 max-xs:h-7"
          >
            <NoteIcon
              unit={beatUnit}
              isActive={isPlaying && i === beat}
              isFirstBeat={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Info display */}
      <div className="grid grid-cols-2 gap-8 max-md:gap-6 max-sm:grid-cols-1 max-sm:gap-4">
        <div className="text-center p-4 border-t border-border-secondary max-sm:p-3">
          <div className="text-text-tertiary text-xs uppercase tracking-wide mb-2">
            {t.measure}
          </div>
          <div className="text-3xl font-light text-text-primary max-md:text-2xl max-sm:text-xl">
            {measureCount}
          </div>
        </div>
        <div className="text-center p-4 border-t border-border-secondary max-sm:p-3">
          <div className="text-text-tertiary text-xs uppercase tracking-wide mb-2">
            {t.elapsed}
          </div>
          <div className="font-mono font-bold text-2xl tabular-nums text-text-primary max-sm:text-lg">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-text-tertiary text-xs mt-1">{t.precision}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 max-sm:gap-2">
        <button
          onClick={handleStart}
          className="flex flex-1 items-center justify-center gap-3 p-4 px-6 text-lg font-medium rounded-lg transition-colors duration-fast bg-accent-primary text-text-inverse hover:bg-accent-hover max-sm:p-3 max-sm:px-4 max-sm:text-base max-sm:min-h-12"
        >
          {isPlaying ? (
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
              <span>{t.stop}</span>
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
              <span>{t.start}</span>
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center p-4 text-lg font-medium rounded-lg transition-colors duration-fast bg-bg-tertiary text-text-primary hover:bg-interactive-hover max-sm:text-base max-sm:min-h-12 max-sm:min-w-12"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* Sync info */}
      <div className="text-center text-text-tertiary text-xs">
        <div className="font-bold text-text-primary mb-1">{t.perfectSync}</div>
        <div>{t.syncDescription}</div>
      </div>
    </div>
  );
});

MetronomePlayer.displayName = 'MetronomePlayer';

export { MetronomePlayer };
