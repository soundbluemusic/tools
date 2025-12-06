'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Application, Container } from 'pixi.js';

// ========================================
// Pixi.js Canvas Component
// ========================================
// GPU 가속 렌더링을 위한 기본 캔버스 컴포넌트

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
  className?: string;
  onAppReady?: (app: Application) => void;
  children?: (container: Container) => void;
}

export function PixiCanvas({
  width,
  height,
  backgroundColor = 0x1a1a1a,
  className,
  onAppReady,
  children,
}: PixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const stageRef = useRef<Container | null>(null);

  const initPixi = useCallback(async () => {
    if (!containerRef.current || appRef.current) return;

    const app = new Application();

    await app.init({
      width: width ?? containerRef.current.clientWidth,
      height: height ?? containerRef.current.clientHeight,
      backgroundColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.canvas as HTMLCanvasElement);
    appRef.current = app;
    stageRef.current = app.stage;

    // Call children function to add graphics
    if (children && stageRef.current) {
      children(stageRef.current);
    }

    // Notify parent
    if (onAppReady) {
      onAppReady(app);
    }
  }, [width, height, backgroundColor, children, onAppReady]);

  useEffect(() => {
    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        stageRef.current = null;
      }
    };
  }, [initPixi]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !appRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && appRef.current) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        appRef.current.renderer.resize(newWidth, newHeight);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
      }}
    />
  );
}
