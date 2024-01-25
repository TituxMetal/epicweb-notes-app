import tailwindForms from '@tailwindcss/forms'
import { type Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', 'Nunito Sans Fallback', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        gray: colors.zinc
      },
      fontSize: {
        // 1rem = 16px
        /** 80px size / 84px high / bold */
        mega: ['5rem', { lineHeight: '5.25rem', fontWeight: '700' }],
        /** 56px size / 62px high / bold */
        h1: ['3.5rem', { lineHeight: '3.875rem', fontWeight: '700' }],
        /** 40px size / 48px high / bold */
        h2: ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }]
      }
    }
  },
  plugins: [tailwindForms]
} satisfies Config
