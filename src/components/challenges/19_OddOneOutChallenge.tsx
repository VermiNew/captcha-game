import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Category definition
 */
interface Category {
  name: string;
  items: string[];
  oddOne: string;
}

/**
 * Categories with emoji
 */
const CATEGORIES: Category[] = [
  {
    name: 'Fruits',
    items: ['🍎', '🍊', '🍌', '🍇', '🍓', '🍑', '🍒', '🥝'],
    oddOne: '🚗',
  },
  {
    name: 'Animals',
    items: ['🐕', '🐈', '🐎', '🐄', '🐘', '🦁', '🐯', '🦒'],
    oddOne: '🌻',
  },
  {
    name: 'Vehicles',
    items: ['🚗', '🚙', '🚕', '🏎️', '🚓', '🚑', '🚒', '🚐'],
    oddOne: '🍎',
  },
  {
    name: 'Happy Emotions',
    items: ['😀', '😊', '😄', '😁', '😆', '🤣', '😃', '😉'],
    oddOne: '😢',
  },
  {
    name: 'Weather',
    items: ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️'],
    oddOne: '🍕',
  },
  {
    name: 'Sports',
    items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥎'],
    oddOne: '🎸',
  },
  {
    name: 'Food',
    items: ['🍕', '🍔', '🍟', '🌭', '🍿', '🥪', '🌮', '🍱'],
    oddOne: '🚁',
  },
  {
    name: 'Flowers',
    items: ['🌻', '🌷', '🌹', '🌺', '🌸', '💐', '🌼', '🌴'],
    oddOne: '🎸',
  },
];

/**
 * Shuffle array
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

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
 * Styled category label
 */
const CategoryLabel = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled emoji grid
 */
const EmojiGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 360px;
`;

/**
 * Styled emoji cell
 */
const EmojiCell = styled(motion.button)<{ $isCorrect: boolean; $isWrong: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes['4xl']};
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  ${(props) => {
    if (props.$isCorrect) {
      return `
        background: rgba(16, 185, 129, 0.2);
        border-color: ${theme.colors.success};
        box-shadow: 0 0 20px ${theme.colors.success};
        pointer-events: none;
      `;
    }
    if (props.$isWrong) {
      return `
        background: rgba(239, 68, 68, 0.2);
        border-color: ${theme.colors.error};
        box-shadow: 0 0 20px ${theme.colors.error};
        animation: shake 0.4s ease-in-out;
      `;
    }
    return `
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 15px ${theme.colors.primary};
        border-color: ${theme.colors.secondary};
      }

      &:active {
        transform: scale(0.95);
      }
    `;
  }}

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-8px);
    }
    75% {
      transform: translateX(8px);
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
  font-size: ${theme.fontSizes['2xl']};
  line-height: 1;
`;

/**
 * Styled stats
 */
const Stats = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`;

/**
 * Styled stat item
 */
const StatItem = styled.div`
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
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Odd One Out Challenge Component
 * User must find the emoji that doesn't belong
 */
const OddOneOutChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const { category, grid, oddOneIndex } = useMemo(() => {
    const selectedCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const gameGrid = [...selectedCategory.items, selectedCategory.oddOne];
    const shuffled = shuffleArray(gameGrid);
    const oddIndex = shuffled.indexOf(selectedCategory.oddOne);

    return {
      category: selectedCategory,
      grid: shuffled,
      oddOneIndex: oddIndex,
    };
  }, []);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());

  /**
   * Handle emoji click
   */
  const handleEmojiClick = (index: number) => {
    if (selectedIndex !== null || completed) return;

    setSelectedIndex(index);

    const isCorrect = index === oddOneIndex;

    if (isCorrect) {
      setFeedback('success');
      setCompleted(true);

      const timeSpent = (Date.now() - startTime) / 1000;
      const speedBonus = Math.max(0, 50 - Math.floor(timeSpent / 2));
      const score = 100 + speedBonus;

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 2000);
    } else {
      setFeedback('error');
      setTimeout(() => {
        setSelectedIndex(null);
        setFeedback(null);
      }, 800);
    }
  };

  return (
    <ChallengeBase
      title="Odd One Out Challenge"
      description="Find the emoji that doesn't belong"
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
          Spot the Difference!
        </Title>

        <Instruction>
          {feedback === null
            ? 'Click the emoji that doesn\'t belong with the others'
            : feedback === 'success'
              ? 'You found it!'
              : 'Try again!'}
        </Instruction>

        <CategoryLabel
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Category: {category.name}
        </CategoryLabel>

        <EmojiGrid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {grid.map((emoji, index) => (
              <EmojiCell
                key={index}
                $isCorrect={selectedIndex === index && feedback === 'success'}
                $isWrong={selectedIndex === index && feedback === 'error'}
                onClick={() => handleEmojiClick(index)}
                disabled={selectedIndex !== null && selectedIndex !== index}
                whileHover={selectedIndex === null ? { scale: 1.1 } : {}}
                whileTap={selectedIndex === null ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: index * 0.05,
                }}
              >
                <motion.span
                  key={emoji}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  {emoji}
                </motion.span>
              </EmojiCell>
            ))}
          </AnimatePresence>
        </EmojiGrid>

        <AnimatePresence>
          {feedback && (
            <FeedbackMessage
              $success={feedback === 'success'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Emoji>{feedback === 'success' ? '✓' : '✗'}</Emoji>
              <span>
                {feedback === 'success'
                  ? `Correct! "${grid[oddOneIndex]}" doesn't belong`
                  : `That's not right. Try another emoji.`}
              </span>
            </FeedbackMessage>
          )}
        </AnimatePresence>

        {completed && (
          <Stats
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatItem>
              <StatLabel>Category</StatLabel>
              <StatValue>{category.name}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Odd One Out</StatLabel>
              <StatValue style={{ fontSize: theme.fontSizes['2xl'] }}>
                {grid[oddOneIndex]}
              </StatValue>
            </StatItem>
          </Stats>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default OddOneOutChallenge;
