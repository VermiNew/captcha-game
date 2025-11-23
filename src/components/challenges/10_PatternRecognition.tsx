import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  type: 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'prime';
  sequence: number[];
  correctAnswer: number;
  description: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generate arithmetic progression question
 */
const generateArithmeticQuestion = (): Question => {
  const start = Math.floor(Math.random() * 5) + 1;
  const diff = Math.floor(Math.random() * 4) + 2;
  const count = 5;

  const sequence = Array.from({ length: count }, (_, i) => start + i * diff);
  const correctAnswer = start + count * diff;

  return {
    id: 1,
    type: 'arithmetic',
    sequence,
    correctAnswer,
    description: 'Arithmetic Progression',
    hint: `Each number increases by ${diff}`,
    difficulty: 'easy',
  };
};

/**
 * Generate geometric progression question
 */
const generateGeometricQuestion = (): Question => {
  const start = Math.floor(Math.random() * 3) + 2;
  const ratio = Math.floor(Math.random() * 2) + 2;
  const count = 4;

  const sequence = Array.from({ length: count }, (_, i) => start * Math.pow(ratio, i));
  const correctAnswer = start * Math.pow(ratio, count);

  return {
    id: 2,
    type: 'geometric',
    sequence,
    correctAnswer,
    description: 'Geometric Progression',
    hint: `Each number is multiplied by ${ratio}`,
    difficulty: 'medium',
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
    description: 'Fibonacci Sequence',
    hint: 'Each number is the sum of the previous two',
    difficulty: 'medium',
  };
};

/**
 * Generate square numbers question
 */
const generateSquareQuestion = (): Question => {
  const start = 1;
  const count = 5;
  
  const sequence = Array.from({ length: count }, (_, i) => Math.pow(start + i, 2));
  const correctAnswer = Math.pow(start + count, 2);

  return {
    id: 4,
    type: 'square',
    sequence,
    correctAnswer,
    description: 'Square Numbers',
    hint: 'These are perfect squares: 1², 2², 3²...',
    difficulty: 'hard',
  };
};

/**
 * Generate prime numbers question
 */
const generatePrimeQuestion = (): Question => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const sequence = primes.slice(0, 5);
  const correctAnswer = primes[5];

  return {
    id: 5,
    type: 'prime',
    sequence,
    correctAnswer,
    description: 'Prime Numbers',
    hint: 'Numbers divisible only by 1 and themselves',
    difficulty: 'hard',
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
  flex-wrap: wrap;
`;

/**
 * Styled progress dot
 */
const ProgressDot = styled(motion.div)<{ $active: boolean; $answered: boolean; $correct?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  cursor: default;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  ${(props) => {
    if (props.$answered) {
      if (props.$correct) {
        return `
          background: ${theme.colors.success}; 
          border: 3px solid ${theme.colors.success};
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `;
      } else {
        return `
          background: ${theme.colors.error}; 
          border: 3px solid ${theme.colors.error};
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        `;
      }
    } else if (props.$active) {
      return `
        background: ${theme.colors.primary}; 
        border: 3px solid ${theme.colors.primary};
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        animation: pulse 2s infinite;
      `;
    } else {
      return `
        background: ${theme.colors.surface}; 
        border: 3px solid ${theme.colors.border};
        color: ${theme.colors.textSecondary};
      `;
    }
  }}

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

/**
 * Difficulty badge
 */
const DifficultyBadge = styled.span<{ $difficulty: 'easy' | 'medium' | 'hard' }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) => {
    switch (props.$difficulty) {
      case 'easy': return 'rgba(16, 185, 129, 0.1)';
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'hard': return 'rgba(239, 68, 68, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.$difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
    }
  }};
  border: 2px solid ${(props) => {
    switch (props.$difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
    }
  }};
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
 * Question header with type and difficulty
 */
const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

/**
 * Styled question type label
 */
const QuestionTypeLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled question title
 */
const QuestionTitle = styled(motion.h3)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
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
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  box-shadow: ${theme.shadows.md};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled number item
 */
const NumberItem = styled(motion.span)<{ $isAnswer?: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => props.$isAnswer ? theme.colors.secondary : theme.colors.primary};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${(props) => props.$isAnswer ? theme.colors.secondary : theme.colors.primary};
  min-width: 60px;
  text-align: center;
  box-shadow: ${theme.shadows.sm};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

/**
 * Styled separator
 */
const Separator = styled.span`
  font-size: ${theme.fontSizes['2xl']};
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
  align-items: stretch;
`;

/**
 * Styled number input with error state
 */
const NumberInput = styled(motion.input)<{ $hasError?: boolean }>`
  flex: 1;
  height: 60px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.semibold};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 3px solid ${(props) => props.$hasError ? theme.colors.error : theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.background};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.$hasError ? theme.colors.error : theme.colors.secondary};
    box-shadow: 0 0 0 4px ${(props) => 
      props.$hasError 
        ? 'rgba(239, 68, 68, 0.1)' 
        : 'rgba(99, 102, 241, 0.1)'
    };
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
  height: 60px;
  padding: 0 ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.bold};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    background: ${theme.colors.secondary};
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
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
 * Hint button
 */
const HintButton = styled(motion.button)`
  align-self: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  background: transparent;
  color: ${theme.colors.primary};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }
`;

/**
 * Hint display
 */
const HintDisplay = styled(motion.div)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: rgba(99, 102, 241, 0.1);
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.primary};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $correct: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  background: ${(props) =>
    props.$correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
  color: ${(props) => (props.$correct ? theme.colors.success : theme.colors.error)};
  border: 3px solid
    ${(props) => (props.$correct ? theme.colors.success : theme.colors.error)};
  width: 100%;
  box-shadow: ${(props) =>
    props.$correct 
      ? '0 4px 16px rgba(16, 185, 129, 0.2)' 
      : '0 4px 16px rgba(239, 68, 68, 0.2)'};
`;

/**
 * Styled emoji icon
 */
const EmojiIcon = styled.span`
  font-size: ${theme.fontSizes['2xl']};
  line-height: 1;
`;

/**
 * Stats display
 */
const StatsBar = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.05) 0%, 
    rgba(168, 85, 247, 0.05) 100%);
  border-radius: ${theme.borderRadius.lg};
  gap: ${theme.spacing.lg};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const StatLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Pattern Recognition Challenge Component
 * Enhanced with hints, better feedback, and improved scoring
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
    generateSquareQuestion(),
    generatePrimeQuestion(),
  ].slice(0, 3)); // Take 3 random questions

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [feedback, setFeedback] = useState<(boolean | null)[]>([null, null, null]);
  const [inputValue, setInputValue] = useState('');
  const [startTime] = useState(() => Date.now());
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState<boolean[]>([false, false, false]);
  const [attempts, setAttempts] = useState<number[]>([0, 0, 0]);
  const [hasInputError, setHasInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * Calculate score based on performance
   */
  const calculateScore = useCallback(() => {
    let totalScore = 0;
    
    feedback.forEach((isCorrect, idx) => {
      if (isCorrect) {
        let questionScore = 100;
        
        // Deduct points for hints
        if (hintUsed[idx]) {
          questionScore -= 30;
        }
        
        // Deduct points for multiple attempts
        if (attempts[idx] > 1) {
          questionScore -= (attempts[idx] - 1) * 15;
        }
        
        // Bonus for difficulty
        const difficulty = questions[idx].difficulty;
        if (difficulty === 'medium') questionScore += 20;
        if (difficulty === 'hard') questionScore += 40;
        
        totalScore += Math.max(20, questionScore);
      }
    });
    
    return totalScore;
  }, [feedback, hintUsed, attempts, questions]);

  /**
   * Handle answer submission
   */
  const handleSubmitAnswer = useCallback(() => {
    if (!inputValue.trim()) return;

    const userAnswer = parseInt(inputValue, 10);

    if (isNaN(userAnswer)) {
      setHasInputError(true);
      setTimeout(() => setHasInputError(false), 500);
      return;
    }

    // Track attempts
    const newAttempts = [...attempts];
    newAttempts[currentQuestionIndex]++;
    setAttempts(newAttempts);

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
    setShowHint(false);

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 1500);
    } else {
      // Challenge complete
      setTimeout(() => {
        const correctCount = newFeedback.filter((f) => f === true).length;
        const success = correctCount >= 2;
        const score = calculateScore();
        const timeSpent = (Date.now() - startTime) / 1000;

        onComplete(success, timeSpent, score);
      }, 1800);
    }
  }, [inputValue, currentQuestionIndex, currentQuestion, answers, feedback, attempts, questions, startTime, calculateScore, onComplete]);

  /**
   * Handle hint toggle
   */
  const handleToggleHint = useCallback(() => {
    if (!showHint) {
      const newHintUsed = [...hintUsed];
      newHintUsed[currentQuestionIndex] = true;
      setHintUsed(newHintUsed);
    }
    setShowHint(!showHint);
  }, [showHint, hintUsed, currentQuestionIndex]);

  /**
   * Handle Enter key press
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && inputValue.trim() && !isAnswered) {
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [inputValue, handleSubmitAnswer]);

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

  /**
   * Clear input error after animation
   */
  useEffect(() => {
    if (hasInputError) {
      const timer = setTimeout(() => setHasInputError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hasInputError]);

  const isAnswered = feedback[currentQuestionIndex] !== null;
  const isCorrect = feedback[currentQuestionIndex] === true;
  const correctCount = useMemo(() => feedback.filter(f => f === true).length, [feedback]);
  const accuracy = useMemo(() => {
    const answered = feedback.filter(f => f !== null).length;
    return answered > 0 ? Math.round((correctCount / answered) * 100) : 0;
  }, [feedback, correctCount]);

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
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.1 }}
            >
              {feedback[idx] === null ? idx + 1 : feedback[idx] ? '✓' : '✗'}
            </ProgressDot>
          ))}
        </ProgressIndicator>

        <StatsBar>
          <StatItem>
            <StatLabel>Progress</StatLabel>
            <StatValue>{currentQuestionIndex + 1}/3</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Correct</StatLabel>
            <StatValue>{correctCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Accuracy</StatLabel>
            <StatValue>{accuracy}%</StatValue>
          </StatItem>
        </StatsBar>

        <AnimatePresence mode="wait">
          <QuestionWrapper
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionHeader>
              <QuestionTypeLabel>{currentQuestion.description}</QuestionTypeLabel>
              <DifficultyBadge $difficulty={currentQuestion.difficulty}>
                {currentQuestion.difficulty}
              </DifficultyBadge>
            </QuestionHeader>

            <QuestionTitle
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Find the Next Number
            </QuestionTitle>

            <SequenceDisplay
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              {currentQuestion.sequence.map((num, idx) => (
                <React.Fragment key={idx}>
                  <NumberItem
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.08, type: 'spring', stiffness: 200 }}
                  >
                    {num}
                  </NumberItem>
                  {idx < currentQuestion.sequence.length - 1 && <Separator>,</Separator>}
                </React.Fragment>
              ))}
              <Separator>,</Separator>
              <NumberItem
                $isAnswer
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                ?
              </NumberItem>
            </SequenceDisplay>

            {!isAnswered ? (
              <>
                <InputContainer>
                  <NumberInput
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Your answer..."
                    $hasError={hasInputError}
                    disabled={false}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      x: hasInputError ? [-5, 5, -5, 5, 0] : 0
                    }}
                    transition={{ delay: 0.3, duration: hasInputError ? 0.3 : 0.2 }}
                    aria-label="Answer input"
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

                {attempts[currentQuestionIndex] >= 2 && !showHint && (
                  <HintButton
                    onClick={handleToggleHint}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💡 Show Hint (-30 points)
                  </HintButton>
                )}

                <AnimatePresence>
                  {showHint && currentQuestion.hint && (
                    <HintDisplay
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      💡 {currentQuestion.hint}
                    </HintDisplay>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Feedback
                $correct={isCorrect}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <EmojiIcon>{isCorrect ? '✓' : '✗'}</EmojiIcon>
                <span>
                  {isCorrect
                    ? `Correct! The answer is ${currentQuestion.correctAnswer}`
                    : `Wrong. The correct answer is ${currentQuestion.correctAnswer}`}
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
