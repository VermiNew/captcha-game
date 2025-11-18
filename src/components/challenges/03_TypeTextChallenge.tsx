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
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

/**
 * Styled target text container
 */
const TargetTextContainer = styled(motion.div)`
  width: 100%;
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  line-height: 1.6;
  letter-spacing: 0px;
  border: 2px solid ${theme.colors.primary};
  min-height: 80px;
  display: block;
  word-wrap: break-word;
  word-break: normal;
  white-space: normal;
  box-shadow: ${theme.shadows.md};
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
        return theme.colors.textPrimary;
    }
  }};
  font-weight: ${(props) =>
    props.$color !== 'pending' ? theme.fontWeights.bold : theme.fontWeights.normal};
  background-color: ${(props) => {
    if (props.$color === 'error') return 'rgba(239, 68, 68, 0.15)';
    if (props.$color === 'success') return 'rgba(16, 185, 129, 0.15)';
    return 'transparent';
  }};
  padding: 1px 2px;
  border-radius: ${theme.borderRadius.sm};
  white-space: pre-wrap;
`;

/**
 * Styled textarea
 */
const Textarea = styled.textarea`
  width: 100%;
  height: 100px;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  resize: none;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.secondary};
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

/**
 * Styled stats container
 */
const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  flex-wrap: wrap;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  margin-top: ${theme.spacing.md};
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
    const chars: React.ReactNode[] = [];

    for (let i = 0; i < targetText.length; i++) {
      const char = targetText[i];
      let charColor: CharColor = 'pending';

      if (i < userInput.length) {
        const userChar = userInput[i];
        charColor = userChar === char ? 'success' : 'error';
      }

      chars.push(
        <Char key={i} $color={charColor}>
          {char}
        </Char>,
      );
    }

    return chars;
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
