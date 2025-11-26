import { css } from 'styled-components';
import { theme } from './theme';

/**
 * Typography mixins for styled-components
 * Usage: ${typographyMixins.heading1}
 */
export const typographyMixins = {
  heading1: css`
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['5xl']};
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: -0.5px;
    line-height: 1.2;
  `,

  heading2: css`
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['4xl']};
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: -0.3px;
    line-height: 1.2;
  `,

  heading3: css`
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['3xl']};
    font-weight: ${theme.fontWeights.semibold};
    letter-spacing: -0.2px;
    line-height: 1.2;
  `,

  heading4: css`
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes['2xl']};
    font-weight: ${theme.fontWeights.semibold};
    line-height: 1.3;
  `,

  body: css`
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.md};
    font-weight: ${theme.fontWeights.normal};
    line-height: 1.6;
  `,

  bodySm: css`
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights.normal};
    line-height: 1.5;
  `,

  label: css`
    font-family: ${theme.fonts.heading};
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights.semibold};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.4;
  `,

  mono: css`
    font-family: ${theme.fonts.mono};
    font-weight: ${theme.fontWeights.semibold};
  `,

  monoLg: css`
    font-family: ${theme.fonts.mono};
    font-size: ${theme.fontSizes['3xl']};
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: 1px;
    line-height: 1;
  `,

  monoXl: css`
    font-family: ${theme.fonts.mono};
    font-size: ${theme.fontSizes['5xl']};
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: 2px;
    line-height: 1;
  `,
};
