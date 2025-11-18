import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Comprehensive emoji list
 */
const emojiList = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '🥰',
  '😍',
  '🤩',
  '😘',
  '😗',
  '😚',
  '😙',
  '😋',
  '😛',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤭',
  '🤫',
  '🤔',
  '🤐',
  '🤨',
  '😐',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😬',
  '🤥',
  '😌',
  '😔',
  '😪',
  '🤤',
  '😴',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '🥵',
  '🥶',
  '🥴',
  '😵',
  '🤯',
  '🤠',
  '🥳',
  '😎',
  '🤓',
  '🧐',
  '😕',
  '😟',
  '🙁',
];

/**
 * Emoji state type
 */
type EmojiState = 'default' | 'wrong' | 'correct';

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 700px;
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
 * Styled target emoji display
 */
const TargetEmojiDisplay = styled(motion.div)`
  font-size: 8rem;
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
  line-height: 1;
`;

/**
 * Styled emoji grid
 */
const EmojiGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: repeat(6, 1fr);
    gap: ${theme.spacing.xs};
  }

  @media (max-width: 400px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

/**
 * Styled emoji cell
 */
const EmojiCell = styled(motion.button)<{ $state: EmojiState }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: ${theme.borderRadius.md};
  border: 2px solid transparent;
  background: ${theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1;

  ${(props) => {
    switch (props.$state) {
      case 'default':
        return `
          border-color: ${theme.colors.borderLight};
          
          &:hover:not(:disabled) {
            border-color: ${theme.colors.primary};
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          }
        `;
      case 'wrong':
        return `
          border-color: ${theme.colors.error};
          background: rgba(239, 68, 68, 0.1);
          animation: shake 0.4s ease-in-out;
          pointer-events: none;
        `;
      case 'correct':
        return `
          border-color: ${theme.colors.success};
          background: rgba(34, 197, 94, 0.2);
          pointer-events: none;
          animation: pulse 0.6s ease-out;
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    cursor: not-allowed;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
    }
  }
`;

/**
 * Styled stats container
 */
const Stats = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  width: 100%;
`;

/**
 * Styled stat item
 */
const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  letter-spacing: 1px;
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Find Emoji Challenge Component
 * User must find the target emoji in an 8x8 grid
 */
const FindEmojiChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const gridSize = 8;
  const totalCells = gridSize * gridSize;

  // Select target emoji and create grid
  const [targetEmoji] = useState(
    () => emojiList[Math.floor(Math.random() * emojiList.length)],
  );

  const [grid] = useState<string[]>(() => {
    // Create grid with random emojis
    const newGrid = Array(totalCells)
      .fill(null)
      .map(() => emojiList[Math.floor(Math.random() * emojiList.length)]);

    // Ensure target emoji is in the grid at least once
    const randomIndex = Math.floor(Math.random() * totalCells);
    newGrid[randomIndex] = targetEmoji;

    return newGrid;
  });

  const [clickedIndices, setClickedIndices] = useState<Set<number>>(new Set());
  const [startTime] = useState(() => Date.now());
  const [found, setFound] = useState(false);

  /**
   * Handle emoji click
   */
  const handleEmojiClick = (index: number, emoji: string) => {
    if (found || clickedIndices.has(index)) return;

    const newClicked = new Set(clickedIndices);
    newClicked.add(index);
    setClickedIndices(newClicked);

    if (emoji === targetEmoji) {
      setFound(true);
      const timeSpent = (Date.now() - startTime) / 1000;

      // Score: faster = better
      // Max 100 points, -5 per second
      const score = Math.max(50, 100 - Math.floor(timeSpent * 5));

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1000);
    }
  };

  /**
   * Get emoji state based on click history
   */
  const getEmojiState = (index: number, emoji: string): EmojiState => {
    if (!clickedIndices.has(index)) return 'default';
    if (emoji === targetEmoji) return 'correct';
    return 'wrong';
  };

  return (
    <ChallengeBase
      title="Find Emoji Challenge"
      description="Find the target emoji in the grid"
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
          Find the Emoji!
        </Title>

        <Instruction>Click on this emoji in the grid below:</Instruction>

        <TargetEmojiDisplay
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, -5, 0],
          }}
          transition={{
            scale: { duration: 0.4 },
            opacity: { duration: 0.4 },
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {targetEmoji}
        </TargetEmojiDisplay>

        <EmojiGrid
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {grid.map((emoji, index) => (
            <EmojiCell
              key={index}
              onClick={() => handleEmojiClick(index, emoji)}
              $state={getEmojiState(index, emoji)}
              whileHover={!found && !clickedIndices.has(index) ? { scale: 1.1 } : {}}
              whileTap={!found && !clickedIndices.has(index) ? { scale: 0.9 } : {}}
              disabled={found}
            >
              {emoji}
            </EmojiCell>
          ))}
        </EmojiGrid>

        <Stats
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Stat>
            <StatLabel>Attempts</StatLabel>
            <StatValue
              key={clickedIndices.size}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {clickedIndices.size}
            </StatValue>
          </Stat>
        </Stats>
      </Container>
    </ChallengeBase>
  );
};

export default FindEmojiChallenge;
