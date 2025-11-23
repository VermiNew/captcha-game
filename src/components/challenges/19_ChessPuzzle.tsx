import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Chess piece types
 */
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';

/**
 * Represents a chess piece on the board
 */
interface Piece {
  type: PieceType;
  color: PieceColor;
  position: [number, number]; // [row, col]
}

/**
 * Chess puzzle configuration
 */
interface ChessPuzzle {
  name: string;
  description: string;
  pieces: Piece[];
  solution: {
    from: [number, number];
    to: [number, number];
  };
  hint: string;
}

/**
 * Predefined mate-in-1 puzzles with simple positions
 */
const PUZZLES: ChessPuzzle[] = [
  {
    name: 'Back Rank Mate',
    description: 'Deliver checkmate with the queen',
    pieces: [
      { type: 'king', color: 'white', position: [7, 4] },
      { type: 'queen', color: 'white', position: [1, 4] },
      { type: 'king', color: 'black', position: [0, 4] },
      { type: 'pawn', color: 'black', position: [1, 3] },
      { type: 'pawn', color: 'black', position: [1, 5] },
    ],
    solution: {
      from: [1, 4],
      to: [0, 4],
    },
    hint: 'Move the queen straight up to deliver checkmate',
  },
  {
    name: 'Rook Mate',
    description: 'Use the rook to checkmate',
    pieces: [
      { type: 'king', color: 'white', position: [7, 0] },
      { type: 'rook', color: 'white', position: [6, 7] },
      { type: 'king', color: 'black', position: [0, 7] },
      { type: 'pawn', color: 'black', position: [1, 6] },
      { type: 'pawn', color: 'black', position: [1, 7] },
    ],
    solution: {
      from: [6, 7],
      to: [0, 7],
    },
    hint: 'Move the rook up the column to checkmate',
  },
  {
    name: 'Queen & Rook Mate',
    description: 'Coordinate queen and rook for mate',
    pieces: [
      { type: 'king', color: 'white', position: [7, 3] },
      { type: 'queen', color: 'white', position: [2, 0] },
      { type: 'rook', color: 'white', position: [1, 7] },
      { type: 'king', color: 'black', position: [0, 0] },
    ],
    solution: {
      from: [2, 0],
      to: [0, 0],
    },
    hint: 'The queen can deliver the final blow',
  },
  {
    name: 'Corner Trap',
    description: 'Trap the king in the corner',
    pieces: [
      { type: 'king', color: 'white', position: [7, 7] },
      { type: 'queen', color: 'white', position: [2, 6] },
      { type: 'rook', color: 'white', position: [1, 0] },
      { type: 'king', color: 'black', position: [0, 7] },
      { type: 'pawn', color: 'black', position: [1, 6] },
    ],
    solution: {
      from: [1, 0],
      to: [1, 7],
    },
    hint: 'The rook can slide across to deliver mate',
  },
  {
    name: 'Queen Side Mate',
    description: 'Checkmate from the side',
    pieces: [
      { type: 'king', color: 'white', position: [7, 1] },
      { type: 'queen', color: 'white', position: [4, 3] },
      { type: 'king', color: 'black', position: [0, 0] },
      { type: 'rook', color: 'black', position: [1, 0] },
      { type: 'pawn', color: 'black', position: [1, 1] },
    ],
    solution: {
      from: [4, 3],
      to: [0, 3],
    },
    hint: 'Queen to the first rank for checkmate',
  },
];

/**
 * Chess piece Unicode symbols
 */
const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
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
  max-width: 700px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

/**
 * Header section with puzzle info
 */
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Puzzle title with gradient
 */
const PuzzleTitle = styled(motion.h3)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0;
`;

/**
 * Puzzle description
 */
const PuzzleDescription = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Instruction banner
 */
const Instruction = styled(motion.div)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textPrimary};
  text-align: center;
  font-weight: ${theme.fontWeights.semibold};
  width: 100%;
`;

/**
 * Chessboard container
 */
const BoardContainer = styled(motion.div)`
  width: 100%;
  max-width: 512px;
  aspect-ratio: 1;
  border: 4px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  
  @media (max-width: 768px) {
    max-width: 400px;
  }
  
  @media (max-width: 500px) {
    max-width: 320px;
  }
`;

/**
 * Chess board grid
 */
const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  height: 100%;
  position: relative;
`;

/**
 * Individual square on the board
 */
const Square = styled(motion.div)<{ 
  $isLight: boolean; 
  $isSelected: boolean;
  $isValidMove: boolean;
  $isCheckmate: boolean;
}>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$isCheckmate) return 'rgba(34, 197, 94, 0.4)';
    if (props.$isSelected) return 'rgba(99, 102, 241, 0.4)';
    if (props.$isValidMove) return 'rgba(255, 193, 7, 0.3)';
    return props.$isLight ? '#F0D9B5' : '#B58863';
  }};
  cursor: ${props => props.$isValidMove ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    ${props => props.$isValidMove && `
      background: rgba(255, 193, 7, 0.5);
      transform: scale(1.05);
    `}
  }
`;

/**
 * Chess piece display
 */
const PieceDisplay = styled(motion.div)<{ $color: PieceColor }>`
  font-size: clamp(32px, 6vw, 64px);
  line-height: 1;
  cursor: grab;
  user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  
  &:active {
    cursor: grabbing;
  }
`;

/**
 * Valid move indicator dot
 */
const MoveIndicator = styled(motion.div)`
  position: absolute;
  width: 25%;
  height: 25%;
  background: rgba(255, 193, 7, 0.7);
  border-radius: 50%;
  pointer-events: none;
`;

/**
 * Hint card
 */
const HintCard = styled(motion.div)`
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05));
  border-left: 4px solid rgba(255, 193, 7, 0.8);
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

/**
 * Hint label
 */
const HintLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.xs} 0;
  font-weight: ${theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  
  &::before {
    content: '💡 ';
  }
`;

/**
 * Hint text
 */
const HintText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textPrimary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Result display
 */
const ResultCard = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
  background: ${props =>
    props.$success
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))'};
  border: 3px solid ${props => props.$success ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.xl};
  text-align: center;
  color: ${props => props.$success ? theme.colors.success : theme.colors.error};
  font-weight: ${theme.fontWeights.bold};
  width: 100%;
  box-shadow: 0 8px 32px ${props =>
    props.$success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

/**
 * Result emoji
 */
const ResultEmoji = styled.div`
  font-size: ${theme.fontSizes['5xl']};
  margin-bottom: ${theme.spacing.md};
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  @keyframes bounceIn {
    0% { 
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    60% { 
      transform: scale(1.2) rotate(20deg);
      opacity: 1;
    }
    100% { 
      transform: scale(1) rotate(0deg);
    }
  }
`;

/**
 * Result text
 */
const ResultText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

/**
 * Result subtext
 */
const ResultSubtext = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Button container
 */
const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  width: 100%;
`;

/**
 * Move counter display
 */
const MoveCounter = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Chess Puzzle Challenge Component
 * 
 * A simplified chess puzzle where players must find checkmate in one move.
 * Features custom board rendering with 64x64px piece display.
 * 
 * Game mechanics:
 * 1. Select a piece by clicking it (highlights valid moves)
 * 2. Click a highlighted square to move the piece
 * 3. Find the checkmate move to complete the challenge
 * 4. Puzzle selection is random from predefined set
 * 
 * Scoring:
 * - Base: 250 points
 * - Speed bonus: up to +100 points
 * - Move efficiency: penalty for extra moves
 * 
 * Features:
 * - Visual move indicators
 * - Hint system
 * - Reset functionality
 * - Checkmate detection
 * - Responsive design
 */
const ChessPuzzleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Select random puzzle on mount
  const puzzle = useMemo(
    () => PUZZLES[Math.floor(Math.random() * PUZZLES.length)],
    []
  );

  const [pieces, setPieces] = useState<Piece[]>(puzzle.pieces);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(() => Date.now());

  /**
   * Checks if a square is light or dark
   */
  const isLightSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 0;
  };

  /**
   * Gets valid moves for a piece (simplified - only for puzzle pieces)
   */
  const getValidMoves = useCallback((piece: Piece): [number, number][] => {
    const [row, col] = piece.position;
    const moves: [number, number][] = [];

    switch (piece.type) {
      case 'queen':
        // Queen moves in all directions
        for (let i = 0; i < 8; i++) {
          if (i !== row) moves.push([i, col]); // vertical
          if (i !== col) moves.push([row, i]); // horizontal
        }
        // Diagonals
        for (let i = 1; i < 8; i++) {
          if (row + i < 8 && col + i < 8) moves.push([row + i, col + i]);
          if (row + i < 8 && col - i >= 0) moves.push([row + i, col - i]);
          if (row - i >= 0 && col + i < 8) moves.push([row - i, col + i]);
          if (row - i >= 0 && col - i >= 0) moves.push([row - i, col - i]);
        }
        break;

      case 'rook':
        // Rook moves horizontally and vertically
        for (let i = 0; i < 8; i++) {
          if (i !== row) moves.push([i, col]);
          if (i !== col) moves.push([row, i]);
        }
        break;

      case 'king':
        // King moves one square in any direction
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
              moves.push([newRow, newCol]);
            }
          }
        }
        break;

      default:
        break;
    }

    // Filter out moves that would capture own pieces
    return moves.filter(([r, c]) => {
      const pieceAtTarget = pieces.find(
        p => p.position[0] === r && p.position[1] === c
      );
      return !pieceAtTarget || pieceAtTarget.color !== piece.color;
    });
  }, [pieces]);

  /**
   * Handles piece selection
   */
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (isCheckmate) return;

    // Check if clicking on a piece
    const clickedPiece = pieces.find(
      p => p.position[0] === row && p.position[1] === col
    );

    if (clickedPiece && clickedPiece.color === 'white') {
      // Select piece and show valid moves
      setSelectedPiece(clickedPiece);
      setValidMoves(getValidMoves(clickedPiece));
    } else if (selectedPiece) {
      // Check if clicking on valid move
      const isValid = validMoves.some(
        ([r, c]) => r === row && c === col
      );

      if (isValid) {
        // Make the move
        const newPieces = pieces.map(p => {
          if (p === selectedPiece) {
            return { ...p, position: [row, col] as [number, number] };
          }
          return p;
        }).filter(p => {
          // Remove captured pieces
          return !(p.position[0] === row && p.position[1] === col && p !== selectedPiece);
        });

        setPieces(newPieces);
        setMoveCount(prev => prev + 1);
        setSelectedPiece(null);
        setValidMoves([]);

        // Check if this is the solution
        const isSolution =
          selectedPiece.position[0] === puzzle.solution.from[0] &&
          selectedPiece.position[1] === puzzle.solution.from[1] &&
          row === puzzle.solution.to[0] &&
          col === puzzle.solution.to[1];

        if (isSolution) {
          setIsCheckmate(true);
          const timeSpent = (Date.now() - startTime) / 1000;
          const speedBonus = Math.max(0, 100 - Math.floor(timeSpent * 5));
          const movePenalty = Math.max(0, (moveCount) * 20);
          const score = Math.max(100, 250 + speedBonus - movePenalty);

          setTimeout(() => {
            onComplete(true, timeSpent, score);
          }, 2000);
        }
      }
    }
  }, [pieces, selectedPiece, validMoves, isCheckmate, puzzle, startTime, moveCount, getValidMoves, onComplete]);

  /**
   * Resets the puzzle to initial state
   */
  const handleReset = useCallback(() => {
    setPieces(puzzle.pieces);
    setSelectedPiece(null);
    setValidMoves([]);
    setIsCheckmate(false);
    setMoveCount(0);
  }, [puzzle]);

  return (
    <ChallengeBase
      title="Chess Puzzle"
      description="Find checkmate in one move"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        {/* Header */}
        <Header>
          <PuzzleTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {puzzle.name}
          </PuzzleTitle>
          <PuzzleDescription>{puzzle.description}</PuzzleDescription>
        </Header>

        {/* Instruction */}
        <Instruction
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isCheckmate 
            ? '♔ Checkmate! Well played!' 
            : selectedPiece 
              ? 'Click a highlighted square to move' 
              : 'White to move - Click a white piece to begin'}
        </Instruction>

        {/* Move counter */}
        {moveCount > 0 && !isCheckmate && (
          <MoveCounter>Moves made: {moveCount}</MoveCounter>
        )}

        {/* Chessboard */}
        <BoardContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Board>
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => {
                const piece = pieces.find(
                  p => p.position[0] === row && p.position[1] === col
                );
                const isSelected =
                  selectedPiece?.position[0] === row &&
                  selectedPiece?.position[1] === col;
                const isValidMove = validMoves.some(
                  ([r, c]) => r === row && c === col
                );

                return (
                  <Square
                    key={`${row}-${col}`}
                    $isLight={isLightSquare(row, col)}
                    $isSelected={isSelected}
                    $isValidMove={isValidMove}
                    $isCheckmate={isCheckmate && piece?.color === 'black' && piece?.type === 'king'}
                    onClick={() => handleSquareClick(row, col)}
                    whileHover={isValidMove ? { scale: 1.05 } : {}}
                  >
                    {piece && (
                      <PieceDisplay
                        $color={piece.color}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 20,
                        }}
                        whileHover={
                          piece.color === 'white' && !isCheckmate
                            ? { scale: 1.1 }
                            : {}
                        }
                      >
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                      </PieceDisplay>
                    )}
                    {isValidMove && (
                      <MoveIndicator
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      />
                    )}
                  </Square>
                );
              })
            )}
          </Board>
        </BoardContainer>

        {/* Hint */}
        {!isCheckmate && (
          <HintCard
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <HintLabel>Hint</HintLabel>
            <HintText>{puzzle.hint}</HintText>
          </HintCard>
        )}

        {/* Result */}
        <AnimatePresence>
          {isCheckmate && (
            <ResultCard
              $success={true}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <ResultEmoji>♔</ResultEmoji>
              <ResultText>Checkmate!</ResultText>
              <ResultSubtext>Perfect execution in {moveCount} move{moveCount !== 1 ? 's' : ''}!</ResultSubtext>
            </ResultCard>
          )}
        </AnimatePresence>

        {/* Controls */}
        <ButtonContainer>
          <Button
            onClick={handleReset}
            disabled={isCheckmate}
            size="md"
            variant="secondary"
          >
            ↺ Reset Puzzle
          </Button>
        </ButtonContainer>
      </Container>
    </ChallengeBase>
  );
};

export default ChessPuzzleChallenge;