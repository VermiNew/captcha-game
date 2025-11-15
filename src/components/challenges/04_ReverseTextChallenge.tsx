import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Sentences that will be displayed reversed
 */
const sentences = [
  'The early bird catches the worm',
  'Practice makes perfect',
  'Better late than never',
  'Actions speak louder than words',
  'Where there is a will there is a way',
];

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
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled reversed text display
 */
const ReversedTextDisplay = styled(motion.div)`
  font-family: 'Courier New', monospace;
  font-size: ${theme.fontSizes.xl};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  letter-spacing: 1px;
  color: ${theme.colors.primary};
  text-align: center;
  width: 100%;
  word-break: break-word;
  user-select: text;
`;

/**
 * Styled input field
 */
const Input = styled(motion.input)`
  width: 100%;
  height: 60px;
  font-family: ${theme.fonts.primary};
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
`;

/**
 * Styled progress info
 */
const ProgressInfo = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Reverse Text Challenge Component
 * User must read backwards text and type it forward
 */
const ReverseTextChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [targetText] = useState(() =>
    sentences[Math.floor(Math.random() * sentences.length)],
  );
  const [userInput, setUserInput] = useState('');
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const reversedText = useMemo(
    () => targetText.split('').reverse().join(''),
    [targetText],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Check if completed
    if (
      userInput.toLowerCase().trim() ===
      targetText.toLowerCase().trim()
    ) {
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = Math.max(100, 200 - Math.floor(timeSpent * 2));

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 500);
    }
  }, [userInput, targetText, startTime, onComplete]);

  return (
    <ChallengeBase
      title="Reverse Text Challenge"
      description="Read the backwards text and type it normally"
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
          Read Backwards, Type Forward!
        </Title>

        <Instruction>
          This text is written backwards. Type it normally:
        </Instruction>

        <ReversedTextDisplay
          initial={{ opacity: 0, rotateX: -20 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />

        <ProgressInfo>
          {userInput.length} / {targetText.length} characters
        </ProgressInfo>
      </Container>
    </ChallengeBase>
  );
};

export default ReverseTextChallenge;
