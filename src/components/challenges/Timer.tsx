import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * Timer Props
 */
interface TimerProps {
  /** Time limit in seconds */
  timeLimit: number;
  /** Callback when time runs out */
  onTimeUp?: () => void;
  /** Hide timer display (optional) */
  hide?: boolean;
  /** Custom max width */
  maxWidth?: string;
}

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
 * Hook for managing timer
 */
export const useTimer = (timeLimit: number, onTimeUp?: () => void) => {
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
 * Timer Component
 * Display a countdown timer with visual feedback
 */
export const Timer: React.FC<TimerProps> = ({
  timeLimit,
  onTimeUp,
  hide = false,
}) => {
  const { 
    timeLeft, 
    isActive, 
    percentage,
    isWarning,
    isCritical,
  } = useTimer(timeLimit, onTimeUp);

  if (hide || !isActive) return null;

  return (
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
  );
};

Timer.displayName = 'Timer';

export default Timer;
