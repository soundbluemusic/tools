import { memo } from 'react';
import { cn } from '../../utils';

interface SkeletonProps {
  /** Width (CSS value) */
  width?: string;
  /** Height (CSS value) */
  height?: string;
  /** Border radius variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

const VARIANT_CLASSES = {
  text: 'h-4',
  circular: 'rounded-full',
  rectangular: '',
  rounded: 'rounded-md',
} as const;

const ANIMATION_CLASSES = {
  pulse: 'animate-pulse',
  wave: 'animate-pulse',
  none: '',
} as const;

/**
 * Skeleton loading placeholder component
 */
export const Skeleton = memo<SkeletonProps>(function Skeleton({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className,
}) {
  return (
    <div
      className={cn(
        'bg-skeleton rounded',
        VARIANT_CLASSES[variant],
        ANIMATION_CLASSES[animation],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
});

Skeleton.displayName = 'Skeleton';

interface SkeletonListProps {
  /** Number of skeleton items */
  count?: number;
  /** Item height */
  itemHeight?: string;
}

/**
 * Skeleton list for loading states
 */
export const SkeletonList = memo<SkeletonListProps>(function SkeletonList({
  count = 5,
  itemHeight = '3.5rem',
}) {
  return (
    <div
      className="pointer-events-none bg-bg-tertiary rounded-lg overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center py-4 px-5 border-b border-border-primary last:border-b-0"
          style={{ height: itemHeight }}
        >
          <Skeleton width="60%" height="1.2rem" />
        </div>
      ))}
    </div>
  );
});

SkeletonList.displayName = 'SkeletonList';
