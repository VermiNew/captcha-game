import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * Timer Props
 */
interface TimerProps {
  /** Seconds remaining */
  timeLeft: number;
  /** Total time in seconds */
  totalTime: number;
  /** Callback when time runs out */
  onTimeUp?: () => void;
}

/**
 * Styled timer container
 */
const TimerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Styled timer text
 */
const TimerText = styled(motion.div)<{ $isWarning: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  line-height: 1.2;
  min-width: 70px;
  text-align: center;
  letter-spacing: 1px;
`;

/**
 * Format seconds to MM:SS format
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Timer Component
 * Countdown timer with warning state and optional onTimeUp callback
 */
const Timer = React.forwardRef<HTMLDivElement, TimerProps>(
  ({ timeLeft, totalTime, onTimeUp }, ref) => {
    const isWarning = timeLeft < 10;

    useEffect(() => {
      if (timeLeft === 0 && onTimeUp) {
        onTimeUp();
      }
    }, [timeLeft, onTimeUp]);

    return (
      <TimerContainer ref={ref}>
        <TimerText
          $isWarning={isWarning}
          animate={isWarning ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{
            repeat: isWarning ? Infinity : 0,
            duration: 1,
            ease: 'easeInOut',
          }}
          key={timeLeft}
          initial={{ scale: 1 }}
        >
          {formatTime(timeLeft)}
        </TimerText>
      </TimerContainer>
    );
  },
);

Timer.displayName = 'Timer';

export default Timer;
