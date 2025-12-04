import { createEffect, onCleanup, type Accessor } from 'solid-js';

interface UseDropdownOptions {
  /** Getter function for container element */
  containerRef: () => HTMLElement | null | undefined;
  /** Getter function for trigger button (for focus restoration) */
  buttonRef?: () => HTMLElement | null | undefined;
  /** Whether the dropdown is open */
  isOpen: Accessor<boolean>;
  /** Callback to close the dropdown */
  onClose: () => void;
  /** Close on scroll (default: true) */
  closeOnScroll?: boolean;
  /** Close on escape key (default: true) */
  closeOnEscape?: boolean;
  /** Close on click outside (default: true) */
  closeOnClickOutside?: boolean;
}

/**
 * Hook to manage dropdown behavior (click outside, scroll, escape key)
 * Consolidates common dropdown logic used in ShareButton, EmbedButton, etc.
 */
export function useDropdown({
  containerRef,
  buttonRef,
  isOpen,
  onClose,
  closeOnScroll = true,
  closeOnEscape = true,
  closeOnClickOutside = true,
}: UseDropdownOptions): void {
  // Close dropdown on click outside
  createEffect(() => {
    if (!isOpen() || !closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      const container = containerRef();
      if (container && !container.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
  });

  // Close dropdown on scroll (throttled to prevent cascading re-renders)
  createEffect(() => {
    if (!isOpen() || !closeOnScroll) return;

    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        onClose();
        throttleTimer = null;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, true);
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll, true);
      if (throttleTimer) clearTimeout(throttleTimer);
    });
  });

  // Close dropdown on Escape key
  createEffect(() => {
    if (!isOpen() || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        buttonRef?.()?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    onCleanup(() => document.removeEventListener('keydown', handleEscape));
  });
}

/**
 * Helper to create a toggle callback with copy state reset
 */
export function useDropdownToggle(
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void,
  setCopied?: (value: boolean) => void
) {
  return () => {
    setIsOpen((prev) => !prev);
    setCopied?.(false);
  };
}
