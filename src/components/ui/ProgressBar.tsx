import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * ProgressBar Props
 */
interface ProgressBarProps {
  /** Current challenge number (1-10) */
  current: number;
  /** Total number of challenges */
  total: number;
  /** Enable animated fill */
  animated?: boolean;
}

/**
 * Styled container for progress bar
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled text label
 */
const Text = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.textSecondary};
`;

/**
 * Styled progress bar container
 */
const BarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
`;

/**
 * Styled fill element
 */
const BarFill = styled(motion.div)`
  height: 100%;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.lg};
  will-change: width;
`;

/**
 * ProgressBar Component
 * Displays progress through challenges with animated fill
 */
const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ current, total, animated = true }, ref) => {
    const progressPercentage = (current / total) * 100;

    return (
      <Container ref={ref}>
        <Text>
          Challenge {current} / {total}
        </Text>
        <BarContainer>
          <BarFill
            initial={animated ? { width: 0 } : { width: `${progressPercentage}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
          />
        </BarContainer>
      </Container>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
