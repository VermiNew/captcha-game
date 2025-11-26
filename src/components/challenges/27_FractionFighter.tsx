import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Fraction type
 */
interface Fraction {
  numerator: number;
  denominator: number;
  display: string;
}

/**
 * Available fractions
 */
const FRACTIONS: Fraction[] = [
  { numerator: 1, denominator: 2, display: '½' },
  { numerator: 1, denominator: 3, display: '⅓' },
  { numerator: 1, denominator: 4, display: '¼' },
  { numerator: 1, denominator: 5, display: '⅕' },
  { numerator: 1, denominator: 6, display: '⅙' },
  { numerator: 1, denominator: 8, display: '⅛' },
  { numerator: 2, denominator: 3, display: '⅔' },
  { numerator: 2, denominator: 5, display: '⅖' },
  { numerator: 3, denominator: 4, display: '¾' },
  { numerator: 3, denominator: 5, display: '⅗' },
  { numerator: 4, denominator: 5, display: '⅘' },
  { numerator: 5, denominator: 6, display: '⅚' },
  { numerator: 5, denominator: 8, display: '⅝' },
  { numerator: 7, denominator: 8, display: '⅞' },
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
 * Styled progress
 */
const Progress = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textPrimary};
`;

/**
 * Styled comparison container
 */
const ComparisonContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
`;

/**
 * Styled fraction display
 */
const FractionDisplay = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: clamp(4rem, 10vw, 6rem);
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  min-width: 100px;
  text-align: center;
`;

/**
 * Styled separator
 */
const Separator = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  color: ${theme.colors.textSecondary};
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  width: 100%;
  flex-wrap: wrap;
`;

/**
 * Styled comparison button
 */
const ComparisonButton = styled(motion.button)<{
  $isCorrect?: boolean;
  $isWrong?: boolean;
}>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  border: 2px solid
    ${(props) => {
      if (props.$isCorrect) return theme.colors.success;
      if (props.$isWrong) return theme.colors.error;
      return theme.colors.primary;
    }};
  background: ${(props) => {
    if (props.$isCorrect) return 'rgba(16, 185, 129, 0.2)';
    if (props.$isWrong) return 'rgba(239, 68, 68, 0.2)';
    return theme.colors.primary;
  }};
  color: ${(props) => {
    if (props.$isCorrect || props.$isWrong) return theme.colors.textPrimary;
    return 'white';
  }};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.success};
  text-align: center;
`;

/**
 * Styled stats
 */
const Stats = styled.div`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
`;

/**
 * Fraction Fighter Challenge Component
 * Compare two fractions and select which is larger
 */
const FractionFighterChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [left, setLeft] = useState<Fraction | null>(() =>
    FRACTIONS[Math.floor(Math.random() * FRACTIONS.length)]
  );
  const [right, setRight] = useState<Fraction | null>(() =>
    FRACTIONS[Math.floor(Math.random() * FRACTIONS.length)]
  );
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const totalQuestions = 12;
  const successThreshold = 9;
  const pointsPerQuestion = 20;

  /**
   * Generate random question
   */
  const generateQuestion = () => {
    const leftFrac =
      FRACTIONS[Math.floor(Math.random() * FRACTIONS.length)];
    const rightFrac =
      FRACTIONS[Math.floor(Math.random() * FRACTIONS.length)];

    setLeft(leftFrac);
    setRight(rightFrac);
    setAnswered(false);
    setIsCorrect(null);
  };



  /**
   * Compare fractions
   */
  const compareFractions = (
    left: Fraction,
    right: Fraction
  ): 'left' | 'right' | 'equal' => {
    const leftValue = left.numerator / left.denominator;
    const rightValue = right.numerator / right.denominator;

    if (Math.abs(leftValue - rightValue) < 0.0001) return 'equal';
    return leftValue > rightValue ? 'left' : 'right';
  };

  /**
   * Handle answer selection
   */
  const handleAnswer = (answer: 'left' | 'right' | 'equal') => {
    if (!left || !right || answered) return;

    const correct = compareFractions(left, right) === answer;
    setAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + pointsPerQuestion);
    }

    const newQuestionIndex = questionIndex + 1;

    setTimeout(() => {
      if (newQuestionIndex < totalQuestions) {
        setQuestionIndex(newQuestionIndex);
        generateQuestion();
      } else {
        // Challenge complete
        const finalScore =
          score + (correct ? pointsPerQuestion : 0);
        const success = Math.ceil((correctAnswers + (correct ? 1 : 0)) / totalQuestions * 100) >= (successThreshold / totalQuestions * 100);
        onComplete(success, 0, finalScore);
      }
    }, 500);
  };

  const correctAnswers = Math.floor(score / pointsPerQuestion);

  if (!left || !right) return null;

  return (
    <ChallengeBase
      title="Fraction Fighter"
      description="Select which fraction is larger"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Progress>
          Question {questionIndex + 1} / {totalQuestions}
        </Progress>

        <ComparisonContainer
          key={`q-${questionIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FractionDisplay>{left.display}</FractionDisplay>
          <Separator>vs</Separator>
          <FractionDisplay>{right.display}</FractionDisplay>
        </ComparisonContainer>

        <ButtonContainer>
          <ComparisonButton
            $isCorrect={
              answered &&
              isCorrect &&
              compareFractions(left, right) === 'left'
            }
            $isWrong={
              answered &&
              !isCorrect &&
              compareFractions(left, right) !== 'left'
            }
            onClick={() => handleAnswer('left')}
            disabled={answered}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            Left
          </ComparisonButton>

          <ComparisonButton
            $isCorrect={
              answered &&
              isCorrect &&
              compareFractions(left, right) === 'equal'
            }
            $isWrong={
              answered &&
              !isCorrect &&
              compareFractions(left, right) !== 'equal'
            }
            onClick={() => handleAnswer('equal')}
            disabled={answered}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Equal
          </ComparisonButton>

          <ComparisonButton
            $isCorrect={
              answered &&
              isCorrect &&
              compareFractions(left, right) === 'right'
            }
            $isWrong={
              answered &&
              !isCorrect &&
              compareFractions(left, right) !== 'right'
            }
            onClick={() => handleAnswer('right')}
            disabled={answered}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Right
          </ComparisonButton>
        </ButtonContainer>

        <Stats>
          Correct: {correctAnswers} / {successThreshold} needed to pass
        </Stats>

        <ScoreDisplay>Score: {score} / {totalQuestions * pointsPerQuestion}</ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default FractionFighterChallenge;
