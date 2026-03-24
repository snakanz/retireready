import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          50:  '#E8EDF4',
          100: '#C5D1E4',
          200: '#8FA7C7',
          300: '#5A7DAA',
          400: '#2E5490',
          500: '#0B1F3A',
          600: '#091929',
          700: '#071318',
          800: '#040C10',
          900: '#020608',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#FDF8EC',
          100: '#F8ECC8',
          200: '#F0D892',
          300: '#E8C45B',
          400: '#C9A84C',
          500: '#A6872A',
          600: '#7D6520',
          700: '#554315',
          800: '#2C220B',
          900: '#141002',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'score-fill': {
          '0%': { strokeDashoffset: '339.29' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'score-fill': 'score-fill 1.5s ease-out forwards',
      },
      backdropBlur: { xs: '2px' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
