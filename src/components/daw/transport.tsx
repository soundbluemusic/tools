'use client';

import * as React from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioStore } from '@/stores/audio-store';
import { cn } from '@/lib/utils';

// ========================================
// Transport Controls Component
// ========================================

interface TransportProps {
  className?: string;
}

export function Transport({ className }: TransportProps) {
  const { transport, play, pause, stop, toggleLoop, setBpm } = useAudioStore();

  const {
    isPlaying,
    isPaused,
    isLooping,
    bpm,
    currentTime,
    currentBar,
    currentBeat,
  } = transport;

  // Format time as MM:SS:mmm
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  };

  // Format position as BAR.BEAT
  const formatPosition = (): string => {
    return `${currentBar + 1}.${Math.floor(currentBeat) + 1}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseFloat(e.target.value);
    if (!isNaN(newBpm)) {
      setBpm(newBpm);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-2 bg-card border rounded-lg',
        className
      )}
    >
      {/* Position Display */}
      <div className="flex flex-col items-center min-w-[100px]">
        <span className="text-2xl font-mono font-bold tabular-nums">
          {formatPosition()}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Transport Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          title="처음으로 (Home)"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          title={isPlaying ? '일시정지 (Space)' : '재생 (Space)'}
          className={cn(isPlaying && 'bg-primary/10')}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={stop} title="정지 (Enter)">
          <Square className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" title="끝으로 (End)">
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLoop}
          title="반복 (L)"
          className={cn(isLooping && 'bg-primary text-primary-foreground')}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      {/* BPM */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">BPM</label>
        <input
          type="number"
          value={bpm}
          onChange={handleBpmChange}
          min={20}
          max={300}
          step={1}
          className="w-16 h-8 px-2 text-center font-mono bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-2 ml-auto">
        {isPlaying && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Playing
          </span>
        )}
        {isPaused && (
          <span className="flex items-center gap-1 text-xs text-yellow-500">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Paused
          </span>
        )}
      </div>
    </div>
  );
}
