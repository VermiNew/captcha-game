import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Color definitions
 */
const COLORS = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#FBBF24',
  purple: '#A855F7',
  orange: '#F97316',
} as const;

type ColorKey = keyof typeof COLORS;

const COLOR_NAMES: Record<ColorKey, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
  purple: 'Purple',
  orange: 'Orange',
};

const COLOR_SEQUENCE: ColorKey[] = ['red', 'blue', 'green', 'yellow', 'purple'];

/**
 * Game state type
 */
type GamePhase = 'playing-sequence' | 'waiting-input' | 'showing-error';

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
 * Styled colors grid
 */
const ColorsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  margin: ${theme.spacing.xl} 0;
  width: 100%;

  @media (max-width: 500px) {
    gap: ${theme.spacing.md};
  }
`;

/**
 * Styled color square
 */
const ColorSquare = styled(motion.button)<{ $color: ColorKey; $isActive: boolean }>`
  aspect-ratio: 1;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => COLORS[props.$color]};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease;
  padding: 0;
  min-height: 80px;

  ${(props) =>
    props.$isActive
      ? `
    box-shadow: 0 0 20px ${COLORS[props.$color]}, inset 0 0 15px rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  `
      : `
    opacity: 0.8;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &:hover {
      opacity: 1;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.98);
    }
  `}

  &:disabled {
    cursor: not-allowed;
  }

  /**
   * Shine effect for active state
   */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: ${(props) => (props.$isActive ? 'shine 0.6s ease-in-out' : 'none')};
  }

  @keyframes shine {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

/**
 * Styled info section
 */
const InfoSection = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
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
`;

/**
 * Styled info label
 */
const InfoLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  letter-spacing: 0.5px;
`;

/**
 * Styled info value
 */
const InfoValue = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled message
 */
const Message = styled(motion.p)<{ $type: 'info' | 'error' | 'success' }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  text-align: center;
  margin: 0;
  color: ${(props) => {
    switch (props.$type) {
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  }};
`;

/**
 * Color Memory Challenge Component
 * User must remember and repeat the color sequence
 */
const ColorMemoryChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [sequence, setSequence] = useState<ColorKey[]>([]);
  const [userSequence, setUserSequence] = useState<ColorKey[]>([]);
  const [phase, setPhase] = useState<GamePhase>('playing-sequence');
  const [activeColor, setActiveColor] = useState<ColorKey | null>(null);
  const [startTime] = useState(Date.now());
  const [gameStarted, setGameStarted] = useState(false);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout>();
  const phaseTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Initialize game on mount
   */
  useEffect(() => {
    // Generate random sequence
    const newSequence = Array(5)
      .fill(null)
      .map(() => COLOR_SEQUENCE[Math.floor(Math.random() * COLOR_SEQUENCE.length)]);

    setSequence(newSequence);
    setGameStarted(true);
  }, []);

  /**
   * Play the sequence animation
   */
  useEffect(() => {
    if (!gameStarted || sequence.length === 0 || phase !== 'playing-sequence') {
      return;
    }

    const playSequence = async () => {
      // Wait a bit before starting
      await new Promise((resolve) => {
        sequenceTimeoutRef.current = setTimeout(resolve, 500);
      });

      // Play each color in sequence
      for (let i = 0; i < sequence.length; i++) {
        await new Promise((resolve) => {
          sequenceTimeoutRef.current = setTimeout(() => {
            setActiveColor(sequence[i]);

            // Light up for 800ms
            sequenceTimeoutRef.current = setTimeout(() => {
              setActiveColor(null);
              resolve(null);
            }, 800);
          }, 500);
        });
      }

      // After sequence, wait for user input
      setPhase('waiting-input');
    };

    playSequence();

    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [sequence, gameStarted, phase]);

  /**
   * Handle color click
   */
  const handleColorClick = (color: ColorKey) => {
    if (phase !== 'waiting-input') return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    // Play color feedback
    setActiveColor(color);
    phaseTimeoutRef.current = setTimeout(() => {
      setActiveColor(null);
    }, 300);

    // Check if click is correct
    const expectedColor = sequence[newUserSequence.length - 1];
    if (color !== expectedColor) {
      // Wrong sequence
      setPhase('showing-error');
      setTimeout(() => {
        onComplete(false, (Date.now() - startTime) / 1000, 0);
      }, 500);
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      // Success!
      const timeSpent = (Date.now() - startTime) / 1000;
      // Base 150 points + bonus for speed (30 second limit)
      const speedBonus = Math.max(0, 100 - Math.floor((timeSpent / timeLimit) * 100));
      const score = 150 + speedBonus;

      setPhase('waiting-input');
      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1000);
    }
  };

  const progress = Math.round(((userSequence.length) / sequence.length) * 100) || 0;

  return (
    <ChallengeBase
      title="Color Memory Challenge"
      description="Watch the sequence and click the colors in the same order"
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
          Remember the Sequence!
        </Title>

        <Instruction>
          {phase === 'playing-sequence'
            ? 'Watch carefully as the colors light up...'
            : phase === 'waiting-input'
              ? 'Click the colors in the same order'
              : 'Wrong sequence! Game over.'}
        </Instruction>

        <ColorsGrid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {COLOR_SEQUENCE.map((color) => (
            <ColorSquare
              key={color}
              $color={color}
              $isActive={activeColor === color}
              onClick={() => handleColorClick(color)}
              disabled={phase !== 'waiting-input'}
              whileHover={phase === 'waiting-input' ? { scale: 1.05 } : {}}
              whileTap={phase === 'waiting-input' ? { scale: 0.95 } : {}}
            />
          ))}
        </ColorsGrid>

        <InfoSection
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <InfoItem>
            <InfoLabel>Progress</InfoLabel>
            <InfoValue
              key={progress}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {userSequence.length}/{sequence.length}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>Sequence Length</InfoLabel>
            <InfoValue>{sequence.length}</InfoValue>
          </InfoItem>
        </InfoSection>

        {phase === 'showing-error' && (
          <Message
            $type="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            Wrong! Expected {COLOR_NAMES[sequence[userSequence.length - 1]]} but you clicked{' '}
            {COLOR_NAMES[userSequence[userSequence.length - 1]]}
          </Message>
        )}

        {phase === 'waiting-input' && userSequence.length < sequence.length && (
          <Message
            $type="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Next: {COLOR_NAMES[sequence[userSequence.length]]}
          </Message>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default ColorMemoryChallenge;
