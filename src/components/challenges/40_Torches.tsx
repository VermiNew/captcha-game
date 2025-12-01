import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';
import torchEnabled from '../../assets/torch_enabled.webp';
import torchDisabled from '../../assets/torch_disabled.webp';

/**
 * Torch puzzle data
 */
interface TorchPuzzle {
  id: number;
  hints: string[];
  answer: number[]; // Array of torch indices that should be lit (0-7)
  description: string;
}

const TORCH_PUZZLES: TorchPuzzle[] = [
  {
    id: 1,
    description: 'The Ancient Riddle',
    hints: [
      '🔮 Only the even ones shall glow',
      '⚡ Count them: second, fourth, sixth, eighth',
      '🌙 Not one, not three, not five, not seven',
    ],
    answer: [1, 3, 5, 7], // 0-indexed, so positions 2,4,6,8 (even positions)
  },
  {
    id: 2,
    description: 'The Pattern of Three',
    hints: [
      '🎯 Every third flame must burn bright',
      '🔥 Starting from the beginning: skip two, light one',
      '✨ Three candles dance in the darkness',
    ],
    answer: [2, 5], // Positions 3, 6 (every third)
  },
  {
    id: 3,
    description: 'The Mirror\'s Secret',
    hints: [
      '🪞 The extremes hold the truth',
      '🌟 First and last must burn as one',
      '⭐ Only the edges know the way',
    ],
    answer: [0, 7], // First and last
  },
  {
    id: 4,
    description: 'The Twin Flames',
    hints: [
      '👯 Find the perfect pair in the middle',
      '💫 Two hearts beat as one',
      '🔗 The fourth and fifth are destined',
    ],
    answer: [3, 4], // Middle two (4th and 5th)
  },
];

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * Puzzle info section
 */
const PuzzleInfo = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const PuzzleTitle = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const PuzzleCounter = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Hints section
 */
const HintsSection = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const HintItem = styled(motion.div)`
  padding: ${theme.spacing.md};
  background: rgba(59, 130, 246, 0.08);
  border-left: 4px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textPrimary};
  line-height: 1.6;
`;

/**
 * Torches grid
 */
const TorchesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.background});
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Single torch
 */
const TorchWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

const TorchImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 120px;
`;

const TorchImage = styled(motion.img)<{ $isLit: boolean }>`
  width: 80px;
  height: 120px;
  object-fit: contain;
  filter: ${props => props.$isLit ? 'drop-shadow(0 0 15px rgba(255, 140, 0, 0.9))' : 'none'};
  transition: filter 0.3s ease;
  z-index: 2;

  &:hover {
    filter: ${props => props.$isLit 
      ? 'drop-shadow(0 0 20px rgba(255, 140, 0, 1))'
      : 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.5))'};
  }
`;

/**
 * Smoke particles container
 */
const SmokeContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 120px;
  pointer-events: none;
  z-index: 1;
`;

/**
 * Single smoke particle
 */
const SmokeParticle = styled(motion.div)<{ $delay: number }>`
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(255, 200, 100, 0.6), rgba(255, 150, 50, 0.3));
  border-radius: 50%;
  left: 50%;
  bottom: 90px;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(255, 140, 0, 0.5);
`;

const TorchLabel = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.sm};
`;

/**
 * Action buttons section
 */
const ButtonsSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  justify-content: center;
`;

/**
 * Feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${props => props.$success
    ? 'rgba(16, 185, 129, 0.1)'
    : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$success
    ? theme.colors.success
    : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$success
    ? theme.colors.success
    : theme.colors.error};
`;

const FeedbackIcon = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  margin-bottom: ${theme.spacing.sm};
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.2);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  box-shadow: 0 0 10px ${theme.colors.primary}40;
`;

/**
 * Torch Puzzle Challenge Component
 */
const TorchesChallenge: React.FC<ChallengeProps> = ({ onComplete }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedTorches, setSelectedTorches] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentPuzzle = useMemo(
    () => TORCH_PUZZLES[currentPuzzleIndex],
    [currentPuzzleIndex]
  );

  const progressPercentage = useMemo(
    () => ((currentPuzzleIndex + 1) / TORCH_PUZZLES.length) * 100,
    [currentPuzzleIndex]
  );

  const handleTorchClick = useCallback((index: number) => {
    if (submitted) return;

    setSelectedTorches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;

    setSubmitted(true);
    const selectedArray = Array.from(selectedTorches).sort((a, b) => a - b);
    const correctArray = [...currentPuzzle.answer].sort((a, b) => a - b);

    const correct = 
      selectedArray.length === correctArray.length &&
      selectedArray.every((val, idx) => val === correctArray[idx]);

    setIsCorrect(correct);

    if (correct) {
      const baseScore = 150;
      const puzzleBonus = 50;
      setScore(prev => prev + baseScore + puzzleBonus);
    }

    setTimeout(() => {
      if (currentPuzzleIndex < TORCH_PUZZLES.length - 1) {
        setCurrentPuzzleIndex(prev => prev + 1);
        setSelectedTorches(new Set());
        setSubmitted(false);
        setIsCorrect(undefined);
      } else {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, score + (correct ? 200 : 0));
      }
    }, 2000);
  }, [submitted, selectedTorches, currentPuzzle, currentPuzzleIndex, score, startTime, onComplete]);

  const handleClear = useCallback(() => {
    if (!submitted) {
      setSelectedTorches(new Set());
    }
  }, [submitted]);

  return (
    <ChallengeBase
      title="🔥 Torches of Wisdom"
      description="Solve the ancient torch riddles by lighting the correct flames"
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressBar>
          <ProgressFill
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </ProgressBar>

        <PuzzleInfo
          key={`puzzle-${currentPuzzleIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <PuzzleTitle>{currentPuzzle.description}</PuzzleTitle>
          <PuzzleCounter>
            Puzzle {currentPuzzleIndex + 1} of {TORCH_PUZZLES.length}
          </PuzzleCounter>
        </PuzzleInfo>

        <HintsSection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {currentPuzzle.hints.map((hint, idx) => (
            <HintItem
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              {hint}
            </HintItem>
          ))}
        </HintsSection>

        <TorchesGrid
          key={`torches-${currentPuzzleIndex}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((torchIndex) => (
            <TorchWrapper
              key={torchIndex}
              onClick={() => handleTorchClick(torchIndex)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TorchImageContainer>
                {selectedTorches.has(torchIndex) && (
                  <SmokeContainer>
                    {[0, 1, 2].map((particleIdx) => (
                      <SmokeParticle
                        key={particleIdx}
                        $delay={particleIdx * 0.2}
                        animate={{
                          y: [-80, -150],
                          opacity: [1, 0],
                          x: Math.random() * 40 - 20,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: particleIdx * 0.2,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </SmokeContainer>
                )}
                <TorchImage
                  src={selectedTorches.has(torchIndex) ? torchEnabled : torchDisabled}
                  alt={`Torch ${torchIndex + 1}`}
                  $isLit={selectedTorches.has(torchIndex)}
                  animate={{
                    scale: selectedTorches.has(torchIndex) ? [1, 1.02, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: selectedTorches.has(torchIndex) ? Infinity : 0,
                  }}
                />
              </TorchImageContainer>
              <TorchLabel>{torchIndex + 1}</TorchLabel>
            </TorchWrapper>
          ))}
        </TorchesGrid>

        <ButtonsSection>
          <Button
            onClick={handleClear}
            disabled={submitted}
            size="lg"
            variant="secondary"
          >
            🗑️ Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitted || selectedTorches.size === 0}
            size="lg"
            variant="primary"
          >
            ✓ Check Answer
          </Button>
        </ButtonsSection>

        <AnimatePresence>
          {submitted && isCorrect !== undefined && (
            <FeedbackMessage
              $success={isCorrect}
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FeedbackIcon>
                {isCorrect ? '🎉' : '🔌'}
              </FeedbackIcon>
              <div>
                {isCorrect 
                  ? '✨ Perfect! The riddle is solved!' 
                  : '❌ Not quite right. Try again!'}
              </div>
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default TorchesChallenge;
