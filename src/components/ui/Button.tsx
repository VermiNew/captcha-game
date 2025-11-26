import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * Button Props
 */
interface ButtonProps {
  /** Button label or content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'success';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Full width option */
  fullWidth?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit';
  /** Loading state */
  loading?: boolean;
}

/**
 * Styled button component
 */
const StyledButton = styled(motion.button)<{
  $variant: 'primary' | 'secondary' | 'success';
  $size: 'sm' | 'md' | 'lg';
  $fullWidth: boolean;
  $disabled: boolean;
}>`
  display: ${(props) => (props.$fullWidth ? 'w-full' : 'inline-block')};
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.$disabled ? 'none' : 'auto')};
  position: relative;
  overflow: hidden;

  /* Size variants */
  ${(props) => {
    switch (props.$size) {
      case 'sm':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.fontSizes.sm};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.lg} ${theme.spacing.xl};
          font-size: ${theme.fontSizes.lg};
        `;
      case 'md':
      default:
        return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.fontSizes.md};
        `;
    }
  }}

  /* Variant styles */
  ${(props) => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #3d58d3ff 0%, #5d5bddff 100%);
          color: white;
          box-shadow: 0 8px 20px rgba(61, 159, 211, 0.4);
          font-weight: bold;
          letter-spacing: 0.5px;
          
          &:hover:not(:disabled) {
            filter: brightness(1.15);
            box-shadow: 0 12px 30px rgba(91, 179, 221, 0.6);
            transform: translateY(-3px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: rgba(99, 102, 241, 0.1);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%);
          color: ${theme.colors.background};
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          
          &:hover:not(:disabled) {
            filter: brightness(1.1);
            box-shadow: 0 12px 30px rgba(16, 185, 129, 0.5);
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      default:
        return '';
    }
  }}
`;

/**
 * Button Component
 * Reusable button with multiple variants, sizes and animations
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      variant = 'primary',
      size = 'md',
      disabled = false,
      fullWidth = false,
      type = 'button',
      loading = false,
    },
    ref,
  ) => {
    return (
      <StyledButton
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {loading ? '⏳ Loading...' : children}
      </StyledButton>
    );
  },
);

Button.displayName = 'Button';

export default Button;
