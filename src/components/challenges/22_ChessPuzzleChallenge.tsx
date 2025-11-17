import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Chess } from 'chess.js';
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
    name: 'Back Rank Mate',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4',
    solution: 'b1a1', // Example solution
    hint: 'Look for back rank weakness - queen to the back rank',
  },
  {
    name: 'Checkmate Pattern 1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/6RK w - - 0 1',
    solution: 'g1g8', // Rook to g8
    hint: 'Move your rook to deliver checkmate',
  },
  {
    name: 'Queen Mate',
    fen: '6k1/5ppp/8/8/8/8/5PPP/6QK w - - 0 1',
    solution: 'g1g8', // Queen to g8
    hint: 'Queen can deliver mate on the back rank',
  },
  {
    name: 'Rook on 8th Rank',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4',
    solution: 'a1a8', // Rook to a8
    hint: 'Rook to the 8th rank for checkmate',
  },
  {
    name: 'Scholar\'s Mate Setup',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
    solution: 'd1h5', // Queen to h5
    hint: 'Attack f7 for a quick checkmate',
  },
];

/**
 * Piece unicode symbols
 */
const PIECE_SYMBOLS: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

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
  max-width: 400px;
`;

/**
 * Styled chessboard
 */
const ChessBoard = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: #654321;
  border: 3px solid #3d2817;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  padding: 4px;
`;

/**
 * Styled square
 */
const Square = styled(motion.div)<{ $light: boolean; $selected: boolean; $legal: boolean }>`
  aspect-ratio: 1;
  background: ${(props) => {
    if (props.$selected) return '#66bb6a';
    if (props.$legal) return '#90ee90';
    return props.$light ? '#f0d9b5' : '#b58863';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  cursor: ${(props) => (props.$legal || !props.$light ? 'pointer' : 'default')};
  border: ${(props) => (props.$selected || props.$legal ? '2px solid #2e7d32' : 'none')};
  user-select: none;
  transition: all 0.15s ease;

  &:hover {
    transform: ${(props) => (props.$legal ? 'scale(1.08)' : 'scale(1)')};
  }
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
  max-width: 400px;
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
  max-width: 400px;
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
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
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

  const [game, setGame] = useState(() => {
    const g = new Chess(puzzle.fen);
    return g;
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [lastMove, setLastMove] = useState<string>('');

  /**
   * Get legal moves from square (in algebraic notation)
   */
  const getLegalMovesFromSquare = (square: string): string[] => {
    const moves = game.moves({ square, verbose: true });
    return moves.map((m) => m.to);
  };

  /**
   * Handle square click
   */
  const handleSquareClick = (square: string) => {
    // Click same square = deselect
    if (selected === square) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // Click white piece = select it and show legal moves
    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      const moves = getLegalMovesFromSquare(square);
      setSelected(square);
      setLegalMoves(moves);
      return;
    }

    // Click legal move destination
    if (selected && legalMoves.includes(square)) {
      const moveResult = game.move({
        from: selected,
        to: square,
        promotion: 'q',
      });

      if (moveResult) {
        const moveNotation = `${selected}-${square}`;
        setLastMove(moveNotation);
        setSelected(null);
        setLegalMoves([]);

        // Create new game state
        setGame(new Chess(game.fen()));

        // Check if white just moved into checkmate position (puzzle is mate in 1)
        if (game.isCheckmate()) {
          setCompleted(true);
          const timeSpent = (Date.now() - startTime) / 1000;
          setTimeout(() => {
            onComplete(true, timeSpent, 250);
          }, 1500);
        }
      }
    }
  };

  /**
   * Reset puzzle
   */
  const handleReset = () => {
    setGame(new Chess(puzzle.fen));
    setSelected(null);
    setLegalMoves([]);
    setLastMove('');
  };

  if (completed) {
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

        <ChessBoard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Array.from({ length: 64 }).map((_, idx) => {
            const file = idx % 8;
            const rank = 7 - Math.floor(idx / 8);
            const squareIndex = rank * 8 + file;
            const square = String.fromCharCode(97 + file) + (rank + 1);

            const isLight = (file + rank) % 2 === 0;
            const isSelected = selected === square;
            const isLegal = legalMoves.includes(square);
            const piece = game.get(square);

            return (
              <Square
                key={square}
                $light={isLight}
                $selected={isSelected}
                $legal={isLegal}
                onClick={() => handleSquareClick(square)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {piece ? PIECE_SYMBOLS[piece.type === piece.type.toLowerCase() ? piece.type : piece.type.toUpperCase()] || '' : ''}
              </Square>
            );
          })}
        </ChessBoard>

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
