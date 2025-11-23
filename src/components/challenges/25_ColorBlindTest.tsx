import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
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
}

/**
 * Color patterns for Ishihara-like tests
 */
const COLOR_PATTERNS: ColorPattern[] = [
    {
        id: 1,
        targetNumber: 2,
        bgColor: { r: 200, g: 50, b: 100 },
        targetColor: { r: 220, g: 100, b: 120 },
    },
    {
        id: 2,
        targetNumber: 5,
        bgColor: { r: 50, g: 150, b: 100 },
        targetColor: { r: 100, g: 180, b: 130 },
    },
    {
        id: 3,
        targetNumber: 7,
        bgColor: { r: 150, g: 100, b: 200 },
        targetColor: { r: 180, g: 140, b: 220 },
    },
    {
        id: 4,
        targetNumber: 3,
        bgColor: { r: 100, g: 120, b: 180 },
        targetColor: { r: 140, g: 160, b: 210 },
    },
    {
        id: 5,
        targetNumber: 9,
        bgColor: { r: 200, g: 150, b: 50 },
        targetColor: { r: 230, g: 180, b: 100 },
    },
];

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
 * Styled test card
 */
const TestCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  width: 100%;
  max-width: 500px;
`;

/**
 * Styled progress text
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-align: center;
`;

/**
 * Styled canvas wrapper
 */
const CanvasWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg};
  background: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
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
 * Styled input container
 */
const InputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 400px;
  justify-content: center;
  flex-wrap: wrap;
`;

/**
 * Styled input field
 */
const InputField = styled.input`
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.base};
  font-family: ${theme.fonts.primary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  width: 120px;
  text-align: center;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
  }
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $correct?: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
        props.$correct
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid
    ${(props) =>
        props.$correct ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) =>
        props.$correct ? theme.colors.success : theme.colors.error};
  width: 100%;
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary};
  text-align: center;
`;

/**
 * Generate a number pattern on canvas
 */
const generateColorPattern = (
    canvas: HTMLCanvasElement,
    pattern: ColorPattern
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = 300;
    const canvasHeight = 300;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const dotRadius = 5;
    const spacing = 15;
    const cols = Math.floor(canvasWidth / spacing);
    const rows = Math.floor(canvasHeight / spacing);

    /**
     * Create a simple pattern to form the number
     */
    const getNumberPattern = (num: number): Set<string> => {
        const dots = new Set<string>();

        // Define patterns for each number based on a grid
        const patterns: Record<number, Array<[number, number]>> = {
            2: [
                [1, 1],
                [2, 1],
                [3, 1],
                [3, 2],
                [2, 3],
                [1, 3],
                [1, 4],
                [2, 4],
                [3, 4],
            ],
            3: [
                [1, 1],
                [2, 1],
                [3, 1],
                [3, 2],
                [2, 2],
                [3, 3],
                [1, 4],
                [2, 4],
                [3, 4],
            ],
            5: [
                [1, 1],
                [2, 1],
                [3, 1],
                [1, 2],
                [1, 3],
                [2, 3],
                [3, 3],
                [3, 4],
                [2, 4],
                [1, 4],
            ],
            7: [
                [1, 1],
                [2, 1],
                [3, 1],
                [3, 2],
                [3, 3],
                [2, 3],
                [1, 4],
            ],
            9: [
                [1, 1],
                [2, 1],
                [3, 1],
                [1, 2],
                [3, 2],
                [1, 3],
                [2, 3],
                [3, 3],
                [3, 4],
                [2, 4],
                [1, 4],
            ],
        };

        const coordinates = patterns[num] || [];
        coordinates.forEach(([col, row]) => {
            dots.add(`${col},${row}`);
        });

        return dots;
    };

    const targetDots = getNumberPattern(pattern.targetNumber);

    // Fill background
    ctx.fillStyle = `rgb(${pattern.bgColor.r}, ${pattern.bgColor.g}, ${pattern.bgColor.b})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw dots
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * spacing + spacing / 2;
            const y = row * spacing + spacing / 2;

            // Check if this position is part of the target number
            const isTargetDot = targetDots.has(`${col % 4},${(row % 5) + 1}`);

            // Use target color or background color with variation
            if (isTargetDot) {
                ctx.fillStyle = `rgb(${pattern.targetColor.r}, ${pattern.targetColor.g}, ${pattern.targetColor.b})`;
            } else {
                // Add slight variation to background color
                const variation = Math.random() * 20 - 10;
                ctx.fillStyle = `rgb(
          ${Math.max(0, Math.min(255, pattern.bgColor.r + variation))},
          ${Math.max(0, Math.min(255, pattern.bgColor.g + variation))},
          ${Math.max(0, Math.min(255, pattern.bgColor.b + variation))}
        )`;
            }

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

/**
 * Color Blind Test Challenge Component
 * Identify hidden numbers in color patterns
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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const totalTests = 5;
    const pointsPerCorrect = 50;

    /**
     * Generate canvas pattern on mount and when index changes
     */
    useEffect(() => {
        if (canvasRef.current && !answered) {
            generateColorPattern(canvasRef.current, COLOR_PATTERNS[currentIndex]);
        }
    }, [currentIndex, answered]);

    /**
     * Handle answer submission
     */
    const handleSubmit = () => {
        if (!userAnswer.trim()) return;

        const currentPattern = COLOR_PATTERNS[currentIndex];
        const correct = parseInt(userAnswer) === currentPattern.targetNumber;

        setIsCorrect(correct);
        setAnswered(true);

        if (correct) {
            setScore((prev) => prev + pointsPerCorrect);
        }

        // Move to next test or complete
        setTimeout(() => {
            const nextIndex = currentIndex + 1;
            if (nextIndex < totalTests) {
                setCurrentIndex(nextIndex);
                setUserAnswer('');
                setAnswered(false);
                setIsCorrect(null);
            } else {
                // Challenge complete
                const finalScore =
                    score + (correct ? pointsPerCorrect : 0);
                const success = finalScore >= pointsPerCorrect * 3; // Need 3 correct
                onComplete(success, 0, finalScore);
            }
        }, 1500);
    };

    /**
     * Handle key press for quick submit
     */
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Enter' && !answered && userAnswer.trim()) {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [answered, userAnswer]);

    const currentPattern = COLOR_PATTERNS[currentIndex];
    const correctAnswers = Math.floor(score / pointsPerCorrect);

    return (
        <ChallengeBase
            title="Color Blind Test Challenge"
            description="Identify the hidden numbers in the colored patterns"
            timeLimit={timeLimit}
            challengeId={challengeId}
            onComplete={onComplete}
        >
            <Container>
                <TestCard
                    key={`test-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <ProgressText>Test {currentIndex + 1} / {totalTests}</ProgressText>

                    <CanvasWrapper>
                        <Canvas ref={canvasRef} />
                    </CanvasWrapper>

                    <ProgressText>What number do you see?</ProgressText>

                    <InputContainer>
                        <InputField
                            type="number"
                            min="0"
                            max="9"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !answered) {
                                    handleSubmit();
                                }
                            }}
                            disabled={answered}
                            placeholder="Enter number"
                            autoFocus
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={answered || !userAnswer.trim()}
                            size="md"
                            variant="primary"
                        >
                            Submit
                        </Button>
                    </InputContainer>

                    <AnimatePresence>
                        {isCorrect !== null && (
                            <Feedback
                                $correct={isCorrect}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isCorrect
                                    ? `✓ Correct! The number was ${currentPattern.targetNumber}`
                                    : `✗ Incorrect. The number was ${currentPattern.targetNumber}`}
                            </Feedback>
                        )}
                    </AnimatePresence>

                    <ScoreDisplay>Correct: {correctAnswers} / 5</ScoreDisplay>
                </TestCard>
            </Container>
        </ChallengeBase>
    );
};

export default ColorBlindTestChallenge;
