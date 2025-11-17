import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Chess piece type
 */
type Piece = 'wK' | 'wQ' | 'wR' | 'wB' | 'wN' | 'wP' | 'bK' | 'bQ' | 'bR' | 'bB' | 'bN' | 'bP' | null;

/**
 * Chess puzzle definition
 */
interface ChessPuzzle {
  name: string;
  description: string;
  board: Piece[];
  solution: { from: number; to: number };
  hint: string;
}

/**
 * Piece unicode symbols
 */
const PIECE_SYMBOLS: Record<Piece, string> = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟',
  null: '',
};

/**
 * Simple chess puzzles (mate in 1)
 */
const PUZZLES: ChessPuzzle[] = [
  {
    name: 'Back Rank Mate',
    description: 'Queen to the back rank',
    board: (() => {
      const b = Array(64).fill(null) as Piece[];
      b[0] = 'bK'; // a1
      b[1] = 'bP'; // b1
      b[2] = 'bP'; // c1
      b[48] = 'wQ'; // a7
      b[56] = 'wK'; // a8
      return b;
    })(),
    solution: { from: 48, to: 0 }, // Qa7-a1#
    hint: 'Queen moves to the back rank for checkmate',
  },
  {
    name: 'Queen Checkmate',
    description: 'Queen delivers mate',
    board: (() => {
      const b = Array(64).fill(null) as Piece[];
      b[62] = 'bK'; // g8
      b[61] = 'bP'; // f8
      b[60] = 'bP'; // e8
      b[46] = 'wQ'; // g7
      b[8] = 'wK'; // a2
      return b;
    })(),
    solution: { from: 46, to: 62 }, // Qg7-g8#
    hint: 'Queen captures on g8 for checkmate',
  },
  {
    name: 'Rook Mate',
    description: 'Rook on first rank',
    board: (() => {
      const b = Array(64).fill(null) as Piece[];
      b[4] = 'bK'; // e1
      b[0] = 'wR'; // a1
      b[12] = 'wK'; // a3
      return b;
    })(),
    solution: { from: 0, to: 4 }, // Ra1-e1#
    hint: 'Rook moves to e1 for checkmate',
  },
  {
    name: 'Two Rooks Mate',
    description: 'Second rook delivers mate',
    board: (() => {
      const b = Array(64).fill(null) as Piece[];
      b[4] = 'bK'; // e1
      b[1] = 'wR'; // b1
      b[9] = 'wR'; // b2
      b[12] = 'wK'; // a3
      return b;
    })(),
    solution: { from: 1, to: 4 }, // Rb1-e1#
    hint: 'Move rook to e1 for checkmate',
  },
  {
    name: 'Knight Mate',
    description: 'Knight delivers smothered mate',
    board: (() => {
      const b = Array(64).fill(null) as Piece[];
      b[62] = 'bK'; // g8
      b[61] = 'bP'; // f8
      b[53] = 'bP'; // f7
      b[37] = 'wN'; // f5
      b[8] = 'wK'; // a2
      return b;
    })(),
    solution: { from: 37, to: 63 }, // Nf5-h7#
    hint: 'Knight to h7 for smothered mate',
  },
];

/**
 * Position to notation (a1-h8)
 */
function posToNotation(pos: number): string {
  const file = String.fromCharCode(97 + (pos % 8));
  const rank = Math.floor(pos / 8) + 1;
  return `${file}${rank}`;
}

/**
 * Check if move is legal (simple path check)
 */
function canMovePiece(board: Piece[], from: number, to: number): boolean {
  if (from === to) return false;

  const piece = board[from];
  if (!piece) return false;

  const fromFile = from % 8;
  const fromRank = Math.floor(from / 8);
  const toFile = to % 8;
  const toRank = Math.floor(to / 8);

  const target = board[to];
  if (target && target[0] === piece[0]) return false; // Can't capture own piece

  const type = piece[1];

  switch (type) {
    case 'Q': {
      // Queen moves like rook or bishop
      if (fromFile === toFile || fromRank === toRank) {
        // Rook-like move - check path
        if (fromFile === toFile) {
          const step = toRank > fromRank ? 1 : -1;
          for (let r = fromRank + step; r !== toRank; r += step) {
            if (board[r * 8 + fromFile]) return false;
          }
        } else {
          const step = toFile > fromFile ? 1 : -1;
          for (let f = fromFile + step; f !== toFile; f += step) {
            if (board[fromRank * 8 + f]) return false;
          }
        }
        return true;
      } else if (Math.abs(fromFile - toFile) === Math.abs(fromRank - toRank)) {
        // Bishop-like move - check diagonal
        const fileDir = toFile > fromFile ? 1 : -1;
        const rankDir = toRank > fromRank ? 1 : -1;
        let f = fromFile + fileDir;
        let r = fromRank + rankDir;
        while (f !== toFile) {
          if (board[r * 8 + f]) return false;
          f += fileDir;
          r += rankDir;
        }
        return true;
      }
      return false;
    }
    case 'R': {
      if (fromFile !== toFile && fromRank !== toRank) return false;
      if (fromFile === toFile) {
        const step = toRank > fromRank ? 1 : -1;
        for (let r = fromRank + step; r !== toRank; r += step) {
          if (board[r * 8 + fromFile]) return false;
        }
      } else {
        const step = toFile > fromFile ? 1 : -1;
        for (let f = fromFile + step; f !== toFile; f += step) {
          if (board[fromRank * 8 + f]) return false;
        }
      }
      return true;
    }
    case 'N': {
      const fileDiff = Math.abs(fromFile - toFile);
      const rankDiff = Math.abs(fromRank - toRank);
      return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    }
    case 'B': {
      if (Math.abs(fromFile - toFile) !== Math.abs(fromRank - toRank)) return false;
      const fileDir = toFile > fromFile ? 1 : -1;
      const rankDir = toRank > fromRank ? 1 : -1;
      let f = fromFile + fileDir;
      let r = fromRank + rankDir;
      while (f !== toFile) {
        if (board[r * 8 + f]) return false;
        f += fileDir;
        r += rankDir;
      }
      return true;
    }
    case 'K': {
      return Math.abs(fromFile - toFile) <= 1 && Math.abs(fromRank - toRank) <= 1;
    }
    case 'P': {
      const dir = piece[0] === 'w' ? -1 : 1;
      if (fromFile === toFile && !target && toRank === fromRank + dir) return true;
      if (Math.abs(fromFile - toFile) === 1 && target && toRank === fromRank + dir) return true;
      return false;
    }
    default:
      return false;
  }
}

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
  cursor: ${(props) => (props.$legal ? 'pointer' : 'default')};
  border: ${(props) => (props.$selected || props.$legal ? '2px solid #2e7d32' : 'none')};
  user-select: none;
  transition: all 0.15s ease;

  &:hover {
    ${(props) => (props.$legal ? 'transform: scale(1.08);' : '')}
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
 * Chess Puzzle Challenge Component
 */
const ChessPuzzleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [startTime] = useState(Date.now());
  const puzzle = useMemo(() => PUZZLES[Math.floor(Math.random() * PUZZLES.length)], []);

  const [board, setBoard] = useState<Piece[]>(puzzle.board);
  const [selected, setSelected] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [lastMove, setLastMove] = useState<string>('');

  /**
   * Get legal moves for position
   */
  const getLegalMoves = useCallback(
    (pos: number): number[] => {
      const moves: number[] = [];
      for (let i = 0; i < 64; i++) {
        if (canMovePiece(board, pos, i)) {
          moves.push(i);
        }
      }
      return moves;
    },
    [board]
  );

  /**
   * Handle square click
   */
  const handleSquareClick = (pos: number) => {
    const piece = board[pos];

    // Click same square = deselect
    if (selected === pos) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // Click white piece = select it
    if (piece && piece[0] === 'w') {
      const moves = getLegalMoves(pos);
      setSelected(pos);
      setLegalMoves(moves);
      return;
    }

    // Click legal move destination
    if (selected !== null && legalMoves.includes(pos)) {
      const newBoard = [...board];
      newBoard[pos] = newBoard[selected];
      newBoard[selected] = null;

      const moveStr = `${posToNotation(selected)}-${posToNotation(pos)}`;
      setLastMove(moveStr);
      setBoard(newBoard);
      setSelected(null);
      setLegalMoves([]);

      // Check if this is the solution
      if (selected === puzzle.solution.from && pos === puzzle.solution.to) {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        setTimeout(() => {
          onComplete(true, timeSpent, 250);
        }, 1500);
      }
    }
  };

  /**
   * Reset board
   */
  const handleReset = () => {
    setBoard([...puzzle.board]);
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

        <ChessBoard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {board.map((piece, pos) => {
            const file = pos % 8;
            const rank = Math.floor(pos / 8);
            const isLight = (file + rank) % 2 === 0;
            const isSelected = selected === pos;
            const isLegal = legalMoves.includes(pos);

            return (
              <Square
                key={pos}
                $light={isLight}
                $selected={isSelected}
                $legal={isLegal}
                onClick={() => handleSquareClick(pos)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {piece ? PIECE_SYMBOLS[piece] : ''}
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
