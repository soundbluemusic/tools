import { useEffect, useCallback, type RefObject } from 'react';

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

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, containerRef, onClose]);

  // Close dropdown on scroll
  useEffect(() => {
    if (!isOpen || !closeOnScroll) return;

    const handleScroll = () => onClose();
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, closeOnScroll, onClose]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        buttonRef?.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
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
