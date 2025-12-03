/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  // Disable Preflight to preserve existing CSS styles
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // Colors mapped from CSS variables
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
        },
        item: {
          hover: 'var(--item-hover-bg)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          brand: 'var(--color-text-brand)',
        },
        border: {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          focus: 'var(--color-border-focus)',
          hover: 'var(--color-border-hover)',
        },
        interactive: {
          hover: 'var(--color-interactive-hover)',
          active: 'var(--color-interactive-active)',
          focus: 'var(--color-interactive-focus)',
          muted: 'var(--color-interactive-muted)',
        },
        skeleton: {
          DEFAULT: 'var(--color-skeleton)',
          shimmer: 'var(--color-skeleton-shimmer)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg: 'var(--color-error-bg)',
          border: 'var(--color-error-border)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success-border)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning-border)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info-border)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          tertiary: 'var(--color-accent-tertiary)',
          hover: 'var(--color-accent-hover)',
        },
      },

      // Font family
      fontFamily: {
        base: 'var(--font-family-base)',
        mono: 'var(--font-family-mono)',
      },

      // Font size
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },

      // Font weight
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },

      // Line height
      lineHeight: {
        tight: 'var(--line-height-tight)',
        base: 'var(--line-height-base)',
        relaxed: 'var(--line-height-relaxed)',
      },

      // Letter spacing
      letterSpacing: {
        tight: 'var(--letter-spacing-tight)',
        normal: 'var(--letter-spacing-normal)',
        wide: 'var(--letter-spacing-wide)',
      },

      // Spacing (extends default Tailwind spacing)
      spacing: {
        0: 'var(--spacing-0)',
        1: 'var(--spacing-1)',
        2: 'var(--spacing-2)',
        3: 'var(--spacing-3)',
        4: 'var(--spacing-4)',
        5: 'var(--spacing-5)',
        6: 'var(--spacing-6)',
        8: 'var(--spacing-8)',
        10: 'var(--spacing-10)',
        12: 'var(--spacing-12)',
        16: 'var(--spacing-16)',
        // Layout specific
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
        'bottom-nav': 'var(--bottom-nav-height)',
        'touch-min': 'var(--touch-target-min)',
        'touch-comfortable': 'var(--touch-target-comfortable)',
      },

      // Border radius
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      // Box shadow
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        focus: 'var(--shadow-focus)',
        'focus-ring': 'var(--shadow-focus-ring)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        glow: 'var(--shadow-glow)',
        inner: 'var(--shadow-inner)',
      },

      // Transition duration
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },

      // Transition timing function
      transitionTimingFunction: {
        default: 'var(--ease-default)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },

      // Z-index
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },

      // Container
      maxWidth: {
        'container-sm': 'var(--container-sm)',
        'container-md': 'var(--container-md)',
        'container-lg': 'var(--container-lg)',
        'container-xl': 'var(--container-xl)',
        'container-max': 'var(--container-max)',
        'command-palette': 'var(--command-palette-width)',
      },

      // Height
      height: {
        'input-sm': 'var(--input-height-sm)',
        'input-md': 'var(--input-height-md)',
        'input-lg': 'var(--input-height-lg)',
        'btn-sm': 'var(--btn-height-sm)',
        'btn-md': 'var(--btn-height-md)',
        'btn-lg': 'var(--btn-height-lg)',
        'bottom-nav': 'var(--bottom-nav-height)',
        'command-palette': 'var(--command-palette-max-height)',
      },

      // Width
      width: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
        'command-palette': 'var(--command-palette-width)',
      },

      // Screens (breakpoints) - using actual pixel values for media queries
      screens: {
        xs: '320px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },

      // Animations
      keyframes: {
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        toolPageEnter: {
          from: {
            opacity: '0',
            transform: 'translateY(8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          from: {
            opacity: '0',
            transform: 'translateY(-16px) scale(0.98)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'synth-status-slide-in': {
          from: {
            opacity: '0',
            transform: 'translateX(-50%) translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(-50%) translateY(0)',
          },
        },
        'drum-loop-pulse': {
          from: {
            transform: 'scale(1)',
            boxShadow:
              '0 0 0 0 rgba(var(--color-accent-rgb, 59, 130, 246), 0.4)',
          },
          to: {
            transform: 'scale(1.08)',
            boxShadow:
              '0 0 8px 2px rgba(var(--color-accent-rgb, 59, 130, 246), 0.6)',
          },
        },
        'drum-status-slide-up': {
          from: {
            opacity: '0',
            transform: 'translate(-50%, 20px)',
          },
          to: {
            opacity: '1',
            transform: 'translate(-50%, 0)',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-out',
        slideDown: 'slideDown 150ms ease-out',
        'synth-status-slide-in': 'synth-status-slide-in 0.2s ease-out',
        'drum-loop-pulse': 'drum-loop-pulse 0.5s ease-in-out infinite alternate',
        'drum-status-slide-up': 'drum-status-slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
