import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          light: 'rgba(99, 102, 241, 0.1)',
        },
        secondary: '#EC4899',
        accent: '#F59E0B',
        success: {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.1)',
        },
        error: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.1)',
        },
        warning: '#F59E0B',
        info: '#3B82F6',
        surface: '#F9FAFB',
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
      },
      fontFamily: {
        primary: '"Space Grotesk", sans-serif',
        heading: '"Poppins", sans-serif',
        mono: '"Fira Code", monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        'a-lot': '10rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FFD1FF 0%, #FFA8E1 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
