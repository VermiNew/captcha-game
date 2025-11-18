import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

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
 * Styled progress text
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled task container
 */
const TaskContainer = styled(motion.div)`
  background: ${theme.colors.background};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
`;

/**
 * Styled decimal number display
 */
const DecimalNumber = styled.div`
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  padding: ${theme.spacing.xl};
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.primary};
  margin-bottom: ${theme.spacing.lg};
`;

/**
 * Styled instruction text
 */
const InstructionText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

/**
 * Styled input container
 */
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

/**
 * Styled input field
 */
const BinaryInput = styled.input<{ $isCorrect?: boolean; $isWrong?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  border: 2px solid
    ${(props) =>
      props.$isCorrect
        ? theme.colors.success
        : props.$isWrong
          ? theme.colors.error
          : theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  text-align: center;
  letter-spacing: 4px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

/**
 * Styled feedback message
 */
const FeedbackMessage = styled(motion.p)<{ $type: 'correct' | 'wrong' }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) =>
    props.$type === 'correct' ? theme.colors.success : theme.colors.error};
  text-align: center;
  margin: 0;
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled.div`
  display: flex;
  justify-content: space-around;
  gap: ${theme.spacing.lg};
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

/**
 * Styled score item
 */
const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  p {
    font-family: ${theme.fonts.primary};
    margin: 0;

    &:first-child {
      font-size: ${theme.fontSizes.sm};
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.fontWeights.medium};
    }

    &:last-child {
      font-size: ${theme.fontSizes.xl};
      font-weight: ${theme.fontWeights.bold};
      color: ${theme.colors.primary};
    }
  }
`;

/**
 * Binary Calculator Challenge Component
 * Convert 4 random decimal numbers to binary
 */
const BinaryCalculatorChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Generate 4 random numbers between 8-255
  const [numbers] = useState<number[]>(() => {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * (255 - 8 + 1)) + 8
    );
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputs, setInputs] = useState<string[]>(Array(4).fill(''));
  const [feedback, setFeedback] = useState<string>('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentNumber = numbers[currentIndex];
  const currentBinary = currentNumber.toString(2);
  const isLastNumber = currentIndex === numbers.length - 1;

  /**
   * Check if answer is correct
   */
  const checkAnswer = () => {
    const userAnswer = inputs[currentIndex].trim();

    if (!userAnswer) {
      setFeedback('Please enter a binary number');
      return;
    }

    const isCorrect = userAnswer === currentBinary;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setFeedback('✓ Correct!');

      setTimeout(() => {
        if (isLastNumber) {
          // Challenge completed
          const timeSpent = (Date.now() - startTime) / 1000;
          const score = correctCount * 75; // 75 points per correct answer
          onComplete(true, timeSpent, score);
        } else {
          // Next number
          setCurrentIndex((prev) => prev + 1);
          setFeedback('');
        }
      }, 1000);
    } else {
      setWrongCount((prev) => prev + 1);
      setFeedback(`✗ Wrong! Correct: ${currentBinary}`);

      setTimeout(() => {
        if (isLastNumber) {
          // Challenge completed
          const timeSpent = (Date.now() - startTime) / 1000;
          const score = correctCount * 75;
          onComplete(true, timeSpent, score);
        } else {
          // Next number
          setCurrentIndex((prev) => prev + 1);
          setFeedback('');
        }
      }, 2000);
    }
  };

  /**
   * Handle input change - only allow 0 and 1
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 0 and 1
    const filtered = value.replace(/[^01]/g, '');
    const newInputs = [...inputs];
    newInputs[currentIndex] = filtered;
    setInputs(newInputs);
    setFeedback('');
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const isAnswered = feedback !== '';
  const isCorrect = feedback.startsWith('✓');

  return (
    <ChallengeBase
      title="Binary Calculator"
      description="Convert decimal numbers to binary"
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
          Binary Converter
        </Title>

        <ProgressText>
          Number {currentIndex + 1} / 4
        </ProgressText>

        <TaskContainer
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InstructionText>Convert this decimal number to binary:</InstructionText>

          <DecimalNumber>{currentNumber}</DecimalNumber>

          <InputContainer>
            <BinaryInput
              type="text"
              placeholder="e.g., 1010"
              value={inputs[currentIndex]}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isAnswered}
              $isCorrect={isAnswered && isCorrect}
              $isWrong={isAnswered && !isCorrect}
              autoFocus
            />

            {feedback && (
              <FeedbackMessage
                $type={isCorrect ? 'correct' : 'wrong'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {feedback}
              </FeedbackMessage>
            )}
          </InputContainer>

          {!isAnswered && (
            <motion.button
              onClick={checkAnswer}
              style={{
                marginTop: theme.spacing.lg,
                padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                fontFamily: theme.fonts.primary,
                fontSize: theme.fontSizes.base,
                fontWeight: theme.fontWeights.semibold,
                border: 'none',
                borderRadius: theme.borderRadius.lg,
                background: theme.colors.primary,
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: theme.shadows.md,
              }}
              whileHover={{ boxShadow: theme.shadows.lg, transform: 'translateY(-2px)' }}
              whileTap={{ transform: 'scale(0.98)' }}
            >
              Submit
            </motion.button>
          )}
        </TaskContainer>

        <ScoreDisplay>
          <ScoreItem>
            <p>Correct</p>
            <p>{correctCount}</p>
          </ScoreItem>
          <ScoreItem>
            <p>Wrong</p>
            <p>{wrongCount}</p>
          </ScoreItem>
          <ScoreItem>
            <p>Score</p>
            <p>{correctCount * 75}</p>
          </ScoreItem>
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default BinaryCalculatorChallenge;
