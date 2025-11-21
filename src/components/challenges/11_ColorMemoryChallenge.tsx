import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Color interface
 */
interface Color {
  hex: string;
  name: string;
  rgb?: string;
}

/**
 * Available colors pool
 */
const COLOR_POOL: Color[] = [
  { hex: '#FF6B6B', name: 'Red', rgb: 'rgb(255, 107, 107)' },
  { hex: '#4ECDC4', name: 'Teal', rgb: 'rgb(78, 205, 196)' },
  { hex: '#45B7D1', name: 'Blue', rgb: 'rgb(69, 183, 209)' },
  { hex: '#96CEB4', name: 'Green', rgb: 'rgb(150, 206, 180)' },
  { hex: '#FFEAA7', name: 'Yellow', rgb: 'rgb(255, 234, 167)' },
  { hex: '#DDA15E', name: 'Tan', rgb: 'rgb(221, 161, 94)' },
  { hex: '#BC6C25', name: 'Brown', rgb: 'rgb(188, 108, 37)' },
  { hex: '#D62828', name: 'Dark Red', rgb: 'rgb(214, 40, 40)' },
  { hex: '#F77F00', name: 'Orange', rgb: 'rgb(247, 127, 0)' },
  { hex: '#06A77D', name: 'Emerald', rgb: 'rgb(6, 167, 125)' },
  { hex: '#9D84B7', name: 'Purple', rgb: 'rgb(157, 132, 183)' },
  { hex: '#E75480', name: 'Pink', rgb: 'rgb(231, 84, 128)' },
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
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * Styled instruction
 */
const Instruction = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled color display box with pulse animation
 */
const ColorBox = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin: ${theme.spacing.lg} 0;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      rgba(255, 255, 255, 0) 50%, 
      rgba(0, 0, 0, 0.1) 100%);
    pointer-events: none;
  }
`;

/**
 * Color name badge
 */
const ColorNameBadge = styled(motion.div)`
  position: absolute;
  top: ${theme.spacing.md};
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  z-index: 1;
`;

/**
 * Styled answers grid
 */
const AnswersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 400px;
`;

/**
 * Styled answer button with enhanced feedback
 */
const AnswerButton = styled(motion.button)<{ 
  $isCorrect?: boolean; 
  $isSelected?: boolean;
  $isWrong?: boolean;
}>`
  padding: ${theme.spacing.lg};
  border: 2px solid ${(props) => {
    if (props.$isSelected && props.$isCorrect) return theme.colors.success;
    if (props.$isSelected && props.$isWrong) return theme.colors.error;
    if (props.$isCorrect) return theme.colors.success;
    return theme.colors.border;
  }};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => {
    if (props.$isSelected && props.$isCorrect) return 'rgba(16, 185, 129, 0.15)';
    if (props.$isSelected && props.$isWrong) return 'rgba(239, 68, 68, 0.15)';
    if (props.$isCorrect) return 'rgba(16, 185, 129, 0.1)';
    return theme.colors.surface;
  }};
  color: ${(props) => {
    if (props.$isSelected && props.$isCorrect) return theme.colors.success;
    if (props.$isSelected && props.$isWrong) return theme.colors.error;
    if (props.$isCorrect) return theme.colors.success;
    return theme.colors.textPrimary;
  }};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &::before {
    content: '${(props) => {
      if (props.$isSelected && props.$isCorrect) return '✓';
      if (props.$isSelected && props.$isWrong) return '✗';
      if (props.$isCorrect) return '✓';
      return '';
    }}';
    position: absolute;
    top: ${theme.spacing.xs};
    right: ${theme.spacing.xs};
    font-size: ${theme.fontSizes.xl};
    font-weight: ${theme.fontWeights.bold};
  }
`;

/**
 * Styled stats with enhanced design
 */
const Stats = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.05) 0%, 
    rgba(168, 85, 247, 0.05) 100%);
  border-radius: ${theme.borderRadius.lg};
`;

/**
 * Styled stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Styled stat value
 */
const StatValue = styled.p<{ $highlight?: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => props.$highlight ? theme.colors.success : theme.colors.primary};
  margin: 0;
  transition: color 0.3s ease;
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, 
    ${theme.colors.primary} 0%, 
    ${theme.colors.secondary} 100%);
  border-radius: ${theme.borderRadius.full};
`;

/**
 * Styled result message with icon
 */
const ResultMessage = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  box-shadow: ${(props) =>
    props.$success ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.2)'};
`;

/**
 * Streak indicator
 */
const StreakIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.15) 0%, 
    rgba(251, 191, 36, 0.15) 100%);
  border: 2px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.warning};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
`;

/**
 * Generate unique wrong answers
 */
const generateWrongAnswers = (correctHex: string, pool: Color[]): string[] => {
  return pool
    .filter((c) => c.hex !== correctHex)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((c) => c.hex);
};

/**
 * Shuffle array
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Color Memory Challenge Component
 * Identify the hex code of displayed colors with enhanced feedback and scoring
 */
const ColorMemoryChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [roundStartTime, setRoundStartTime] = useState(Date.now());

  const TOTAL_ROUNDS = 5;

  /**
   * Generate new round
   */
  const generateRound = useCallback(() => {
    const randomColor = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
    setCurrentColor(randomColor);
    setCorrectAnswer(randomColor.hex);
    setSelected(null);
    setIsAnswered(false);
    setRoundStartTime(Date.now());

    const wrongAnswers = generateWrongAnswers(randomColor.hex, COLOR_POOL);
    const allAnswers = shuffleArray([randomColor.hex, ...wrongAnswers]);
    
    setAnswers(allAnswers);
    setTotalRounds((prev) => prev + 1);
  }, []);

  /**
   * Initialize first round
   */
  useEffect(() => {
    generateRound();
  }, [generateRound]);

  /**
   * Handle answer selection
   */
  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return;

    setSelected(answer);
    setIsAnswered(true);
    const isCorrect = answer === correctAnswer;
    const roundTime = (Date.now() - roundStartTime) / 1000;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((best) => Math.max(best, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    // Next round or complete
    setTimeout(() => {
      if (totalRounds >= TOTAL_ROUNDS) {
        // Calculate final score with bonuses
        const finalCorrect = score + (isCorrect ? 1 : 0);
        const baseScore = finalCorrect * 50;
        const streakBonus = bestStreak >= 3 ? 100 : bestStreak >= 2 ? 50 : 0;
        const timeBonus = Math.max(0, 100 - Math.floor((Date.now() - startTime) / 1000));
        const finalScore = baseScore + streakBonus + timeBonus;
        
        const timeSpent = (Date.now() - startTime) / 1000;
        const passed = finalCorrect >= 3; // Pass if 3+ correct
        
        onComplete(passed, timeSpent, finalScore);
      } else {
        generateRound();
      }
    }, 1200);
  }, [isAnswered, correctAnswer, roundStartTime, totalRounds, score, bestStreak, startTime, onComplete, generateRound]);

  /**
   * Calculate current accuracy
   */
  const accuracy = useMemo(() => {
    if (totalRounds === 0) return 0;
    const currentScore = selected === correctAnswer ? score + 1 : score;
    return Math.round((currentScore / totalRounds) * 100);
  }, [totalRounds, score, selected, correctAnswer]);

  /**
   * Current score considering pending answer
   */
  const currentScore = useMemo(() => {
    return selected === correctAnswer ? score + 1 : score;
  }, [score, selected, correctAnswer]);

  /**
   * Progress percentage
   */
  const progressPercent = (totalRounds / TOTAL_ROUNDS) * 100;

  return (
    <ChallengeBase
      title="Color Memory Challenge"
      description="Identify the hex code of the displayed color"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instruction
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          What is the hex code of this color?
        </Instruction>

        <AnimatePresence mode="wait">
          {currentColor && (
            <ColorBox
              key={currentColor.hex}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ backgroundColor: currentColor.hex }}
              role="img"
              aria-label={`Color: ${currentColor.name}`}
            >
              <ColorNameBadge
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {currentColor.name}
              </ColorNameBadge>
            </ColorBox>
          )}
        </AnimatePresence>

        <AnswersGrid>
          {answers.map((answer, index) => (
            <AnswerButton
              key={answer}
              onClick={() => handleAnswer(answer)}
              disabled={isAnswered}
              $isSelected={selected === answer}
              $isCorrect={isAnswered && answer === correctAnswer}
              $isWrong={isAnswered && selected === answer && answer !== correctAnswer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={!isAnswered ? { scale: 1.05 } : {}}
              whileTap={!isAnswered ? { scale: 0.95 } : {}}
              aria-label={`Answer option: ${answer}`}
            >
              {answer}
            </AnswerButton>
          ))}
        </AnswersGrid>

        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </ProgressBar>

        <Stats
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatItem>
            <StatLabel>Round</StatLabel>
            <StatValue>{totalRounds}/{TOTAL_ROUNDS}</StatValue>
          </StatItem>

          <StatItem>
            <StatLabel>Correct</StatLabel>
            <StatValue $highlight={currentScore > score}>
              {currentScore}/{totalRounds}
            </StatValue>
          </StatItem>

          <StatItem>
            <StatLabel>Accuracy</StatLabel>
            <StatValue>{accuracy}%</StatValue>
          </StatItem>
        </Stats>

        {streak >= 2 && (
          <StreakIndicator
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            🔥 {streak} Streak!
          </StreakIndicator>
        )}

        <AnimatePresence mode="wait">
          {isAnswered && (
            <ResultMessage
              key={selected}
              $success={selected === correctAnswer}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {selected === correctAnswer ? (
                <>
                  <span>✓</span>
                  <span>Correct! Well done!</span>
                </>
              ) : (
                <>
                  <span>✗</span>
                  <span>Wrong! Correct answer: {correctAnswer}</span>
                </>
              )}
            </ResultMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default ColorMemoryChallenge;
