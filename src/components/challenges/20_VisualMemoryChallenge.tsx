import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game phase type
 */
type GamePhase = 'showing' | 'waiting' | 'complete';

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
 * Styled grid
 */
const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
`;

/**
 * Styled tile
 */
const Tile = styled(motion.button)<{
  $isLit: boolean;
  $isCorrect: boolean;
  $isWrong: boolean;
}>`
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => {
    if (props.$isWrong) {
      return theme.colors.error;
    }
    if (props.$isCorrect) {
      return theme.colors.success;
    }
    return props.$isLit ? theme.colors.primary : theme.colors.surface;
  }};
  cursor: ${(props) =>
    props.$isWrong || props.$isCorrect ? 'default' : 'pointer'};
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease;
  padding: 0;

  ${(props) => {
    if (props.$isWrong) {
      return `
        box-shadow: 0 0 25px ${theme.colors.error};
        pointer-events: none;
        animation: pulse-error 0.4s ease-out;
      `;
    }
    if (props.$isCorrect) {
      return `
        box-shadow: 0 0 25px ${theme.colors.success};
      `;
    }
    if (props.$isLit) {
      return `
        box-shadow: 0 0 25px ${theme.colors.primary}, inset 0 0 15px rgba(255, 255, 255, 0.2);
        animation: pulse-lit 0.6s ease-out;
      `;
    }
    return `
      border: 2px solid ${theme.colors.border};

      &:hover {
        border-color: ${theme.colors.primary};
        box-shadow: 0 0 12px ${theme.colors.primary};
        transform: translateY(-2px);
      }

      &:active {
        transform: scale(0.95);
      }
    `;
  }}

  @keyframes pulse-lit {
    0% {
      box-shadow: 0 0 0 0 ${theme.colors.primary};
    }
    50% {
      box-shadow: 0 0 30px ${theme.colors.primary};
    }
    100% {
      box-shadow: 0 0 15px ${theme.colors.primary};
    }
  }

  @keyframes pulse-error {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(0.95);
    }
    75% {
      transform: scale(1.05);
    }
  }
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
 * Styled stats grid
 */
const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled stat card
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Visual Memory Challenge Component
 * User must remember and click the lit tiles
 */
const VisualMemoryChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const TOTAL_TILES = 16;
  const TILES_TO_REMEMBER = 6;
  const SHOWING_DURATION = 3000; // ms

  const [litTiles] = useState<Set<number>>(() => {
    const tiles = new Set<number>();
    while (tiles.size < TILES_TO_REMEMBER) {
      tiles.add(Math.floor(Math.random() * TOTAL_TILES));
    }
    return tiles;
  });

  const [phase, setPhase] = useState<GamePhase>('showing');
  const [clickedTiles, setClickedTiles] = useState<Set<number>>(new Set());
  const [correctTiles, setCorrectTiles] = useState<Set<number>>(new Set());
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Handle phase transition from showing to waiting
   */
  useEffect(() => {
    if (phase !== 'showing') return;

    timeoutRef.current = setTimeout(() => {
      setPhase('waiting');
    }, SHOWING_DURATION);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [phase]);

  /**
   * Handle tile click
   */
  const handleTileClick = (index: number) => {
    if (phase !== 'waiting' || clickedTiles.has(index) || completed) return;

    const newClicked = new Set(clickedTiles);
    newClicked.add(index);
    setClickedTiles(newClicked);

    if (litTiles.has(index)) {
      // Correct tile
      const newCorrect = new Set(correctTiles);
      newCorrect.add(index);
      setCorrectTiles(newCorrect);

      // Check if all tiles are correct
      if (newCorrect.size === TILES_TO_REMEMBER) {
        // Success!
        const timeSpent = (Date.now() - startTime) / 1000;
        const speedBonus = Math.max(0, 100 - Math.floor(timeSpent / 2));
        const score = 250 + speedBonus;

        setCompleted(true);
        setPhase('complete');

        setTimeout(() => {
          onComplete(true, timeSpent, score);
        }, 2000);
      }
    } else {
      // Wrong tile - game over
      setWrongTile(index);
      setCompleted(true);
      setPhase('complete');

      const timeSpent = (Date.now() - startTime) / 1000;
      setTimeout(() => {
        onComplete(false, timeSpent, 0);
      }, 1500);
    }
  };

  const progress = correctTiles.size;

  return (
    <ChallengeBase
      title="Visual Memory Challenge"
      description="Remember which tiles light up"
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
          Test Your Memory!
        </Title>

        <Instruction>
          {phase === 'showing'
            ? 'Watch carefully which tiles light up...'
            : phase === 'waiting'
              ? 'Click the tiles in the same pattern'
              : 'Challenge complete!'}
        </Instruction>

        <InfoSection>
          <InfoItem>
            <InfoLabel>Tiles to Remember</InfoLabel>
            <InfoValue>{TILES_TO_REMEMBER}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Correct So Far</InfoLabel>
            <InfoValue
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {progress}/{TILES_TO_REMEMBER}
            </InfoValue>
          </InfoItem>
        </InfoSection>

        <Grid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {Array.from({ length: TOTAL_TILES }, (_, idx) => (
              <Tile
                key={idx}
                $isLit={phase === 'showing' && litTiles.has(idx)}
                $isCorrect={correctTiles.has(idx)}
                $isWrong={wrongTile === idx}
                onClick={() => handleTileClick(idx)}
                disabled={phase !== 'waiting' || correctTiles.has(idx) || wrongTile !== null}
                whileHover={
                  phase === 'waiting' &&
                  !correctTiles.has(idx) &&
                  !litTiles.has(idx) &&
                  wrongTile === null
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  phase === 'waiting' &&
                  !correctTiles.has(idx) &&
                  !litTiles.has(idx) &&
                  wrongTile === null
                    ? { scale: 0.95 }
                    : {}
                }
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: idx * 0.02,
                }}
              />
            ))}
          </AnimatePresence>
        </Grid>

        <AnimatePresence>
          {completed && (
            <FeedbackMessage
              $success={wrongTile === null}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Emoji>{wrongTile === null ? '🎉' : '💥'}</Emoji>
              <span>
                {wrongTile === null
                  ? `Perfect! You remembered all ${TILES_TO_REMEMBER} tiles!`
                  : 'Oops! You clicked the wrong tile.'}
              </span>
            </FeedbackMessage>
          )}
        </AnimatePresence>

        {completed && (
          <StatsGrid
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
          >
            <StatCard
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <StatLabel>Correct Tiles</StatLabel>
              <StatValue
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {correctTiles.size}/{TILES_TO_REMEMBER}
              </StatValue>
            </StatCard>

            <StatCard
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <StatLabel>Result</StatLabel>
              <StatValue
                style={{
                  color: wrongTile === null ? theme.colors.success : theme.colors.error,
                }}
              >
                {wrongTile === null ? 'WIN' : 'FAIL'}
              </StatValue>
            </StatCard>
          </StatsGrid>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default VisualMemoryChallenge;
