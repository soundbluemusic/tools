'use client';

import * as React from 'react';
import { Plus, Music, Mic, Piano } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackHeader } from './track-header';
import { useProjectStore, type Track } from '@/stores/project-store';
import { cn } from '@/lib/utils';

// ========================================
// Track List Component
// ========================================

interface TrackListProps {
  className?: string;
}

export function TrackList({ className }: TrackListProps) {
  const tracks = useProjectStore((s) => s.tracks);
  const createTrack = useProjectStore((s) => s.createTrack);
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const handleAddTrack = (type: Track['type']) => {
    createTrack(type);
    setShowAddMenu(false);
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">트랙</span>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {showAddMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => handleAddTrack('audio')}
              >
                <Mic className="h-4 w-4" />
                오디오 트랙
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => handleAddTrack('midi')}
              >
                <Music className="h-4 w-4" />
                MIDI 트랙
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => handleAddTrack('instrument')}
              >
                <Piano className="h-4 w-4" />
                인스트루먼트 트랙
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
            <Music className="h-8 w-8 opacity-50" />
            <p className="text-sm">트랙이 없습니다</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddTrack('audio')}
            >
              <Plus className="mr-1 h-3 w-3" />
              트랙 추가
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
