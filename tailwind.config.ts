import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        plane: '#f9f9f7',
        ink: '#0b0b0b',
        ink2: '#52514e',
        muted: '#898781',
        hairline: '#e1e0d9',
        rule: '#c3c2b7',
        accent: '#2a78d6',
        good: '#006300',
        team: {
          1: '#2a78d6',
          2: '#eb6834',
          3: '#1baf7a',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 11, 11, 0.04), 0 1px 1px rgba(11, 11, 11, 0.03)',
      },
    },
  },
  plugins: [],
} satisfies Config
