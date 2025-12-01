/**
 * Utility for conditionally joining classNames together
 * Similar to clsx/classnames but lightweight
 */
type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    }
  }

  return classes.join(' ');
}

/**
 * Utility for conditionally applying classes based on conditions
 * @example
 * cx({ 'active': isActive, 'disabled': isDisabled })
 */
export function cx(
  classMap: Record<string, boolean | undefined | null>
): string {
  return Object.entries(classMap)
    .filter(([, condition]) => Boolean(condition))
    .map(([className]) => className)
    .join(' ');
}
