import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * ScoreDisplay Props
 */
interface ScoreDisplayProps {
  /** Current score */
  score: number;
  /** Enable animated counter */
  animated?: boolean;
}

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled label
 */
const Label = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Styled score display
 */
const ScoreValue = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  line-height: 1;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

/**
 * ScoreDisplay Component
 * Animated score display with celebration effect
 */
const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
  ({ score, animated = true }, ref) => {
    return (
      <Container ref={ref}>
        <Label>Score</Label>
        <ScoreValue
          key={score}
          initial={animated ? { scale: 1.5, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {score}
        </ScoreValue>
      </Container>
    );
  },
);

ScoreDisplay.displayName = 'ScoreDisplay';

export default ScoreDisplay;
