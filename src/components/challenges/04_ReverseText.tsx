import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';
import { getRandomSentence } from '../../utils/sentenceDataset';

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

/**
 * Styled reversed text display
 */
const ReversedTextDisplay = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  letter-spacing: 0.5px;
  color: ${theme.colors.primary};
  text-align: center;
  width: 100%;
  word-break: normal;
  white-space: normal;
  user-select: text;
  border: 2px solid ${theme.colors.primary};
  box-shadow: ${theme.shadows.md};
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Styled input field with dynamic border color
 */
const Input = styled(motion.input)<{ $accuracy: number }>`
  width: 100%;
  height: 60px;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  padding: ${theme.spacing.md};
  border: 2px solid ${props => {
    if (props.$accuracy === 100) return theme.colors.success;
    if (props.$accuracy >= 80) return theme.colors.warning;
    if (props.$accuracy > 0) return theme.colors.error;
    return theme.colors.primary;
  }};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.background};
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.sm};

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$accuracy === 100) return theme.colors.success;
      if (props.$accuracy >= 80) return theme.colors.warning;
      if (props.$accuracy > 0) return theme.colors.error;
      return theme.colors.secondary;
    }};
    box-shadow: 0 0 0 4px ${props => {
      if (props.$accuracy === 100) return 'rgba(16, 185, 129, 0.2)';
      if (props.$accuracy >= 80) return 'rgba(245, 158, 11, 0.2)';
      if (props.$accuracy > 0) return 'rgba(239, 68, 68, 0.2)';
      return 'rgba(99, 102, 241, 0.2)';
    }};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

/**
 * Styled progress info with accuracy indicator
 */
const ProgressInfo = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

/**
 * Accuracy bar container
 */
const AccuracyBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.xs};
`;

/**
 * Accuracy bar fill
 */
const AccuracyBarFill = styled(motion.div)<{ $accuracy: number }>`
  height: 100%;
  background: ${props => {
    if (props.$accuracy === 100) return theme.colors.success;
    if (props.$accuracy >= 80) return theme.colors.warning;
    return theme.colors.error;
  }};
  border-radius: ${theme.borderRadius.full};
`;

/**
 * Feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $type: 'success' | 'warning' | 'error' }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  color: ${props => {
    if (props.$type === 'success') return theme.colors.success;
    if (props.$type === 'warning') return theme.colors.warning;
    return theme.colors.error;
  }};
  text-align: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background: ${props => {
    if (props.$type === 'success') return 'rgba(16, 185, 129, 0.1)';
    if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  }};
`;

/**
 * Calculate typing accuracy
 */
const calculateAccuracy = (input: string, target: string): number => {
  if (!input || !target) return 0;
  
  const minLength = Math.min(input.length, target.length);
  let correctChars = 0;
  
  for (let i = 0; i < minLength; i++) {
    if (input.toLowerCase()[i] === target.toLowerCase()[i]) {
      correctChars++;
    }
  }
  
  return Math.round((correctChars / target.length) * 100);
};

/**
 * Get feedback message based on accuracy
 */
const getFeedback = (accuracy: number, length: number, targetLength: number): string | null => {
  if (length === 0) return null;
  
  if (accuracy === 100 && length === targetLength) {
    return 'Perfect! Challenge complete!';
  }
  if (accuracy >= 50) {
    return 'You\'re on the right track!';
  }
  if (accuracy >= 10) {
    return 'Check your spelling carefully';
  }
  if (accuracy > 0) {
    return 'Keep trying, you can do it!';
  }
  return null;
};

/**
 * Reverse Text Challenge Component
 * User must read backwards text and type it forward with real-time accuracy feedback
 */
const ReverseTextChallenge: React.FC<ChallengeProps> = ({
  onComplete,
}) => {
  const [targetText] = useState(() => getRandomSentence());
  const [userInput, setUserInput] = useState('');
  const [startTime] = useState(() => Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoized reversed text
  const reversedText = useMemo(() => {
    return targetText.split('').reverse().join('');
  }, [targetText]);

  // Calculate real-time accuracy
  const accuracy = useMemo(() => {
    return calculateAccuracy(userInput, targetText);
  }, [userInput, targetText]);

  // Get feedback message
  const feedbackMessage = useMemo(() => {
    return getFeedback(accuracy, userInput.length, targetText.length);
  }, [accuracy, userInput.length, targetText.length]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle completion with callback wrapper
  const handleComplete = useCallback(() => {
    if (isCompleted) return;
    
    const timeSpent = (Date.now() - startTime) / 1000;
    // Base score 200, deduct 2 points per second
    const timeScore = Math.max(100, 200 - Math.floor(timeSpent * 2));
    // Bonus for perfect accuracy
    const accuracyBonus = accuracy === 100 ? 50 : 0;
    const finalScore = timeScore + accuracyBonus;

    setIsCompleted(true);
    
    setTimeout(() => {
      onComplete(true, timeSpent, finalScore);
    }, 500);
  }, [isCompleted, startTime, accuracy, onComplete]);

  // Check for completion
  useEffect(() => {
    const normalizedInput = userInput.toLowerCase().trim();
    const normalizedTarget = targetText.toLowerCase().trim();
    
    if (normalizedInput && normalizedInput === normalizedTarget && !isCompleted) {
      handleComplete();
    }
  }, [userInput, targetText, isCompleted, handleComplete]);

  return (
    <ChallengeBase
      title="Reverse Text Challenge"
      description="Read the backwards text and type it normally"
    >
 
      <Container>
        <ReversedTextDisplay
          initial={{ opacity: 0, rotateX: -20 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          role="img"
          aria-label={`Reversed text: ${reversedText}`}
        >
          {reversedText}
        </ReversedTextDisplay>

        <Input
          ref={inputRef}
          as={motion.input}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type the text normally..."
          autoComplete="off"
          disabled={isCompleted}
          $accuracy={accuracy}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          aria-label="Type the reversed text normally"
          aria-describedby="progress-info"
        />

        <ProgressInfo id="progress-info">
          <div>
            {userInput.length} / {targetText.length} characters
            {userInput.length > 0 && ` • Accuracy: ${accuracy}%`}
          </div>
          
          {userInput.length > 0 && (
            <AccuracyBarContainer>
              <AccuracyBarFill
                $accuracy={accuracy}
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 0.3 }}
              />
            </AccuracyBarContainer>
          )}
        </ProgressInfo>

        <AnimatePresence mode="wait">
          {feedbackMessage && (
            <FeedbackMessage
              key={feedbackMessage}
              $type={
                accuracy === 100 && userInput.length === targetText.length
                  ? 'success'
                  : accuracy >= 80
                  ? 'warning'
                  : 'error'
              }
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {feedbackMessage}
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default ReverseTextChallenge;
