import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Simplified 8x8 patterns (64 pixels instead of 256)
 */
const PIXEL_PATTERNS = {
  heart: [
    0,1,1,0,0,1,1,0,
    1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,
    0,1,1,1,1,1,1,0,
    0,0,1,1,1,1,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,0,0,0,0,0,
  ] as number[],

  star: [
    0,0,0,1,1,0,0,0,
    0,0,1,1,1,1,0,0,
    0,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,
    0,1,1,1,1,1,1,0,
    0,0,1,1,1,1,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,0,0,0,0,0,
  ] as number[],

  smile: [
    0,1,1,1,1,1,1,0,
    1,1,0,1,1,0,1,1,
    1,1,0,1,1,0,1,1,
    1,1,1,1,1,1,1,1,
    1,0,1,1,1,1,0,1,
    1,0,0,1,1,0,0,1,
    0,1,0,0,0,0,1,0,
    0,0,1,1,1,1,0,0,
  ] as number[],

  arrow: [
    0,0,0,1,1,0,0,0,
    0,0,1,1,1,1,0,0,
    0,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,0,0,0,0,0,
  ] as number[],

  tree: [
    0,0,0,1,1,0,0,0,
    0,0,1,1,1,1,0,0,
    0,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,
    0,0,1,1,1,1,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,1,1,1,1,0,0,
  ] as number[],
};

type PatternName = keyof typeof PIXEL_PATTERNS;
const PATTERN_NAMES: PatternName[] = ['heart', 'star', 'smile', 'arrow', 'tree'];
const PATTERN_LABELS: Record<PatternName, string> = {
  heart: '❤️ Heart',
  star: '⭐ Star',
  smile: '😊 Smile',
  arrow: '⬆️ Arrow',
  tree: '🌲 Tree',
};

const GRID_SIZE = 8;
const MEMORIZE_TIME = 5;

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Styled phase display
 */
const PhaseDisplay = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
`;

/**
 * Timer display
 */
const TimerDisplay = styled(motion.div)<{ $warning?: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$warning ? theme.colors.error : theme.colors.success};
  text-shadow: 0 2px 10px currentColor;
`;

/**
 * Pattern label
 */
const PatternLabel = styled.div`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled grid container
 */
const GridContainer = styled(motion.div)`
  display: inline-grid;
  grid-template-columns: repeat(${GRID_SIZE}, 40px);
  grid-template-rows: repeat(${GRID_SIZE}, 40px);
  gap: 2px;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.border}20);
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid ${theme.colors.primary};
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled single pixel
 */
const Pixel = styled(motion.div)<{
  $filled: boolean;
  $isDrawing?: boolean;
  $correct?: boolean;
}>`
  width: 40px;
  height: 40px;
  background: ${props => {
    if (props.$correct === true) return 'linear-gradient(135deg, #10B981, #059669)';
    if (props.$correct === false) return 'linear-gradient(135deg, #EF4444, #DC2626)';
    return props.$filled ? 
      'linear-gradient(135deg, #1F2937, #111827)' : 
      'linear-gradient(135deg, #FFFFFF, #F3F4F6)';
  }};
  border: 2px solid ${props => {
    if (props.$correct === true) return '#10B981';
    if (props.$correct === false) return '#EF4444';
    return props.$filled ? '#374151' : '#D1D5DB';
  }};
  border-radius: ${theme.borderRadius.sm};
  cursor: ${props => props.$isDrawing ? 'pointer' : 'default'};
  transition: all 0.15s ease;
  box-shadow: ${props => props.$filled ? 
    'inset 0 2px 4px rgba(0,0,0,0.3)' : 
    'inset 0 2px 4px rgba(255,255,255,0.5)'};

  &:hover {
    ${props => props.$isDrawing ? `
      transform: scale(0.95);
      border-color: ${theme.colors.primary};
    ` : ''}
  }

  &:active {
    ${props => props.$isDrawing ? `
      transform: scale(0.9);
    ` : ''}
  }
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
`;

/**
 * Stats container
 */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
`;

/**
 * Stat card
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled(motion.p)<{ $highlight?: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$highlight ? theme.colors.success : theme.colors.primary};
  margin: 0;
`;

/**
 * Result message
 */
const ResultMessage = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.xl};
  background: ${props => props.$success ? 
    'rgba(16, 185, 129, 0.1)' : 
    'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$success ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  color: ${props => props.$success ? theme.colors.success : theme.colors.error};
  width: 100%;
  max-width: 500px;
`;

/**
 * Hint text
 */
const HintText = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.info};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.md};
  background: rgba(59, 130, 246, 0.1);
  border-radius: ${theme.borderRadius.md};
  max-width: 500px;
`;

/**
 * Pixel Art Memory Challenge Component
 */
const PixelArtMemoryChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [phase, setPhase] = useState<'showing' | 'drawing' | 'result'>('showing');
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_TIME);
  const [patternName] = useState<PatternName>(
    () => PATTERN_NAMES[Math.floor(Math.random() * PATTERN_NAMES.length)]
  );
  const [userGrid, setUserGrid] = useState<number[]>(Array(64).fill(0));
  const [result, setResult] = useState<{
    accuracy: number;
    correct: number;
    total: number;
  } | null>(null);
  const [startTime] = useState(() => Date.now());

  const pattern = useMemo(() => PIXEL_PATTERNS[patternName], [patternName]);

  /**
   * Countdown timer for showing phase
   */
  useEffect(() => {
    if (phase !== 'showing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('drawing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  /**
   * Toggle pixel
   */
  const handlePixelClick = useCallback((index: number) => {
    if (phase !== 'drawing') return;

    setUserGrid(prev => {
      const newGrid = [...prev];
      newGrid[index] = newGrid[index] === 0 ? 1 : 0;
      return newGrid;
    });
  }, [phase]);

  /**
   * Clear grid
   */
  const handleClear = useCallback(() => {
    setUserGrid(Array(64).fill(0));
  }, []);

  /**
   * Submit and evaluate
   */
  const handleSubmit = useCallback(() => {
    if (phase !== 'drawing') return;

    let correct = 0;
    for (let i = 0; i < 64; i++) {
      if (pattern[i] === userGrid[i]) {
        correct++;
      }
    }

    const accuracy = (correct / 64) * 100;

    setResult({
      accuracy,
      correct,
      total: 64,
    });
    setPhase('result');

    const timeSpent = (Date.now() - startTime) / 1000;
    const success = accuracy >= 75;
    let score = 0;
    
    if (accuracy >= 95) score = 300;
    else if (accuracy >= 85) score = 250;
    else if (accuracy >= 75) score = 200;

    setTimeout(() => {
      onComplete(success, timeSpent, score);
    }, 2000);
  }, [phase, pattern, userGrid, startTime, onComplete]);

  /**
   * Count filled pixels
   */
  const filledCount = useMemo(() => 
    userGrid.filter(p => p === 1).length,
    [userGrid]
  );

  const targetCount = useMemo(() => 
    pattern.filter(p => p === 1).length,
    [pattern]
  );

  return (
    <ChallengeBase
      title="Pixel Art Memory Challenge"
      description="Memorize and recreate the pattern"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PhaseDisplay>
          {phase === 'showing' && (
            <>
              <PatternLabel>{PATTERN_LABELS[patternName]}</PatternLabel>
              <div>Memorize the pattern!</div>
              <TimerDisplay 
                $warning={timeLeft <= 2}
                animate={{ scale: timeLeft <= 2 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5, repeat: timeLeft <= 2 ? Infinity : 0 }}
              >
                {timeLeft}
              </TimerDisplay>
            </>
          )}
          {phase === 'drawing' && (
            <>
              <div>🎨 Draw from memory</div>
              <PatternLabel style={{ fontSize: theme.fontSizes.md, opacity: 0.7 }}>
                ({PATTERN_LABELS[patternName]})
              </PatternLabel>
            </>
          )}
          {phase === 'result' && (
            <div>✓ Checking accuracy...</div>
          )}
        </PhaseDisplay>

        <GridContainer
          key={phase}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {(phase === 'showing' ? pattern : userGrid).map((filled, idx) => {
            let correct: boolean | undefined;
            if (phase === 'result') {
              correct = pattern[idx] === userGrid[idx];
            }

            return (
              <Pixel
                key={idx}
                $filled={filled === 1}
                $isDrawing={phase === 'drawing'}
                $correct={correct}
                onClick={() => handlePixelClick(idx)}
                whileHover={phase === 'drawing' ? { scale: 1.05 } : {}}
                whileTap={phase === 'drawing' ? { scale: 0.95 } : {}}
                animate={phase === 'showing' && filled === 1 ? {
                  boxShadow: [
                    'inset 0 2px 4px rgba(0,0,0,0.3)',
                    'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(31, 41, 55, 0.5)',
                    'inset 0 2px 4px rgba(0,0,0,0.3)',
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            );
          })}
        </GridContainer>

        {phase === 'drawing' && (
          <>
            <StatsContainer>
              <StatCard>
                <StatLabel>Filled</StatLabel>
                <StatValue>{filledCount}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Target</StatLabel>
                <StatValue $highlight>{targetCount}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Empty</StatLabel>
                <StatValue>{64 - filledCount}</StatValue>
              </StatCard>
            </StatsContainer>

            <ButtonContainer>
              <Button
                onClick={handleClear}
                disabled={false}
                size="lg"
                variant="secondary"
              >
                🗑️ Clear
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={false}
                size="lg"
                variant="primary"
              >
                ✓ Submit
              </Button>
            </ButtonContainer>

            <HintText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              💡 Tip: Click pixels to fill/unfill. Try to match {targetCount} pixels!
            </HintText>
          </>
        )}

        <AnimatePresence>
          {phase === 'result' && result && (
            <ResultMessage
              $success={result.accuracy >= 75}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>
                {result.accuracy >= 95 ? '🏆' :
                 result.accuracy >= 85 ? '⭐' :
                 result.accuracy >= 75 ? '✓' : '❌'}
              </div>
              <div style={{ fontSize: theme.fontSizes['2xl'], marginBottom: theme.spacing.sm }}>
                {result.accuracy.toFixed(0)}% Accuracy
              </div>
              <div style={{ fontSize: theme.fontSizes.md, opacity: 0.9 }}>
                {result.correct}/{result.total} pixels correct
              </div>
              <div style={{ fontSize: theme.fontSizes.sm, marginTop: theme.spacing.sm, opacity: 0.7 }}>
                {result.accuracy >= 95 ? '🎉 Perfect! +300 points' :
                 result.accuracy >= 85 ? '✨ Excellent! +250 points' :
                 result.accuracy >= 75 ? '👍 Good! +200 points' :
                 '🔄 Try again!'}
              </div>
            </ResultMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default PixelArtMemoryChallenge;