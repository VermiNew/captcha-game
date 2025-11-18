import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game state type
 */
type GameState = 'waiting' | 'ready' | 'result' | 'complete';

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled attempt counter
 */
const AttemptCounter = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled reaction button
 */
const ReactionButton = styled(motion.button)<{ $state: GameState }>`
  width: 180px;
  height: 180px;
  border: none;
  border-radius: ${theme.borderRadius.xl};
  cursor: pointer;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;

  ${(props) => {
    switch (props.$state) {
      case 'waiting':
        return `
          background: ${theme.colors.error};
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          cursor: not-allowed;
          opacity: 0.7;
        `;
      case 'ready':
        return `
          background: ${theme.colors.success};
          box-shadow: 0 0 30px ${theme.colors.success};
          cursor: pointer;
          animation: pulse-btn 0.6s ease-in-out;
        `;
      case 'result':
        return `
          background: ${theme.colors.primary};
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
          cursor: not-allowed;
        `;
      default:
        return `
          background: ${theme.colors.surface};
          cursor: not-allowed;
          opacity: 0.5;
        `;
    }
  }}

  &:hover {
    ${(props) => (props.$state === 'ready' ? `transform: scale(1.05);` : '')}
  }

  &:active {
    ${(props) => (props.$state === 'ready' ? `transform: scale(0.95);` : '')}
  }

  @keyframes pulse-btn {
    0% {
      box-shadow: 0 0 0 0 ${theme.colors.success};
    }
    50% {
      box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }
`;

/**
 * Styled stats container
 */
const StatsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Styled stat box
 */
const StatBox = styled(motion.div)`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  text-align: center;
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

/**
 * Styled stat value
 */
const StatValue = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled result message
 */
const ResultMessage = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.base};
`;

const TOTAL_ROUNDS = 5;
const READY_TIMEOUT = 3000; // Time to click after green

/**
 * Reaction Time Challenge Component
 * Click the button as fast as possible when it turns green
 */
const ReactionTimeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [round, setRound] = useState(1);
  const [state, setState] = useState<GameState>('waiting');
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [startTime] = useState(() => Date.now());

  const stateRef = useRef<GameState>('waiting');
  const readyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Start new round
   */
  const startRound = () => {
    setCurrentTime(null);
    setState('waiting');

    // Random delay 1-3 seconds before turning green
    const delay = Math.random() * 2000 + 1000;

    timeoutRef.current = setTimeout(() => {
      setState('ready');
      readyTimeRef.current = performance.now();

      // Auto-timeout if not clicked in 3 seconds
      timeoutRef.current = setTimeout(() => {
        if (stateRef.current === 'ready') {
          setCurrentTime(READY_TIMEOUT);
          setState('result');
          finishRound(READY_TIMEOUT);
        }
      }, READY_TIMEOUT);
    }, delay);
  };

  /**
   * Handle button click
   */
  const handleClick = () => {
    if (state !== 'ready') return;

    const reactionTime = Math.round(performance.now() - readyTimeRef.current);
    setCurrentTime(reactionTime);
    setState('result');
    finishRound(reactionTime);
  };

  /**
   * Finish current round and start next
   */
  const finishRound = (reactionTime: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setTimes((prev) => [...prev, reactionTime]);

    // Move to next round after delay
    timeoutRef.current = setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        setRound(round + 1);
        startRound();
      } else {
        // Game complete
        setState('complete');
      }
    }, 800);
  };

  /**
   * Initialize first round
   */
  useEffect(() => {
    startRound();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Calculate stats
   */
  const avgTime =
    times.length > 0
      ? Math.round(times.filter((t) => t < READY_TIMEOUT).reduce((a, b) => a + b, 0) / times.length)
      : 0;
  const bestTime = times.length > 0 ? Math.min(...times.filter((t) => t < READY_TIMEOUT)) : 0;
  const success = avgTime > 0 && avgTime < 400;
  const score = Math.max(0, Math.round(300 - avgTime));

  /**
   * Complete challenge
   */
  useEffect(() => {
    if (state === 'complete') {
      const timeSpent = (Date.now() - startTime) / 1000;
      timeoutRef.current = setTimeout(() => {
        onComplete(success, timeSpent, score);
      }, 1500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state, success, score, startTime, onComplete]);

  return (
    <ChallengeBase
      title="Reaction Time Challenge"
      description="Click as fast as you can when the button turns green"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instruction>
          {state === 'waiting'
            ? 'Wait for the button to turn green...'
            : state === 'ready'
              ? 'Click NOW!'
              : state === 'result'
                ? 'Time recorded!'
                : 'Complete!'}
        </Instruction>

        <AttemptCounter
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Round {round}/{TOTAL_ROUNDS}
        </AttemptCounter>

        <ReactionButton
          $state={state}
          onClick={handleClick}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {state === 'result' && currentTime !== null && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {currentTime >= READY_TIMEOUT ? 'Too Slow!' : `${currentTime}ms`}
            </motion.span>
          )}
        </ReactionButton>

        {state === 'complete' && (
          <StatsContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StatBox
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <StatLabel>Average</StatLabel>
              <StatValue>{avgTime}ms</StatValue>
            </StatBox>

            <StatBox
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <StatLabel>Best</StatLabel>
              <StatValue>{bestTime}ms</StatValue>
            </StatBox>

            <StatBox
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <StatLabel>Score</StatLabel>
              <StatValue>{score}</StatValue>
            </StatBox>

            <ResultMessage
              $success={success}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              style={{ gridColumn: '1 / -1' }}
            >
              {success
                ? '✓ Excellent reaction time!'
                : avgTime > 0
                  ? '✗ Good effort, keep training!'
                  : 'Game complete!'}
            </ResultMessage>
          </StatsContainer>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default ReactionTimeChallenge;
