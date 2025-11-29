import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useTranslations } from '../../../i18n';
import './MetronomePlayer.css';

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
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [beatUnit, setBeatUnit] = useState(4);
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');
  const [measureCount, setMeasureCount] = useState(0);
  const [volume, setVolume] = useState(80);
  const [pendulumAngle, setPendulumAngle] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);
  const [countdownElapsed, setCountdownElapsed] = useState(0);

  const { metronome: t } = useTranslations();

  // Timing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const schedulerBeatRef = useRef(0);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bpmRef = useRef(120);
  const volumeRef = useRef(80);
  const beatsPerMeasureRef = useRef(4);
  const animationRef = useRef<number | null>(null);
  const startAudioTimeRef = useRef(0);

  // Get accent pattern based on time signature
  const getAccentPattern = useCallback(() => {
    const n = beatsPerMeasure;

    if (n >= 1 && n <= 4) return (beatIndex: number) => beatIndex === 0;
    if (n === 5) return (beatIndex: number) => beatIndex === 0 || beatIndex === 2;
    if (n === 6) return (beatIndex: number) => beatIndex === 0 || beatIndex === 3;
    if (n === 7)
      return (beatIndex: number) => beatIndex === 0 || beatIndex === 2 || beatIndex === 4;
    if (n === 8) return (beatIndex: number) => beatIndex === 0 || beatIndex === 4;
    if (n === 9)
      return (beatIndex: number) => beatIndex === 0 || beatIndex === 3 || beatIndex === 6;
    if (n === 10)
      return (beatIndex: number) =>
        beatIndex === 0 || beatIndex === 3 || beatIndex === 6 || beatIndex === 8;
    if (n === 11)
      return (beatIndex: number) =>
        beatIndex === 0 || beatIndex === 3 || beatIndex === 6 || beatIndex === 9;
    if (n === 12)
      return (beatIndex: number) =>
        beatIndex === 0 || beatIndex === 3 || beatIndex === 6 || beatIndex === 9;

    return (beatIndex: number) => beatIndex === 0;
  }, [beatsPerMeasure]);

  const isAccentBeat = useMemo(() => getAccentPattern(), [getAccentPattern]);

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

  // Animation loop for visual updates
  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      const animate = () => {
        if (!audioContextRef.current || startAudioTimeRef.current === 0) return;

        const currentTime = audioContextRef.current.currentTime;
        const secondsPerBeat = 60 / bpmRef.current;
        const elapsed = currentTime - startAudioTimeRef.current;
        const totalBeats = elapsed / secondsPerBeat;
        const currentBeatIndex = Math.floor(totalBeats) % beatsPerMeasureRef.current;

        setBeat(currentBeatIndex);

        // Pendulum swing (one cycle per 2 beats)
        const swingCycle = totalBeats % 2;
        const angle = swingCycle < 1 ? -30 + swingCycle * 60 : 30 - (swingCycle - 1) * 60;
        setPendulumAngle(angle);

        const elapsedMs = elapsed * 1000;
        setElapsedTime(elapsedMs);

        if (countdownTime > 0) {
          const remaining = countdownTime - elapsedMs;
          if (remaining <= 0) {
            setCountdownElapsed(countdownTime);
            setIsPlaying(false);
            return;
          }
          setCountdownElapsed(elapsedMs);
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (!isPlaying) setPendulumAngle(0);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, countdownTime]);

  // Initialize AudioContext
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playClick = useCallback(
    (time: number, beatNumber: number) => {
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') return;

      const isFirst = isAccentBeat(beatNumber);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const volumeMultiplier = volumeRef.current / 100;

      if (isFirst) {
        osc.frequency.value = 2000;
        gain.gain.setValueAtTime(0.8 * volumeMultiplier, time);
      } else {
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.4 * volumeMultiplier, time);
      }

      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, 0.01 * volumeMultiplier),
        time + 0.08
      );

      osc.start(time);
      osc.stop(time + 0.08);
    },
    [isAccentBeat]
  );

  const scheduleNote = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;

    const secondsPerBeat = 60.0 / bpmRef.current;
    const currentTime = audioContextRef.current.currentTime;

    while (nextNoteTimeRef.current < currentTime + 0.1) {
      if (schedulerBeatRef.current === 0) {
        setMeasureCount((prev) => prev + 1);
      }

      playClick(nextNoteTimeRef.current, schedulerBeatRef.current);

      nextNoteTimeRef.current += secondsPerBeat;
      schedulerBeatRef.current =
        (schedulerBeatRef.current + 1) % beatsPerMeasureRef.current;
    }
  }, [playClick]);

  // Scheduler effect
  useEffect(() => {
    if (isPlaying && audioContextRef.current && audioContextRef.current.state !== 'suspended') {
      const currentTime = audioContextRef.current.currentTime;

      if (elapsedTime === 0) {
        startAudioTimeRef.current = currentTime;
      } else {
        startAudioTimeRef.current = currentTime - elapsedTime / 1000;
      }

      schedulerBeatRef.current = 0;
      setBeat(0);
      nextNoteTimeRef.current = currentTime;

      schedulerRef.current = setInterval(scheduleNote, 25);
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
  }, [isPlaying, scheduleNote, elapsedTime]);

  const handleStart = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.error('AudioContext resume failed:', err);
      }
    }

    const timerEnded = countdownTime > 0 && countdownElapsed >= countdownTime;

    if (!isPlaying) {
      if (elapsedTime === 0 && countdownTime === 0) {
        const totalMinutes = parseInt(timerMinutes) || 0;
        const totalSeconds = parseInt(timerSeconds) || 0;
        const totalMs = (totalMinutes * 60 + totalSeconds) * 1000;

        if (totalMs > 0) {
          setCountdownTime(totalMs);
          setCountdownElapsed(0);
        }
      } else if (timerEnded) {
        setCountdownElapsed(0);
        setElapsedTime(0);
        setMeasureCount(0);
        schedulerBeatRef.current = 0;
        setBeat(0);
        startAudioTimeRef.current = 0;
      }
    }

    setIsPlaying(!isPlaying);
  }, [
    isPlaying,
    countdownTime,
    countdownElapsed,
    elapsedTime,
    timerMinutes,
    timerSeconds,
  ]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setElapsedTime(0);
    setCountdownTime(0);
    setCountdownElapsed(0);
    setMeasureCount(0);
    schedulerBeatRef.current = 0;
    setBeat(0);
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

  const currentCountdown = countdownTime > 0 ? Math.max(0, countdownTime - countdownElapsed) : 0;

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
              setBeatsPerMeasure(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))
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
            onChange={(e) => setTimerMinutes(e.target.value)}
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
            onChange={(e) => setTimerSeconds(e.target.value)}
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
            <rect x="15" y="112" width="70" height="4" rx="2" fill="var(--color-border-secondary)" />
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
            <circle cx="50" cy="108" r="2.5" fill="var(--color-text-tertiary)" />
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
            min="40"
            max="240"
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
            min="0"
            max="100"
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
            <NoteIcon unit={beatUnit} isActive={isPlaying && i === beat} isFirstBeat={i === 0} />
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
        <button onClick={handleStart} className="metronome-btn metronome-btn--primary">
          {isPlaying ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>{t.stop}</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{t.start}</span>
            </>
          )}
        </button>
        <button onClick={reset} className="metronome-btn metronome-btn--secondary">
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
