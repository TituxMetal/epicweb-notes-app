import tailwindForms from '@tailwindcss/forms'
import { type Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', 'Nunito Sans Fallback', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        gray: colors.zinc
      }
    }
  },
  plugins: [tailwindForms]
} satisfies Config
