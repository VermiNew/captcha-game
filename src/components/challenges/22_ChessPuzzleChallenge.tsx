import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Chess puzzle definition
 */
interface ChessPuzzle {
  name: string;
  fen: string;
  solution: string; // In UCI format: e2e4
  hint: string;
}

/**
 * Predefined chess puzzles (mate in 1)
 */
const PUZZLES: ChessPuzzle[] = [
  {
    name: 'Rook Mate I',
    fen: '6k1/5ppk/6p1/8/8/5P2/5RPK w - - 0 1',
    solution: 'f2f8',
    hint: 'Move rook to f8 for checkmate',
  },
  {
    name: 'Queen Mate I',
    fen: '6k1/5pp1/8/8/8/5Q2/5KP1 w - - 0 1',
    solution: 'f3f8',
    hint: 'Queen to f8 delivers mate',
  },
  {
    name: 'Back Rank Mate',
    fen: '6k1/5ppp/8/8/8/8/5Q1K w - - 0 1',
    solution: 'f2f8',
    hint: 'Checkmate on the back rank',
  },
  {
    name: 'Knight Fork Mate',
    fen: '6k1/5ppp/8/8/8/6N1/5KPP w - - 0 1',
    solution: 'g3f5',
    hint: 'Knight moves to deliver checkmate',
  },
  {
    name: 'Rook and Pawn Mate',
    fen: '6k1/5ppp/5P2/8/8/8/R5K w - - 0 1',
    solution: 'a1a8',
    hint: 'Rook to a8 for mate',
  },
  {
    name: 'Queen Back Rank',
    fen: '5rk1/5ppp/8/8/8/8/4Q2K w - - 0 1',
    solution: 'e2e8',
    hint: 'Queen to e8 checkmate',
  },
];

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
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
  max-width: 500px;
`;

/**
 * Styled chessboard container
 */
const ChessBoardContainer = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled hint
 */
const Hint = styled(motion.div)`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-left: 4px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  max-width: 500px;
`;

/**
 * Styled hint label
 */
const HintLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-weight: ${theme.fontWeights.bold};
  text-transform: uppercase;
`;

/**
 * Styled hint text
 */
const HintText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.info};
  margin: 0;
`;

/**
 * Styled result
 */
const Result = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  width: 100%;
  max-width: 500px;
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  width: 100%;
`;

/**
 * Styled puzzle info
 */
const PuzzleInfo = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  text-align: center;
`;

/**
 * Chess Puzzle Challenge Component
 */
const ChessPuzzleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [startTime] = useState(Date.now());
  const puzzle = useMemo(() => PUZZLES[Math.floor(Math.random() * PUZZLES.length)], []);

  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [completedPuzzle, setCompletedPuzzle] = useState(false);
  const [lastMove, setLastMove] = useState<string>('');

  /**
   * Handle move on board
   */
  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (completedPuzzle) return false;

      try {
        const moveResult = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });

        if (!moveResult) return false;

        const moveUCI = `${sourceSquare}${targetSquare}`;
        setLastMove(moveUCI);
        setGame(new Chess(game.fen()));

        // Check if puzzle is solved (checkmate)
        if (game.isCheckmate()) {
          setCompletedPuzzle(true);
          const timeSpent = (Date.now() - startTime) / 1000;
          setTimeout(() => {
            onComplete(true, timeSpent, 250);
          }, 1500);
        }

        return true;
      } catch {
        return false;
      }
    },
    [game, completedPuzzle, startTime, onComplete]
  );

  /**
   * Reset puzzle
   */
  const handleReset = () => {
    setGame(new Chess(puzzle.fen));
    setLastMove('');
    setCompletedPuzzle(false);
  };

  if (completedPuzzle) {
    return (
      <ChallengeBase
        title="Chess Puzzle Challenge"
        description="Find the checkmate in one move"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <Container>
          <Result
            $success={true}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div style={{ fontSize: theme.fontSizes['3xl'], marginBottom: theme.spacing.md }}>
              ♔ Checkmate!
            </div>
            <div>Perfect move: {lastMove}</div>
          </Result>
        </Container>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Chess Puzzle Challenge"
      description="Find the checkmate in one move"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instruction>White to move - Find mate in one move!</Instruction>

        <PuzzleInfo>{puzzle.name}</PuzzleInfo>

        <ChessBoardContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            arePiecesDraggable={!completedPuzzle}
            boardWidth={500}
            showBoardNotation={true}
          />
        </ChessBoardContainer>

        <Hint initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <HintLabel>Hint</HintLabel>
          <HintText>{puzzle.hint}</HintText>
        </Hint>

        {lastMove && <Instruction>Last move: {lastMove}</Instruction>}

        <ButtonContainer>
          <Button onClick={handleReset} disabled={false} size="md" variant="secondary">
            Reset
          </Button>
        </ButtonContainer>
      </Container>
    </ChallengeBase>
  );
};

export default ChessPuzzleChallenge;
