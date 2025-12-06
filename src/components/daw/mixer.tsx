'use client';

import * as React from 'react';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fader, dbToLinear, linearToDb } from './fader';
import { Knob } from './knob';
import { useProjectStore, type Track } from '@/stores/project-store';
import { useAudioStore } from '@/stores/audio-store';
import { cn } from '@/lib/utils';

// ========================================
// Mixer Component
// ========================================

interface MixerProps {
  className?: string;
}

export function Mixer({ className }: MixerProps) {
  const tracks = useProjectStore((s) => s.tracks);
  const masterMeter = useAudioStore((s) => s.masterMeter);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="border-b px-3 py-2">
        <span className="text-sm font-medium">믹서</span>
      </div>

      {/* Channel Strips */}
      <div className="flex flex-1 gap-1 overflow-x-auto p-2">
        {/* Track Channels */}
        {tracks.map((track) => (
          <ChannelStrip key={track.id} track={track} />
        ))}

        {/* Master Channel */}
        <MasterStrip
          level={masterMeter.leftLevel}
          peak={masterMeter.leftPeak}
        />
      </div>
    </div>
  );
}

// ========================================
// Channel Strip Component
// ========================================

interface ChannelStripProps {
  track: Track;
}

function ChannelStrip({ track }: ChannelStripProps) {
  const updateTrack = useProjectStore((s) => s.updateTrack);

  const handleVolumeChange = (value: number) => {
    // Convert dB to linear
    const linear = dbToLinear(value);
    updateTrack(track.id, { volume: linear });
  };

  const handlePanChange = (value: number) => {
    updateTrack(track.id, { pan: value });
  };

  const handleMute = () => {
    updateTrack(track.id, { mute: !track.mute });
  };

  const handleSolo = () => {
    updateTrack(track.id, { solo: !track.solo });
  };

  // Convert linear to dB for display
  const volumeDb = linearToDb(track.volume);

  return (
    <div className="flex w-16 flex-shrink-0 flex-col items-center gap-2 rounded border bg-card p-2">
      {/* Track Color */}
      <div
        className="h-1 w-full rounded-full"
        style={{ backgroundColor: track.color }}
      />

      {/* Pan Knob */}
      <div className="flex flex-col items-center">
        <Knob
          value={track.pan}
          min={-1}
          max={1}
          step={0.01}
          size={32}
          bipolar
          onChange={handlePanChange}
        />
        <span className="text-[9px] text-muted-foreground">PAN</span>
      </div>

      {/* Fader */}
      <div className="flex-1">
        <Fader
          value={volumeDb}
          min={-60}
          max={6}
          onChange={handleVolumeChange}
          height={120}
        />
      </div>

      {/* Mute/Solo */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6',
            track.mute && 'bg-destructive text-destructive-foreground'
          )}
          onClick={handleMute}
        >
          {track.mute ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6',
            track.solo && 'bg-yellow-500 text-yellow-950'
          )}
          onClick={handleSolo}
        >
          <Headphones className="h-3 w-3" />
        </Button>
      </div>

      {/* Track Name */}
      <span className="w-full truncate text-center text-[10px]">
        {track.name}
      </span>
    </div>
  );
}

// ========================================
// Master Strip Component
// ========================================

interface MasterStripProps {
  level: number;
  peak: number;
}

function MasterStrip({ level, peak }: MasterStripProps) {
  const [masterVolume, setMasterVolume] = React.useState(0); // 0 dB

  return (
    <div className="flex w-20 flex-shrink-0 flex-col items-center gap-2 rounded border-2 border-primary/50 bg-card p-2">
      {/* Master Label */}
      <div className="flex h-1 w-full items-center justify-center rounded-full bg-primary" />

      {/* Stereo Meter */}
      <div className="flex gap-1">
        <MeterBar level={level} />
        <MeterBar level={level * 0.95} /> {/* Slight stereo variation */}
      </div>

      {/* Fader */}
      <div className="flex-1">
        <Fader
          value={masterVolume}
          min={-60}
          max={6}
          onChange={setMasterVolume}
          height={120}
        />
      </div>

      {/* Peak Display */}
      <div className="text-center">
        <span
          className={cn(
            'font-mono text-[10px]',
            peak > 0.9 ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          {linearToDb(peak).toFixed(1)} dB
        </span>
      </div>

      {/* Master Label */}
      <span className="text-[10px] font-medium">MASTER</span>
    </div>
  );
}

// ========================================
// Meter Bar Component
// ========================================

interface MeterBarProps {
  level: number;
}

function MeterBar({ level }: MeterBarProps) {
  const height = 80;
  const fillHeight = Math.min(level, 1) * height;

  return (
    <div
      className="relative w-2 overflow-hidden rounded-sm bg-muted"
      style={{ height }}
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 transition-all',
          level > 0.9
            ? 'bg-red-500'
            : level > 0.7
              ? 'bg-yellow-500'
              : 'bg-green-500'
        )}
        style={{ height: fillHeight }}
      />
    </div>
  );
}
