import { useEffect, useCallback, type RefObject } from 'react';
import { onClickOutside, onEscapeKey, onScroll } from '../utils/dom';

// Re-export DOM utilities for convenience
export {
  isClickOutside,
  onClickOutside,
  onEscapeKey,
  onScroll,
  focusElement,
  containsNode,
} from '../utils/dom';

interface UseDropdownOptions {
  /** Ref to the container element */
  containerRef: RefObject<HTMLElement | null>;
  /** Ref to the trigger button (for focus restoration) */
  buttonRef?: RefObject<HTMLElement | null>;
  /** Whether the dropdown is open */
  isOpen: boolean;
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
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;
    return onClickOutside(containerRef.current, onClose);
  }, [isOpen, closeOnClickOutside, containerRef, onClose]);

  // Close dropdown on scroll (throttled)
  useEffect(() => {
    if (!isOpen || !closeOnScroll) return;
    return onScroll(onClose, 50);
  }, [isOpen, closeOnScroll, onClose]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    return onEscapeKey(onClose, buttonRef?.current);
  }, [isOpen, closeOnEscape, buttonRef, onClose]);
}

/**
 * Hook to create a toggle callback with copy state reset
 */
export function useDropdownToggle(
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void,
  setCopied?: (value: boolean) => void
) {
  return useCallback(() => {
    setIsOpen((prev) => !prev);
    setCopied?.(false);
  }, [setIsOpen, setCopied]);
}
