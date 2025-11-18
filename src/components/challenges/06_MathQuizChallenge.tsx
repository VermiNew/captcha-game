import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Question interface
 */
interface Question {
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generate easy question (single digit +/-)
 */
const generateEasyQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const op = Math.random() > 0.5 ? '+' : '-';
  const question = `${num1} ${op} ${num2}`;
  const answer = op === '+' ? num1 + num2 : num1 - num2;
  return { question, answer, difficulty: 'easy' };
};

/**
 * Generate medium question (multiplication)
 */
const generateMediumQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 12) + 5;
  const num2 = Math.floor(Math.random() * 8) + 2;
  const question = `${num1} × ${num2}`;
  const answer = num1 * num2;
  return { question, answer, difficulty: 'medium' };
};

/**
 * Generate hard question (parentheses)
 */
const generateHardQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 10) + 10;
  const num2 = Math.floor(Math.random() * 10) + 5;
  const num3 = Math.floor(Math.random() * 3) + 2;
  const question = `(${num1} + ${num2}) × ${num3}`;
  const answer = (num1 + num2) * num3;
  return { question, answer, difficulty: 'hard' };
};

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 500px;
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
 * Styled question progress
 */
const QuestionProgress = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled difficulty badge
 */
const DifficultyBadge = styled(motion.span)<{ difficulty: 'easy' | 'medium' | 'hard' }>`
  display: inline-block;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 9999px;
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.bold};
  background-color: ${(props) => {
    switch (props.difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: white;
`;

/**
 * Styled question display
 */
const QuestionDisplay = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  line-height: 1.2;
`;

/**
 * Styled input field
 */
const Input = styled(motion.input)<{ $isError: boolean; $isSuccess: boolean }>`
  width: 100%;
  height: 80px;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.background};
  transition: all 0.2s ease;

  ${(props) =>
    props.$isError &&
    `
    border-color: ${theme.colors.error};
    background: rgba(239, 68, 68, 0.1);
    animation: shake 0.4s ease-in-out;
  `}

  ${(props) =>
    props.$isSuccess &&
    `
    border-color: ${theme.colors.success};
    background: rgba(34, 197, 94, 0.1);
  `}

  &:focus {
    outline: none;
    border-color: ${theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
  }
`;

/**
 * Styled submit button
 */
const SubmitButton = styled(motion.button)<{ $isCorrect?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => {
    if (props.$isCorrect === true) return theme.colors.success;
    if (props.$isCorrect === false) return theme.colors.error;
    return theme.colors.primary;
  }};
  color: white;
  box-shadow: ${theme.shadows.md};

  &:hover:not(:disabled) {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.primary};
  text-align: center;
  margin: ${theme.spacing.lg} 0 0 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Math Quiz Challenge Component
 * 3 progressively harder math questions
 */
const MathQuizChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [questions] = useState<Question[]>(() => [
    generateEasyQuestion(),
    generateMediumQuestion(),
    generateHardQuestion(),
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [startTime] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  const handleSubmit = () => {
    if (isSubmitted || !userAnswer) return;

    setIsSubmitted(true);
    const correct = parseInt(userAnswer, 10) === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      const pointPerQuestion = 100;
      setScore((prev) => prev + pointPerQuestion);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        // Next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswer('');
        setIsSubmitted(false);
        setIsCorrect(undefined);
      } else {
        // Quiz completed
        const timeSpent = (Date.now() - startTime) / 1000;
        const finalScore = score + (correct ? 100 : 0);
        onComplete(true, timeSpent, finalScore);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitted && userAnswer) {
      handleSubmit();
    }
  };

  return (
    <ChallengeBase
      title="Math Quiz Challenge"
      description="Answer 3 math questions of increasing difficulty"
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
          Math Quiz
        </Title>

        <QuestionProgress>
          Question {currentQuestionIndex + 1} / {questions.length}
        </QuestionProgress>

        <DifficultyBadge
          difficulty={currentQuestion.difficulty}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.difficulty.toUpperCase()}
        </DifficultyBadge>

        <QuestionDisplay
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.question} = ?
        </QuestionDisplay>

        <Input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSubmitted}
          $isError={isSubmitted && !isCorrect}
          $isSuccess={isCorrect === true}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />

        <SubmitButton
          onClick={handleSubmit}
          disabled={!userAnswer || isSubmitted}
          $isCorrect={isCorrect}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isSubmitted ? isCorrect ? '✓ Correct!' : '✗ Wrong' : 'Submit'}
        </SubmitButton>

        <ScoreDisplay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          Current Score: {score} / 300
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default MathQuizChallenge;
