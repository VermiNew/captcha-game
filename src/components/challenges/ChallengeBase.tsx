import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import { theme } from '../../styles/theme';

/**
 * ChallengeBase Props
 */
interface ChallengeBaseProps extends ChallengeProps {
  /** Challenge title */
  title: string;
  /** Challenge description */
  description: string;
  /** Challenge content */
  children: React.ReactNode;
}

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * Styled header
 */
const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  text-align: center;
`;

/**
 * Styled title
 */
const Title = styled.h1`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

/**
 * Styled description
 */
const Description = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled content area
 */
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

/**
 * Hook for managing challenge timer
 */
export const useChallengeTimer = (timeLimit: number) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return { timeLeft, isActive, setIsActive };
};

/**
 * ChallengeBase Component
 * Base component for all challenges with shared timer and completion logic
 */
export const ChallengeBase: React.FC<ChallengeBaseProps> = ({
  title,
  description,
  timeLimit,
  challengeId,
  onComplete,
  children,
}) => {
  const { timeLeft, isActive, setIsActive } = useChallengeTimer(timeLimit);

  /**
   * Handle time up event
   */
  const handleTimeUp = useCallback(() => {
    setIsActive(false);
    console.debug(`Challenge ${challengeId} timed out`);
    onComplete(false, timeLimit, 0);
  }, [challengeId, timeLimit, onComplete, setIsActive]);

  /**
   * Handle successful completion
   */
  const handleSuccess = useCallback((score: number) => {
    setIsActive(false);
    const timeSpent = timeLimit - timeLeft;
    onComplete(true, timeSpent, score);
  }, [timeLimit, timeLeft, onComplete, setIsActive]);

  /**
   * Handle failure
   */
  const handleFailure = useCallback(() => {
    setIsActive(false);
    const timeSpent = timeLimit - timeLeft;
    onComplete(false, timeSpent, 0);
  }, [timeLimit, timeLeft, onComplete, setIsActive]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft, handleTimeUp]);

  // Expose handlers through context or direct calls
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Header>

      <Content>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
              isActive,
              onSuccess: handleSuccess,
              onFailure: handleFailure,
              timeLeft,
            })
          : children}
      </Content>
    </Container>
  );
};

ChallengeBase.displayName = 'ChallengeBase';

export default ChallengeBase;
