'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Volume2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// Drum Synth Tool - 드럼 신디사이저
// ========================================

interface DrumParams {
  pitch: number;
  decay: number;
  tone: number;
  snap: number;
}

export interface DrumSynthSettings {
  kick: DrumParams;
  snare: DrumParams;
  hihat: DrumParams;
  tom: DrumParams;
  volume: number;
  selectedDrum: 'kick' | 'snare' | 'hihat' | 'tom';
  [key: string]: unknown;
}

const defaultSettings: DrumSynthSettings = {
  kick: { pitch: 60, decay: 0.5, tone: 50, snap: 30 },
  snare: { pitch: 200, decay: 0.2, tone: 70, snap: 80 },
  hihat: { pitch: 800, decay: 0.05, tone: 90, snap: 10 },
  tom: { pitch: 120, decay: 0.3, tone: 40, snap: 20 },
  volume: 0.7,
  selectedDrum: 'kick',
};

const DRUMS = [
  { id: 'kick', name: 'Kick', icon: '🔴' },
  { id: 'snare', name: 'Snare', icon: '🟡' },
  { id: 'hihat', name: 'Hi-Hat', icon: '🟢' },
  { id: 'tom', name: 'Tom', icon: '🔵' },
] as const;

function DrumSynthComponent({
  settings,
  onSettingsChange,
}: ToolProps<DrumSynthSettings>) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isTriggering, setIsTriggering] = useState<string | null>(null);

  const { volume, selectedDrum } = settings;
  const drumParams = settings[selectedDrum] as DrumParams;

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play drum sound
  const playDrum = useCallback(
    (drumId: 'kick' | 'snare' | 'hihat' | 'tom') => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const params = settings[drumId] as DrumParams;
      const time = ctx.currentTime;

      // Main oscillator
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ctx.destination);

      // Configure based on drum type
      if (drumId === 'kick') {
        osc.frequency.setValueAtTime(params.pitch * 2, time);
        osc.frequency.exponentialRampToValueAtTime(params.pitch, time + 0.05);
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 200 + params.tone * 3;
      } else if (drumId === 'snare') {
        osc.frequency.value = params.pitch;
        osc.type = 'triangle';
        filter.type = 'highpass';
        filter.frequency.value = params.tone * 5;

        // Noise for snare
        const bufferSize = ctx.sampleRate * params.decay;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();

        noise.buffer = noiseBuffer;
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1000 + params.tone * 30;

        noiseGain.gain.setValueAtTime(volume * (params.snap / 100), time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);

        noise.start(time);
        noise.stop(time + params.decay);
      } else if (drumId === 'hihat') {
        osc.frequency.value = params.pitch;
        osc.type = 'square';
        filter.type = 'highpass';
        filter.frequency.value = 5000 + params.tone * 50;
      } else {
        // Tom
        osc.frequency.setValueAtTime(params.pitch * 1.5, time);
        osc.frequency.exponentialRampToValueAtTime(params.pitch, time + 0.02);
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.value = 500 + params.tone * 10;
      }

      oscGain.gain.setValueAtTime(volume, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);

      osc.start(time);
      osc.stop(time + params.decay);

      // Visual feedback
      setIsTriggering(drumId);
      setTimeout(() => setIsTriggering(null), 100);
    },
    [settings, volume]
  );

  // Update drum parameter
  const updateParam = (param: keyof DrumParams, value: number) => {
    onSettingsChange({
      [selectedDrum]: {
        ...drumParams,
        [param]: value,
      },
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Drum Pads */}
      <div className="grid grid-cols-4 gap-2">
        {DRUMS.map((drum) => (
          <button
            key={drum.id}
            onClick={() => playDrum(drum.id)}
            onMouseDown={() => onSettingsChange({ selectedDrum: drum.id })}
            className={cn(
              'flex h-20 flex-col items-center justify-center rounded-lg border-2 transition-all',
              selectedDrum === drum.id
                ? 'border-primary bg-primary/10'
                : 'border-muted bg-muted/50 hover:bg-muted',
              isTriggering === drum.id && 'scale-95 bg-primary/30'
            )}
          >
            <span className="text-2xl">{drum.icon}</span>
            <span className="text-xs font-medium">{drum.name}</span>
          </button>
        ))}
      </div>

      {/* Parameter Controls */}
      <div className="flex-1 rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold">
          {DRUMS.find((d) => d.id === selectedDrum)?.name} Parameters
        </h3>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pitch</span>
              <span className="text-xs text-muted-foreground">
                {drumParams.pitch} Hz
              </span>
            </div>
            <Slider
              value={[drumParams.pitch]}
              onValueChange={([v]) => updateParam('pitch', v)}
              min={20}
              max={1000}
              step={1}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Decay</span>
              <span className="text-xs text-muted-foreground">
                {(drumParams.decay * 1000).toFixed(0)} ms
              </span>
            </div>
            <Slider
              value={[drumParams.decay * 1000]}
              onValueChange={([v]) => updateParam('decay', v / 1000)}
              min={10}
              max={1000}
              step={10}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tone</span>
              <span className="text-xs text-muted-foreground">
                {drumParams.tone}%
              </span>
            </div>
            <Slider
              value={[drumParams.tone]}
              onValueChange={([v]) => updateParam('tone', v)}
              min={0}
              max={100}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Snap/Noise</span>
              <span className="text-xs text-muted-foreground">
                {drumParams.snap}%
              </span>
            </div>
            <Slider
              value={[drumParams.snap]}
              onValueChange={([v]) => updateParam('snap', v)}
              min={0}
              max={100}
            />
          </div>
        </div>
      </div>

      {/* Master Volume */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume * 100]}
          onValueChange={([v]) => onSettingsChange({ volume: v / 100 })}
          max={100}
          className="flex-1"
        />
        <span className="w-10 text-right text-xs text-muted-foreground">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Play Button */}
      <Button
        onClick={() => playDrum(selectedDrum)}
        size="lg"
        className="w-full"
      >
        <Play className="mr-2 h-5 w-5" />
        Play {DRUMS.find((d) => d.id === selectedDrum)?.name}
      </Button>
    </div>
  );
}

// Tool Definition
export const drumSynthTool: ToolDefinition<DrumSynthSettings> = {
  meta: {
    id: 'drum-synth',
    name: {
      ko: '드럼 신스',
      en: 'Drum Synth',
    },
    description: {
      ko: '파라미터 조절 가능한 드럼 사운드 합성',
      en: 'Synthesize drum sounds with adjustable parameters',
    },
    icon: '🎛️',
    category: 'music',
    defaultSize: 'md',
    minSize: { width: 300, height: 400 },
    tags: ['drums', 'synthesizer', 'sound-design'],
  },
  defaultSettings,
  component: DrumSynthComponent,
};

// Auto-register
registerTool(drumSynthTool);
