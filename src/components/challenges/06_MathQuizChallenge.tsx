import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

interface Question {
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const generateEasyQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const op = Math.random() > 0.5 ? '+' : '-';
  const question = `${num1} ${op} ${num2}`;
  const answer = op === '+' ? num1 + num2 : num1 - num2;
  return { question, answer, difficulty: 'easy' };
};

const generateMediumQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 12) + 5;
  const num2 = Math.floor(Math.random() * 8) + 2;
  const question = `${num1} × ${num2}`;
  const answer = num1 * num2;
  return { question, answer, difficulty: 'medium' };
};

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
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
`;

/**
 * Styled progress section
 */
const ProgressSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

/**
 * Styled progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 3px;
  overflow: hidden;
`;

/**
 * Styled progress fill
 */
const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
`;

/**
 * Styled progress text
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled difficulty badge
 */
const DifficultyBadge = styled(motion.span)<{ difficulty: 'easy' | 'medium' | 'hard' }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: 9999px;
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.bold};
  background-color: ${(props) => {
    switch (props.difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: white;
`;

/**
 * Styled question box
 */
const QuestionBox = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

/**
 * Styled question display
 */
const QuestionDisplay = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  line-height: 1.2;
  margin: 0;
`;

/**
 * Styled input field
 */
const Input = styled(motion.input)<{ $isError: boolean; $isSuccess: boolean }>`
  width: 100%;
  height: 60px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  padding: ${theme.spacing.md};
  border: 2px solid rgba(99, 102, 241, 0.3);
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
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
`;

/**
 * Styled submit button
 */
const SubmitButton = styled(motion.button)<{ $isCorrect?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

/**
 * Styled score label
 */
const ScoreLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

/**
 * Styled score value
 */
const ScoreValue = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Math Quiz Challenge Component
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
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  const handleSubmit = () => {
    if (isSubmitted || !userAnswer) return;

    setIsSubmitted(true);
    const correct = parseInt(userAnswer, 10) === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 100);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswer('');
        setIsSubmitted(false);
        setIsCorrect(undefined);
      } else {
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
      title="Math Quiz"
      description="Answer 3 math questions of increasing difficulty"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <ProgressSection>
          <ProgressText>
            Question <strong>{currentQuestionIndex + 1}</strong> / {questions.length}
          </ProgressText>
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4 }}
            />
          </ProgressBar>
        </ProgressSection>

        <DifficultyBadge
          difficulty={currentQuestion.difficulty}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.difficulty.toUpperCase()}
        </DifficultyBadge>

        <QuestionBox
          key={currentQuestionIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionDisplay>{currentQuestion.question} = ?</QuestionDisplay>
        </QuestionBox>

        <Input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your answer"
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
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {isSubmitted ? (isCorrect ? '✓ Correct!' : '✗ Wrong') : 'Submit'}
        </SubmitButton>

        <ScoreDisplay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ScoreLabel>Score</ScoreLabel>
          <ScoreValue>
            {score} / {questions.length * 100}
          </ScoreValue>
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default MathQuizChallenge;
