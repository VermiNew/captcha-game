import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Math expression with value and tooltip
 */
interface MathExpression {
  id: string;
  expression: React.ReactNode;
  value: number;
  tooltip: string;
  description: string;
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
`;

/**
 * Styled grid container (3x3)
 */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

/**
 * Styled tile
 */
const Tile = styled(motion.div)<{
  $selected?: boolean;
  $correct?: boolean | null;
  $hovered?: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 2px solid ${(props) => {
    if (props.$correct === true) return theme.colors.success;
    if (props.$correct === false) return theme.colors.error;
    return theme.colors.border;
  }};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  position: relative;
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.semibold};
  transition: all 0.2s ease;
  padding: ${theme.spacing.md};
  text-align: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: scale(0.98);
  }
`;

/**
 * Styled sequence badge
 */
const SequenceBadge = styled(motion.div)`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: ${theme.colors.info};
  color: white;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.sm};
  box-shadow: ${theme.shadows.md};
`;

/**
 * Styled checkmark
 */
const Checkmark = styled(motion.div)`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: ${theme.colors.success};
  color: white;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
`;

/**
 * Styled tooltip
 */
const Tooltip = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  max-width: 300px;
  z-index: 1000;
  box-shadow: ${theme.shadows.lg};
  white-space: normal;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textPrimary};
  line-height: 1.6;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`;

/**
 * Styled tooltip title
 */
const TooltipTitle = styled.div`
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.primary};
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  width: 100%;
`;

/**
 * Styled result
 */
const Result = styled(motion.div)<{ $success: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${(props) => (props.$success ? '#f0fdf4' : '#fef2f2')};
  border: 2px solid ${(props) =>
    props.$success ? theme.colors.success : theme.colors.error};
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
  color: ${(props) => props.color};
  margin: 0 0 ${theme.spacing.md} 0;
`;

/**
 * Styled result text
 */
const ResultText = styled.p`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textPrimary};
  margin: ${theme.spacing.sm} 0;
`;

/**
 * Generate random number in range
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate math expressions with values
 */
function generateExpressions(): MathExpression[] {
  const expressions: MathExpression[] = [];

  // 1. Basic arithmetic (3×4)
  const a1 = randomInt(1, 20);
  const b1 = randomInt(1, 20);
  expressions.push({
    id: 'basic1',
    expression: `${a1}×${b1}`,
    value: a1 * b1,
    tooltip: `Basic Multiplication`,
    description: `Multiply ${a1} by ${b1}. Hint: Skip counting by ${a1} or ${b1} groups.`,
  });

  // 2. Basic division (15÷3)
  const a2 = randomInt(3, 10) * randomInt(1, 5);
  const b2 = randomInt(2, 10);
  if (a2 % b2 === 0) {
    expressions.push({
      id: 'basic2',
      expression: `${a2}÷${b2}`,
      value: a2 / b2,
      tooltip: `Basic Division`,
      description: `Divide ${a2} by ${b2}. How many groups of ${b2} make ${a2}?`,
    });
  }

  // 3. Fraction (10/13)
  const num = randomInt(1, 20);
  const denom = randomInt(num + 1, 25);
  expressions.push({
    id: 'fraction',
    expression: (
      <div>
        <div>{num}</div>
        <div style={{ borderTop: '2px solid currentColor', margin: '4px 0' }}>
          {denom}
        </div>
      </div>
    ),
    value: num / denom,
    tooltip: `Fraction: ${num}/${denom}`,
    description: `This fraction = ${num} ÷ ${denom}. Since numerator < denominator, it's less than 1.`,
  });

  // 4. Square root (√12)
  const sqrtN = randomInt(4, 100);
  expressions.push({
    id: 'sqrt',
    expression: `√${sqrtN}`,
    value: Math.sqrt(sqrtN),
    tooltip: `Square Root of ${sqrtN}`,
    description: `What number × itself = ${sqrtN}? Hint: Try numbers between ${Math.floor(Math.sqrt(sqrtN))} and ${Math.ceil(Math.sqrt(sqrtN))}`,
  });

  // 5. Factorial (4!)
  const factN = randomInt(2, 7);
  let factValue = 1;
  for (let i = 1; i <= factN; i++) {
    factValue *= i;
  }
  expressions.push({
    id: 'factorial',
    expression: `${factN}!`,
    value: factValue,
    tooltip: `Factorial: ${factN}!`,
    description: `Multiply: ${factN} × ${factN - 1} × ${factN - 2}... × 1. It's how many ways to arrange ${factN} items.`,
  });

  // 6. Power of e (e^6)
  const expN = randomInt(1, 8);
  expressions.push({
    id: 'exponential',
    expression: (
      <>
        e<sup>{expN}</sup>
      </>
    ),
    value: Math.exp(expN),
    tooltip: `Power of e: e^${expN}`,
    description: `e ≈ 2.718 (Euler's number). Multiply e by itself ${expN} times. Grows very fast!`,
  });

  // 7. Logarithm (log₃(18))
  const logBase = randomInt(2, 5);
  const logArg = randomInt(5, 50);
  expressions.push({
    id: 'logarithm',
    expression: (
      <>
        log<sub>{logBase}</sub>({logArg})
      </>
    ),
    value: Math.log(logArg) / Math.log(logBase),
    tooltip: `Logarithm: log${logBase}(${logArg})`,
    description: `${logBase} to what power = ${logArg}? Hint: Try ${logBase}² = ${Math.pow(logBase, 2)}, ${logBase}³ = ${Math.pow(logBase, 3)}, etc.`,
  });

  // 8. Sum notation (∑)
  const sumStart = randomInt(1, 5);
  const sumEnd = sumStart + randomInt(3, 6);
  let sumValue = 0;
  for (let i = sumStart; i <= sumEnd; i++) {
    sumValue += i;
  }
  expressions.push({
    id: 'sum',
    expression: (
      <>
        ∑(i={sumStart} to {sumEnd}) i
      </>
    ),
    value: sumValue,
    tooltip: `Sum from ${sumStart} to ${sumEnd}`,
    description: `Add all integers: ${sumStart} + ${sumStart + 1} + ... + ${sumEnd}. Hint: Pair them up (first + last).`,
  });

  // 9. Infinity (always largest)
  expressions.push({
    id: 'infinity',
    expression: '∞',
    value: Infinity,
    tooltip: 'Infinity',
    description: 'The largest value imaginable. Always greater than any number!',
  });

  return expressions;
}

/**
 * Math Sorting Challenge Component
 */
const MathSortingChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [expressions, setExpressions] = useState<MathExpression[]>([]);
  const [shuffled, setShuffled] = useState<MathExpression[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    score: number;
    message: string;
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /**
   * Generate and shuffle expressions on mount
   */
  useEffect(() => {
    const newExpressions = generateExpressions();
    setExpressions(newExpressions);

    // Shuffle for display
    const shuffledExpressions = [...newExpressions].sort(
      () => Math.random() - 0.5
    );
    setShuffled(shuffledExpressions);
  }, []);

  /**
   * Handle tile click
   */
  const handleTileClick = (id: string) => {
    setSelected((prev) => {
      const index = prev.indexOf(id);
      if (index > -1) {
        // Remove if already selected
        return prev.filter((_, i) => i !== index);
      } else {
        // Add new selection
        return [...prev, id];
      }
    });
  };

  /**
   * Check if selection is correct
   */
  const handleVerify = () => {
    if (selected.length !== 9) return;

    // Get values for selected tiles
    const selectedExpressions = selected.map(
      (id) => expressions.find((e) => e.id === id)!
    );
    const selectedValues = selectedExpressions.map((e) => e.value);

    // Check if sorted correctly (ascending)
    let correct = true;
    for (let i = 0; i < selectedValues.length - 1; i++) {
      if (selectedValues[i] > selectedValues[i + 1]) {
        correct = false;
        break;
      }
    }

    const score = correct ? 250 : Math.max(0, 250 - 30 * selected.length);
    const message = correct
      ? '✓ Perfect! Correct order from least to greatest!'
      : '✗ Incorrect order. Try again!';

    setResult({
      success: correct,
      score,
      message,
    });
    setVerified(true);

    setTimeout(() => {
      onComplete(correct, 0, score);
    }, 2000);
  };

  /**
   * Reset challenge
   */
  const handleReset = () => {
    const newExpressions = generateExpressions();
    setExpressions(newExpressions);
    const shuffledExpressions = [...newExpressions].sort(
      () => Math.random() - 0.5
    );
    setShuffled(shuffledExpressions);
    setSelected([]);
    setVerified(false);
    setResult(null);
  };

  if (expressions.length === 0) {
    return (
      <ChallengeBase
        title="Math Sorting Challenge"
        description="Select all expressions in order from least to greatest value"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <Container>Loading...</Container>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Math Sorting Challenge"
      description="Select all expressions in order from least to greatest value"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Grid>
          {shuffled.map((expr, idx) => {
            const tileIndex = selected.indexOf(expr.id);
            const isSelected = tileIndex > -1;
            const isHovered = hoveredId === expr.id;

            // Determine if correct/incorrect (only show after verification)
            let correctStatus: boolean | null = null;
            if (verified && isSelected) {
              const selectedExpressions = selected.map(
                (id) => expressions.find((e) => e.id === id)!
              );
              const selectedValues = selectedExpressions.map((e) => e.value);

              // Check if this tile's position is correct
              const isInCorrectPosition =
                tileIndex === 0 ||
                selectedValues[tileIndex] >= selectedValues[tileIndex - 1];
              correctStatus = result?.success ? true : isInCorrectPosition ? null : false;
            }

            return (
              <div key={expr.id} style={{ position: 'relative' }}>
                <Tile
                  $selected={isSelected}
                  $correct={correctStatus}
                  $hovered={isHovered}
                  onClick={() => !verified && handleTileClick(expr.id)}
                  onMouseEnter={() => setHoveredId(expr.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {expr.expression}

                  {isSelected && (
                    <SequenceBadge
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      {tileIndex + 1}
                    </SequenceBadge>
                  )}

                  {isSelected && result?.success && (
                    <Checkmark
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' }}
                    >
                      ✓
                    </Checkmark>
                  )}

                  {isHovered && !verified && (
                    <Tooltip
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <TooltipTitle>{expr.tooltip}</TooltipTitle>
                      <div>{expr.description}</div>
                    </Tooltip>
                  )}
                </Tile>
              </div>
            );
          })}
        </Grid>

        {result && (
          <Result
            $success={result.success}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ResultTitle color={result.success ? theme.colors.success : theme.colors.error}>
              {result.message}
            </ResultTitle>
            <ResultText>Score: {result.score} points</ResultText>
          </Result>
        )}

        {!verified && (
          <ButtonContainer>
            <Button
              onClick={handleReset}
              disabled={false}
              size="md"
              variant="secondary"
            >
              Reset
            </Button>
            <Button
              onClick={handleVerify}
              disabled={selected.length !== 9}
              size="md"
              variant="primary"
            >
              Verify ({selected.length}/9)
            </Button>
          </ButtonContainer>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default MathSortingChallenge;
