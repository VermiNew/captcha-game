import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Pixel art patterns (16x16 grid = 256 pixels)
 * 1 = filled (black), 0 = empty (white)
 */
const PIXEL_PATTERNS = {
  heart: [
    0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,
    1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,
    1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,
    1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
    0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
    0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ] as number[],

  star: [
    0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
    0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
    0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
    0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  ] as number[],

  smile: [
    0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
    0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
    1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,
    1,1,1,0,0,1,1,0,0,0,1,1,0,1,1,1,
    1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,
    1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,
    1,1,1,0,0,1,1,0,0,0,1,1,0,1,1,1,
    1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,
    1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,0,
    1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,0,
    1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,0,
    0,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,
    0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,
    0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,
  ] as number[],

  house: [
    0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
    0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,
    0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
    0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
    0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,
    1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,
    1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,
    1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,
    1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  ] as number[],

  lightning: [
    0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
    0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,
    0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,
    0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,
    0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,
    0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0,
    0,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,
    1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,
    1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,
    0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,
    0,0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,
    0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,
    0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,
  ] as number[],
};

type PatternName = keyof typeof PIXEL_PATTERNS;
const patternNames: PatternName[] = ['heart', 'star', 'smile', 'house', 'lightning'];

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Styled phase display
 */
const PhaseDisplay = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textSecondary};
  text-align: center;
`;

/**
 * Styled grid container
 */
const GridContainer = styled(motion.div)`
  display: inline-grid;
  grid-template-columns: repeat(16, 20px);
  grid-template-rows: repeat(16, 20px);
  gap: 1px;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled single pixel
 */
const Pixel = styled.div<{
  $filled: boolean;
  $isDrawing?: boolean;
  $correct?: boolean;
}>`
  width: 20px;
  height: 20px;
  background: ${(props) => {
    if (props.$correct === true) return '#10B981';
    if (props.$correct === false) return '#EF4444';
    return props.$filled ? '#1F2937' : '#FFFFFF';
  }};
  border: 1px solid ${theme.colors.border};
  cursor: ${(props) => (props.$isDrawing ? 'crosshair' : 'default')};
  transition: all 0.1s ease;

  &:hover {
    ${(props) =>
      props.$isDrawing
        ? `
      transform: scale(0.95);
      box-shadow: inset 0 0 3px rgba(0,0,0,0.3);
    `
        : ''}
  }
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

/**
 * Styled result display
 */
const ResultDisplay = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
`;

/**
 * Styled result title
 */
const ResultTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
`;

/**
 * Styled result stat
 */
const ResultStat = styled.p`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.sm} 0;
`;

/**
 * Styled accuracy
 */
const Accuracy = styled.div<{ $accuracy: number }>`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => {
    if (props.$accuracy >= 90) return theme.colors.success;
    if (props.$accuracy >= 80) return theme.colors.warning;
    return theme.colors.error;
  }};
  margin: ${theme.spacing.md} 0;
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
  const [pattern] = useState<number[]>(
    () => PIXEL_PATTERNS[patternNames[Math.floor(Math.random() * patternNames.length)]]
  );
  const [userGrid, setUserGrid] = useState<number[]>(Array(256).fill(0));
  const [result, setResult] = useState<{
    accuracy: number;
    correct: number;
    total: number;
  } | null>(null);

  /**
   * Initialize - show pattern for 6 seconds
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('drawing');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Toggle pixel
   */
  const handlePixelClick = (index: number) => {
    if (phase !== 'drawing') return;

    setUserGrid((prev) => {
      const newGrid = [...prev];
      newGrid[index] = newGrid[index] === 0 ? 1 : 0;
      return newGrid;
    });
  };

  /**
   * Clear grid
   */
  const handleClear = () => {
    setUserGrid(Array(256).fill(0));
  };

  /**
   * Submit and evaluate
   */
  const handleSubmit = () => {
    if (phase !== 'drawing') return;

    // Compare grids
    let correct = 0;
    let filledPixels = 0;

    for (let i = 0; i < 256; i++) {
      if (pattern[i] === 1) {
        filledPixels++;
        if (userGrid[i] === 1) {
          correct++;
        }
      } else if (userGrid[i] === 0) {
        correct++;
      }
    }

    const accuracy = filledPixels > 0
      ? (correct / 256) * 100
      : 0;

    setResult({
      accuracy,
      correct,
      total: 256,
    });
    setPhase('result');

    // Determine success
    const success = accuracy >= 80;
    let score = 0;
    if (accuracy >= 90) score = 300;
    else if (accuracy >= 80) score = 200;

    setTimeout(() => {
      onComplete(success, 0, score);
    }, 2000);
  };

  return (
    <ChallengeBase
      title="Pixel Art Memory Challenge"
      description="Memorize the pattern and draw it from memory"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <PhaseDisplay>
          {phase === 'showing'
            ? 'Memorize the pattern (6 seconds)'
            : phase === 'drawing'
              ? 'Now draw the pattern from memory'
              : 'Checking your accuracy...'}
        </PhaseDisplay>

        <GridContainer
          key={phase}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {(phase === 'showing' ? pattern : userGrid).map((filled, idx) => {
            let correct: boolean | undefined;
            if (phase === 'result') {
              if (pattern[idx] === 1 && userGrid[idx] === 1) {
                correct = true;
              } else if (pattern[idx] !== userGrid[idx]) {
                correct = false;
              }
            }

            return (
              <Pixel
                key={idx}
                $filled={phase === 'showing' ? filled === 1 : userGrid[idx] === 1}
                $isDrawing={phase === 'drawing'}
                $correct={correct}
                onClick={() => handlePixelClick(idx)}
                style={{
                  animation:
                    phase === 'showing' && filled === 1
                      ? 'pulse 2s ease-in-out infinite'
                      : 'none',
                }}
              />
            );
          })}
        </GridContainer>

        {phase === 'drawing' && (
          <ButtonContainer>
            <Button
              onClick={handleClear}
              disabled={false}
              size="md"
              variant="secondary"
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={false}
              size="md"
              variant="primary"
            >
              Submit
            </Button>
          </ButtonContainer>
        )}

        {phase === 'result' && result && (
          <ResultDisplay
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultTitle>Accuracy Check</ResultTitle>
            <Accuracy $accuracy={result.accuracy}>
              {result.accuracy.toFixed(1)}%
            </Accuracy>
            <ResultStat>
              {result.accuracy >= 90
                ? '✓ Perfect! 300 points'
                : result.accuracy >= 80
                  ? '✓ Good! 200 points'
                  : '✗ Try again'}
            </ResultStat>
          </ResultDisplay>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(31, 41, 55, 0.7);
            }
            50% {
              box-shadow: 0 0 0 2px rgba(31, 41, 55, 0.3);
            }
          }
        `}</style>
      </Container>
    </ChallengeBase>
  );
};

export default PixelArtMemoryChallenge;
