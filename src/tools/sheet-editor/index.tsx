'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// Sheet Editor Tool - 악보 편집기
// ========================================

export interface SheetNote {
  id: string;
  pitch: number; // MIDI pitch
  measure: number;
  beat: number; // Beat within measure (0-based)
  duration: number; // In beats
}

export interface SheetEditorSettings {
  notes: SheetNote[];
  timeSignature: [number, number]; // [beats per measure, beat unit]
  keySignature: number; // Number of sharps (positive) or flats (negative)
  tempo: number;
  measures: number;
  [key: string]: unknown;
}

const defaultSettings: SheetEditorSettings = {
  notes: [],
  timeSignature: [4, 4],
  keySignature: 0,
  tempo: 120,
  measures: 8,
};

const STAFF_LINE_SPACING = 12;
const MEASURE_WIDTH = 120;

function SheetEditorComponent({
  settings,
  onSettingsChange,
  size,
}: ToolProps<SheetEditorSettings>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  const { notes, timeSignature, measures } = settings;

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
        backgroundColor: 0xffffff,
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

  // Render sheet music
  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    const height = app.screen.height;

    app.stage.removeChildren();

    const staffContainer = new Container();
    app.stage.addChild(staffContainer);

    const g = new Graphics();
    staffContainer.addChild(g);

    const startX = 60;
    const startY = height / 2 - STAFF_LINE_SPACING * 2;

    // Draw staff lines (5 lines)
    g.setStrokeStyle({ width: 1, color: 0x000000 });
    for (let i = 0; i < 5; i++) {
      const y = startY + i * STAFF_LINE_SPACING;
      g.moveTo(startX, y);
      g.lineTo(startX + measures * MEASURE_WIDTH, y);
      g.stroke();
    }

    // Draw clef (treble clef representation)
    const clefStyle = new TextStyle({
      fontFamily: 'serif',
      fontSize: 48,
      fill: 0x000000,
    });
    const clef = new Text({ text: '𝄞', style: clefStyle });
    clef.x = startX - 45;
    clef.y = startY - 15;
    staffContainer.addChild(clef);

    // Draw time signature
    const timeStyle = new TextStyle({
      fontFamily: 'serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0x000000,
    });
    const timeTop = new Text({
      text: String(timeSignature[0]),
      style: timeStyle,
    });
    timeTop.x = startX + 5;
    timeTop.y = startY;
    staffContainer.addChild(timeTop);

    const timeBottom = new Text({
      text: String(timeSignature[1]),
      style: timeStyle,
    });
    timeBottom.x = startX + 5;
    timeBottom.y = startY + STAFF_LINE_SPACING * 2;
    staffContainer.addChild(timeBottom);

    // Draw bar lines
    for (let m = 0; m <= measures; m++) {
      const x = startX + m * MEASURE_WIDTH;
      g.moveTo(x, startY);
      g.lineTo(x, startY + STAFF_LINE_SPACING * 4);
      g.stroke();
    }

    // Draw notes
    notes.forEach((note) => {
      const noteG = new Graphics();

      // Calculate position
      // Middle C (60) is on the first ledger line below staff
      const pitchOffset = note.pitch - 60; // Relative to middle C
      const linePosition = Math.floor(pitchOffset / 2);
      const y =
        startY +
        STAFF_LINE_SPACING * 4 -
        linePosition * (STAFF_LINE_SPACING / 2);
      const x =
        startX +
        note.measure * MEASURE_WIDTH +
        (note.beat + 0.5) * (MEASURE_WIDTH / timeSignature[0]);

      // Draw note head (filled oval)
      noteG.ellipse(x, y, 7, 5);
      noteG.fill(0x000000);

      // Draw stem
      noteG.moveTo(x + 6, y);
      noteG.lineTo(x + 6, y - 35);
      noteG.stroke({ width: 1.5, color: 0x000000 });

      // Draw ledger lines if needed
      if (y > startY + STAFF_LINE_SPACING * 4) {
        for (
          let ly = startY + STAFF_LINE_SPACING * 5;
          ly <= y;
          ly += STAFF_LINE_SPACING
        ) {
          noteG.moveTo(x - 10, ly);
          noteG.lineTo(x + 10, ly);
          noteG.stroke({ width: 1, color: 0x000000 });
        }
      }
      if (y < startY) {
        for (
          let ly = startY - STAFF_LINE_SPACING;
          ly >= y;
          ly -= STAFF_LINE_SPACING
        ) {
          noteG.moveTo(x - 10, ly);
          noteG.lineTo(x + 10, ly);
          noteG.stroke({ width: 1, color: 0x000000 });
        }
      }

      staffContainer.addChild(noteG);
    });
  }, [notes, timeSignature, measures]);

  // Add note on click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const height = rect.height;

      const startX = 60;
      const startY = height / 2 - STAFF_LINE_SPACING * 2;

      // Calculate measure and beat
      const measureFloat = (x - startX) / MEASURE_WIDTH;
      const measure = Math.floor(measureFloat);
      const beat = Math.floor((measureFloat - measure) * timeSignature[0]);

      if (measure < 0 || measure >= measures) return;

      // Calculate pitch from y position
      const linePosition = Math.round(
        (startY + STAFF_LINE_SPACING * 4 - y) / (STAFF_LINE_SPACING / 2)
      );
      const pitch = 60 + linePosition * 2;

      const newNote: SheetNote = {
        id: `note-${Date.now()}`,
        pitch,
        measure,
        beat,
        duration: 1,
      };

      onSettingsChange({ notes: [...notes, newNote] });
    },
    [notes, measures, timeSignature, onSettingsChange]
  );

  const clearNotes = () => {
    onSettingsChange({ notes: [] });
  };

  const addMeasure = () => {
    onSettingsChange({ measures: measures + 1 });
  };

  const removeMeasure = () => {
    if (measures > 1) {
      onSettingsChange({
        measures: measures - 1,
        notes: notes.filter((n) => n.measure < measures - 1),
      });
    }
  };

  const isCompact = size.width < 500;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div
        className={cn(
          'flex items-center gap-2 border-b p-2',
          isCompact && 'p-1'
        )}
      >
        <Button variant="ghost" size="sm" onClick={addMeasure}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeMeasure}
          disabled={measures <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{measures}마디</span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearNotes}
          disabled={notes.length === 0}
        >
          초기화
        </Button>
        <span className="text-xs text-muted-foreground">
          {notes.length} notes
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 cursor-crosshair overflow-hidden bg-white"
        onClick={handleCanvasClick}
      />
    </div>
  );
}

// Tool Definition
export const sheetEditorTool: ToolDefinition<SheetEditorSettings> = {
  meta: {
    id: 'sheet-editor',
    name: {
      ko: '악보 편집기',
      en: 'Sheet Editor',
    },
    description: {
      ko: '간단한 악보를 만들고 편집',
      en: 'Create and edit simple sheet music',
    },
    icon: '🎼',
    category: 'music',
    defaultSize: 'lg',
    minSize: { width: 500, height: 300 },
    tags: ['sheet', 'music', 'notation', 'compose'],
  },
  defaultSettings,
  component: SheetEditorComponent,
};

// Auto-register
registerTool(sheetEditorTool);
