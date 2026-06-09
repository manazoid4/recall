/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      // ─── Semantic color tokens ────────────────────────────────────────────
      // HSL channel format: Tailwind multiplies opacity in, e.g. bg-ink/50 works
      colors: {
        // Theme-adaptive surfaces
        surface:  'hsl(var(--surface) / <alpha-value>)',
        panel:    'hsl(var(--panel)   / <alpha-value>)',
        overlay:  'hsl(var(--overlay) / <alpha-value>)',

        // Theme-adaptive text
        ink:    'hsl(var(--ink)   / <alpha-value>)',
        muted:  'hsl(var(--muted) / <alpha-value>)',
        dim:    'hsl(var(--dim)   / <alpha-value>)',

        // Theme-adaptive borders
        line: 'hsl(var(--line) / <alpha-value>)',

        // Brand — hardcoded amber, opacity always works
        brand: {
          DEFAULT: '#f59e0b',
          hover:   '#d97706',
          light:   '#fef3c7',
          dark:    '#92400e',
        },

        // Backward-compat aliases
        yellow: '#f59e0b',
        orange: '#f97316',
      },

      // ─── Shadow scale ─────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        'panel':      '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        'modal':      '0 20px 60px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.12)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.30)',
        'inner-sm':   'inset 0 1px 2px rgba(0,0,0,0.06)',
      },

      // ─── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        'xs':  '4px',
        'sm':  '6px',
        DEFAULT: '8px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      // ─── Keyframe animations ──────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },

      animation: {
        'fade-in':    'fade-in 0.20s ease-out',
        'slide-up':   'slide-up 0.25s ease-out',
        'slide-down': 'slide-down 0.20s ease-out',
        'scale-in':   'scale-in 0.15s ease-out',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },

      // ─── Typography extras ────────────────────────────────────────────────
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
};
