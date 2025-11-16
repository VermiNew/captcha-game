import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game phase type
 */
type GamePhase = 'active' | 'showing-result' | 'complete';

/**
 * Result item
 */
interface AttemptResult {
  distance: number;
  x: number;
  y: number;
}

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
 * Styled game area
 */
const GameArea = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  max-width: 400px;
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid ${theme.colors.primary};
  position: relative;
  overflow: hidden;
  cursor: crosshair;
`;

/**
 * Styled target circle
 */
const TargetCircle = styled(motion.div)<{ $phase: GamePhase }>`
  position: absolute;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.accent} 100%);
  box-shadow: 0 0 20px ${theme.colors.secondary}, inset 0 0 10px rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: white;

  ${(props) =>
    props.$phase === 'showing-result'
      ? `
    pointer-events: none;
    opacity: 0.5;
  `
      : ''}

  &::before {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    z-index: 10;
  }
`;

/**
 * Styled miss indicator
 */
const MissIndicator = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.full};
  pointer-events: none;
`;

/**
 * Styled result display
 */
const ResultDisplay = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.primary};
  width: 100%;
  text-align: center;
`;

/**
 * Styled result label
 */
const ResultLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled result value
 */
const ResultValue = styled(motion.p)<{ $quality: 'excellent' | 'good' | 'fair' | 'poor' }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
  color: ${(props) => {
    switch (props.$quality) {
      case 'excellent':
        return theme.colors.success;
      case 'good':
        return theme.colors.info;
      case 'fair':
        return theme.colors.accent;
      case 'poor':
        return theme.colors.error;
    }
  }};
`;

/**
 * Styled attempts summary
 */
const AttemptsSummary = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled attempt item
 */
const AttemptItem = styled(motion.div)<{ $quality: 'excellent' | 'good' | 'fair' | 'poor' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => {
    switch (props.$quality) {
      case 'excellent':
        return 'rgba(16, 185, 129, 0.1)';
      case 'good':
        return 'rgba(59, 130, 246, 0.1)';
      case 'fair':
        return 'rgba(245, 158, 11, 0.1)';
      case 'poor':
        return 'rgba(239, 68, 68, 0.1)';
    }
  }};
  border: 2px solid
    ${(props) => {
      switch (props.$quality) {
        case 'excellent':
          return theme.colors.success;
        case 'good':
          return theme.colors.info;
        case 'fair':
          return theme.colors.accent;
        case 'poor':
          return theme.colors.error;
      }
    }};
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
 * Styled attempt distance
 */
const AttemptDistance = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
`;

/**
 * Styled stats section
 */
const StatsSection = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
`;

/**
 * Styled stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled completion message
 */
const CompletionMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Styled emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Get quality level based on distance
 */
const getQuality = (distance: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (distance <= 15) return 'excellent';
  if (distance <= 30) return 'good';
  if (distance <= 50) return 'fair';
  return 'poor';
};

/**
 * Click Precision Challenge Component
 * User must click the center of a shrinking circle
 */
const ClickPrecisionChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [phase, setPhase] = useState<GamePhase>('active');
  const [missIndicator, setMissIndicator] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [startTime] = useState(Date.now());

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationStartRef = useRef<number>(0);
  const rafRef = useRef<number>();

  const CIRCLE_SIZE = 200; // px
  const ANIMATION_DURATION = 3000; // ms
  const MIN_CIRCLE_SIZE = 20; // px

  /**
   * Calculate distance from center
   */
  const calculateDistance = (clickX: number, clickY: number, centerX: number, centerY: number): number => {
    return Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
  };

  /**
   * Handle circle click
   */
  const handleCircleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'active' || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const distance = calculateDistance(clickX, clickY, centerX, centerY);

    // Show miss indicator if miss
    if (distance > 20) {
      setMissIndicator({ x: clickX, y: clickY });
      setTimeout(() => setMissIndicator(null), 500);
    }

    // Record result
    const newResults = [...results, { distance, x: clickX, y: clickY }];
    setResults(newResults);

    // Show result phase
    setPhase('showing-result');

    // Next attempt or complete
    if (currentAttempt < 3) {
      setTimeout(() => {
        setCurrentAttempt(currentAttempt + 1);
        setScale(1);
        setPhase('active');
      }, 1500);
    } else {
      // Challenge complete
      setTimeout(() => {
        setPhase('complete');
      }, 1500);
    }
  };

  /**
   * Animate circle shrinking
   */
  useEffect(() => {
    if (phase !== 'active') return;

    animationStartRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - animationStartRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      // Exponential easing for more dramatic shrinking
      const easeProgress = Math.pow(progress, 1.5);
      const newScale = 1 - easeProgress * (1 - MIN_CIRCLE_SIZE / CIRCLE_SIZE);

      setScale(newScale);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [phase]);

  // Calculate statistics
  const avgDistance = results.length > 0 ? results.reduce((a, b) => a + b.distance, 0) / results.length : 0;
  const success = avgDistance < 30;
  const score = Math.max(0, Math.round(200 - avgDistance * 3));

  return (
    <ChallengeBase
      title="Click Precision Challenge"
      description="Click the center of the shrinking circle"
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
          Hit the Target!
        </Title>

        <Instruction>
          {phase === 'active'
            ? 'Click the center of the circle before it disappears'
            : phase === 'showing-result'
              ? 'Recording result...'
              : 'Challenge complete!'}
        </Instruction>

        {phase !== 'complete' && (
          <AttemptCounter
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Attempt {currentAttempt}/3
          </AttemptCounter>
        )}

        {phase !== 'complete' && (
          <GameArea
            ref={gameAreaRef}
            onClick={handleCircleClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <TargetCircle
              $phase={phase}
              animate={{
                width: CIRCLE_SIZE * scale,
                height: CIRCLE_SIZE * scale,
              }}
              transition={{ type: 'tween', duration: ANIMATION_DURATION / 1000 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCircleClick(e as any);
              }}
            />

            {missIndicator && (
              <MissIndicator
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.4 }}
                style={{
                  left: missIndicator.x - 10,
                  top: missIndicator.y - 10,
                }}
              />
            )}
          </GameArea>
        )}

        {phase === 'showing-result' && results.length > 0 && (
          <ResultDisplay
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <ResultLabel>Attempt {currentAttempt} Result</ResultLabel>
            <ResultValue
              $quality={getQuality(results[results.length - 1].distance)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {Math.round(results[results.length - 1].distance)}px
            </ResultValue>
          </ResultDisplay>
        )}

        {phase === 'complete' && (
          <>
            <AttemptsSummary
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
            >
              {results.map((result, idx) => (
                <AttemptItem
                  key={idx}
                  $quality={getQuality(result.distance)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <AttemptNumber>Attempt {idx + 1}</AttemptNumber>
                  <AttemptDistance
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {Math.round(result.distance)}px
                  </AttemptDistance>
                </AttemptItem>
              ))}
            </AttemptsSummary>

            <StatsSection
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatItem>
                <StatLabel>Average Distance</StatLabel>
                <StatValue
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {Math.round(avgDistance)}px
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Score</StatLabel>
                <StatValue
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {score}
                </StatValue>
              </StatItem>
            </StatsSection>

            <CompletionMessage
              $success={success}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            >
              <Emoji>{success ? '🎯' : '💪'}</Emoji>
              <div>
                {success
                  ? 'Excellent precision!'
                  : 'Keep practicing your accuracy!'}
              </div>
            </CompletionMessage>
          </>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default ClickPrecisionChallenge;
