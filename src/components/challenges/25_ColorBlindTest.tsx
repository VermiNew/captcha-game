import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Color test pattern data
 */
interface ColorPattern {
  id: number;
  targetNumber: number;
  bgColor: { r: number; g: number; b: number };
  targetColor: { r: number; g: number; b: number };
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

/**
 * Constants
 */
const CANVAS_SIZE = 400;
const DOT_RADIUS = 6;
const DOT_SPACING = 16;
const TOTAL_TESTS = 5;
const POINTS_PER_CORRECT = 50;
const MIN_CORRECT_TO_PASS = 3;

/**
 * Enhanced color patterns with better visibility gradients
 */
const COLOR_PATTERNS: ColorPattern[] = [
  {
    id: 1,
    targetNumber: 2,
    bgColor: { r: 200, g: 80, b: 120 },
    targetColor: { r: 230, g: 120, b: 150 },
    difficulty: 'Easy',
  },
  {
    id: 2,
    targetNumber: 5,
    bgColor: { r: 80, g: 160, b: 120 },
    targetColor: { r: 120, g: 200, b: 160 },
    difficulty: 'Easy',
  },
  {
    id: 3,
    targetNumber: 7,
    bgColor: { r: 140, g: 100, b: 200 },
    targetColor: { r: 180, g: 150, b: 230 },
    difficulty: 'Medium',
  },
  {
    id: 4,
    targetNumber: 3,
    bgColor: { r: 100, g: 130, b: 180 },
    targetColor: { r: 150, g: 170, b: 220 },
    difficulty: 'Medium',
  },
  {
    id: 5,
    targetNumber: 9,
    bgColor: { r: 200, g: 140, b: 60 },
    targetColor: { r: 240, g: 180, b: 110 },
    difficulty: 'Hard',
  },
];

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
 * Styled test card
 */
const TestCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  width: 100%;
  max-width: 550px;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Progress bar container
 */
const ProgressBarContainer = styled.div`
  width: 100%;
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ProgressStep = styled(motion.div)<{ $active: boolean; $completed: boolean }>`
  flex: 1;
  height: 8px;
  background: ${props => 
    props.$completed ? theme.colors.success :
    props.$active ? theme.colors.primary :
    theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  transition: all 0.3s ease;
`;

/**
 * Styled progress text
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-align: center;
`;

/**
 * Difficulty badge
 */
const DifficultyBadge = styled.span<{ $difficulty: string }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  background: ${props => 
    props.$difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)' :
    props.$difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' :
    'rgba(239, 68, 68, 0.15)'};
  color: ${props => 
    props.$difficulty === 'Easy' ? theme.colors.success :
    props.$difficulty === 'Medium' ? '#F59E0B' :
    theme.colors.error};
  border: 2px solid ${props => 
    props.$difficulty === 'Easy' ? theme.colors.success :
    props.$difficulty === 'Medium' ? '#F59E0B' :
    theme.colors.error};
`;

/**
 * Styled canvas wrapper
 */
const CanvasWrapper = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg};
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  position: relative;
`;

/**
 * Styled canvas
 */
const Canvas = styled.canvas`
  display: block;
  border-radius: ${theme.borderRadius.md};
  max-width: 100%;
  height: auto;
`;

/**
 * Hint overlay
 */
const HintOverlay = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  pointer-events: none;
  z-index: 10;
`;

/**
 * Styled input container
 */
const InputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 400px;
  justify-content: center;
`;

/**
 * Styled input field
 */
const InputField = styled.input`
  padding: ${theme.spacing.lg};
  font-size: ${theme.fontSizes.xl};
  font-family: ${theme.fonts.mono};
  font-weight: ${theme.fontWeights.bold};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  width: 120px;
  text-align: center;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Remove spinner arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $correct?: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${props =>
    props.$correct
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props =>
    props.$correct ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  color: ${props =>
    props.$correct ? theme.colors.success : theme.colors.error};
  width: 100%;
`;

/**
 * Stats container
 */
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const StatLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled(motion.span)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Instruction text
 */
const InstructionText = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.info};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.md};
  background: rgba(59, 130, 246, 0.1);
  border-radius: ${theme.borderRadius.md};
`;

/**
 * Generate number patterns with better definition
 */
const getNumberPattern = (num: number): Set<string> => {
  const dots = new Set<string>();
  
  // Enhanced patterns for better visibility (scaled for larger grid)
  const patterns: Record<number, Array<[number, number]>> = {
    2: [
      [2, 1], [3, 1], [4, 1],
      [4, 2], [5, 2],
      [3, 3], [4, 3],
      [2, 4], [3, 4],
      [2, 5], [3, 5], [4, 5], [5, 5],
    ],
    3: [
      [2, 1], [3, 1], [4, 1],
      [4, 2], [5, 2],
      [3, 3], [4, 3],
      [4, 4], [5, 4],
      [2, 5], [3, 5], [4, 5],
    ],
    5: [
      [2, 1], [3, 1], [4, 1], [5, 1],
      [2, 2],
      [2, 3], [3, 3], [4, 3],
      [5, 4],
      [2, 5], [3, 5], [4, 5], [5, 5],
    ],
    7: [
      [2, 1], [3, 1], [4, 1], [5, 1],
      [5, 2],
      [4, 3], [5, 3],
      [3, 4], [4, 4],
      [2, 5], [3, 5],
    ],
    9: [
      [2, 1], [3, 1], [4, 1], [5, 1],
      [2, 2], [5, 2],
      [2, 3], [3, 3], [4, 3], [5, 3],
      [5, 4],
      [2, 5], [3, 5], [4, 5], [5, 5],
    ],
  };

  const coordinates = patterns[num] || [];
  coordinates.forEach(([col, row]) => {
    dots.add(`${col},${row}`);
  });

  return dots;
};

/**
 * Generate a color pattern on canvas with improved rendering
 */
const generateColorPattern = (
  canvas: HTMLCanvasElement,
  pattern: ColorPattern,
  showHint: boolean = false
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const cols = Math.floor(CANVAS_SIZE / DOT_SPACING);
  const rows = Math.floor(CANVAS_SIZE / DOT_SPACING);

  const targetDots = getNumberPattern(pattern.targetNumber);

  // Fill background with gradient
  const bgGradient = ctx.createRadialGradient(
    CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0,
    CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2
  );
  bgGradient.addColorStop(0, `rgb(${pattern.bgColor.r + 20}, ${pattern.bgColor.g + 20}, ${pattern.bgColor.b + 20})`);
  bgGradient.addColorStop(1, `rgb(${pattern.bgColor.r}, ${pattern.bgColor.g}, ${pattern.bgColor.b})`);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw dots with improved pattern
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * DOT_SPACING + DOT_SPACING / 2;
      const y = row * DOT_SPACING + DOT_SPACING / 2;

      // Map to pattern grid (7x7)
      const patternCol = Math.floor((col / cols) * 7);
      const patternRow = Math.floor((row / rows) * 7);
      
      const isTargetDot = targetDots.has(`${patternCol},${patternRow}`);

      if (isTargetDot) {
        // Target color with slight variation
        const variation = (Math.random() - 0.5) * 15;
        ctx.fillStyle = showHint 
          ? '#FFFF00' // Yellow hint
          : `rgb(
              ${Math.max(0, Math.min(255, pattern.targetColor.r + variation))},
              ${Math.max(0, Math.min(255, pattern.targetColor.g + variation))},
              ${Math.max(0, Math.min(255, pattern.targetColor.b + variation))}
            )`;
      } else {
        // Background color with variation
        const variation = (Math.random() - 0.5) * 25;
        ctx.fillStyle = `rgb(
          ${Math.max(0, Math.min(255, pattern.bgColor.r + variation))},
          ${Math.max(0, Math.min(255, pattern.bgColor.g + variation))},
          ${Math.max(0, Math.min(255, pattern.bgColor.b + variation))}
        )`;
      }

      // Draw dot with slight size variation
      const radius = DOT_RADIUS + (Math.random() - 0.5) * 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle shadow for depth
      if (isTargetDot && !showHint) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }
      ctx.shadowColor = 'transparent';
    }
  }
};

/**
 * Color Blind Test Challenge Component
 */
const ColorBlindTestChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(() => Date.now());
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPattern = useMemo(() => COLOR_PATTERNS[currentIndex], [currentIndex]);
  const correctAnswers = useMemo(() => Math.floor(score / POINTS_PER_CORRECT), [score]);

  /**
   * Generate canvas pattern
   */
  const updateCanvas = useCallback(() => {
    if (canvasRef.current && !answered) {
      generateColorPattern(canvasRef.current, currentPattern, showHint);
    }
  }, [currentPattern, answered, showHint]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  /**
   * Handle answer submission
   */
  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim() || answered) return;

    const correct = parseInt(userAnswer) === currentPattern.targetNumber;

    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      setScore(prev => prev + POINTS_PER_CORRECT);
    }

    // Move to next test or complete
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < TOTAL_TESTS) {
        setCurrentIndex(nextIndex);
        setUserAnswer('');
        setAnswered(false);
        setIsCorrect(null);
        setShowHint(false);
        inputRef.current?.focus();
      } else {
        const finalScore = score + (correct ? POINTS_PER_CORRECT : 0);
        const timeSpent = (Date.now() - startTime) / 1000;
        const success = finalScore >= POINTS_PER_CORRECT * MIN_CORRECT_TO_PASS;
        onComplete(success, timeSpent, finalScore);
      }
    }, 2000);
  }, [userAnswer, answered, currentPattern, currentIndex, score, startTime, onComplete]);

  /**
   * Toggle hint
   */
  const toggleHint = useCallback(() => {
    setShowHint(prev => !prev);
  }, []);

  /**
   * Handle key press
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !answered && userAnswer.trim()) {
        handleSubmit();
      } else if (e.key === 'h' || e.key === 'H') {
        toggleHint();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answered, userAnswer, handleSubmit, toggleHint]);

  return (
    <ChallengeBase
      title="Color Blind Test Challenge"
      description="Identify the hidden numbers in the colored patterns"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      hideTimer
    >
      <Timer timeLimit={timeLimit} />
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TestCard
          key={`test-${currentIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ProgressBarContainer>
            {Array.from({ length: TOTAL_TESTS }).map((_, idx) => (
              <ProgressStep
                key={idx}
                $active={idx === currentIndex}
                $completed={idx < currentIndex}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: idx * 0.1 }}
              />
            ))}
          </ProgressBarContainer>

          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <ProgressText>Test {currentIndex + 1} of {TOTAL_TESTS}</ProgressText>
            <DifficultyBadge $difficulty={currentPattern.difficulty}>
              {currentPattern.difficulty}
            </DifficultyBadge>
          </div>

          <CanvasWrapper
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Canvas ref={canvasRef} />
            <AnimatePresence>
              {showHint && (
                <HintOverlay
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {currentPattern.targetNumber}
                </HintOverlay>
              )}
            </AnimatePresence>
          </CanvasWrapper>

          <ProgressText>What number do you see?</ProgressText>

          <InputContainer>
            <InputField
              ref={inputRef}
              type="number"
              min="0"
              max="9"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              disabled={answered}
              placeholder="0-9"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={answered || !userAnswer.trim()}
              size="md"
              variant="primary"
            >
              {answered ? 'Next...' : 'Submit'}
            </Button>
          </InputContainer>

          <AnimatePresence>
            {isCorrect !== null && (
              <Feedback
                $correct={isCorrect}
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {isCorrect
                  ? `✓ Correct! The number was ${currentPattern.targetNumber}`
                  : `✗ Incorrect. The number was ${currentPattern.targetNumber}`}
              </Feedback>
            )}
          </AnimatePresence>

          <StatsContainer>
            <StatItem>
              <StatLabel>Correct</StatLabel>
              <StatValue
                key={correctAnswers}
                animate={{ scale: [1.3, 1] }}
                transition={{ duration: 0.3 }}
              >
                {correctAnswers}/{TOTAL_TESTS}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Score</StatLabel>
              <StatValue
                key={score}
                animate={{ scale: [1.3, 1] }}
                transition={{ duration: 0.3 }}
              >
                {score}
              </StatValue>
            </StatItem>
          </StatsContainer>

          {!answered && (
            <InstructionText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              💡 Press 'H' to toggle hint | Enter to submit
            </InstructionText>
          )}
        </TestCard>
      </Container>
    </ChallengeBase>
  );
};

export default ColorBlindTestChallenge;