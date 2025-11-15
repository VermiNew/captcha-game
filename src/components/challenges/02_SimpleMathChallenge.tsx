import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Math problem type
 */
interface MathProblem {
  question: string;
  answer: number;
}

/**
 * Generate a random math problem
 */
const generateMath = (): MathProblem => {
  const operations = ['+', '-', '*'];
  const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
  const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
  const operation =
    operations[Math.floor(Math.random() * operations.length)];

  let answer = 0;
  if (operation === '+') answer = num1 + num2;
  else if (operation === '-') answer = num1 - num2;
  else if (operation === '*') answer = num1 * num2;

  return {
    question: `${num1} ${operation} ${num2}`,
    answer,
  };
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
`;

/**
 * Styled question display
 */
const Question = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

/**
 * Styled input container
 */
const InputContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

/**
 * Styled input field
 */
const Input = styled.input<{
  $isError?: boolean;
  $isSuccess?: boolean;
}>`
  width: 100%;
  max-width: 250px;
  height: 60px;
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  font-family: ${theme.fonts.primary};
  border: 2px solid
    ${(props) => {
      if (props.$isSuccess) return theme.colors.success;
      if (props.$isError) return theme.colors.error;
      return theme.colors.primary;
    }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  transition: all 0.2s ease;
  background-color: ${theme.colors.background};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px
      ${(props) => {
        if (props.$isSuccess) return 'rgba(16, 185, 129, 0.1)';
        if (props.$isError) return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(99, 102, 241, 0.1)';
      }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

/**
 * Styled feedback message
 */
const Feedback = styled(motion.div)<{ $isCorrect: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) =>
    props.$isCorrect ? theme.colors.success : theme.colors.error};
  text-align: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${(props) =>
    props.$isCorrect
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
`;

/**
 * Simple Math Challenge Component
 * Solve a random math problem to complete the challenge
 */
const SimpleMathChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [math] = useState<MathProblem>(() => generateMath());
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Auto-focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (isSubmitted || !userAnswer) return;

    setIsSubmitted(true);
    const correct = parseInt(userAnswer, 10) === math.answer;
    setIsCorrect(correct);

    if (correct) {
      // Complete challenge on correct answer
      setTimeout(() => {
        onComplete(true, 5, 100); // success, ~5s, 100 points
      }, 600);
    } else {
      // Show error and allow retry
      setShakeAnimation(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setUserAnswer('');
        setShakeAnimation(false);
        inputRef.current?.focus();
      }, 1000);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitted && userAnswer) {
      handleSubmit();
    }
  };

  return (
    <ChallengeBase
      title="Simple Math Challenge"
      description="Solve the math problem below"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Question
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {math.question} = ?
        </Question>

        <InputContainer>
          <motion.div
            style={{ width: '100%', maxWidth: '250px' }}
            animate={
              shakeAnimation
                ? { x: [-10, 10, -10, 10, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.4 }}
          >
            <Input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitted}
              $isError={isSubmitted && !isCorrect}
              $isSuccess={isCorrect}
              placeholder="Your answer"
            />
          </motion.div>
        </InputContainer>

        <ButtonContainer>
          <Button
            onClick={handleSubmit}
            disabled={!userAnswer || isSubmitted}
            size="md"
            variant="primary"
          >
            {isSubmitted && !isCorrect ? 'Try Again' : 'Submit'}
          </Button>
        </ButtonContainer>

        {isSubmitted && (
          <Feedback
            $isCorrect={isCorrect}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isCorrect
              ? '✓ Correct! Great job!'
              : `✗ Wrong answer. The correct answer is ${math.answer}`}
          </Feedback>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default SimpleMathChallenge;
