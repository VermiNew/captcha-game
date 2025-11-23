import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Curated emoji list with distinct, recognizable emojis
 * Organized by categories for better visual diversity
 */
const emojiList = [
  // Happy emotions
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  // Love & affection
  '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  // Playful
  '😋', '😛', '😜', '🤪', '😝',
  // Cool & quirky
  '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  // Neutral & skeptical
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
  // Tired & sick
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  // Woozy
  '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯',
  // Special characters
  '🤠', '🥳', '😎', '🤓', '🧐',
  // Sad
  '😕', '😟', '🙁',
];

/**
 * Represents the state of an emoji cell in the grid
 */
type EmojiState = 'default' | 'wrong' | 'correct';

/**
 * Main container with responsive layout and smooth spacing
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

/**
 * Header section with instructions
 */
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Main title with gradient text effect
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
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &::before {
    content: '👆';
    font-size: ${theme.fontSizes.xl};
  }
`;

/**
 * Elegant card displaying the target emoji with subtle animations
 */
const TargetCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 100%);
  border: 3px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(255, 255, 255, 0.1) 50%, 
      transparent 70%);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 12px 48px rgba(99, 102, 241, 0.2);
  }
`;

/**
 * Large target emoji display
 */
const TargetEmoji = styled(motion.div)`
  font-size: clamp(5rem, 15vw, 9rem);
  text-align: center;
  line-height: 1;
  position: relative;
  z-index: 1;
  user-select: none;
`;

/**
 * Responsive emoji grid with smooth layout
 */
const EmojiGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    grid-template-columns: repeat(6, 1fr);
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(5, 1fr);
    gap: ${theme.spacing.xs};
  }
`;

/**
 * Interactive emoji button with state-based styling and animations
 */
const EmojiCell = styled(motion.button)<{ $state: EmojiState }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  border-radius: ${theme.borderRadius.lg};
  border: 2.5px solid;
  background: ${theme.colors.background};
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1;
  position: relative;
  overflow: hidden;

  /* State-based styling */
  ${(props) => {
    switch (props.$state) {
      case 'default':
        return `
          border-color: ${theme.colors.borderLight};
          
          &:hover:not(:disabled) {
            border-color: ${theme.colors.primary};
            background: rgba(99, 102, 241, 0.05);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'wrong':
        return `
          border-color: ${theme.colors.error};
          background: rgba(239, 68, 68, 0.12);
          animation: wrongShake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
          pointer-events: none;
        `;
      case 'correct':
        return `
          border-color: ${theme.colors.success};
          background: linear-gradient(135deg, 
            rgba(34, 197, 94, 0.2) 0%, 
            rgba(34, 197, 94, 0.3) 100%);
          pointer-events: none;
          animation: correctPulse 0.6s ease-out;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Success ripple effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.3);
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  @keyframes wrongShake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    20% { transform: translateX(-8px) rotate(-2deg); }
    40% { transform: translateX(8px) rotate(2deg); }
    60% { transform: translateX(-8px) rotate(-2deg); }
    80% { transform: translateX(8px) rotate(2deg); }
  }

  @keyframes correctPulse {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.15);
    }
    50% {
      transform: scale(1.05) rotate(5deg);
    }
    75% {
      transform: scale(1.15) rotate(-5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }
`;

/**
 * Statistics panel with elegant design
 */
const StatsPanel = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    ${theme.colors.surface} 0%, 
    ${theme.colors.background} 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  @media (max-width: 480px) {
    gap: ${theme.spacing.lg};
  }
`;

/**
 * Individual stat display
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

/**
 * Stat label with uppercase styling
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textSecondary};
  margin: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

/**
 * Animated stat value with color coding
 */
const StatValue = styled(motion.p)<{ $isError?: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$isError ? theme.colors.error : theme.colors.primary};
  margin: 0;
  line-height: 1;
`;

/**
 * Success message overlay
 */
const SuccessOverlay = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(34, 197, 94, 0.95);
  color: white;
  padding: ${theme.spacing['2xl']} ${theme.spacing['3xl']};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  z-index: 1000;
  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.4);
  text-align: center;
`;

/**
 * Find Emoji Challenge Component
 * 
 * An engaging visual search challenge where users must locate a target emoji
 * within a grid of similar emojis. Tests visual recognition and reaction time.
 * 
 * Features:
 * - Responsive grid layout (8x8 on desktop, 6x6 on tablet, 5x5 on mobile)
 * - Real-time attempt tracking
 * - Smooth animations for feedback (correct/incorrect clicks)
 * - Score calculation based on speed and accuracy
 * - Accessible keyboard navigation
 * 
 * User flow:
 * 1. User sees target emoji in highlighted card
 * 2. User scans grid to find matching emoji
 * 3. User clicks on emoji they believe is correct
 * 4. Visual feedback shows if correct (green pulse) or wrong (red shake)
 * 5. On correct selection, success message appears and challenge completes
 * 6. Score calculated based on time taken and number of attempts
 */
const FindEmojiChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Grid configuration
  const gridSize = 8;
  const totalCells = gridSize * gridSize;

  // State management
  const [targetEmoji] = useState(() => 
    emojiList[Math.floor(Math.random() * emojiList.length)]
  );

  const [grid] = useState<string[]>(() => {
    // Generate grid with random emojis
    const newGrid = Array(totalCells)
      .fill(null)
      .map(() => emojiList[Math.floor(Math.random() * emojiList.length)]);

    // Ensure target emoji appears at least once
    const randomIndex = Math.floor(Math.random() * totalCells);
    newGrid[randomIndex] = targetEmoji;

    return newGrid;
  });

  const [clickedIndices, setClickedIndices] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [found, setFound] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Handles emoji cell click interaction
   * Validates selection and updates game state accordingly
   */
  const handleEmojiClick = useCallback((index: number, emoji: string) => {
    if (found || clickedIndices.has(index)) return;

    const newClicked = new Set(clickedIndices);
    newClicked.add(index);
    setClickedIndices(newClicked);

    if (emoji === targetEmoji) {
      // Correct selection
      setFound(true);
      setShowSuccess(true);
      
      const timeSpent = (Date.now() - startTime) / 1000;
      
      // Score calculation: base 100 points
      // -5 points per second elapsed
      // -10 points per wrong attempt
      const timeDeduction = Math.floor(timeSpent * 5);
      const attemptDeduction = wrongAttempts * 10;
      const score = Math.max(20, 100 - timeDeduction - attemptDeduction);

      // Complete challenge after celebration animation
      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1500);
    } else {
      // Wrong selection
      setWrongAttempts(prev => prev + 1);
    }
  }, [found, clickedIndices, targetEmoji, startTime, wrongAttempts, onComplete]);

  /**
   * Determines visual state of emoji cell based on interaction history
   */
  const getEmojiState = useCallback((index: number, emoji: string): EmojiState => {
    if (!clickedIndices.has(index)) return 'default';
    if (emoji === targetEmoji) return 'correct';
    return 'wrong';
  }, [clickedIndices, targetEmoji]);

  return (
    <ChallengeBase
      title="Visual Search Challenge"
      description="Test your observation skills by finding the target emoji"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        {/* Header with title and instructions */}
        <Header>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Find the Matching Emoji!
          </Title>

          <Instruction
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Locate this emoji in the grid below
          </Instruction>
        </Header>

        {/* Target emoji display card */}
        <TargetCard
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          <TargetEmoji
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {targetEmoji}
          </TargetEmoji>
        </TargetCard>

        {/* Interactive emoji grid */}
        <EmojiGrid
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {grid.map((emoji, index) => (
            <EmojiCell
              key={index}
              onClick={() => handleEmojiClick(index, emoji)}
              $state={getEmojiState(index, emoji)}
              whileHover={
                !found && !clickedIndices.has(index)
                  ? { scale: 1.12, rotate: 5 }
                  : {}
              }
              whileTap={
                !found && !clickedIndices.has(index)
                  ? { scale: 0.92 }
                  : {}
              }
              disabled={found}
              aria-label={`Emoji option ${index + 1}`}
              aria-pressed={clickedIndices.has(index)}
            >
              {emoji}
            </EmojiCell>
          ))}
        </EmojiGrid>

        {/* Statistics panel */}
        <StatsPanel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <StatItem>
            <StatLabel>Total Clicks</StatLabel>
            <StatValue
              key={`total-${clickedIndices.size}`}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {clickedIndices.size}
            </StatValue>
          </StatItem>
          
          <StatItem>
            <StatLabel>Mistakes</StatLabel>
            <StatValue
              $isError={wrongAttempts > 0}
              key={`wrong-${wrongAttempts}`}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {wrongAttempts}
            </StatValue>
          </StatItem>
        </StatsPanel>

        {/* Success celebration overlay */}
        <AnimatePresence>
          {showSuccess && (
            <SuccessOverlay
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
            >
              🎉 Perfect Match! 🎉
            </SuccessOverlay>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default FindEmojiChallenge;