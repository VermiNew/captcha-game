import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';
import { getRandomSentence } from '../../utils/sentenceDataset';

/**
 * Character color type
 */
type CharColor = 'success' | 'error' | 'pending';

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
 * Styled target text container
 */
const TargetTextContainer = styled(motion.div)`
  width: 100%;
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  line-height: 1.8;
  word-break: break-all;
  border: 1px solid ${theme.colors.border};
  min-height: 100px;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`;

/**
 * Styled individual character
 */
const Char = styled.span<{ $color: CharColor }>`
  transition: all 0.15s ease;
  color: ${(props) => {
    switch (props.$color) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'pending':
      default:
        return theme.colors.textTertiary;
    }
  }};
  font-weight: ${(props) =>
    props.$color !== 'pending' ? theme.fontWeights.semibold : theme.fontWeights.normal};
  background-color: ${(props) => {
    if (props.$color === 'error') return 'rgba(239, 68, 68, 0.1)';
    return 'transparent';
  }};
  padding: 2px 4px;
  border-radius: ${theme.borderRadius.sm};
`;

/**
 * Styled textarea
 */
const Textarea = styled.textarea`
  width: 100%;
  height: 120px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.base};
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  resize: none;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

/**
 * Styled stats container
 */
const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  flex-wrap: wrap;
`;

/**
 * Styled individual stat
 */
const Stat = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Styled stat value
 */
const StatValue = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Success message
 */
const SuccessMessage = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.success};
  text-align: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background-color: rgba(16, 185, 129, 0.1);
`;

/**
 * Type Text Challenge Component
 * Type the target text exactly to complete the challenge
 */
const TypeTextChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [targetText] = useState(() => getRandomSentence());
  const [userInput, setUserInput] = useState('');
  const [startTime] = useState(() => Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-focus textarea on mount
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  /**
   * Check for completion
   */
  useEffect(() => {
    if (userInput === targetText && !isCompleted) {
      setIsCompleted(true);
      const timeSpent = (Date.now() - startTime) / 1000;
      const accuracy = 100; // Perfect match required
      const baseScore = 150;
      const timeBonus = Math.max(0, 50 - Math.floor(timeSpent));
      const totalScore = baseScore + timeBonus;

      setTimeout(() => {
        onComplete(true, timeSpent, totalScore, accuracy);
      }, 700);
    }
  }, [userInput, targetText, startTime, isCompleted, onComplete]);

  /**
   * Render target text with color coding
   */
  const renderTargetText = () => {
    return targetText.split('').map((char, index) => {
      let charColor: CharColor = 'pending';

      if (index < userInput.length) {
        charColor = userInput[index] === char ? 'success' : 'error';
      }

      return (
        <Char key={index} $color={charColor}>
          {char}
        </Char>
      );
    });
  };

  const progressPercentage = Math.round(
    Math.min(userInput.length, targetText.length) / targetText.length * 100,
  );
  const remainingChars = Math.max(0, targetText.length - userInput.length);

  return (
    <ChallengeBase
      title="Type Text Challenge"
      description="Type the text exactly as shown below"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <TargetTextContainer
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTargetText()}
        </TargetTextContainer>

        <Textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Start typing here..."
          autoComplete="off"
          spellCheck="false"
          disabled={isCompleted}
        />

        <Stats>
          <Stat
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StatLabel>Progress</StatLabel>
            <StatValue>{progressPercentage}%</StatValue>
          </Stat>

          <Stat
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StatLabel>Characters</StatLabel>
            <StatValue>
              {userInput.length} / {targetText.length}
            </StatValue>
          </Stat>

          <Stat
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <StatLabel>Remaining</StatLabel>
            <StatValue>{Math.max(0, remainingChars)}</StatValue>
          </Stat>
        </Stats>

        {isCompleted && (
          <SuccessMessage
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            ✓ Perfect! You typed it correctly!
          </SuccessMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default TypeTextChallenge;
