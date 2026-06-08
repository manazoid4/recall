/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: '#0f172a',
        line: '#e2e8f0',
        muted: '#64748b',
        yellow: '#f59e0b',
        orange: '#f97316',
        surface: '#f8fafc',
        panel: '#ffffff',
      },
    },
  },
  plugins: [],
};
