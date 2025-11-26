import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Represents a challenge category with themed items and one outlier
 */
interface Category {
  name: string;
  description: string;
  items: string[];
  oddOne: string;
  hint: string;
}

/**
 * Curated categories with clear thematic groupings
 * Each category has 8 related items and 1 obvious outlier
 */
const CATEGORIES: Category[] = [
  {
    name: 'Fruits',
    description: 'Sweet and healthy foods from nature',
    items: ['🍎', '🍊', '🍌', '🍇', '🍓', '🍑', '🍒', '🥝'],
    oddOne: '🚗',
    hint: 'One of these is not edible',
  },
  {
    name: 'Animals',
    description: 'Living creatures from the animal kingdom',
    items: ['🐕', '🐈', '🐎', '🐄', '🐘', '🦁', '🐯', '🦒'],
    oddOne: '🌻',
    hint: 'One of these is not an animal',
  },
  {
    name: 'Vehicles',
    description: 'Transportation methods on land',
    items: ['🚗', '🚙', '🚕', '🏎️', '🚓', '🚑', '🚒', '🚐'],
    oddOne: '🍎',
    hint: 'One of these cannot drive',
  },
  {
    name: 'Happy Emotions',
    description: 'Positive feelings and expressions',
    items: ['😀', '😊', '😄', '😁', '😆', '🤣', '😃', '😉'],
    oddOne: '😢',
    hint: 'One of these is not a happy emotion',
  },
  {
    name: 'Weather',
    description: 'Natural atmospheric conditions',
    items: ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️'],
    oddOne: '🍕',
    hint: 'One of these is not weather-related',
  },
  {
    name: 'Sports Equipment',
    description: 'Balls used in various sports',
    items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥎'],
    oddOne: '🎸',
    hint: 'One of these is not used in sports',
  },
  {
    name: 'Fast Food',
    description: 'Quick and tasty meal options',
    items: ['🍕', '🍔', '🍟', '🌭', '🍿', '🥪', '🌮', '🍱'],
    oddOne: '🚁',
    hint: 'One of these you cannot eat',
  },
  {
    name: 'Flowers & Plants',
    description: 'Beautiful blooms from gardens',
    items: ['🌻', '🌷', '🌹', '🌺', '🌸', '💐', '🌼', '🏵️'],
    oddOne: '🎸',
    hint: 'One of these does not grow',
  },
  {
    name: 'Sea Creatures',
    description: 'Marine life from the ocean',
    items: ['🐠', '🐟', '🐡', '🦈', '🐙', '🦑', '🦞', '🦀'],
    oddOne: '🦅',
    hint: 'One of these lives in the sky',
  },
  {
    name: 'Musical Instruments',
    description: 'Tools for making beautiful music',
    items: ['🎸', '🎹', '🎺', '🎷', '🥁', '🎻', '🪕', '🎼'],
    oddOne: '⚽',
    hint: 'One of these makes no sound',
  },
];

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 * @param array - Array to shuffle
 * @returns New shuffled array (immutable)
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
 * Main container with centered layout
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

/**
 * Header section with category information
 */
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Main title with gradient effect
 */
const Title = styled(motion.h2)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0;
  
  @media (max-width: 600px) {
    font-size: ${theme.fontSizes['2xl']};
  }
`;

/**
 * Instructional text with icon
 */
const Instruction = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  line-height: 1.5;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Category information card
 */
const CategoryCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.xl};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  width: 100%;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.1), 
      transparent);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    to {
      left: 100%;
    }
  }
`;

/**
 * Category name label
 */
const CategoryName = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.primary};
  margin: 0;
  font-weight: ${theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

/**
 * Category description text
 */
const CategoryDescription = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-align: center;
  font-style: italic;
`;

/**
 * Responsive emoji grid with 3 columns
 */
const EmojiGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 480px;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 600px) {
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    max-width: 400px;
  }
  
  @media (max-width: 400px) {
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
  }
`;

/**
 * Interactive emoji button with state-based styling
 */
const EmojiCell = styled(motion.button)<{ 
  $isCorrect: boolean; 
  $isWrong: boolean;
  $isRevealed: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(3rem, 8vw, 4.5rem);
  border: 3px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.background};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  position: relative;
  overflow: hidden;
  user-select: none;

  ${(props) => {
    if (props.$isCorrect) {
      return `
        background: linear-gradient(135deg, 
          rgba(34, 197, 94, 0.25) 0%, 
          rgba(34, 197, 94, 0.15) 100%);
        border-color: ${theme.colors.success};
        box-shadow: 0 0 30px ${theme.colors.success};
        pointer-events: none;
        animation: successPulse 0.6s ease-out;
        
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15) rotate(5deg); }
        }
      `;
    }
    if (props.$isWrong) {
      return `
        background: linear-gradient(135deg, 
          rgba(239, 68, 68, 0.25) 0%, 
          rgba(239, 68, 68, 0.15) 100%);
        border-color: ${theme.colors.error};
        animation: wrongShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        
        @keyframes wrongShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-10px) rotate(-3deg); }
          75% { transform: translateX(10px) rotate(3deg); }
        }
      `;
    }
    if (props.$isRevealed) {
      return `
        opacity: 0.5;
        pointer-events: none;
      `;
    }
    return `
      &:hover:not(:disabled) {
        transform: translateY(-5px) scale(1.05);
        border-color: ${theme.colors.primary};
        background: linear-gradient(135deg, 
          rgba(99, 102, 241, 0.1) 0%, 
          rgba(139, 92, 246, 0.1) 100%);
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
      }

      &:active:not(:disabled) {
        transform: translateY(-2px) scale(0.98);
      }
    `;
  }}

  &:disabled {
    cursor: not-allowed;
  }
`;

/**
 * Feedback message card with color-coded styling
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.xl};
  border: 3px solid ${(props) => 
    props.$success ? theme.colors.success : theme.colors.error};
  background: ${(props) =>
    props.$success 
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))' 
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08))'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.semibold};
  text-align: center;
  width: 100%;
  box-shadow: 0 8px 32px ${(props) =>
    props.$success 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(239, 68, 68, 0.2)'};
`;

/**
 * Large feedback icon
 */
const FeedbackIcon = styled(motion.span)`
  font-size: ${theme.fontSizes['4xl']};
  line-height: 1;
`;

/**
 * Feedback text content
 */
const FeedbackText = styled.p`
  font-size: ${theme.fontSizes.lg};
  margin: 0;
  line-height: 1.5;
`;

/**
 * Statistics display panel
 */
const Stats = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.08) 0%, 
    rgba(168, 85, 247, 0.08) 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(99, 102, 241, 0.2);
`;

/**
 * Individual stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

/**
 * Stat label text
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

/**
 * Stat value display
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
  line-height: 1;
`;

/**
 * Hint button for assistance
 */
const HintButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.15) 0%, 
    rgba(139, 92, 246, 0.15) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.25) 0%, 
      rgba(139, 92, 246, 0.25) 100%);
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Hint display box
 */
const HintBox = styled(motion.div)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
  width: 100%;
  
  &::before {
    content: '💡 ';
    margin-right: ${theme.spacing.xs};
  }
`;

/**
 * Odd One Out Challenge Component
 * 
 * A pattern recognition challenge where players identify the item that doesn't
 * belong in a themed category. Tests visual discrimination and logical reasoning.
 * 
 * Features:
 * - 10 diverse categories with clear thematic groupings
 * - 3x3 grid layout (9 items total: 8 matching + 1 outlier)
 * - Optional hint system for assistance
 * - Real-time visual feedback on selections
 * - Attempt tracking and time-based scoring
 * - Smooth animations and transitions
 * 
 * Scoring system:
 * - Base score: 100 points
 * - Speed bonus: +50 points (decreases by 2 per second)
 * - Hint penalty: -20 points
 * - Wrong attempt penalty: -10 points per mistake
 * - Minimum score: 20 points
 * 
 * User flow:
 * 1. Category card displays theme and description
 * 2. User examines 9 shuffled emoji items
 * 3. User can request a hint (with score penalty)
 * 4. User clicks on the suspected odd item
 * 5. Visual feedback shows if correct/incorrect
 * 6. On success: celebratory animation and auto-complete
 * 7. On error: shake animation, allow retry
 */
const OddOneOutChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Generate random category and shuffle grid on mount
  const [{ category, grid, oddOneIndex }] = useState(() => {
    const selectedCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const gameGrid = [...selectedCategory.items, selectedCategory.oddOne];
    const shuffled = shuffleArray(gameGrid);
    const oddIndex = shuffled.indexOf(selectedCategory.oddOne);

    return {
      category: selectedCategory,
      grid: shuffled,
      oddOneIndex: oddIndex,
    };
  });

  // Game state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [startTime] = useState(() => Date.now());

  /**
   * Handles emoji selection and validation
   * Provides immediate feedback and manages game state
   */
  const handleEmojiClick = useCallback((index: number) => {
    if (selectedIndex !== null || completed) return;

    setSelectedIndex(index);
    setAttempts(prev => prev + 1);

    const isCorrect = index === oddOneIndex;

    if (isCorrect) {
      setFeedback('success');
      setCompleted(true);

      const timeSpent = (Date.now() - startTime) / 1000;
      
      // Score calculation
      const baseScore = 100;
      const speedBonus = Math.max(0, 50 - Math.floor(timeSpent * 2));
      const hintPenalty = usedHint ? 20 : 0;
      const attemptPenalty = (attempts - 1) * 10; // Don't count current attempt
      const finalScore = Math.max(20, baseScore + speedBonus - hintPenalty - attemptPenalty);

      // Complete challenge after celebration
      setTimeout(() => {
        onComplete(true, timeSpent, finalScore);
      }, 2200);
    } else {
      setFeedback('error');
      
      // Reset for retry
      setTimeout(() => {
        setSelectedIndex(null);
        setFeedback(null);
      }, 1000);
    }
  }, [selectedIndex, completed, oddOneIndex, startTime, usedHint, attempts, onComplete]);

  /**
   * Toggles hint visibility
   */
  const handleHintClick = useCallback(() => {
    setShowHint(true);
    setUsedHint(true);
  }, []);

  return (
    <ChallengeBase
      title="Pattern Recognition"
      description="Identify the item that doesn't belong"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        {/* Header section */}
        <Header>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Find the Odd One Out!
          </Title>

          <Instruction
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {feedback === null
              ? 'Click the item that doesn\'t match the category'
              : feedback === 'success'
                ? '🎉 Perfect! You found it!'
                : '❌ Not quite. Try another one!'}
          </Instruction>
        </Header>

        {/* Category information card */}
        <CategoryCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <CategoryName>{category.name}</CategoryName>
          <CategoryDescription>{category.description}</CategoryDescription>
        </CategoryCard>

        {/* Hint button and display */}
        {!completed && !showHint && (
          <HintButton
            onClick={handleHintClick}
            disabled={usedHint}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            💡 Need a Hint? (−20 points)
          </HintButton>
        )}

        <AnimatePresence>
          {showHint && !completed && (
            <HintBox
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {category.hint}
            </HintBox>
          )}
        </AnimatePresence>

        {/* Emoji grid */}
        <EmojiGrid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {grid.map((emoji, index) => (
            <EmojiCell
              key={index}
              $isCorrect={selectedIndex === index && feedback === 'success'}
              $isWrong={selectedIndex === index && feedback === 'error'}
              $isRevealed={completed && index !== oddOneIndex}
              onClick={() => handleEmojiClick(index)}
              disabled={selectedIndex !== null && selectedIndex !== index}
              whileHover={
                selectedIndex === null && !completed
                  ? { scale: 1.08, y: -6 }
                  : {}
              }
              whileTap={
                selectedIndex === null && !completed
                  ? { scale: 0.95 }
                  : {}
              }
              initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: index * 0.06,
              }}
              aria-label={`Emoji option ${index + 1}: ${emoji}`}
              aria-pressed={selectedIndex === index}
            >
              <motion.span
                animate={
                  selectedIndex === index && feedback === 'success'
                    ? { 
                        scale: [1, 1.3, 1],
                        rotate: [0, 360, 720]
                      }
                    : {}
                }
                transition={{ duration: 0.8 }}
              >
                {emoji}
              </motion.span>
            </EmojiCell>
          ))}
        </EmojiGrid>

        {/* Feedback message */}
        <AnimatePresence>
          {feedback && (
            <FeedbackMessage
              $success={feedback === 'success'}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300,
                damping: 25
              }}
            >
              <FeedbackIcon
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200,
                  delay: 0.1
                }}
              >
                {feedback === 'success' ? '✓' : '✗'}
              </FeedbackIcon>
              <FeedbackText>
                {feedback === 'success'
                  ? `Excellent! "${grid[oddOneIndex]}" is the odd one out!`
                  : `Not quite right. Keep looking!`}
              </FeedbackText>
            </FeedbackMessage>
          )}
        </AnimatePresence>

        {/* Statistics panel */}
        {completed && (
          <Stats
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <StatItem>
              <StatLabel>Category</StatLabel>
              <StatValue
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ fontSize: theme.fontSizes.lg }}
              >
                {category.name}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Odd One</StatLabel>
              <StatValue
                initial={{ scale: 1.5, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ fontSize: theme.fontSizes['3xl'] }}
              >
                {grid[oddOneIndex]}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Attempts</StatLabel>
              <StatValue
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {attempts}
              </StatValue>
            </StatItem>
          </Stats>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default OddOneOutChallenge;