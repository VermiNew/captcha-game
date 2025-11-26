import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * Card Props
 */
interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Use gradient background */
  gradient?: boolean;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
  /** Show shadow */
  shadow?: boolean;
}

/**
 * Styled card component
 */
const StyledCard = styled(motion.div)<{
  $gradient: boolean;
  $padding: 'sm' | 'md' | 'lg';
  $shadow: boolean;
}>`
  background: ${(props) =>
    props.$gradient ? theme.gradients.secondary : theme.colors.cardBg};
  border-radius: ${theme.borderRadius.xl};
  border: ${(props) =>
    props.$gradient ? 'none' : `1px solid ${theme.colors.border}`};
  box-shadow: ${(props) =>
    props.$shadow
      ? theme.shadows.lg
      : '0 0 0 transparent'};
  padding: ${(props) => {
    switch (props.$padding) {
      case 'sm':
        return theme.spacing.md;
      case 'lg':
        return theme.spacing.xl;
      case 'md':
      default:
        return theme.spacing.lg;
    }
  }};
  transition: all 0.2s ease;
`;

/**
 * Card Component
 * Reusable container component with optional gradient background and animations
 */
const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(
  (
    { children, gradient = false, padding = 'md', shadow = true },
    ref,
  ) => {
    return (
      <StyledCard
        ref={ref}
        $gradient={gradient}
        $padding={padding}
        $shadow={shadow}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </StyledCard>
    );
  },
);

Card.displayName = 'Card';

export default Card;
