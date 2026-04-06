/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f11',
          1: '#141416',
          2: '#1a1a1e',
          3: '#222228',
          4: '#2a2a32',
        },
        accent: {
          DEFAULT: '#7c6af7',
          hover: '#9585f8',
          muted: '#7c6af720',
          border: '#7c6af740',
        },
        positive: '#34d399',
        negative: '#f87171',
        warning: '#fbbf24',
        ink: {
          DEFAULT: '#f4f4f6',
          muted: '#a0a0b0',
          faint: '#60607a',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 24px rgba(124,106,247,0.3)',
      },
    },
  },
  plugins: [],
}
