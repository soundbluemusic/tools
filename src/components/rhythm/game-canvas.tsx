'use client';

import { useRef, useEffect } from 'react';
import { Application, Graphics, Container, Text, TextStyle } from 'pixi.js';
import { useRhythmStore } from '@/stores/rhythm-store';

// ========================================
// Rhythm Game Canvas (Pixi.js)
// ========================================

const LANE_COLORS = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55];
const LANE_WIDTH = 100;
const NOTE_HEIGHT = 30;
const HIT_LINE_Y_RATIO = 0.85;

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const notesContainerRef = useRef<Container | null>(null);
  const judgmentTextRef = useRef<Text | null>(null);

  const chart = useRhythmStore((s) => s.chart);
  const currentTime = useRhythmStore((s) => s.currentTime);
  const scrollSpeed = useRhythmStore((s) => s.scrollSpeed);
  const lanePressed = useRhythmStore((s) => s.lanePressed);
  const gameState = useRhythmStore((s) => s.gameState);

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
        backgroundColor: 0x0a0a0a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      container.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Create game layers
      const laneContainer = new Container();
      const notesContainer = new Container();
      const uiContainer = new Container();

      app.stage.addChild(laneContainer);
      app.stage.addChild(notesContainer);
      app.stage.addChild(uiContainer);
      notesContainerRef.current = notesContainer;

      // Draw lanes
      const laneStartX = (width - LANE_WIDTH * 4) / 2;
      const hitLineY = height * HIT_LINE_Y_RATIO;

      const laneGraphics = new Graphics();
      for (let i = 0; i < 4; i++) {
        const x = laneStartX + i * LANE_WIDTH;

        // Lane background
        laneGraphics.rect(x, 0, LANE_WIDTH, height);
        laneGraphics.fill({ color: 0x111111, alpha: 0.8 });

        // Lane borders
        laneGraphics.moveTo(x, 0);
        laneGraphics.lineTo(x, height);
        laneGraphics.stroke({ width: 1, color: 0x333333 });

        // Lane key labels
        const keyLabels = ['D', 'F', 'J', 'K'];
        const keyText = new Text({
          text: keyLabels[i],
          style: new TextStyle({
            fontSize: 24,
            fill: LANE_COLORS[i],
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }),
        });
        keyText.x = x + LANE_WIDTH / 2 - keyText.width / 2;
        keyText.y = hitLineY + 20;
        uiContainer.addChild(keyText);
      }

      // Right border
      laneGraphics.moveTo(laneStartX + LANE_WIDTH * 4, 0);
      laneGraphics.lineTo(laneStartX + LANE_WIDTH * 4, height);
      laneGraphics.stroke({ width: 1, color: 0x333333 });

      laneContainer.addChild(laneGraphics);

      // Hit line
      const hitLine = new Graphics();
      hitLine.moveTo(laneStartX, hitLineY);
      hitLine.lineTo(laneStartX + LANE_WIDTH * 4, hitLineY);
      hitLine.stroke({ width: 4, color: 0xffffff, alpha: 0.8 });
      uiContainer.addChild(hitLine);

      // Judgment text
      const judgmentText = new Text({
        text: '',
        style: new TextStyle({
          fontSize: 48,
          fill: 0xffffff,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          dropShadow: {
            blur: 4,
            distance: 0,
            color: 0x000000,
            alpha: 0.5,
          },
        }),
      });
      judgmentText.anchor.set(0.5);
      judgmentText.x = width / 2;
      judgmentText.y = hitLineY - 100;
      uiContainer.addChild(judgmentText);
      judgmentTextRef.current = judgmentText;
    };

    initApp();

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (appRef.current && entry) {
        const { width, height } = entry.contentRect;
        appRef.current.renderer.resize(width, height);
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
  }, []);

  // Update notes rendering
  useEffect(() => {
    if (!notesContainerRef.current || !appRef.current || !chart) return;
    if (gameState !== 'playing') return;

    const container = notesContainerRef.current;
    const app = appRef.current;
    const width = app.screen.width;
    const height = app.screen.height;
    const laneStartX = (width - LANE_WIDTH * 4) / 2;
    const hitLineY = height * HIT_LINE_Y_RATIO;

    // Clear existing notes
    container.removeChildren();

    // Pixels per ms based on scroll speed
    const pixelsPerMs = scrollSpeed * 0.5;

    // Render visible notes
    chart.notes.forEach((note) => {
      if (note.hit) return; // Don't render hit notes

      // Calculate Y position based on time difference
      const timeDiff = note.time - currentTime;
      const y = hitLineY - timeDiff * pixelsPerMs;

      // Only render if visible
      if (y < -NOTE_HEIGHT || y > height + NOTE_HEIGHT) return;

      const noteGraphics = new Graphics();
      const x = laneStartX + note.lane * LANE_WIDTH + 5;

      // Note body
      noteGraphics.roundRect(
        x,
        y - NOTE_HEIGHT / 2,
        LANE_WIDTH - 10,
        NOTE_HEIGHT,
        6
      );
      noteGraphics.fill(LANE_COLORS[note.lane]);

      // Note glow effect when close to hit line
      if (Math.abs(timeDiff) < 200) {
        noteGraphics.roundRect(
          x,
          y - NOTE_HEIGHT / 2,
          LANE_WIDTH - 10,
          NOTE_HEIGHT,
          6
        );
        noteGraphics.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
      }

      container.addChild(noteGraphics);
    });
  }, [chart, currentTime, scrollSpeed, gameState]);

  // Lane press effects
  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    const width = app.screen.width;
    const height = app.screen.height;
    const laneStartX = (width - LANE_WIDTH * 4) / 2;
    const hitLineY = height * HIT_LINE_Y_RATIO;

    // Find or create press effects container
    let pressContainer = app.stage.getChildByLabel(
      'pressContainer'
    ) as Container | null;
    if (!pressContainer) {
      pressContainer = new Container();
      pressContainer.label = 'pressContainer';
      app.stage.addChild(pressContainer);
    }

    pressContainer.removeChildren();

    lanePressed.forEach((pressed, i) => {
      if (!pressed) return;

      const effect = new Graphics();
      const x = laneStartX + i * LANE_WIDTH;

      // Press effect
      effect.rect(x, hitLineY - 20, LANE_WIDTH, 40);
      effect.fill({ color: LANE_COLORS[i], alpha: 0.3 });

      pressContainer!.addChild(effect);
    });
  }, [lanePressed]);

  // Show judgment text
  useEffect(() => {
    const unsubscribe = useRhythmStore.subscribe(
      (state) => state.judgments,
      (judgments, prevJudgments) => {
        if (!judgmentTextRef.current) return;

        const text = judgmentTextRef.current;

        // Determine which judgment just changed
        for (const [j, count] of Object.entries(judgments)) {
          if (count > (prevJudgments[j as keyof typeof prevJudgments] || 0)) {
            text.text = j.toUpperCase();
            text.style.fill =
              j === 'perfect'
                ? 0xffff00
                : j === 'great'
                  ? 0x00ff00
                  : j === 'good'
                    ? 0x00ffff
                    : 0xff0000;

            // Reset after animation
            setTimeout(() => {
              if (judgmentTextRef.current) {
                judgmentTextRef.current.text = '';
              }
            }, 300);
            break;
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
