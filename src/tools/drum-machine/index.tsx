'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// Drum Machine Tool - 드럼 머신
// ========================================

const DRUM_SOUNDS = [
  { id: 'kick', name: 'Kick', freq: 60, decay: 0.5 },
  { id: 'snare', name: 'Snare', freq: 200, decay: 0.2 },
  { id: 'hihat', name: 'Hi-Hat', freq: 800, decay: 0.05 },
  { id: 'clap', name: 'Clap', freq: 400, decay: 0.15 },
] as const;

type DrumId = (typeof DRUM_SOUNDS)[number]['id'];

export interface DrumMachineSettings {
  bpm: number;
  steps: number;
  pattern: Record<DrumId, boolean[]>;
  volume: number;
  swing: number;
  [key: string]: unknown;
}

const createEmptyPattern = (steps: number): Record<DrumId, boolean[]> => ({
  kick: Array(steps).fill(false),
  snare: Array(steps).fill(false),
  hihat: Array(steps).fill(false),
  clap: Array(steps).fill(false),
});

const defaultSettings: DrumMachineSettings = {
  bpm: 120,
  steps: 16,
  pattern: {
    kick: [
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    snare: [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ],
    hihat: [
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ],
    clap: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ],
  },
  volume: 0.7,
  swing: 0,
};

function DrumMachineComponent({
  settings,
  onSettingsChange,
}: ToolProps<DrumMachineSettings>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef(0);
  const currentStepRef = useRef(0);

  const { bpm, steps, pattern, volume } = settings;

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play drum sound
  const playDrum = useCallback(
    (drumId: DrumId, time: number) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const drum = DRUM_SOUNDS.find((d) => d.id === drumId);
      if (!drum) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (drumId === 'kick') {
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(drum.freq, time + 0.05);
        osc.type = 'sine';
      } else if (drumId === 'snare') {
        osc.frequency.value = drum.freq;
        osc.type = 'triangle';
        // Add noise for snare
        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noise.frequency.value = 1000;
        noise.type = 'square';
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseGain.gain.setValueAtTime(volume * 0.3, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + drum.decay);
        noise.start(time);
        noise.stop(time + drum.decay);
      } else if (drumId === 'hihat') {
        osc.frequency.value = drum.freq;
        osc.type = 'square';
      } else {
        osc.frequency.value = drum.freq;
        osc.type = 'sawtooth';
      }

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + drum.decay);

      osc.start(time);
      osc.stop(time + drum.decay);
    },
    [volume]
  );

  // Scheduler for precise timing
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.1;
    const lookahead = 25; // ms

    while (nextStepTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const step = currentStepRef.current;

      // Play drums for this step
      DRUM_SOUNDS.forEach((drum) => {
        if (pattern[drum.id][step]) {
          playDrum(drum.id, nextStepTimeRef.current);
        }
      });

      // Advance step
      const secondsPerBeat = 60.0 / bpm / 4; // 16th notes
      nextStepTimeRef.current += secondsPerBeat;
      currentStepRef.current = (step + 1) % steps;

      // Update UI
      setCurrentStep(step);
    }

    schedulerRef.current = window.setTimeout(scheduler, lookahead);
  }, [bpm, steps, pattern, playDrum]);

  // Toggle play/stop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current);
        schedulerRef.current = null;
      }
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      currentStepRef.current = 0;
      nextStepTimeRef.current = audioContextRef.current!.currentTime;
      scheduler();
      setIsPlaying(true);
    }
  }, [isPlaying, scheduler]);

  // Toggle pattern step
  const toggleStep = (drumId: DrumId, step: number) => {
    const newPattern = { ...pattern };
    newPattern[drumId] = [...newPattern[drumId]];
    newPattern[drumId][step] = !newPattern[drumId][step];
    onSettingsChange({ pattern: newPattern });
  };

  // Clear pattern
  const clearPattern = () => {
    onSettingsChange({ pattern: createEmptyPattern(steps) });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? 'destructive' : 'default'}
            size="sm"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={clearPattern}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">BPM</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) =>
                onSettingsChange({
                  bpm: Math.max(
                    40,
                    Math.min(300, parseInt(e.target.value) || 120)
                  ),
                })
              }
              className="w-16 rounded border bg-background px-2 py-1 text-center text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Vol</span>
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => onSettingsChange({ volume: v / 100 })}
              max={100}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-2">
          {DRUM_SOUNDS.map((drum) => (
            <div key={drum.id} className="flex items-center gap-2">
              <span className="w-16 text-xs font-medium">{drum.name}</span>
              <div className="flex gap-1">
                {Array.from({ length: steps }).map((_, step) => (
                  <button
                    key={step}
                    onClick={() => toggleStep(drum.id, step)}
                    className={cn(
                      'h-8 w-8 rounded border transition-all',
                      pattern[drum.id][step]
                        ? 'bg-primary border-primary'
                        : 'bg-muted hover:bg-muted/80',
                      currentStep === step &&
                        isPlaying &&
                        'ring-2 ring-yellow-400',
                      step % 4 === 0 && 'border-l-2 border-l-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 pl-[72px]">
        {Array.from({ length: steps }).map((_, step) => (
          <div
            key={step}
            className={cn(
              'h-1 w-8 rounded-full',
              currentStep === step && isPlaying ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Tool Definition
export const drumMachineTool: ToolDefinition<DrumMachineSettings> = {
  meta: {
    id: 'drum-machine',
    name: {
      ko: '드럼 머신',
      en: 'Drum Machine',
    },
    description: {
      ko: '16스텝 드럼 패턴 시퀀서',
      en: '16-step drum pattern sequencer',
    },
    icon: '🥁',
    category: 'music',
    defaultSize: 'lg',
    minSize: { width: 400, height: 300 },
    tags: ['drums', 'beats', 'sequencer', 'rhythm'],
  },
  defaultSettings,
  component: DrumMachineComponent,
};

// Auto-register
registerTool(drumMachineTool);
