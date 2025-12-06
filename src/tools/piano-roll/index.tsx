'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Application, Graphics, Container } from 'pixi.js';
import { Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// Piano Roll Tool - 피아노 롤
// ========================================

export interface Note {
  id: string;
  pitch: number; // MIDI note number (0-127)
  start: number; // Start time in beats
  duration: number; // Duration in beats
}

export interface PianoRollSettings {
  notes: Note[];
  bpm: number;
  beatsPerMeasure: number;
  octaveRange: [number, number];
  gridSnap: number; // Snap to grid (0.25 = 16th note)
  [key: string]: unknown;
}

const defaultSettings: PianoRollSettings = {
  notes: [],
  bpm: 120,
  beatsPerMeasure: 4,
  octaveRange: [3, 5],
  gridSnap: 0.25,
};

const KEY_HEIGHT = 16;
const BEAT_WIDTH = 40;

function isBlackKey(pitch: number): boolean {
  const note = pitch % 12;
  return [1, 3, 6, 8, 10].includes(note);
}

function PianoRollComponent({
  settings,
  onSettingsChange,
  size,
}: ToolProps<PianoRollSettings>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { notes, bpm, octaveRange, gridSnap, beatsPerMeasure } = settings;

  const lowestPitch = octaveRange[0] * 12 + 12;
  const highestPitch = (octaveRange[1] + 1) * 12 + 11;
  const totalKeys = highestPitch - lowestPitch + 1;

  // Initialize Pixi.js
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

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
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Render piano roll
  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    const width = app.screen.width;
    const height = app.screen.height;

    app.stage.removeChildren();

    const pianoWidth = 50;
    const gridContainer = new Container();
    const notesContainer = new Container();

    app.stage.addChild(gridContainer);
    app.stage.addChild(notesContainer);

    const g = new Graphics();
    gridContainer.addChild(g);

    // Draw piano keys
    for (let i = 0; i < totalKeys; i++) {
      const pitch = highestPitch - i;
      const y = i * KEY_HEIGHT;
      const isBlack = isBlackKey(pitch);

      // Key background
      g.rect(0, y, pianoWidth, KEY_HEIGHT);
      g.fill(isBlack ? 0x333333 : 0xffffff);
      g.stroke({ width: 1, color: 0x000000 });

      // Grid row
      g.rect(pianoWidth, y, width - pianoWidth, KEY_HEIGHT);
      g.fill(isBlack ? 0x1f1f1f : 0x252525);
      g.stroke({ width: 0.5, color: 0x333333 });
    }

    // Draw beat lines
    const totalBeats = Math.ceil((width - pianoWidth) / BEAT_WIDTH);
    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = pianoWidth + beat * BEAT_WIDTH;
      const isBar = beat % beatsPerMeasure === 0;

      g.moveTo(x, 0);
      g.lineTo(x, height);
      g.stroke({
        width: isBar ? 1 : 0.5,
        color: isBar ? 0x555555 : 0x333333,
      });
    }

    // Draw notes
    notes.forEach((note) => {
      const noteG = new Graphics();
      const keyIndex = highestPitch - note.pitch;
      const x = pianoWidth + note.start * BEAT_WIDTH;
      const y = keyIndex * KEY_HEIGHT + 1;
      const noteWidth = note.duration * BEAT_WIDTH - 2;

      noteG.roundRect(x, y, noteWidth, KEY_HEIGHT - 2, 3);
      noteG.fill(0x3b82f6);

      noteG.eventMode = 'static';
      noteG.cursor = 'pointer';

      notesContainer.addChild(noteG);
    });

    // Draw playhead
    if (isPlaying) {
      const playheadX = pianoWidth + playhead * BEAT_WIDTH;
      g.moveTo(playheadX, 0);
      g.lineTo(playheadX, height);
      g.stroke({ width: 2, color: 0xff4444 });
    }
  }, [notes, totalKeys, highestPitch, beatsPerMeasure, playhead, isPlaying]);

  // Play note
  const playNote = useCallback((pitch: number, duration: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12);
    osc.type = 'triangle';

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  // Add note on click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left - 50; // Subtract piano width
      const y = e.clientY - rect.top;

      if (x < 0) return; // Clicked on piano

      const beat = Math.floor(x / BEAT_WIDTH / gridSnap) * gridSnap;
      const keyIndex = Math.floor(y / KEY_HEIGHT);
      const pitch = highestPitch - keyIndex;

      if (pitch < lowestPitch || pitch > highestPitch) return;

      const newNote: Note = {
        id: `note-${Date.now()}`,
        pitch,
        start: beat,
        duration: gridSnap,
      };

      onSettingsChange({ notes: [...notes, newNote] });
      playNote(pitch, 0.2);
    },
    [notes, gridSnap, highestPitch, lowestPitch, onSettingsChange, playNote]
  );

  const clearNotes = () => {
    onSettingsChange({ notes: [] });
  };

  const isCompact = size.width < 400;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div
        className={cn(
          'flex items-center gap-2 border-b p-2',
          isCompact && 'p-1'
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <span className="font-mono text-sm">{bpm} BPM</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearNotes}
          disabled={notes.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {notes.length} notes
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 cursor-crosshair overflow-hidden"
        onClick={handleCanvasClick}
      />
    </div>
  );
}

// Tool Definition
export const pianoRollTool: ToolDefinition<PianoRollSettings> = {
  meta: {
    id: 'piano-roll',
    name: {
      ko: '피아노 롤',
      en: 'Piano Roll',
    },
    description: {
      ko: 'MIDI 노트를 시각적으로 편집',
      en: 'Visual MIDI note editor',
    },
    icon: '🎹',
    category: 'music',
    defaultSize: 'lg',
    minSize: { width: 400, height: 300 },
    tags: ['midi', 'notes', 'compose', 'music'],
  },
  defaultSettings,
  component: PianoRollComponent,
};

// Auto-register
registerTool(pianoRollTool);
