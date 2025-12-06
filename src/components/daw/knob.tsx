'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ========================================
// Knob Component (DAW Style Rotary Control)
// ========================================

interface KnobProps {
  value: number; // 0-1
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg' | number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  disabled?: boolean;
  bipolar?: boolean; // Center at 0 for pan controls
  className?: string;
}

const SIZES = {
  sm: { diameter: 32, strokeWidth: 3 },
  md: { diameter: 48, strokeWidth: 4 },
  lg: { diameter: 64, strokeWidth: 5 },
};

export function Knob({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  size = 'md',
  label,
  showValue = true,
  valueFormatter,
  disabled = false,
  bipolar = false,
  className,
}: KnobProps) {
  const knobRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startValue = React.useRef(0);

  // Handle numeric or string size
  const sizeConfig =
    typeof size === 'number'
      ? { diameter: size, strokeWidth: Math.max(2, size / 12) }
      : SIZES[size];
  const { diameter, strokeWidth } = sizeConfig;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Convert value to normalized (0-1)
  const normalizedValue = (value - min) / (max - min);

  // Calculate rotation (270 degree range, from -135 to 135)
  const rotation = -135 + normalizedValue * 270;

  // Arc for value indicator (bipolar mode draws from center)
  const arcLength = bipolar
    ? Math.abs(normalizedValue - 0.5) * 0.75 * circumference
    : normalizedValue * 0.75 * circumference;
  const arcOffset =
    bipolar && normalizedValue < 0.5
      ? circumference * 0.375 + (0.5 - normalizedValue) * 0.75 * circumference
      : circumference * 0.375;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;

    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = normalizedValue;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;

    // Vertical drag: up increases, down decreases
    const deltaY = startY.current - e.clientY;
    const sensitivity = e.shiftKey ? 0.001 : 0.005; // Fine control with Shift
    const deltaValue = deltaY * sensitivity;

    let newNormalizedValue = startValue.current + deltaValue;
    newNormalizedValue = Math.max(0, Math.min(1, newNormalizedValue));

    // Apply step
    const range = max - min;
    const steppedValue =
      Math.round((newNormalizedValue * range) / step) * step + min;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    onChange?.(clampedValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    // Reset to center/default
    onChange?.((min + max) / 2);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (disabled) return;
    e.preventDefault();

    const direction = e.deltaY < 0 ? 1 : -1;
    const sensitivity = e.shiftKey ? step : step * 10;
    const newValue = Math.max(
      min,
      Math.min(max, value + direction * sensitivity)
    );
    onChange?.(newValue);
  };

  const displayValue = valueFormatter
    ? valueFormatter(value)
    : value.toFixed(2);

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center gap-1 select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {label && (
        <span className="text-xs text-muted-foreground truncate max-w-full">
          {label}
        </span>
      )}

      <div
        ref={knobRef}
        className={cn(
          'relative cursor-pointer touch-none',
          disabled && 'cursor-not-allowed'
        )}
        style={{ width: diameter, height: diameter }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Background track */}
        <svg width={diameter} height={diameter} className="absolute inset-0">
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={circumference * 0.375}
            strokeLinecap="round"
          />
        </svg>

        {/* Value arc */}
        <svg width={diameter} height={diameter} className="absolute inset-0">
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-primary"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={
              bipolar && normalizedValue >= 0.5
                ? circumference * 0.375 -
                  (normalizedValue - 0.5) * 0.75 * circumference
                : arcOffset
            }
            strokeLinecap="round"
            style={{
              transition: isDragging.current ? 'none' : 'stroke-dasharray 0.1s',
            }}
          />
        </svg>

        {/* Knob body */}
        <div
          className="absolute inset-1 rounded-full bg-background border-2 border-border shadow-sm"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isDragging.current ? 'none' : 'transform 0.1s',
          }}
        >
          {/* Indicator line */}
          <div className="absolute left-1/2 top-1 w-0.5 h-2 -translate-x-1/2 rounded-full bg-primary" />
        </div>
      </div>

      {showValue && (
        <span className="text-xs font-mono text-muted-foreground">
          {displayValue}
        </span>
      )}
    </div>
  );
}
