import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

/**
 * Global styles for the application
 * Includes CSS reset, typography, and default styles
 */
export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  /* ============================================
     CSS Reset & Base Styles
     ============================================ */

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.base};
    font-weight: ${theme.fontWeights.normal};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ============================================
     Typography
     ============================================ */

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    padding: 0;
    font-weight: ${theme.fontWeights.bold};
    line-height: 1.2;
  }

  h1 {
    font-size: ${theme.fontSizes['5xl']};
  }

  h2 {
    font-size: ${theme.fontSizes['4xl']};
  }

  h3 {
    font-size: ${theme.fontSizes['3xl']};
  }

  h4 {
    font-size: ${theme.fontSizes['2xl']};
  }

  h5 {
    font-size: ${theme.fontSizes.xl};
  }

  h6 {
    font-size: ${theme.fontSizes.lg};
  }

  p {
    margin: 0;
    padding: 0;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  button {
    font-family: ${theme.fonts.primary};
    cursor: pointer;
  }

  /* ============================================
     Form Elements
     ============================================ */

  input,
  textarea,
  select {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.base};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing.md};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    &::placeholder {
      color: ${theme.colors.textTertiary};
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  /* ============================================
     Focus Styles (Accessibility)
     ============================================ */

  :focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  button:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  /* ============================================
     Scrollbar Styling
     ============================================ */

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};

    &:hover {
      background: ${theme.colors.textTertiary};
    }
  }

  /* ============================================
     Selection
     ============================================ */

  ::selection {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.background};
  }

  ::-moz-selection {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.background};
  }
`;
