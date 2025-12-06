'use client';

import { useEffect, useCallback } from 'react';
import { Transport } from '@/components/daw/transport';
import { TrackList } from '@/components/daw/track-list';
import { Timeline } from '@/components/daw/timeline';
import { Mixer } from '@/components/daw/mixer';
import { Toolbar } from '@/components/daw/toolbar';
import { useAudioStore } from '@/stores/audio-store';
import { useProjectStore } from '@/stores/project-store';

export default function DAWPage() {
  const initialize = useAudioStore((s) => s.initialize);
  const play = useAudioStore((s) => s.play);
  const pause = useAudioStore((s) => s.pause);
  const stop = useAudioStore((s) => s.stop);
  const isPlaying = useAudioStore((s) => s.transport.isPlaying);
  const tracks = useProjectStore((s) => s.tracks);
  const clips = useProjectStore((s) => s.clips);

  // Initialize audio engine on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case 'Enter':
          e.preventDefault();
          stop();
          break;
        case 'Home':
          e.preventDefault();
          stop();
          break;
      }
    },
    [isPlaying, play, pause, stop]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="flex h-12 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">🎹 Web DAW</h1>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
            Beta
          </span>
        </div>
        <Toolbar />
      </header>

      {/* Transport */}
      <div className="border-b bg-card/50 px-4 py-2">
        <Transport />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Track List (Left Panel) */}
        <aside className="w-64 flex-shrink-0 border-r bg-card/50">
          <TrackList />
        </aside>

        {/* Timeline (Center) */}
        <main className="flex-1 overflow-hidden">
          <Timeline tracks={tracks} clips={clips} />
        </main>

        {/* Mixer (Right Panel) */}
        <aside className="w-72 flex-shrink-0 border-l bg-card/50">
          <Mixer />
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="flex h-6 items-center justify-between border-t bg-card px-4 text-xs text-muted-foreground">
        <span>Tracks: {tracks.length}</span>
        <span>Clips: {clips.length}</span>
        <span>48kHz / 128 samples</span>
      </footer>
    </div>
  );
}
