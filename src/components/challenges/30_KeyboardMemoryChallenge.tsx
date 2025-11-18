import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Phase type
 */
type Phase = 'showing' | 'input' | 'feedback';

/**
 * Generate random 6-letter sequence
 */
const generateSequence = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 26)]).join('');
};

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 600px;
`;

/**
 * Round label
 */
const RoundLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Sequence display
 */
const SequenceDisplay = styled(motion.div)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid ${theme.colors.primary};
  width: 100%;
  letter-spacing: ${theme.spacing.md};
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Input field
 */
const StyledInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.lg};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: ${theme.spacing.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.secondary};
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

/**
 * Countdown timer
 */
const Countdown = styled(motion.div)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.info};
`;

/**
 * Feedback message
 */
const FeedbackMessageBox = styled(motion.div)<{ $correct: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$correct ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$correct ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Results
 */
const FinalFeedback = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Keyboard Memory Challenge Component
 */
const KeyboardMemoryChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [startTime] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate 3 sequences at start
  const sequences = useMemo(() => [generateSequence(), generateSequence(), generateSequence()], []);

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('showing');
  const [userInput, setUserInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const currentSequence = sequences[currentRound];

  /**
   * Auto-hide showing phase
   */
  useEffect(() => {
    if (phase !== 'showing' || completed) return;

    const timer = setTimeout(() => {
      setPhase('input');
      setCountdown(0);

      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, 4000);

    return () => clearTimeout(timer);
  }, [phase, completed]);

  /**
   * Countdown during showing
   */
  useEffect(() => {
    if (phase !== 'showing') return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setUserInput(value);

    // Auto-submit when 6 letters entered
    if (value.length === 6) {
      handleSubmit(value);
    }
  };

  /**
   * Handle submit
   */
  const handleSubmit = (input: string = userInput) => {
    if (phase !== 'input' || input.length === 0) return;

    const isCorrect = input.toUpperCase() === currentSequence.toUpperCase();

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setFeedback({ correct: true, message: 'Correct!' });
    } else {
      setFeedback({ correct: false, message: `Wrong! It was: ${currentSequence}` });
    }

    setPhase('feedback');

    // Move to next round or finish
    setTimeout(() => {
      if (currentRound < 2) {
        setCurrentRound((prev) => prev + 1);
        setPhase('showing');
        setUserInput('');
        setCountdown(4);
        setFeedback(null);
      } else {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const score = correctAnswers * 100 + (isCorrect ? 100 : 0);
        const success = correctAnswers + (isCorrect ? 1 : 0) >= 2;

        setTimeout(() => {
          onComplete(success, timeSpent, score);
        }, 1500);
      }
    }, 2000);
  };

  /**
   * Handle keyboard submit
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && phase === 'input') {
      handleSubmit();
    }
  };

  if (completed) {
    const success = correctAnswers >= 2;

    return (
      <ChallengeBase
        title="Keyboard Memory Challenge"
        description="Remember and type the letter sequences"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <FinalFeedback
          $success={success}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>{success ? '🧠' : '💭'}</Emoji>
          <span>{success ? 'Great memory!' : 'Keep practicing!'}</span>
          <span>
            Score: {correctAnswers}/3
          </span>
        </FinalFeedback>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Keyboard Memory Challenge"
      description="Remember and type the letter sequences"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <RoundLabel>
          Round {currentRound + 1}/3
        </RoundLabel>

        {phase === 'showing' && (
          <>
            <SequenceDisplay
              key={`showing-${currentRound}`}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {currentSequence}
            </SequenceDisplay>

            <Countdown
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={countdown}
            >
              {countdown > 0 ? `Remember... ${countdown}` : 'Get ready!'}
            </Countdown>
          </>
        )}

        {phase === 'input' && (
          <>
            <p style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.primary }}>
              Type the sequence you just saw:
            </p>
            <StyledInput
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type here..."
              autoFocus
              maxLength={6}
            />
          </>
        )}

        {phase === 'feedback' && feedback && (
          <FeedbackMessageBox
            $correct={feedback.correct}
            key={`feedback-${currentRound}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Emoji>{feedback.correct ? '✅' : '❌'}</Emoji>
            <span>{feedback.message}</span>
          </FeedbackMessageBox>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default KeyboardMemoryChallenge;
