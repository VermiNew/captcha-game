import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import logger from '../../utils/logger';
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
  /** Hide timer (optional) */
  hideTimer?: boolean;
  /** Custom max width */
  maxWidth?: string;
}

/**
 * Styled container
 */
const Container = styled(motion.div)<{ $maxWidth?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: ${props => props.$maxWidth || '800px'};
  margin: 0 auto;
  padding: ${theme.spacing.lg};
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
const Title = styled(motion.h1)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

/**
 * Styled description
 */
const Description = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

/**
 * Timer container
 */
const TimerContainer = styled(motion.div)<{ $warning?: boolean; $critical?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${props => 
    props.$critical ? 'rgba(239, 68, 68, 0.1)' :
    props.$warning ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(99, 102, 241, 0.1)'};
  border: 2px solid ${props => 
    props.$critical ? theme.colors.error :
    props.$warning ? theme.colors.warning :
    theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
`;

const TimerLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${theme.fontWeights.semibold};
`;

const TimerValue = styled(motion.span)<{ $warning?: boolean; $critical?: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => 
    props.$critical ? theme.colors.error :
    props.$warning ? theme.colors.warning :
    theme.colors.primary};
  text-shadow: 0 2px 10px currentColor;
  line-height: 1;
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.sm};
`;

const ProgressFill = styled(motion.div)<{ $warning?: boolean; $critical?: boolean }>`
  height: 100%;
  background: ${props => 
    props.$critical ? `linear-gradient(90deg, ${theme.colors.error}, #dc2626)` :
    props.$warning ? `linear-gradient(90deg, ${theme.colors.warning}, #f59e0b)` :
    `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  border-radius: ${theme.borderRadius.full};
  box-shadow: 0 0 10px currentColor;
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
 * Warning overlay
 */
const WarningOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(239, 68, 68, 0.1);
  pointer-events: none;
  z-index: 9999;
`;

/**
 * Hook for managing challenge timer
 */
export const useChallengeTimer = (timeLimit: number, onTimeUp?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft, onTimeUp]);

  const reset = useCallback(() => {
    setTimeLeft(timeLimit);
    setIsActive(true);
    setIsPaused(false);
  }, [timeLimit]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const percentage = useMemo(() => 
    (timeLeft / timeLimit) * 100,
    [timeLeft, timeLimit]
  );

  const isWarning = useMemo(() => 
    timeLeft <= timeLimit * 0.3 && timeLeft > timeLimit * 0.1,
    [timeLeft, timeLimit]
  );

  const isCritical = useMemo(() => 
    timeLeft <= timeLimit * 0.1,
    [timeLeft, timeLimit]
  );

  return { 
    timeLeft, 
    isActive, 
    isPaused,
    percentage,
    isWarning,
    isCritical,
    setIsActive, 
    reset,
    pause,
    resume,
    stop,
  };
};

/**
 * Format time display
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}`;
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
  hideTimer = false,
  maxWidth,
}) => {
  const handleTimeUp = useCallback(() => {
    logger.debug(`Challenge ${challengeId} timed out`);
    onComplete(false, timeLimit, 0);
  }, [challengeId, timeLimit, onComplete]);

  const { 
    timeLeft, 
    isActive, 
    percentage,
    isWarning,
    isCritical,
    stop,
  } = useChallengeTimer(timeLimit, handleTimeUp);

  /**
   * Handle successful completion
   */
  const handleSuccess = useCallback((timeSpent: number, score: number) => {
    stop();
    logger.debug(`Challenge ${challengeId} completed successfully with score ${score}`);
    onComplete(true, timeSpent, score);
  }, [challengeId, onComplete, stop]);

  /**
   * Handle failure
   */
  const handleFailure = useCallback((timeSpent: number) => {
    stop();
    logger.debug(`Challenge ${challengeId} failed`);
    onComplete(false, timeSpent, 0);
  }, [challengeId, onComplete, stop]);

  return (
    <>
      <Container
        $maxWidth={maxWidth}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Header>
          <Title
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {title}
          </Title>
          <Description
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {description}
          </Description>
        </Header>

        {!hideTimer && isActive && (
          <TimerContainer
            $warning={isWarning}
            $critical={isCritical}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <TimerLabel>Time Remaining</TimerLabel>
            <TimerValue
              $warning={isWarning}
              $critical={isCritical}
              animate={isCritical ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ 
                duration: 1, 
                repeat: isCritical ? Infinity : 0 
              }}
            >
              {formatTime(timeLeft)}
            </TimerValue>
            <ProgressBar>
              <ProgressFill
                $warning={isWarning}
                $critical={isCritical}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </ProgressBar>
          </TimerContainer>
        )}

        <Content>
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<any>, {
                isActive,
                onSuccess: handleSuccess,
                onFailure: handleFailure,
                timeLeft,
              })
            : children}
        </Content>
      </Container>

      {/* Critical time warning overlay */}
      <AnimatePresence>
        {isCritical && isActive && (
          <WarningOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

ChallengeBase.displayName = 'ChallengeBase';

export default ChallengeBase;