import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Question type definition
 */
interface Question {
  id: number;
  type: 'arithmetic' | 'geometric' | 'fibonacci';
  sequence: number[];
  correctAnswer: number;
  description: string;
}

/**
 * Generate arithmetic progression question
 */
const generateArithmeticQuestion = (): Question => {
  const start = Math.floor(Math.random() * 5) + 1;
  const diff = Math.floor(Math.random() * 4) + 1;
  const count = 4;

  const sequence = Array.from({ length: count }, (_, i) => start + i * diff);
  const correctAnswer = start + count * diff;

  return {
    id: 1,
    type: 'arithmetic',
    sequence,
    correctAnswer,
    description: 'Arithmetic Progression - Find the next number',
  };
};

/**
 * Generate geometric progression question
 */
const generateGeometricQuestion = (): Question => {
  const start = Math.floor(Math.random() * 3) + 1;
  const ratio = Math.floor(Math.random() * 3) + 2;
  const count = 4;

  const sequence = Array.from({ length: count }, (_, i) => start * Math.pow(ratio, i));
  const correctAnswer = start * Math.pow(ratio, count);

  return {
    id: 2,
    type: 'geometric',
    sequence,
    correctAnswer,
    description: 'Geometric Progression - Find the next number',
  };
};

/**
 * Generate Fibonacci question
 */
const generateFibonacciQuestion = (): Question => {
  const sequence = [1, 1];

  for (let i = 2; i < 5; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }

  const correctAnswer = sequence[sequence.length - 1] + sequence[sequence.length - 2];

  return {
    id: 3,
    type: 'fibonacci',
    sequence,
    correctAnswer,
    description: 'Fibonacci Sequence - Find the next number',
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
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * Styled progress indicator
 */
const ProgressIndicator = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  width: 100%;
`;

/**
 * Styled progress dot
 */
const ProgressDot = styled(motion.div)<{ $active: boolean; $answered: boolean; $correct?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  cursor: default;

  ${(props) => {
    if (props.$answered) {
      if (props.$correct) {
        return `background: ${theme.colors.success}; border: 2px solid ${theme.colors.success};`;
      } else {
        return `background: ${theme.colors.error}; border: 2px solid ${theme.colors.error};`;
      }
    } else if (props.$active) {
      return `background: ${theme.colors.primary}; border: 2px solid ${theme.colors.primary};`;
    } else {
      return `background: ${theme.colors.border}; border: 2px solid ${theme.colors.textSecondary};`;
    }
  }}
`;

/**
 * Styled question wrapper
 */
const QuestionWrapper = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

/**
 * Styled question type label
 */
const QuestionTypeLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled question title
 */
const QuestionTitle = styled(motion.h3)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  text-align: center;
`;

/**
 * Styled sequence display
 */
const SequenceDisplay = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
`;

/**
 * Styled number item
 */
const NumberItem = styled(motion.span)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.primary};
  min-width: 50px;
  text-align: center;
`;

/**
 * Styled separator
 */
const Separator = styled.span`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.bold};
`;

/**
 * Styled input container
 */
const InputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  align-items: center;
`;

/**
 * Styled number input
 */
const NumberInput = styled(motion.input)`
  flex: 1;
  height: 56px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.background};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.secondary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }

  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
  }
`;

/**
 * Styled submit button
 */
const SubmitButton = styled(motion.button)`
  height: 56px;
  padding: 0 ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.secondary};
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $correct: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  background: ${(props) =>
    props.$correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$correct ? theme.colors.success : theme.colors.error)};
  border: 2px solid
    ${(props) => (props.$correct ? theme.colors.success : theme.colors.error)};
  width: 100%;
`;

/**
 * Styled emoji icon
 */
const EmojiIcon = styled.span`
  font-size: ${theme.fontSizes.xl};
  line-height: 1;
`;

/**
 * Pattern Recognition Challenge Component
 * User must identify numerical patterns and provide the next number
 */
const PatternRecognitionChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [questions] = useState<Question[]>(() => [
    generateArithmeticQuestion(),
    generateGeometricQuestion(),
    generateFibonacciQuestion(),
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [feedback, setFeedback] = useState<(boolean | null)[]>([null, null, null]);
  const [inputValue, setInputValue] = useState('');
  const [startTime] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * Handle answer submission
   */
  const handleSubmitAnswer = () => {
    if (!inputValue.trim()) return;

    const userAnswer = parseInt(inputValue, 10);

    if (isNaN(userAnswer)) {
      inputRef.current?.focus();
      return;
    }

    // Check if answer is correct
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    // Update state
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = userAnswer;
    setAnswers(newAnswers);

    const newFeedback = [...feedback];
    newFeedback[currentQuestionIndex] = isCorrect;
    setFeedback(newFeedback);

    // Reset input
    setInputValue('');

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 1200);
    } else {
      // Challenge complete
      setTimeout(() => {
        // Need 2/3 or 3/3 correct
        const finalCorrect = feedback.filter((f) => f === true).length;
        const success = finalCorrect >= 2;
        const score = success ? finalCorrect * 100 : 0;
        const timeSpent = (Date.now() - startTime) / 1000;

        onComplete(success, timeSpent, score);
      }, 1500);
    }
  };

  /**
   * Handle Enter key press
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        handleSubmitAnswer();
      }
    };

    inputRef.current?.addEventListener('keypress', handleKeyPress);
    return () => {
      inputRef.current?.removeEventListener('keypress', handleKeyPress);
    };
  }, [inputValue, currentQuestionIndex, currentQuestion]);

  /**
   * Focus input on mount and when question changes
   */
  useEffect(() => {
    if (feedback[currentQuestionIndex] === null) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentQuestionIndex, feedback]);

  const isAnswered = feedback[currentQuestionIndex] !== null;
  const isCorrect = feedback[currentQuestionIndex] === true;

  return (
    <ChallengeBase
      title="Pattern Recognition Challenge"
      description="Identify the pattern and provide the next number"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <ProgressIndicator>
          {questions.map((q, idx) => (
            <ProgressDot
              key={q.id}
              $active={idx === currentQuestionIndex}
              $answered={feedback[idx] !== null}
              $correct={feedback[idx]}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              {feedback[idx] === null ? idx + 1 : feedback[idx] ? '✓' : '✗'}
            </ProgressDot>
          ))}
        </ProgressIndicator>

        <AnimatePresence mode="wait">
          <QuestionWrapper
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionTypeLabel>{currentQuestion.description}</QuestionTypeLabel>

            <QuestionTitle
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Question {currentQuestionIndex + 1}/3
            </QuestionTitle>

            <SequenceDisplay
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              {currentQuestion.sequence.map((num, idx) => (
                <React.Fragment key={idx}>
                  <NumberItem
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                  >
                    {num}
                  </NumberItem>
                  {idx < currentQuestion.sequence.length - 1 && <Separator>,</Separator>}
                </React.Fragment>
              ))}
              <Separator>,</Separator>
              <NumberItem
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                ?
              </NumberItem>
            </SequenceDisplay>

            {!isAnswered ? (
              <InputContainer>
                <NumberInput
                  ref={inputRef}
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type answer..."
                  disabled={false}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                />
                <SubmitButton
                  onClick={handleSubmitAnswer}
                  disabled={!inputValue.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Submit
                </SubmitButton>
              </InputContainer>
            ) : (
              <Feedback
                $correct={isCorrect}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <EmojiIcon>{isCorrect ? '✓' : '✗'}</EmojiIcon>
                <span>
                  {isCorrect
                    ? `Correct! The answer is ${currentQuestion.correctAnswer}`
                    : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}`}
                </span>
              </Feedback>
            )}
          </QuestionWrapper>
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default PatternRecognitionChallenge;
