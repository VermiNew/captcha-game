import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

interface ChessPuzzle {
  id: number;
  figure: string;
  emoji: string;
  possibleMoves: string[];
  description: string;
}

const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 1,
    figure: 'Pawn',
    emoji: '♟️',
    possibleMoves: ['1 square forward', 'Diagonal capture'],
    description: 'This piece can move 1 square forward (2 on first move) and capture diagonally',
  },
  {
    id: 2,
    figure: 'Knight',
    emoji: '♞',
    possibleMoves: ['L-shaped (2+1 squares)', 'Jumps over pieces'],
    description: 'This piece moves in an L-shape and can jump over other pieces',
  },
  {
    id: 3,
    figure: 'Bishop',
    emoji: '♝',
    possibleMoves: ['Diagonal unlimited', 'Only one color'],
    description: 'This piece moves diagonally any number of squares and stays on one color',
  },
  {
    id: 4,
    figure: 'Rook',
    emoji: '♜',
    possibleMoves: ['Horizontal unlimited', 'Vertical unlimited'],
    description: 'This piece moves horizontally or vertically any number of squares',
  },
  {
    id: 5,
    figure: 'Queen',
    emoji: '♛',
    possibleMoves: ['Horizontal', 'Vertical', 'Diagonal'],
    description: 'This piece combines rook and bishop moves',
  },
];

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const PuzzleCard = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const FigureEmoji = styled(motion.div)`
  font-size: 72px;
  margin-bottom: ${theme.spacing.lg};
`;

const Description = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.6;
`;

const MovesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

const MoveButton = styled(motion.button)<{ $selected: boolean }>`
  padding: ${theme.spacing.md};
  background: ${props => props.$selected 
    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
    : theme.colors.surface};
  border: 2px solid ${props => props.$selected 
    ? theme.colors.primary
    : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  color: ${props => props.$selected 
    ? 'white'
    : theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

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

const ChessPuzzleChallenge: React.FC<ChallengeProps> = ({ onComplete }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentPuzzle = useMemo(
    () => CHESS_PUZZLES[currentPuzzleIndex],
    [currentPuzzleIndex]
  );

  const progressPercentage = useMemo(
    () => ((currentPuzzleIndex + 1) / CHESS_PUZZLES.length) * 100,
    [currentPuzzleIndex]
  );

  const handleSubmit = useCallback(() => {
    if (submitted || !selectedMove) return;

    setSubmitted(true);
    const correct = currentPuzzle.possibleMoves.includes(selectedMove);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 200);
    }

    setTimeout(() => {
      if (currentPuzzleIndex < CHESS_PUZZLES.length - 1) {
        setCurrentPuzzleIndex(prev => prev + 1);
        setSelectedMove(null);
        setSubmitted(false);
        setIsCorrect(undefined);
      } else {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, score + (isCorrect ? 200 : 0));
      }
    }, 2000);
  }, [submitted, selectedMove, currentPuzzle, currentPuzzleIndex, score, startTime, isCorrect, onComplete]);

  return (
    <ChallengeBase
      title="♛ Chess Figure Challenge"
      description="Identify the chess figure by its possible moves"
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

        <PuzzleCard
          key={`puzzle-${currentPuzzleIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <FigureEmoji
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 1.5 }}
          >
            {currentPuzzle.emoji}
          </FigureEmoji>
          <Description>{currentPuzzle.description}</Description>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary }}>
            Puzzle {currentPuzzleIndex + 1} of {CHESS_PUZZLES.length}
          </p>
        </PuzzleCard>

        <MovesContainer>
          {currentPuzzle.possibleMoves.map((move) => (
            <MoveButton
              key={move}
              $selected={selectedMove === move}
              onClick={() => !submitted && setSelectedMove(move)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {move}
            </MoveButton>
          ))}
        </MovesContainer>

        <Button
          onClick={handleSubmit}
          disabled={!selectedMove || submitted}
          size="lg"
          variant="primary"
        >
          {submitted ? (isCorrect ? '✓ Correct!' : '✗ Try Next') : 'Submit Answer'}
        </Button>

        <AnimatePresence>
          {submitted && isCorrect !== undefined && (
            <FeedbackMessage
              $success={isCorrect}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {isCorrect ? '🎉 Correct!' : '❌ Not quite right. Try again!'}
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default ChessPuzzleChallenge;
