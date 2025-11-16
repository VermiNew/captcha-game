import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game phase type
 */
type GamePhase = 'waiting-start' | 'ready' | 'showing-result' | 'complete';

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
 * Styled title
 */
const Title = styled(motion.h2)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin: 0;
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
 * Styled reaction box
 */
const ReactionBox = styled(motion.button)<{ $phase: GamePhase }>`
  width: 200px;
  height: 200px;
  border: none;
  border-radius: ${theme.borderRadius.xl};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  ${(props) => {
    switch (props.$phase) {
      case 'waiting-start':
        return `
          background: ${theme.colors.error};
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          transform: scale(0.95);
        `;
      case 'ready':
        return `
          background: ${theme.colors.success};
          box-shadow: 0 0 30px ${theme.colors.success}, inset 0 0 20px rgba(255, 255, 255, 0.2);
          transform: scale(1);
          animation: pulse-reaction 0.5s ease-out;
        `;
      case 'showing-result':
        return `
          background: ${theme.colors.primary};
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
          transform: scale(0.98);
          pointer-events: none;
        `;
      default:
        return `
          background: ${theme.colors.surface};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: scale(0.95);
          pointer-events: none;
        `;
    }
  }}

  &:hover:not(:disabled) {
    transform: scale(1.02);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
  }

  @keyframes pulse-reaction {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 ${theme.colors.success};
    }
    50% {
      box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }
`;

/**
 * Styled results container
 */
const ResultsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled result item
 */
const ResultItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border-left: 4px solid ${theme.colors.primary};
`;

/**
 * Styled result label
 */
const ResultLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled result value
 */
const ResultValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled attempt results grid
 */
const AttemptsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: 500px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

/**
 * Styled attempt badge
 */
const AttemptBadge = styled(motion.div)<{ $index: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled attempt number
 */
const AttemptNumber = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled attempt time
 */
const AttemptTime = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled message
 */
const Message = styled(motion.p)<{ $type: 'info' | 'success' | 'error' }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  text-align: center;
  margin: 0;
  color: ${(props) => {
    switch (props.$type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  }};
`;

/**
 * Reaction Time Challenge Component
 * User must click as fast as possible when the square turns green
 */
const ReactionTimeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [reactions, setReactions] = useState<number[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting-start');
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  /**
   * Generate random delay between 2-5 seconds
   */
  const getRandomDelay = () => Math.floor(Math.random() * 3000) + 2000;

  /**
   * Start the next attempt
   */
  const startNextAttempt = () => {
    if (currentAttempt > 5) {
      // Calculate final stats
      const avgTime = reactions.reduce((a, b) => a + b, 0) / reactions.length;
      const success = avgTime < 600;
      const score = Math.max(0, Math.round(200 - avgTime / 3));

      setPhase('complete');
      setTimeout(() => {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(success, timeSpent, score);
      }, 1500);
      return;
    }

    setPhase('waiting-start');
    setLastReactionTime(null);

    // Wait random delay, then turn green
    const delay = getRandomDelay();
    timeoutRef.current = setTimeout(() => {
      setPhase('ready');
      startTimeRef.current = performance.now();
    }, delay);
  };

  /**
   * Handle box click
   */
  const handleBoxClick = () => {
    if (phase !== 'ready') return;

    const reactionTime = Math.round(performance.now() - startTimeRef.current);
    const newReactions = [...reactions, reactionTime];

    setReactions(newReactions);
    setLastReactionTime(reactionTime);
    setPhase('showing-result');

    // Show result and start next attempt
    timeoutRef.current = setTimeout(() => {
      setCurrentAttempt(currentAttempt + 1);
      startNextAttempt();
    }, 1500);
  };

  /**
   * Initialize first attempt on mount
   */
  useEffect(() => {
    startNextAttempt();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle too slow (3 seconds without click)
   */
  useEffect(() => {
    if (phase !== 'ready') return;

    const timeoutId = setTimeout(() => {
      // Player was too slow - record as miss
      if (phase === 'ready') {
        const reactionTime = 3000; // Mark as timeout
        const newReactions = [...reactions, reactionTime];

        setReactions(newReactions);
        setLastReactionTime(reactionTime);
        setPhase('showing-result');

        setTimeout(() => {
          setCurrentAttempt(currentAttempt + 1);
          startNextAttempt();
        }, 1500);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [phase, currentAttempt, reactions]);

  // Calculate statistics
  const avgTime = reactions.length > 0 ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
  const minTime = reactions.length > 0 ? Math.min(...reactions) : 0;
  const maxTime = reactions.length > 0 ? Math.max(...reactions) : 0;

  return (
    <ChallengeBase
      title="Reaction Time Challenge"
      description="Click as fast as possible when the square turns green"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Test Your Reflexes!
        </Title>

        <Instruction>
          {phase === 'waiting-start'
            ? 'Wait for the square to turn green...'
            : phase === 'ready'
              ? 'Click NOW!'
              : phase === 'showing-result'
                ? `Great! Time recorded.`
                : 'Measuring reaction times...'}
        </Instruction>

        <AttemptCounter
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Attempt {currentAttempt}/5
        </AttemptCounter>

        <ReactionBox
          $phase={phase}
          onClick={handleBoxClick}
          disabled={phase !== 'ready'}
          whileTap={phase === 'ready' ? { scale: 0.95 } : {}}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {phase === 'showing-result' && lastReactionTime !== null && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {lastReactionTime >= 3000 ? 'Too Slow!' : `${lastReactionTime}ms`}
            </motion.span>
          )}
        </ReactionBox>

        {phase === 'complete' && (
          <ResultsContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AttemptsGrid
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
            >
              {reactions.map((time, idx) => (
                <AttemptBadge
                  key={idx}
                  $index={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <AttemptNumber>#{idx + 1}</AttemptNumber>
                  <AttemptTime
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {time >= 3000 ? '-' : `${time}ms`}
                  </AttemptTime>
                </AttemptBadge>
              ))}
            </AttemptsGrid>

            <ResultsContainer>
              <ResultItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ResultLabel>Average Time</ResultLabel>
                <ResultValue
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {Math.round(avgTime)}ms
                </ResultValue>
              </ResultItem>

              <ResultItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ResultLabel>Fastest</ResultLabel>
                <ResultValue
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {minTime}ms
                </ResultValue>
              </ResultItem>

              <ResultItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ResultLabel>Slowest</ResultLabel>
                <ResultValue
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {maxTime >= 3000 ? '-' : `${maxTime}ms`}
                </ResultValue>
              </ResultItem>
            </ResultsContainer>

            <Message
              $type={avgTime < 600 ? 'success' : 'error'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {avgTime < 600
                ? '✓ Excellent reaction time!'
                : '✗ Good effort, keep training!'}
            </Message>
          </ResultsContainer>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default ReactionTimeChallenge;
