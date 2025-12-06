'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';
import { useAudioStore } from '@/stores/audio-store';
import { useProjectStore, type Track, type Clip } from '@/stores/project-store';
import { cn } from '@/lib/utils';

// ========================================
// Timeline Component (Pixi.js)
// ========================================

interface TimelineProps {
  tracks: Track[];
  clips: Clip[];
  className?: string;
}

const TRACK_HEIGHT = 80;
const HEADER_HEIGHT = 30;
const PIXELS_PER_BEAT = 40;

export function Timeline({ tracks, clips, className }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const gridRef = useRef<Graphics | null>(null);
  const clipsContainerRef = useRef<Container | null>(null);
  const playheadRef = useRef<Graphics | null>(null);

  const currentTime = useAudioStore((s) => s.transport.currentTime);
  const bpm = useAudioStore((s) => s.transport.bpm);
  const isPlaying = useAudioStore((s) => s.transport.isPlaying);
  const createClip = useProjectStore((s) => s.createClip);
  const selectedClipIds = useProjectStore((s) => s.selectedClipIds);
  const selectClip = useProjectStore((s) => s.selectClip);

  // Calculate playhead position
  const beatsPerSecond = bpm / 60;
  const playheadX = currentTime * beatsPerSecond * PIXELS_PER_BEAT;

  // Initialize Pixi.js
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Local drawGrid function to avoid dependency issues
    const drawGridLocal = (
      g: Graphics,
      w: number,
      h: number,
      trackCount: number
    ) => {
      g.clear();

      // Background
      g.rect(0, 0, w, h);
      g.fill(0x1a1a1a);

      // Header background
      g.rect(0, 0, w, HEADER_HEIGHT);
      g.fill(0x252525);

      // Track lanes
      for (let i = 0; i < trackCount; i++) {
        const y = HEADER_HEIGHT + i * TRACK_HEIGHT;
        g.rect(0, y, w, TRACK_HEIGHT);
        g.fill(i % 2 === 0 ? 0x1f1f1f : 0x1a1a1a);
        g.moveTo(0, y + TRACK_HEIGHT);
        g.lineTo(w, y + TRACK_HEIGHT);
        g.stroke({ width: 1, color: 0x333333 });
      }

      // Beat lines
      const totalBeats = Math.ceil(w / PIXELS_PER_BEAT);
      for (let beat = 0; beat <= totalBeats; beat++) {
        const x = beat * PIXELS_PER_BEAT;
        const isBar = beat % 4 === 0;
        g.moveTo(x, 0);
        g.lineTo(x, h);
        g.stroke({
          width: isBar ? 1 : 0.5,
          color: isBar ? 0x444444 : 0x2a2a2a,
        });

        if (isBar && beat > 0) {
          const barNumber = beat / 4 + 1;
          const text = new Text({
            text: barNumber.toString(),
            style: new TextStyle({
              fontSize: 10,
              fill: 0x888888,
              fontFamily: 'monospace',
            }),
          });
          text.x = x + 4;
          text.y = 8;
          g.addChild(text);
        }
      }
    };

    const initApp = async () => {
      const app = new Application();

      await app.init({
        width,
        height,
        backgroundColor: 0x1a1a1a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      container.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Create grid
      const grid = new Graphics();
      app.stage.addChild(grid);
      gridRef.current = grid;

      // Create clips container
      const clipsContainer = new Container();
      app.stage.addChild(clipsContainer);
      clipsContainerRef.current = clipsContainer;

      // Create playhead
      const playhead = new Graphics();
      app.stage.addChild(playhead);
      playheadRef.current = playhead;

      // Draw initial grid
      drawGridLocal(grid, width, height, tracks.length);
    };

    initApp();

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (appRef.current && entry) {
        const { width, height } = entry.contentRect;
        appRef.current.renderer.resize(width, height);
        if (gridRef.current) {
          drawGridLocal(gridRef.current, width, height, tracks.length);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [tracks.length]);

  // Update clips
  useEffect(() => {
    if (!clipsContainerRef.current) return;

    const container = clipsContainerRef.current;
    container.removeChildren();

    clips.forEach((clip) => {
      const trackIndex = tracks.findIndex((t) => t.id === clip.trackId);
      if (trackIndex === -1) return;

      const clipGraphics = new Graphics();
      const x = clip.startTime * PIXELS_PER_BEAT;
      const y = HEADER_HEIGHT + trackIndex * TRACK_HEIGHT + 4;
      const width = clip.duration * PIXELS_PER_BEAT - 2;
      const height = TRACK_HEIGHT - 8;

      // Parse hex color
      const colorHex = parseInt(clip.color.replace('#', ''), 16);
      const isSelected = selectedClipIds.includes(clip.id);

      // Clip background
      clipGraphics.roundRect(x, y, width, height, 4);
      clipGraphics.fill({ color: colorHex, alpha: 0.7 });

      // Selection border
      if (isSelected) {
        clipGraphics.roundRect(x, y, width, height, 4);
        clipGraphics.stroke({ width: 2, color: 0xffffff });
      }

      // Clip name
      const nameText = new Text({
        text: clip.name,
        style: new TextStyle({
          fontSize: 11,
          fill: 0xffffff,
          fontFamily: 'sans-serif',
        }),
      });
      nameText.x = x + 6;
      nameText.y = y + 6;
      clipGraphics.addChild(nameText);

      // Make interactive
      clipGraphics.eventMode = 'static';
      clipGraphics.cursor = 'pointer';
      clipGraphics.on('pointerdown', () => {
        selectClip(clip.id);
      });

      container.addChild(clipGraphics);
    });
  }, [clips, tracks, selectedClipIds, selectClip]);

  // Update playhead
  useEffect(() => {
    if (!playheadRef.current) return;

    const g = playheadRef.current;
    g.clear();

    const height = containerRef.current?.clientHeight || 400;

    // Playhead line
    g.moveTo(playheadX, 0);
    g.lineTo(playheadX, height);
    g.stroke({ width: 2, color: 0xff4444 });

    // Playhead head
    g.moveTo(playheadX, 0);
    g.lineTo(playheadX - 6, 0);
    g.lineTo(playheadX, 12);
    g.lineTo(playheadX + 6, 0);
    g.closePath();
    g.fill(0xff4444);
  }, [playheadX]);

  // Double-click to create clip
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - HEADER_HEIGHT;

    if (y < 0) return; // Clicked on header

    const trackIndex = Math.floor(y / TRACK_HEIGHT);
    const track = tracks[trackIndex];
    if (!track) return;

    const beat = Math.floor(x / PIXELS_PER_BEAT);
    createClip(track.id, beat);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full', className)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Overlay for empty state */}
      {tracks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>트랙을 추가하여 시작하세요</p>
        </div>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute right-4 top-2 flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-xs text-red-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          REC
        </div>
      )}
    </div>
  );
}
