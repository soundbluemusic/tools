'use client';

import * as React from 'react';
import { Volume2, VolumeX, Headphones, Circle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Knob } from './knob';
import { useProjectStore, type Track } from '@/stores/project-store';
import { cn } from '@/lib/utils';

// ========================================
// Track Header Component
// ========================================

interface TrackHeaderProps {
  track: Track;
  className?: string;
}

export function TrackHeader({ track, className }: TrackHeaderProps) {
  const updateTrack = useProjectStore((s) => s.updateTrack);
  const deleteTrack = useProjectStore((s) => s.deleteTrack);
  const selectTrack = useProjectStore((s) => s.selectTrack);
  const selectedTrackIds = useProjectStore((s) => s.selectedTrackIds);

  const isSelected = selectedTrackIds.includes(track.id);

  const handleMute = () => {
    updateTrack(track.id, { mute: !track.mute });
  };

  const handleSolo = () => {
    updateTrack(track.id, { solo: !track.solo });
  };

  const handleArm = () => {
    updateTrack(track.id, { armed: !track.armed });
  };

  const handleVolumeChange = (value: number) => {
    updateTrack(track.id, { volume: value });
  };

  const handlePanChange = (value: number) => {
    updateTrack(track.id, { pan: value });
  };

  const handleDelete = () => {
    if (confirm(`"${track.name}" 트랙을 삭제하시겠습니까?`)) {
      deleteTrack(track.id);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    selectTrack(track.id, e.shiftKey || e.metaKey);
  };

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 p-3 transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent',
        className
      )}
      onClick={handleClick}
    >
      {/* Top Row: Name and Delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Color Indicator */}
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: track.color }}
          />
          {/* Track Name */}
          <span className="text-sm font-medium">{track.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Middle Row: Buttons */}
      <div className="flex items-center gap-1">
        {/* Mute */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6',
            track.mute && 'bg-destructive text-destructive-foreground'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleMute();
          }}
          title="음소거"
        >
          {track.mute ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>

        {/* Solo */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6',
            track.solo && 'bg-yellow-500 text-yellow-950'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleSolo();
          }}
          title="솔로"
        >
          <Headphones className="h-3 w-3" />
        </Button>

        {/* Record Arm */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6',
            track.armed && 'bg-red-500 text-white animate-pulse'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleArm();
          }}
          title="녹음 대기"
        >
          <Circle className="h-3 w-3" />
        </Button>
      </div>

      {/* Bottom Row: Knobs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">VOL</span>
          <Knob
            value={track.volume}
            min={0}
            max={1}
            step={0.01}
            size={24}
            onChange={handleVolumeChange}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">PAN</span>
          <Knob
            value={track.pan}
            min={-1}
            max={1}
            step={0.01}
            size={24}
            bipolar
            onChange={handlePanChange}
          />
        </div>
      </div>
    </div>
  );
}
