import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Represents a mathematical problem with question and solution
 */
interface MathProblem {
  question: string;
  answer: number;
  operand1: number;
  operand2: number;
  operation: string;
}

/**
 * Generates a random arithmetic problem
 * Ensures results are always positive and within reasonable bounds
 * 
 * @returns MathProblem object with question text and correct answer
 */
const generateMath = (): MathProblem => {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number;
  let num2: number;
  let answer: number;

  // Adjust number ranges based on operation for balanced difficulty
  if (operation === '*') {
    // Smaller numbers for multiplication (2-9)
    num1 = Math.floor(Math.random() * 8) + 2;
    num2 = Math.floor(Math.random() * 8) + 2;
    answer = num1 * num2;
  } else if (operation === '-') {
    // Ensure positive results for subtraction
    num1 = Math.floor(Math.random() * 15) + 6; // 6-20
    num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to (num1-1)
    answer = num1 - num2;
  } else {
    // Addition with moderate numbers
    num1 = Math.floor(Math.random() * 20) + 1; // 1-20
    num2 = Math.floor(Math.random() * 20) + 1; // 1-20
    answer = num1 + num2;
  }

  return {
    question: `${num1} ${operation} ${num2}`,
    answer,
    operand1: num1,
    operand2: num2,
    operation,
  };
};

/**
 * Main container with responsive layout
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  padding: ${theme.spacing.lg};
`;

/**
 * Elegant card container for the math equation
 */
const EquationCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']} ${theme.spacing['3xl']};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 30px rgba(99, 102, 241, 0.15);
    border-color: ${theme.colors.primary};
  }
`;

/**
 * Large, prominent display for the math equation
 */
const Question = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['5xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  letter-spacing: 0.05em;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: ${theme.fontSizes['4xl']};
  }
`;

/**
 * Container for input field with proper spacing
 */
const InputContainer = styled.div`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

/**
 * Label for the input field
 */
const InputLabel = styled.label`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.textSecondary};
  text-align: center;
`;

/**
 * Styled input with state-based visual feedback
 */
const Input = styled(motion.input)<{
  $isError?: boolean;
  $isSuccess?: boolean;
}>`
  width: 100%;
  height: 70px;
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  font-family: ${theme.fonts.primary};
  border: 3px solid
    ${(props) => {
      if (props.$isSuccess) return theme.colors.success;
      if (props.$isError) return theme.colors.error;
      return theme.colors.primary;
    }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  transition: all 0.3s ease;
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};

  &:focus {
    outline: none;
    border-width: 3px;
    box-shadow: 0 0 0 4px
      ${(props) => {
        if (props.$isSuccess) return 'rgba(34, 197, 94, 0.15)';
        if (props.$isError) return 'rgba(239, 68, 68, 0.15)';
        return 'rgba(99, 102, 241, 0.15)';
      }};
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: rgba(0, 0, 0, 0.02);
  }

  &::placeholder {
    color: ${theme.colors.textTertiary};
    font-weight: ${theme.fontWeights.medium};
  }

  /* Remove number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

/**
 * Container for action buttons
 */
const ButtonContainer = styled(motion.div)`
  width: 100%;
  max-width: 320px;
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

/**
 * Feedback message with color-coded styling
 */
const Feedback = styled(motion.div)<{ $isCorrect: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) =>
    props.$isCorrect ? theme.colors.success : theme.colors.error};
  text-align: center;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${(props) =>
    props.$isCorrect
      ? 'rgba(34, 197, 94, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${(props) =>
    props.$isCorrect
      ? 'rgba(34, 197, 94, 0.3)'
      : 'rgba(239, 68, 68, 0.3)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  box-shadow: 0 2px 10px ${(props) =>
    props.$isCorrect
      ? 'rgba(34, 197, 94, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
`;

/**
 * Icon wrapper for feedback messages
 */
const FeedbackIcon = styled(motion.span)`
  font-size: ${theme.fontSizes['2xl']};
  display: inline-flex;
  align-items: center;
`;

/**
 * Hint text for keyboard shortcut
 */
const HintText = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  kbd {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.colors.borderLight};
    border-radius: ${theme.borderRadius.sm};
    font-family: ${theme.fonts.mono};
    font-size: ${theme.fontSizes.xs};
    border: 1px solid ${theme.colors.borderLight};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

/**
 * Simple Math Challenge Component
 * 
 * An elegant arithmetic challenge that tests basic math skills.
 * Features smooth animations, visual feedback, and keyboard shortcuts.
 * 
 * User flow:
 * 1. User sees a random math equation (addition, subtraction, or multiplication)
 * 2. User enters their answer in the large input field
 * 3. User submits via button click or Enter key
 * 4. System validates answer:
 *    - Correct: Success animation and auto-complete
 *    - Incorrect: Shake animation, shows correct answer, allows retry
 * 5. On retry, input clears and user can try again with the same problem
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
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  /**
   * Auto-focus input on component mount for immediate interaction
   */
  useEffect(() => {
    inputRef.current?.focus();
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Handles answer submission and validation
   * Manages success/error states and triggers appropriate animations
   */
  const handleSubmit = () => {
    if (isSubmitted || !userAnswer.trim()) return;

    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
    
    const correct = parseInt(userAnswer, 10) === math.answer;
    setIsCorrect(correct);

    if (correct) {
      // Calculate time taken and award points based on speed
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const points = Math.max(50, 100 - (timeTaken * 5) - (attempts * 10));
      
      // Complete challenge after success animation
      setTimeout(() => {
        onComplete(true, timeTaken, points);
      }, 1200);
    } else {
      // Reset for retry after showing error
      setTimeout(() => {
        setIsSubmitted(false);
        setUserAnswer('');
        inputRef.current?.focus();
      }, 2500);
    }
  };

  /**
   * Handles Enter key press for quick submission
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitted && userAnswer.trim()) {
      handleSubmit();
    }
  };

  /**
   * Handles input changes and validates numeric input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow negative numbers and empty string
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setUserAnswer(value);
    }
  };

  return (
    <ChallengeBase
      title="Quick Math Challenge"
      description="Solve the equation as quickly as you can"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        {/* Math equation card with entrance animation */}
        <EquationCard
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: 'easeOut',
            type: 'spring',
            stiffness: 200,
            damping: 20
          }}
        >
          <Question
            animate={
              isSubmitted && !isCorrect
                ? { 
                    x: [-8, 8, -8, 8, 0],
                    rotate: [-1, 1, -1, 1, 0]
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            {math.question} = ?
          </Question>
        </EquationCard>

        {/* Answer input section */}
        <InputContainer>
          <InputLabel htmlFor="math-answer">
            Enter your answer below
          </InputLabel>
          <Input
            id="math-answer"
            ref={inputRef}
            type="number"
            value={userAnswer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isSubmitted}
            $isError={isSubmitted && !isCorrect}
            $isSuccess={isCorrect}
            placeholder="?"
            animate={
              isSubmitted && !isCorrect
                ? { x: [-10, 10, -10, 10, 0] }
                : {}
            }
            transition={{ duration: 0.4 }}
            aria-label="Math answer input"
            aria-invalid={isSubmitted && !isCorrect}
          />
        </InputContainer>

        {/* Submit button */}
        <ButtonContainer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || isSubmitted}
            size="lg"
            variant="primary"
          >
            {isSubmitted && isCorrect ? 'Correct! ✓' : 'Check Answer'}
          </Button>
        </ButtonContainer>

        {/* Keyboard shortcut hint */}
        {!isSubmitted && (
          <HintText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Press <kbd>Enter</kbd> to submit
          </HintText>
        )}

        {/* Feedback message with enter/exit animation */}
        <AnimatePresence mode="wait">
          {isSubmitted && (
            <Feedback
              $isCorrect={isCorrect}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ 
                duration: 0.4,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
            >
              <FeedbackIcon
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.1,
                  type: 'spring',
                  stiffness: 200 
                }}
              >
                {isCorrect ? '✓' : '✗'}
              </FeedbackIcon>
              <span>
                {isCorrect
                  ? 'Perfect! You got it right!'
                  : `Not quite. The answer is ${math.answer}. Try again!`}
              </span>
            </Feedback>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default SimpleMathChallenge;