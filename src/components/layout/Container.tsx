import { memo, type ReactNode } from 'react';
import { cn } from '../../utils';

interface ContainerProps {
  /** Children content */
  children: ReactNode;
  /** Container size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional class names */
  className?: string;
  /** HTML tag to render */
  as?: 'div' | 'section' | 'article' | 'main';
}

const sizeClasses = {
  sm: 'container--sm',
  md: 'container--md',
  lg: 'container--lg',
  xl: 'container--xl',
  full: 'container--full',
} as const;

/**
 * Responsive container component
 */
export const Container = memo<ContainerProps>(function Container({
  children,
  size = 'md',
  className,
  as: Component = 'div',
}) {
  return (
    <Component className={cn('container', sizeClasses[size], className)}>
      {children}
    </Component>
  );
});

Container.displayName = 'Container';
