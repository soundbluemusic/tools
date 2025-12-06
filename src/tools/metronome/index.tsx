'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';

// ========================================
// Metronome Tool - 메트로놈 (Full Featured)
// ========================================

// Constants
const BPM_RANGE = { MIN: 40, MAX: 240 };
const FREQUENCIES = { ACCENT: 2000, REGULAR: 800 };
const TIMING = {
  SCHEDULER_INTERVAL_MS: 25,
  LOOK_AHEAD_SECONDS: 0.1,
  CLICK_DURATION_SECONDS: 0.08,
};
const PENDULUM = { MAX_ANGLE: 30, SWING_RANGE: 60 };

export interface MetronomeSettings {
  bpm: number;
  beatsPerMeasure: number;
  beatUnit: number;
  volume: number;
  timerMinutes: string;
  timerSeconds: string;
  [key: string]: unknown;
}

const defaultSettings: MetronomeSettings = {
  bpm: 120,
  beatsPerMeasure: 4,
  beatUnit: 4,
  volume: 80,
  timerMinutes: '',
  timerSeconds: '',
};

// Colors matching original design
const COLORS = {
  ACCENT: '#dc2626', // First beat - red
  ACTIVE: 'hsl(var(--foreground))', // Active beat - foreground
  INACTIVE: '#a8a29e', // Inactive beat - stone-400
  PENDULUM_BASE: 'hsl(var(--border))',
  PENDULUM_BG: 'hsl(var(--muted))',
  PENDULUM_ARM: 'hsl(var(--foreground))',
  PENDULUM_PIVOT: 'hsl(var(--muted-foreground))',
};

// Note Icon Component
function NoteIcon({
  unit,
  isActive,
  isFirst,
}: {
  unit: number;
  isActive: boolean;
  isFirst: boolean;
}) {
  const size = isActive ? (isFirst ? 28 : 24) : 16;
  const color = isActive
    ? isFirst
      ? COLORS.ACCENT
      : COLORS.ACTIVE
    : COLORS.INACTIVE;

  if (unit === 2) {
    return (
      <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none">
        <ellipse
          cx="12"
          cy="24"
          rx="7"
          ry="5"
          fill={COLORS.PENDULUM_BG}
          stroke={color}
          strokeWidth="2"
        />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
      </svg>
    );
  }
  if (unit === 4) {
    return (
      <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none">
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
      </svg>
    );
  }
  if (unit === 8) {
    return (
      <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none">
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
        <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color} />
      </svg>
    );
  }
  if (unit === 16) {
    return (
      <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none">
        <ellipse cx="12" cy="24" rx="7" ry="5" fill={color} />
        <line x1="19" y1="24" x2="19" y2="4" stroke={color} strokeWidth="2" />
        <path d="M19 4 L19 10 L24 8 L24 2 Z" fill={color} />
        <path d="M19 8 L19 14 L24 12 L24 6 Z" fill={color} />
      </svg>
    );
  }
  return null;
}

function MetronomeComponent({
  settings,
  onSettingsChange,
}: ToolProps<MetronomeSettings>) {
  const { bpm, beatsPerMeasure, beatUnit, volume, timerMinutes, timerSeconds } =
    settings;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [measureCount, setMeasureCount] = useState(0);
  const [pendulumAngle, setPendulumAngle] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const animationRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const schedulerBeatRef = useRef(0);
  const startAudioTimeRef = useRef(0);

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play click sound with precise timing
  const playClick = useCallback(
    (time: number, beatNumber: number) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const isFirst = beatNumber === 0;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

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
    },
    [volume]
  );

  // Animation loop
  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      const animate = () => {
        const ctx = audioContextRef.current;
        if (!ctx || startAudioTimeRef.current === 0) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const currentTime = ctx.currentTime;
        const secondsPerBeat = 60 / bpm;
        const elapsed = currentTime - startAudioTimeRef.current;
        const totalBeats = elapsed / secondsPerBeat;
        const currentBeatIndex = Math.floor(totalBeats) % beatsPerMeasure;
        const currentMeasure = Math.floor(totalBeats / beatsPerMeasure) + 1;

        // Pendulum swing
        const swingCycle = totalBeats % 2;
        const angle =
          swingCycle < 1
            ? -PENDULUM.MAX_ANGLE + swingCycle * PENDULUM.SWING_RANGE
            : PENDULUM.MAX_ANGLE - (swingCycle - 1) * PENDULUM.SWING_RANGE;

        setCurrentBeat(currentBeatIndex);
        setMeasureCount(currentMeasure);
        setPendulumAngle(angle);

        const elapsedMs = elapsed * 1000;
        setElapsedTime(elapsedMs);

        if (countdownTime > 0 && elapsedMs >= countdownTime) {
          handleStop();
          return;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, bpm, beatsPerMeasure, countdownTime]);

  // Scheduler for precise timing
  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      const scheduleNotes = () => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const secondsPerBeat = 60.0 / bpm;

        while (
          nextNoteTimeRef.current <
          ctx.currentTime + TIMING.LOOK_AHEAD_SECONDS
        ) {
          playClick(nextNoteTimeRef.current, schedulerBeatRef.current);
          nextNoteTimeRef.current += secondsPerBeat;
          schedulerBeatRef.current =
            (schedulerBeatRef.current + 1) % beatsPerMeasure;
        }
      };

      schedulerIntervalRef.current = setInterval(
        scheduleNotes,
        TIMING.SCHEDULER_INTERVAL_MS
      );
    }

    return () => {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
      }
    };
  }, [isPlaying, bpm, beatsPerMeasure, playClick]);

  const handleStart = async () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Set countdown if timer is set
    const totalMinutes = parseInt(timerMinutes) || 0;
    const totalSeconds = parseInt(timerSeconds) || 0;
    const totalMs = (totalMinutes * 60 + totalSeconds) * 1000;
    if (totalMs > 0) {
      setCountdownTime(totalMs);
    }

    startAudioTimeRef.current = ctx.currentTime;
    nextNoteTimeRef.current = ctx.currentTime;
    schedulerBeatRef.current = 0;
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
      schedulerIntervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleReset = () => {
    handleStop();
    setCurrentBeat(0);
    setMeasureCount(0);
    setPendulumAngle(0);
    setElapsedTime(0);
    setCountdownTime(0);
    startAudioTimeRef.current = 0;
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const remainingTime =
    countdownTime > 0 ? Math.max(0, countdownTime - elapsedTime) : 0;

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        {/* Time Signature */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">박자</span>
          <input
            type="number"
            min="1"
            max="12"
            value={beatsPerMeasure}
            onChange={(e) =>
              onSettingsChange({
                beatsPerMeasure: Math.max(
                  1,
                  Math.min(12, parseInt(e.target.value) || 4)
                ),
              })
            }
            className="w-12 rounded border bg-background px-2 py-1 text-center"
            disabled={isPlaying}
          />
          <span>/</span>
          <select
            value={beatUnit}
            onChange={(e) =>
              onSettingsChange({ beatUnit: parseInt(e.target.value) })
            }
            className="rounded border bg-background px-2 py-1"
            disabled={isPlaying}
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="16">16</option>
          </select>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">타이머</span>
          <input
            type="number"
            min="0"
            max="99"
            value={timerMinutes}
            onChange={(e) => onSettingsChange({ timerMinutes: e.target.value })}
            placeholder="0"
            className="w-12 rounded border bg-background px-2 py-1 text-center"
            disabled={isPlaying}
          />
          <span>분</span>
          <input
            type="number"
            min="0"
            max="59"
            value={timerSeconds}
            onChange={(e) => onSettingsChange({ timerSeconds: e.target.value })}
            placeholder="0"
            className="w-12 rounded border bg-background px-2 py-1 text-center"
            disabled={isPlaying}
          />
          <span>초</span>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex items-center justify-center gap-8">
        {/* BPM */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">BPM</div>
          <div className="text-5xl font-bold tabular-nums">{bpm}</div>
        </div>

        {/* Pendulum */}
        <div className="h-32 w-24">
          <svg viewBox="0 0 100 120" className="h-full w-full">
            {/* Base */}
            <rect
              x="15"
              y="112"
              width="70"
              height="4"
              rx="2"
              fill={COLORS.PENDULUM_BASE}
            />
            {/* Metronome body */}
            <path
              d="M 50 22 L 22 112 L 78 112 Z"
              fill={COLORS.PENDULUM_BG}
              stroke={COLORS.PENDULUM_BASE}
              strokeWidth="1.5"
            />
            {/* Swinging arm */}
            <g
              style={{
                transformOrigin: '50px 108px',
                transform: `rotate(${pendulumAngle}deg)`,
              }}
              className="transition-transform duration-50"
            >
              <line
                x1="50"
                y1="28"
                x2="50"
                y2="108"
                stroke={COLORS.PENDULUM_ARM}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Weight */}
              <circle cx="50" cy="55" r="4" fill={COLORS.PENDULUM_ARM} />
            </g>
            {/* Pivot point */}
            <circle cx="50" cy="108" r="2.5" fill={COLORS.PENDULUM_PIVOT} />
          </svg>
        </div>

        {/* Volume */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground">볼륨</div>
          <div className="text-5xl font-bold tabular-nums">{volume}</div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Slider
            value={[bpm]}
            onValueChange={([v]) => onSettingsChange({ bpm: v })}
            min={BPM_RANGE.MIN}
            max={BPM_RANGE.MAX}
            step={1}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>느림</span>
            <span>빠름</span>
          </div>
        </div>
        <div>
          <Slider
            value={[volume]}
            onValueChange={([v]) => onSettingsChange({ volume: v })}
            min={0}
            max={100}
            step={1}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>작게</span>
            <span>크게</span>
          </div>
        </div>
      </div>

      {/* Beat Visualization */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <NoteIcon
              unit={beatUnit}
              isActive={isPlaying && i === currentBeat}
              isFirst={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Info Display */}
      <div className="flex justify-center gap-8 text-center">
        <div>
          <div className="text-xs text-muted-foreground">마디</div>
          <div className="text-2xl font-bold tabular-nums">{measureCount}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">경과 시간</div>
          <div className="font-mono text-2xl tabular-nums">
            {formatTime(elapsedTime)}
          </div>
        </div>
        {countdownTime > 0 && (
          <div>
            <div className="text-xs text-muted-foreground">남은 시간</div>
            <div className="font-mono text-2xl tabular-nums text-primary">
              {formatTime(remainingTime)}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <Button
          size="lg"
          onClick={isPlaying ? handleStop : handleStart}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5" />
              정지
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              시작
            </>
          )}
        </Button>
        <Button variant="outline" size="lg" onClick={handleReset}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Tool Definition
export const metronomeTool: ToolDefinition<MetronomeSettings> = {
  meta: {
    id: 'metronome',
    name: {
      ko: '메트로놈',
      en: 'Metronome',
    },
    description: {
      ko: '정확한 템포 연습을 위한 메트로놈',
      en: 'Precision metronome for tempo practice',
    },
    icon: '⏱️',
    category: 'music',
    defaultSize: 'lg',
    minSize: { width: 320, height: 400 },
    tags: ['tempo', 'practice', 'rhythm', 'bpm'],
  },
  defaultSettings,
  component: MetronomeComponent,
};

// Auto-register
registerTool(metronomeTool);
