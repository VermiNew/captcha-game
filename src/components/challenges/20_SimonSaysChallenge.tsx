import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game phase type
 */
type GamePhase = 'playing' | 'showing' | 'waiting' | 'complete';

/**
 * Button colors for Simon game
 */
const SIMON_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];
const SIMON_LABELS = ['Red', 'Cyan', 'Yellow', 'Green'];

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
 * Styled grid (2x2)
 */
const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1;
`;

/**
 * Styled button
 */
const SimonButton = styled(motion.button)<{
  $color: string;
  $isActive: boolean;
  $isWrong: boolean;
}>`
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => props.$color};
  cursor: ${(props) => (props.$isWrong ? 'default' : 'pointer')};
  position: relative;
  overflow: hidden;
  padding: 0;
  opacity: ${(props) => (props.$isActive ? 1 : 0.6)};
  transition: all 0.1s ease;

  ${(props) => {
    if (props.$isWrong) {
      return `
        animation: shake 0.4s ease-out;
        box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.8);
      `;
    }
    if (props.$isActive) {
      return `
        box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.4), 0 0 30px rgba(0, 0, 0, 0.3);
        transform: scale(0.95);
      `;
    }
    return `
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);

      &:hover:not(:disabled) {
        opacity: 0.8;
        box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.2), 0 0 20px rgba(0, 0, 0, 0.3);
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }
    `;
  }}

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
  }
`;

/**
 * Styled info section
 */
const InfoSection = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`;

/**
 * Styled info item
 */
const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled info label
 */
const InfoLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled info value
 */
const InfoValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
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
 * Styled emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Simon Says Challenge
 * Memorize and repeat the color sequence
 */
const SimonSaysChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const ROUNDS_TO_WIN = 8;
  const SHOW_DURATION = 600; // ms per button flash
  const BUTTON_DELAY = 600; // ms between button flashes

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentRound, setCurrentRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonFlashRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Play button flash animation
   */
  const playButtonFlash = (buttonIndex: number) => {
    return new Promise<void>((resolve) => {
      setActiveButton(buttonIndex);

      buttonFlashRef.current = setTimeout(() => {
        setActiveButton(null);
        resolve();
      }, SHOW_DURATION);
    });
  };

  /**
   * Show the entire sequence
   */
  const showSequence = async (seq: number[]) => {
    setPhase('showing');
    setPlayerSequence([]);

    // Wait a bit before starting
    await new Promise((resolve) => {
      sequenceTimeoutRef.current = setTimeout(resolve, 500);
    });

    // Flash each button in sequence
    for (const buttonIndex of seq) {
      await playButtonFlash(buttonIndex);
      await new Promise((resolve) => {
        sequenceTimeoutRef.current = setTimeout(resolve, BUTTON_DELAY);
      });
    }

    setPhase('waiting');
  };

  /**
   * Start new round
   */
  useEffect(() => {
    if (phase !== 'playing' || gameOver || completed) return;

    const newSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setCurrentRound(newSequence.length);

    const timer = setTimeout(() => {
      showSequence(newSequence);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, sequence, gameOver, completed]);

  /**
   * Handle button click
   */
  const handleButtonClick = async (buttonIndex: number) => {
    if (phase !== 'waiting' || gameOver || completed) return;

    const newPlayerSequence = [...playerSequence, buttonIndex];
    setPlayerSequence(newPlayerSequence);

    // Flash the button
    await playButtonFlash(buttonIndex);

    // Check if correct
    if (sequence[newPlayerSequence.length - 1] !== buttonIndex) {
      // Wrong button!
      setGameOver(true);
      setPhase('complete');

      const timeSpent = (Date.now() - startTime) / 1000;
      completionTimeoutRef.current = setTimeout(() => {
        onComplete(false, timeSpent, 0);
      }, 1500);
      return;
    }

    // Check if player completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      if (sequence.length === ROUNDS_TO_WIN) {
        // Victory!
        setCompleted(true);
        setPhase('complete');

        const timeSpent = (Date.now() - startTime) / 1000;
        const speedBonus = Math.max(0, 100 - Math.floor(timeSpent / 3));
        const score = 250 + speedBonus;

        completionTimeoutRef.current = setTimeout(() => {
          onComplete(true, timeSpent, score);
        }, 2000);
      } else {
        // Next round
        setPhase('playing');
      }
    }
  };

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      if (buttonFlashRef.current) clearTimeout(buttonFlashRef.current);
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
    };
  }, []);

  return (
    <ChallengeBase
      title="Simon Says"
      description="Remember and repeat the color sequence"
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
          Simon Says
        </Title>

        <Instruction>
          {phase === 'showing'
            ? 'Watch the sequence...'
            : phase === 'waiting'
              ? 'Click the buttons in order'
              : 'Challenge complete!'}
        </Instruction>

        <InfoSection>
          <InfoItem>
            <InfoLabel>Round</InfoLabel>
            <InfoValue
              key={currentRound}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {currentRound}/{ROUNDS_TO_WIN}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Clicks</InfoLabel>
            <InfoValue>{playerSequence.length}/{currentRound}</InfoValue>
          </InfoItem>
        </InfoSection>

        <Grid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {SIMON_COLORS.map((color, idx) => (
            <SimonButton
              key={idx}
              $color={color}
              $isActive={activeButton === idx}
              $isWrong={gameOver}
              onClick={() => handleButtonClick(idx)}
              disabled={phase !== 'waiting' || gameOver}
              aria-label={`${SIMON_LABELS[idx]} button`}
              whileHover={
                phase === 'waiting' && !gameOver
                  ? { opacity: 0.8 }
                  : {}
              }
              whileTap={
                phase === 'waiting' && !gameOver
                  ? { scale: 0.95 }
                  : {}
              }
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: idx * 0.1,
              }}
            />
          ))}
        </Grid>

        <AnimatePresence>
          {(gameOver || completed) && (
            <FeedbackMessage
              $success={completed}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Emoji>{completed ? '🎉' : '💥'}</Emoji>
              <span>
                {completed
                  ? `Perfect! You completed all ${ROUNDS_TO_WIN} rounds!`
                  : `Game Over! You reached round ${currentRound}.`}
              </span>
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default SimonSaysChallenge;
