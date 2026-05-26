import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        bordeaux: {
          DEFAULT: '#8B1A1A',
          50:  '#fdf2f2',
          100: '#fce4e4',
          200: '#f9c4c4',
          300: '#f49090',
          400: '#ec5050',
          500: '#a61a1a',
          600: '#8B1A1A',
          700: '#721515',
          800: '#6B1414',
          900: '#501010',
          950: '#300a0a',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#fdf9ee',
          100: '#faf0d0',
          200: '#f4e09e',
          300: '#eece67',
          400: '#e8bb3c',
          500: '#C9A84C',
          600: '#a8893a',
          700: '#836b2c',
          800: '#6a5525',
          900: '#574520',
          950: '#30250f',
        },
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono:  ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
