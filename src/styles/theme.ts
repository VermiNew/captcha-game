/**
 * Theme configuration for the "Not-a-Robot" game
 * Bright, colorful, energetic design system
 */

export const theme = {
  colors: {
    // Primary colors
    primary: '#6366F1',
    secondary: '#EC4899',
    accent: '#F59E0B',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

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
    secondary: 'linear-gradient(135deg, #FFD1FF 0%, #FFA8E1 100%)',
  },

  fonts: {
    primary: '"Space Grotesk", sans-serif',
    heading: '"Poppins", sans-serif',
    mono: '"Fira Code", monospace',
  },

  fontSizes: {
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

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    'a lot': '10rem',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
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
