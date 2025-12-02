import {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useReducer,
} from 'react';
import { useTranslations } from '../../../i18n';
import {
  DEFAULTS,
  BPM_RANGE,
  VOLUME_RANGE,
  FREQUENCIES,
  TIMING,
  PENDULUM,
} from '../constants';
import './MetronomePlayer.css';

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
        className="metronome-note"
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
        className="metronome-note"
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
        className="metronome-note"
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
        className="metronome-note"
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
 */
const MetronomePlayer = memo(function MetronomePlayer() {
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

  const { metronome: t } = useTranslations();

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
    <div className="metronome">
      {/* Top controls */}
      <div className="metronome-controls">
        {/* Time signature */}
        <div className="metronome-control-group">
          <span className="metronome-label">{t.timeSignature}</span>
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
            className="metronome-input metronome-input--small"
            disabled={isPlaying}
          />
          <span className="metronome-divider">/</span>
          <select
            value={beatUnit}
            onChange={(e) => setBeatUnit(parseInt(e.target.value))}
            className="metronome-select"
            disabled={isPlaying}
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="16">16</option>
          </select>
        </div>

        {/* Timer */}
        <div className="metronome-control-group">
          <span className="metronome-label">{t.timer}</span>
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
            className="metronome-input metronome-input--small"
            disabled={isPlaying || elapsedTime > 0}
          />
          <span className="metronome-unit">{t.minutes}</span>
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
            className="metronome-input metronome-input--small"
            disabled={isPlaying || elapsedTime > 0}
          />
          <span className="metronome-unit">{t.seconds}</span>
          <span className="metronome-separator" />
          <div className="metronome-countdown">
            <span className="metronome-countdown-label">{t.countdown}</span>
            <span
              className={`metronome-countdown-value ${countdownTime > 0 ? 'active' : ''}`}
            >
              {formatTime(currentCountdown)}
            </span>
          </div>
        </div>
      </div>

      {/* Main display */}
      <div className="metronome-main">
        {/* BPM display */}
        <div className="metronome-display">
          <div className="metronome-display-label">{t.bpm}</div>
          <div className="metronome-display-value">{bpm}</div>
        </div>

        {/* Pendulum */}
        <div className="metronome-pendulum">
          <svg viewBox="0 0 100 120" className="metronome-pendulum-svg">
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
              }}
              className="metronome-pendulum-arm"
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
        <div className="metronome-display">
          <div className="metronome-display-label">{t.volume}</div>
          <div className="metronome-display-value">{volume}</div>
        </div>
      </div>

      {/* Sliders */}
      <div className="metronome-sliders">
        <div className="metronome-slider-group">
          <input
            type="range"
            min={BPM_RANGE.MIN}
            max={BPM_RANGE.MAX}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="metronome-slider"
          />
          <div className="metronome-slider-labels">
            <span>{t.slow}</span>
            <span>{t.fast}</span>
          </div>
        </div>

        <div className="metronome-slider-group">
          <input
            type="range"
            min={VOLUME_RANGE.MIN}
            max={VOLUME_RANGE.MAX}
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="metronome-slider"
          />
          <div className="metronome-slider-labels">
            <span>{t.quiet}</span>
            <span>{t.loud}</span>
          </div>
        </div>
      </div>

      {/* Beat visualization */}
      <div className="metronome-beats">
        {[...Array(beatsPerMeasure)].map((_, i) => (
          <div key={i} className="metronome-beat">
            <NoteIcon
              unit={beatUnit}
              isActive={isPlaying && i === beat}
              isFirstBeat={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Info display */}
      <div className="metronome-info">
        <div className="metronome-info-item">
          <div className="metronome-info-label">{t.measure}</div>
          <div className="metronome-info-value">{measureCount}</div>
        </div>
        <div className="metronome-info-item">
          <div className="metronome-info-label">{t.elapsed}</div>
          <div className="metronome-info-value metronome-info-value--mono">
            {formatTime(elapsedTime)}
          </div>
          <div className="metronome-info-precision">{t.precision}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="metronome-actions">
        <button
          onClick={handleStart}
          className="metronome-btn metronome-btn--primary"
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
          className="metronome-btn metronome-btn--secondary"
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
      <div className="metronome-sync">
        <div className="metronome-sync-title">{t.perfectSync}</div>
        <div className="metronome-sync-desc">{t.syncDescription}</div>
      </div>
    </div>
  );
});

MetronomePlayer.displayName = 'MetronomePlayer';

export { MetronomePlayer };
