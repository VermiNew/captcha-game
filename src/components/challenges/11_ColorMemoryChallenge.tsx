import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Available colors pool
 */
const COLOR_POOL = [
  { hex: '#FF6B6B', name: 'Red' },
  { hex: '#4ECDC4', name: 'Teal' },
  { hex: '#45B7D1', name: 'Blue' },
  { hex: '#96CEB4', name: 'Green' },
  { hex: '#FFEAA7', name: 'Yellow' },
  { hex: '#DDA15E', name: 'Tan' },
  { hex: '#BC6C25', name: 'Brown' },
  { hex: '#D62828', name: 'Dark Red' },
  { hex: '#F77F00', name: 'Orange' },
  { hex: '#06A77D', name: 'Emerald' },
  { hex: '#9D84B7', name: 'Purple' },
  { hex: '#E75480', name: 'Pink' },
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
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled color display box
 */
const ColorBox = styled(motion.div)`
  width: 200px;
  height: 200px;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin: ${theme.spacing.lg} 0;
`;

/**
 * Styled answers grid
 */
const AnswersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 400px;
`;

/**
 * Styled answer button
 */
const AnswerButton = styled(motion.button)<{ $isCorrect?: boolean; $isSelected?: boolean }>`
  padding: ${theme.spacing.lg};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(props) =>
    props.$isSelected
      ? `
    border-color: ${props.$isCorrect ? theme.colors.success : theme.colors.error};
    background: ${props.$isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
    color: ${props.$isCorrect ? theme.colors.success : theme.colors.error};
  `
      : ''}
`;

/**
 * Styled stats
 */
const Stats = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
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

/**
 * Color Memory Challenge Component
 * Guess the hex code of the displayed color
 */
const ColorMemoryChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [currentColor, setCurrentColor] = useState<typeof COLOR_POOL[0] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime] = useState(() => Date.now());

  /**
   * Generate new round
   */
  const generateRound = () => {
    const randomColor = COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)];
    setCurrentColor(randomColor);
    setCorrectAnswer(randomColor.hex);
    setSelected(null);
    setIsAnswered(false);

    // Generate 3 wrong answers
    const wrongAnswers = COLOR_POOL.filter((c) => c.hex !== randomColor.hex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.hex);

    const allAnswers = [randomColor.hex, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setAnswers(allAnswers);
    setTotalRounds((prev) => prev + 1);
  };

  /**
   * Initialize first round
   */
  useEffect(() => {
    generateRound();
  }, []);

  /**
   * Handle answer selection
   */
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelected(answer);
    setIsAnswered(true);
    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Next round after delay
    setTimeout(() => {
      if (totalRounds >= 5) {
        // Game complete
        const timeSpent = (Date.now() - startTime) / 1000;
        const finalScore = (score + (isCorrect ? 1 : 0)) * 50;
        const accuracy = Math.round(((score + (isCorrect ? 1 : 0)) / 5) * 100);
        onComplete(score + (isCorrect ? 1 : 0) >= 4, timeSpent, finalScore);
      } else {
        generateRound();
      }
    }, 800);
  };

  const progress = totalRounds;
  const currentScore = selected === correctAnswer ? score + 1 : score;

  return (
    <ChallengeBase
      title="Color Memory Challenge"
      description="Identify the hex code of the displayed color"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instruction>What is the hex code of this color?</Instruction>

        {currentColor && (
          <ColorBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: currentColor.hex }}
          />
        )}

        <AnswersGrid>
          {answers.map((answer) => (
            <AnswerButton
              key={answer}
              onClick={() => handleAnswer(answer)}
              disabled={isAnswered}
              $isSelected={selected === answer}
              $isCorrect={answer === correctAnswer}
              whileHover={!isAnswered ? { scale: 1.05 } : {}}
              whileTap={!isAnswered ? { scale: 0.95 } : {}}
            >
              {answer}
            </AnswerButton>
          ))}
        </AnswersGrid>

        <Stats
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatItem>
            <StatLabel>Round</StatLabel>
            <StatValue>{progress}/5</StatValue>
          </StatItem>

          <StatItem>
            <StatLabel>Correct</StatLabel>
            <StatValue>{currentScore}/{progress}</StatValue>
          </StatItem>
        </Stats>

        {isAnswered && (
          <ResultMessage
            $success={selected === correctAnswer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {selected === correctAnswer ? '✓ Correct!' : `✗ Wrong! It was ${correctAnswer}`}
          </ResultMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default ColorMemoryChallenge;
