/**
 * Theme configuration for the "Not-a-Robot" game
 * Bright, colorful, energetic design system
 */

export const theme = {
  colors: {
    // Primary colors
    primary: '#6366F1', // purple
    secondary: '#EC4899', // pink
    accent: '#F59E0B', // orange

    // Status colors
    success: '#10B981', // green
    error: '#EF4444', // red
    warning: '#F59E0B', // orange
    info: '#3B82F6', // blue

    // Neutrals (light theme)
    background: '#FFFFFF',
    surface: '#F9FAFB',
    cardBg: '#FFFFFF',

    // Text
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    sunset: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    ocean: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
    candy: 'linear-gradient(135deg, #FFD1FF 0%, #FFA8E1 100%)',
  },

  fonts: {
    primary: '"Poppins", sans-serif',
    mono: '"Fira Code", monospace',
  },

  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  borderRadius: {
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type Theme = typeof theme;
