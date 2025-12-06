'use client';

import { useRef, useEffect } from 'react';
import { Application, Graphics } from 'pixi.js';

// ========================================
// Waveform Renderer (Pixi.js)
// ========================================
// GPU 가속 오디오 파형 렌더링

interface WaveformProps {
  audioData?: Float32Array;
  width?: number;
  height?: number;
  color?: number;
  backgroundColor?: number;
  className?: string;
}

export function Waveform({
  audioData,
  width = 800,
  height = 128,
  color = 0x3b82f6,
  backgroundColor = 0x1a1a1a,
  className,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const waveformGraphicsRef = useRef<Graphics | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initApp = async () => {
      const app = new Application();

      await app.init({
        width,
        height,
        backgroundColor,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Create waveform graphics
      const waveformGraphics = new Graphics();
      app.stage.addChild(waveformGraphics);
      waveformGraphicsRef.current = waveformGraphics;

      // Draw initial waveform
      drawWaveform(waveformGraphics, audioData, width, height, color);
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        waveformGraphicsRef.current = null;
      }
    };
  }, [width, height, backgroundColor, audioData, color]);

  return <div ref={containerRef} className={className} />;
}

function drawWaveform(
  graphics: Graphics,
  audioData: Float32Array | undefined,
  width: number,
  height: number,
  color: number
) {
  graphics.clear();

  if (!audioData || audioData.length === 0) {
    // Draw center line when no data
    graphics.moveTo(0, height / 2);
    graphics.lineTo(width, height / 2);
    graphics.stroke({ width: 1, color: 0x444444 });
    return;
  }

  const centerY = height / 2;
  const samplesPerPixel = Math.ceil(audioData.length / width);

  graphics.moveTo(0, centerY);

  for (let x = 0; x < width; x++) {
    const startSample = x * samplesPerPixel;
    const endSample = Math.min(startSample + samplesPerPixel, audioData.length);

    let min = 1;
    let max = -1;

    for (let i = startSample; i < endSample; i++) {
      const sample = audioData[i];
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }

    const minY = centerY - min * centerY;
    const maxY = centerY - max * centerY;

    graphics.moveTo(x, minY);
    graphics.lineTo(x, maxY);
  }

  graphics.stroke({ width: 1, color });
}

// ========================================
// Real-time Level Meter
// ========================================

interface LevelMeterProps {
  level: number; // 0-1
  peak?: number; // 0-1
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function LevelMeter({
  level,
  peak,
  width = 20,
  height = 200,
  orientation = 'vertical',
  className,
}: LevelMeterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const meterGraphicsRef = useRef<Graphics | null>(null);
  const peakGraphicsRef = useRef<Graphics | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initApp = async () => {
      const app = new Application();

      await app.init({
        width: orientation === 'vertical' ? width : height,
        height: orientation === 'vertical' ? height : width,
        backgroundColor: 0x1a1a1a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      const meterGraphics = new Graphics();
      const peakGraphics = new Graphics();
      app.stage.addChild(meterGraphics);
      app.stage.addChild(peakGraphics);
      meterGraphicsRef.current = meterGraphics;
      peakGraphicsRef.current = peakGraphics;
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height, orientation]);

  // Update meter
  useEffect(() => {
    if (!meterGraphicsRef.current) return;

    const g = meterGraphicsRef.current;
    g.clear();

    const meterWidth = orientation === 'vertical' ? width : height;
    const meterHeight = orientation === 'vertical' ? height : width;

    // Draw meter background
    g.rect(0, 0, meterWidth, meterHeight);
    g.fill(0x333333);

    // Draw level
    const levelHeight = meterHeight * Math.min(level, 1);
    const levelColor =
      level > 0.9 ? 0xff4444 : level > 0.7 ? 0xffaa00 : 0x44ff44;

    if (orientation === 'vertical') {
      g.rect(0, meterHeight - levelHeight, meterWidth, levelHeight);
    } else {
      g.rect(0, 0, levelHeight, meterWidth);
    }
    g.fill(levelColor);

    // Draw peak
    if (peakGraphicsRef.current && peak !== undefined) {
      const pg = peakGraphicsRef.current;
      pg.clear();

      const peakPos = meterHeight * (1 - Math.min(peak, 1));
      if (orientation === 'vertical') {
        pg.rect(0, peakPos, meterWidth, 2);
      } else {
        pg.rect(meterHeight - peakPos - 2, 0, 2, meterWidth);
      }
      pg.fill(0xffffff);
    }
  }, [level, peak, width, height, orientation]);

  return <div ref={containerRef} className={className} />;
}
