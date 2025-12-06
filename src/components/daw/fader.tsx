'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ========================================
// Fader Component (DAW Style Volume Slider)
// ========================================

interface FaderProps {
  value: number; // 0-1 (or dB range)
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  showScale?: boolean;
  valueFormatter?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

const SIZES = {
  sm: { length: 100, thickness: 24 },
  md: { length: 150, thickness: 32 },
  lg: { length: 200, thickness: 40 },
};

// dB scale marks for volume faders
const DB_MARKS = [0, -3, -6, -12, -24, -48, -Infinity];

export function Fader({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  orientation = 'vertical',
  size = 'md',
  label,
  showValue = true,
  showScale = false,
  valueFormatter,
  disabled = false,
  className,
}: FaderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const { length, thickness } = SIZES[size];
  const isVertical = orientation === 'vertical';

  // Convert value to position (0-1)
  const normalizedValue = (value - min) / (max - min);
  const position = isVertical ? 1 - normalizedValue : normalizedValue;

  const updateValue = (clientX: number, clientY: number) => {
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    let newPosition: number;

    if (isVertical) {
      newPosition = 1 - (clientY - rect.top) / rect.height;
    } else {
      newPosition = (clientX - rect.left) / rect.width;
    }

    newPosition = Math.max(0, Math.min(1, newPosition));

    // Apply step
    const range = max - min;
    const steppedValue = Math.round((newPosition * range) / step) * step + min;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    onChange?.(clampedValue);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;

    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateValue(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;
    updateValue(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    // Reset to unity (0dB = 0.79 for typical DAW faders)
    onChange?.(max * 0.79);
  };

  const displayValue = valueFormatter
    ? valueFormatter(value)
    : value.toFixed(2);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 select-none',
        isVertical ? 'flex-col' : 'flex-row',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {label && (
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      )}

      <div
        className={cn(
          'relative flex items-center',
          isVertical ? 'flex-col' : 'flex-row'
        )}
      >
        {/* Scale marks */}
        {showScale && isVertical && (
          <div
            className="absolute -left-6 top-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground"
            style={{ height: length }}
          >
            {DB_MARKS.map((db) => (
              <span key={db} className="leading-none">
                {db === -Infinity ? '-∞' : db}
              </span>
            ))}
          </div>
        )}

        {/* Track container */}
        <div
          ref={trackRef}
          className={cn(
            'relative rounded-sm bg-muted cursor-pointer touch-none',
            disabled && 'cursor-not-allowed'
          )}
          style={{
            width: isVertical ? thickness : length,
            height: isVertical ? length : thickness,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          role="slider"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-orientation={orientation}
          aria-label={label}
          tabIndex={disabled ? -1 : 0}
        >
          {/* Track groove */}
          <div
            className={cn(
              'absolute bg-muted-foreground/20 rounded-sm',
              isVertical
                ? 'left-1/2 -translate-x-1/2 top-2 bottom-2 w-1'
                : 'top-1/2 -translate-y-1/2 left-2 right-2 h-1'
            )}
          />

          {/* Fill */}
          <div
            className={cn(
              'absolute bg-primary rounded-sm',
              isVertical
                ? 'left-1/2 -translate-x-1/2 w-1 bottom-2'
                : 'top-1/2 -translate-y-1/2 h-1 left-2'
            )}
            style={
              isVertical
                ? { height: `${normalizedValue * 100}%` }
                : { width: `${normalizedValue * 100}%` }
            }
          />

          {/* Fader handle */}
          <div
            className={cn(
              'absolute bg-background border-2 border-border rounded shadow-md',
              isVertical
                ? 'left-0 right-0 h-6 -translate-y-1/2'
                : 'top-0 bottom-0 w-6 -translate-x-1/2'
            )}
            style={
              isVertical
                ? { top: `${position * 100}%` }
                : { left: `${position * 100}%` }
            }
          >
            {/* Handle grip lines */}
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center gap-0.5',
                isVertical ? '' : 'flex-col'
              )}
            >
              <div
                className={cn(
                  'bg-muted-foreground/30 rounded-full',
                  isVertical ? 'w-3 h-0.5' : 'w-0.5 h-3'
                )}
              />
              <div
                className={cn(
                  'bg-muted-foreground/30 rounded-full',
                  isVertical ? 'w-3 h-0.5' : 'w-0.5 h-3'
                )}
              />
              <div
                className={cn(
                  'bg-muted-foreground/30 rounded-full',
                  isVertical ? 'w-3 h-0.5' : 'w-0.5 h-3'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {showValue && (
        <span className="text-xs font-mono text-muted-foreground min-w-[3em] text-center">
          {displayValue}
        </span>
      )}
    </div>
  );
}

// ========================================
// Utility: Convert linear to dB
// ========================================

export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

export function dbToLinear(db: number): number {
  if (db === -Infinity) return 0;
  return Math.pow(10, db / 20);
}

export function formatDb(db: number): string {
  if (db === -Infinity) return '-∞';
  return `${db > 0 ? '+' : ''}${db.toFixed(1)}`;
}
