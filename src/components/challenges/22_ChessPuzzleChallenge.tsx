import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Chess piece type
 */
type Piece = 'wK' | 'wQ' | 'wR' | 'wB' | 'wN' | 'wP' | 'bK' | 'bQ' | 'bR' | 'bB' | 'bN' | 'bP' | null;

/**
 * Position on board (0-63)
 */
type Position = number;

/**
 * Chess puzzle definition
 */
interface ChessPuzzle {
  name: string;
  board: Piece[]; // 64 squares
  whiteToMove: true;
  matingMove: { from: Position; to: Position }; // Solution
  hint: string;
}

/**
 * All predefined chess puzzles - mat w 1 ruchu
 */
const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    name: 'Back Rank Mate',
    hint: 'Wieża na ostatnim rzędzie',
    board: Array(64).fill(null).map((_, i) => {
      if (i === 0) return 'wR'; // a1
      if (i === 4) return 'bK'; // e1
      if (i === 8) return 'wK'; // a2
      return null;
    }),
    whiteToMove: true,
    matingMove: { from: 0, to: 4 }, // Ra1-e1#
  },
  {
    name: 'Back Rank Mate 2',
    hint: 'Mata na ostatnim rzędzie przeciwnika',
    board: Array(64).fill(null).map((_, i) => {
      if (i === 56) return 'bK'; // a8
      if (i === 57) return 'bP'; // b8
      if (i === 58) return 'bP'; // c8
      if (i === 48) return 'wR'; // a7
      if (i === 8) return 'wK'; // a2
      return null;
    }),
    whiteToMove: true,
    matingMove: { from: 48, to: 56 }, // Ra7-a8#
  },
  {
    name: 'Queen Checkmate',
    hint: 'Hetmana zablokowana przez własne piony',
    board: Array(64).fill(null).map((_, i) => {
      if (i === 62) return 'bK'; // g8
      if (i === 61) return 'bP'; // f8
      if (i === 60) return 'bP'; // e8
      if (i === 46) return 'wQ'; // g7
      if (i === 8) return 'wK'; // a2
      return null;
    }),
    whiteToMove: true,
    matingMove: { from: 46, to: 62 }, // Qg7-g8#
  },
  {
    name: 'Smothered Mate Setup',
    hint: 'Koń daje mata zablokowanemu królowi',
    board: Array(64).fill(null).map((_, i) => {
      if (i === 62) return 'bK'; // g8
      if (i === 61) return 'bP'; // f8
      if (i === 52) return 'bP'; // e7
      if (i === 45) return 'wN'; // f6
      if (i === 8) return 'wK'; // a2
      return null;
    }),
    whiteToMove: true,
    matingMove: { from: 45, to: 63 }, // Nf6-h7#
  },
  {
    name: 'Two Rooks Mate',
    hint: 'Druga wieża daje mata na pierwszym rzędzie',
    board: Array(64).fill(null).map((_, i) => {
      if (i === 4) return 'bK'; // e1
      if (i === 0) return 'wR'; // a1
      if (i === 1) return 'wR'; // b1
      if (i === 12) return 'wK'; // a3
      return null;
    }),
    whiteToMove: true,
    matingMove: { from: 1, to: 4 }, // Rb1-e1#
  },
];

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
 * Convert position to notation (a1-h8)
 */
const positionToNotation = (pos: Position): string => {
  const file = String.fromCharCode(97 + (pos % 8));
  const rank = Math.floor(pos / 8) + 1;
  return `${file}${rank}`;
};

/**
 * Check if a move is legal for a piece
 */
const isLegalMove = (board: Piece[], from: Position, to: Position): boolean => {
  const piece = board[from];
  if (!piece) return false;

  const fromFile = from % 8;
  const fromRank = Math.floor(from / 8);
  const toFile = to % 8;
  const toRank = Math.floor(to / 8);

  const targetPiece = board[to];

  // Can't capture own piece
  if (targetPiece && targetPiece[0] === piece[0]) return false;

  const type = piece[1];

  switch (type) {
    case 'P': {
      const direction = piece[0] === 'w' ? -1 : 1;
      const startRank = piece[0] === 'w' ? 6 : 1;
      // Pawn moves forward 1 square
      if (fromFile === toFile) {
        if (toRank === fromRank + direction && !board[to]) return true;
        // Pawn moves forward 2 squares from start
        if (
          fromRank === startRank &&
          toRank === fromRank + 2 * direction &&
          !board[from + 8 * direction] &&
          !board[to]
        )
          return true;
      }
      // Pawn captures diagonally
      if (
        Math.abs(fromFile - toFile) === 1 &&
        toRank === fromRank + direction &&
        targetPiece
      )
        return true;
      return false;
    }
    case 'N': {
      const fileDiff = Math.abs(fromFile - toFile);
      const rankDiff = Math.abs(fromRank - toRank);
      return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    }
    case 'B': {
      if (Math.abs(fromFile - toFile) !== Math.abs(fromRank - toRank)) return false;
      // Check path is clear
      const fileDir = toFile > fromFile ? 1 : -1;
      const rankDir = toRank > fromRank ? 1 : -1;
      let curFile = fromFile + fileDir;
      let curRank = fromRank + rankDir;
      while (curFile !== toFile) {
        if (board[curRank * 8 + curFile]) return false;
        curFile += fileDir;
        curRank += rankDir;
      }
      return true;
    }
    case 'R': {
      if (fromFile !== toFile && fromRank !== toRank) return false;
      // Check path is clear
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
    case 'Q': {
      // Queen = Rook + Bishop
      if (fromFile === toFile || fromRank === toRank) {
        // Rook move
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
        // Bishop move
        const fileDir = toFile > fromFile ? 1 : -1;
        const rankDir = toRank > fromRank ? 1 : -1;
        let curFile = fromFile + fileDir;
        let curRank = fromRank + rankDir;
        while (curFile !== toFile) {
          if (board[curRank * 8 + curFile]) return false;
          curFile += fileDir;
          curRank += rankDir;
        }
        return true;
      }
      return false;
    }
    case 'K': {
      return Math.abs(fromFile - toFile) <= 1 && Math.abs(fromRank - toRank) <= 1;
    }
    default:
      return false;
  }
};

/**
 * Check if king is in checkmate
 */
const isCheckmate = (board: Piece[], kingColor: 'w' | 'b'): boolean => {
  // Find king
  const kingPos = board.findIndex((p) => p === `${kingColor}K`);
  if (kingPos === -1) return false;

  // Check if king is under attack
  const isUnderAttack = (pos: Position): boolean => {
    for (let i = 0; i < 64; i++) {
      const piece = board[i];
      if (!piece || piece[0] === kingColor) continue;
      if (isLegalMove(board, i, pos)) return true;
    }
    return false;
  };

  if (!isUnderAttack(kingPos)) return false;

  // Check if king can escape
  const kingFile = kingPos % 8;
  const kingRank = Math.floor(kingPos / 8);

  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const newFile = kingFile + df;
      const newRank = kingRank + dr;
      if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) continue;

      const newPos = newRank * 8 + newFile;
      const target = board[newPos];
      if (target && target[0] === kingColor) continue;

      // Simulate move
      const newBoard = [...board];
      newBoard[kingPos] = null;
      newBoard[newPos] = `${kingColor}K`;

      if (!isUnderAttack(newPos)) return false;
    }
  }

  return true;
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
 * Chessboard grid
 */
const ChessboardContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: #8b7355;
  border: 3px solid #654321;
  padding: 8px;
  gap: 0;
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
`;

/**
 * Single square
 */
const Square = styled(motion.div)<{ $light: boolean; $selected: boolean; $hasLegalMove: boolean }>`
  aspect-ratio: 1;
  background: ${(props) => {
    if (props.$selected) return '#4CAF50';
    if (props.$hasLegalMove) return '#90EE90';
    return props.$light ? '#F0D9B5' : '#B58863';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  cursor: ${(props) => (props.$hasLegalMove ? 'pointer' : 'default')};
  border: 2px solid
    ${(props) => {
      if (props.$selected) return '#2E7D32';
      if (props.$hasLegalMove) return '#228B22';
      return 'transparent';
    }};
  user-select: none;
  transition: all 0.1s ease;
  position: relative;

  &:hover {
    transform: ${(props) => (props.$hasLegalMove ? 'scale(1.05)' : 'scale(1)')};
  }
`;

/**
 * Piece element (draggable)
 */
const PieceElement = styled.div<{ $isDragging: boolean }>`
  font-size: 2.5rem;
  cursor: grab;
  user-select: none;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transition: opacity 0.1s ease;

  &:active {
    cursor: grabbing;
  }
`;

/**
 * Hint section
 */
const HintSection = styled(motion.div)`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-left: 4px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  width: 100%;
`;

/**
 * Hint label
 */
const HintLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-weight: ${theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Hint text
 */
const HintText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.info};
  margin: 0;
`;

/**
 * Feedback message
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
 * Emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Move notation display
 */
const MoveDisplay = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
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

  // Randomly select a puzzle
  const puzzle = useMemo(
    () => CHESS_PUZZLES[Math.floor(Math.random() * CHESS_PUZZLES.length)],
    []
  );

  const [board, setBoard] = useState<Piece[]>(puzzle.board);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [completed, setCompleted] = useState(false);
  const [moveNotation, setMoveNotation] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor)
  );

  /**
   * Get legal moves for a square
   */
  const getLegalMovesForSquare = useCallback(
    (pos: Position): Position[] => {
      const moves: Position[] = [];
      for (let i = 0; i < 64; i++) {
        if (isLegalMove(board, pos, i)) {
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
  const handleSquareClick = (pos: Position) => {
    const piece = board[pos];

    // If clicking same square, deselect
    if (selectedSquare === pos) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // If clicking a white piece, select it
    if (piece && piece[0] === 'w') {
      const moves = getLegalMovesForSquare(pos);
      setSelectedSquare(pos);
      setLegalMoves(moves);
      return;
    }

    // If clicking a legal move destination
    if (selectedSquare !== null && legalMoves.includes(pos)) {
      const fromNotation = positionToNotation(selectedSquare);
      const toNotation = positionToNotation(pos);
      const notation = `${fromNotation}-${toNotation}`;
      setMoveNotation(notation);

      // Make the move
      const newBoard = [...board];
      newBoard[pos] = newBoard[selectedSquare];
      newBoard[selectedSquare] = null;

      setBoard(newBoard);
      setSelectedSquare(null);
      setLegalMoves([]);

      // Check if this is the mating move
      if (
        selectedSquare === puzzle.matingMove.from &&
        pos === puzzle.matingMove.to &&
        isCheckmate(newBoard, 'b')
      ) {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        setTimeout(() => {
          onComplete(true, timeSpent, 250);
        }, 2000);
      }
    }
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
          <FeedbackMessage
            $success={true}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Emoji>♔</Emoji>
            <span>Checkmate! Perfect!</span>
            <MoveDisplay>{moveNotation}</MoveDisplay>
          </FeedbackMessage>
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
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {puzzle.name}
        </Title>

        <Instruction>White to move - Find the checkmate in one move!</Instruction>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
        >
          <ChessboardContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {board.map((piece, pos) => {
              const file = pos % 8;
              const rank = Math.floor(pos / 8);
              const isLight = (file + rank) % 2 === 0;
              const isSelected = selectedSquare === pos;
              const hasLegalMove = legalMoves.includes(pos);

              return (
                <Square
                  key={pos}
                  $light={isLight}
                  $selected={isSelected}
                  $hasLegalMove={hasLegalMove}
                  onClick={() => handleSquareClick(pos)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {piece && <PieceElement $isDragging={false}>{PIECE_SYMBOLS[piece]}</PieceElement>}
                </Square>
              );
            })}
          </ChessboardContainer>
        </DndContext>

        <HintSection
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <HintLabel>💡 Hint</HintLabel>
          <HintText>{puzzle.hint}</HintText>
        </HintSection>

        {moveNotation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%' }}
          >
            <Instruction>Last move: {moveNotation}</Instruction>
          </motion.div>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default ChessPuzzleChallenge;
