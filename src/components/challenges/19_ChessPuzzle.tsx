import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
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
  position: [number, number]; // [row, col] with row 0 = top (rank 8)
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
 * NOTE: coordinate system: [0,0] == A8 (top-left). Comments use algebraic just for reference.
 */
const PUZZLES: ChessPuzzle[] = [
  {
    name: 'Northern Pressure',
    description: 'White has a strong position and can finish the game with a precise move.',
    pieces: [
      { type: 'king', color: 'white', position: [7, 4] }, // e1
      { type: 'queen', color: 'white', position: [2, 4] }, // e6
      { type: 'rook', color: 'white', position: [7, 0] }, // a1
      { type: 'king', color: 'black', position: [0, 4] }, // e8
      { type: 'pawn', color: 'black', position: [1, 3] }, // d7
      { type: 'pawn', color: 'black', position: [1, 5] }, // f7
    ],
    solution: {
      from: [2, 4],
      to:   [0, 4],
    },
    hint: 'Look for a direct line toward the opposing king.',
  },

  {
    name: 'Quiet Horizon',
    description: 'A calm but decisive position where one move immediately settles the game.',
    pieces: [
      { type: 'king', color: 'white', position: [7, 7] }, // h1
      { type: 'queen', color: 'white', position: [2, 2] }, // c6
      { type: 'rook', color: 'white', position: [7, 1] }, // b1
      { type: 'king', color: 'black', position: [0, 0] }, // a8
      { type: 'pawn', color: 'black', position: [1, 1] }, // b7
    ],
    solution: {
      from: [2, 2],
      to:   [0, 0],
    },
    hint: 'Consider the diagonal leading to the corner.',
  },

  {
    name: 'Silent Net',
    description: 'The arrangement of pieces forms an invisible net that can be closed instantly.',
    pieces: [
      { type: 'king', color: 'white', position: [7, 7] }, // h1
      { type: 'queen', color: 'white', position: [2, 6] }, // g6
      { type: 'rook', color: 'white', position: [7, 6] }, // g1
      { type: 'king', color: 'black', position: [0, 7] }, // h8
      { type: 'pawn', color: 'black', position: [1, 6] }, // g7
      { type: 'pawn', color: 'black', position: [1, 7] }, // h7
    ],
    solution: {
      from: [2, 6],
      to:   [1, 6],
    },
    hint: 'Look for weaknesses around the defending king.',
  },

  {
    name: 'Edge Closure',
    description: 'A side piece has access to a powerful move that decides the game at once.',
    pieces: [
      { type: 'king', color: 'white', position: [7, 6] }, // g1
      { type: 'bishop', color: 'white', position: [4, 2] }, // c4
      { type: 'rook', color: 'white', position: [7, 5] }, // f1
      { type: 'king', color: 'black', position: [0, 6] }, // g8
      { type: 'pawn', color: 'black', position: [1, 5] }, // f7
      { type: 'pawn', color: 'black', position: [1, 6] }, // g7
      { type: 'pawn', color: 'black', position: [1, 7] }, // h7
    ],
    solution: {
      from: [4, 2],
      to:   [1, 5],
    },
    hint: 'Think about a diagonal move that opens a file.',
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
 * Styles (unchanged) ...
 * (For brevity I keep the same styles as your original file.)
 */
const Container = styled.div`display:flex;flex-direction:column;align-items:center;gap:${theme.spacing.xl};width:100%;max-width:700px;margin:0 auto;padding:${theme.spacing.lg};`;
const Header = styled.div`display:flex;flex-direction:column;align-items:center;gap:${theme.spacing.md};width:100%;`;
const PuzzleTitle = styled(motion.h3)`font-family:${theme.fonts.primary};font-size:${theme.fontSizes['2xl']};font-weight:${theme.fontWeights.bold};background:linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;margin:0;`;
const PuzzleDescription = styled.p`font-family:${theme.fonts.primary};font-size:${theme.fontSizes.md};color:${theme.colors.textSecondary};text-align:center;margin:0;font-weight:${theme.fontWeights.medium};`;
const Instruction = styled(motion.div)`padding:${theme.spacing.md} ${theme.spacing.lg};background:linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));border:2px solid rgba(99, 102, 241, 0.3);border-radius:${theme.borderRadius.lg};font-family:${theme.fonts.primary};font-size:${theme.fontSizes.lg};color:${theme.colors.textPrimary};text-align:center;font-weight:${theme.fontWeights.semibold};width:100%;`;
const BoardContainer = styled(motion.div)`width:100%;max-width:512px;aspect-ratio:1;border:4px solid ${theme.colors.primary};border-radius:${theme.borderRadius.lg};box-shadow:0 10px 40px rgba(0,0,0,0.2);overflow:hidden;background:linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05));@media (max-width:768px){max-width:400px;}@media (max-width:500px){max-width:320px;}`;
const Board = styled.div`display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);width:100%;height:100%;position:relative;`;
const Square = styled(motion.div)<{ $isLight:boolean; $isSelected:boolean; $isValidMove:boolean; $isCheckmate:boolean; }>`width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${props => { if (props.$isCheckmate) return 'rgba(34, 197, 94, 0.6)'; if (props.$isSelected) return 'rgba(99, 102, 241, 0.6)'; if (props.$isValidMove) return 'rgba(34, 197, 94, 0.5)'; return props.$isLight ? '#F0D9B5' : '#B58863'; }};box-shadow:${props => { if (props.$isSelected) return 'inset 0 0 0 3px rgba(99, 102, 241, 0.8)'; if (props.$isValidMove) return 'inset 0 0 0 2px rgba(34, 197, 94, 0.8)'; return 'none'; }};cursor:${props => props.$isValidMove ? 'pointer' : 'default'};transition:all 0.2s ease;position:relative;&:hover{${props => props.$isValidMove && `background: rgba(255, 193, 7, 0.5); transform: scale(1.05);`}}`;

// Make piece glyphs clearly visible on both light and dark squares: use dark glyph for white pieces
const PieceDisplay = styled(motion.div)<{ $color: PieceColor }>`font-size:clamp(32px,6vw,64px);line-height:1;cursor:grab;user-select:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));color:${props => props.$color === 'white' ? '#1a1a1a' : '#ffffff'};text-shadow:${props => props.$color === 'white' ? '0 2px 4px rgba(255,255,255,0.25)' : '0 1px 2px rgba(0,0,0,0.45)'};&:active{cursor:grabbing;}`;
const MoveIndicator = styled(motion.div)`position:absolute;width:25%;height:25%;background:#22c55e;border-radius:50%;pointer-events:none;box-shadow:0 0 8px rgba(34,197,94,0.8), inset 0 0 4px rgba(255,255,255,0.5);border:2px solid rgba(255,255,255,0.6);`;
const HintCard = styled(motion.div)`padding:${theme.spacing.lg};background:linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,193,7,0.05));border-left:4px solid rgba(255,193,7,0.8);border-radius:${theme.borderRadius.lg};width:100%;box-shadow:0 2px 8px rgba(0,0,0,0.05);`;
const HintLabel = styled.p`font-family:${theme.fonts.primary};font-size:${theme.fontSizes.xs};color:${theme.colors.textSecondary};margin:0 0 ${theme.spacing.xs} 0;font-weight:${theme.fontWeights.bold};text-transform:uppercase;letter-spacing:0.8px;&::before{content:'💡 ';}`;
const HintText = styled.p`font-family:${theme.fonts.primary};font-size:${theme.fontSizes.md};color:${theme.colors.textPrimary};margin:0;font-weight:${theme.fontWeights.medium};`;
const ResultCard = styled(motion.div)<{ $success:boolean }>`padding:${theme.spacing.xl} ${theme.spacing['2xl']};background:${props => props.$success ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))' : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'};border:3px solid ${props => props.$success ? theme.colors.success : theme.colors.error};border-radius:${theme.borderRadius.xl};text-align:center;color:${props => props.$success ? theme.colors.success : theme.colors.error};font-weight:${theme.fontWeights.bold};width:100%;box-shadow:0 8px 32px ${props => props.$success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};`;
const ResultEmoji = styled.div`font-size:${theme.fontSizes['5xl']};margin-bottom:${theme.spacing.md};animation:bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);@keyframes bounceIn{0%{transform:scale(0) rotate(-180deg);opacity:0;}60%{transform:scale(1.2) rotate(20deg);opacity:1;}100%{transform:scale(1) rotate(0deg);}}`;
const ResultText = styled.p`font-family:${theme.fonts.primary};font-size:${theme.fontSizes['2xl']};margin:0 0 ${theme.spacing.sm} 0;`;
const ResultSubtext = styled.p`font-family:${theme.fonts.primary};font-size:${theme.fontSizes.md};color:${theme.colors.textSecondary};margin:0;`;
const ButtonContainer = styled.div`display:flex;gap:${theme.spacing.md};justify-content:center;width:100%;`;
const MoveCounter = styled.div`padding:${theme.spacing.md} ${theme.spacing.lg};background:${theme.colors.surface};border-radius:${theme.borderRadius.md};font-family:${theme.fonts.mono};font-size:${theme.fontSizes.sm};color:${theme.colors.textSecondary};font-weight:${theme.fontWeights.semibold};`;

/**
 * Main component
 */
const ChessPuzzleChallenge: React.FC<ChallengeProps> = ({ onComplete, timeLimit, challengeId }) => {
  const [puzzle] = useState(() => PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);

  const [pieces, setPieces] = useState<Piece[]>(puzzle.pieces);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [showHint, setShowHint] = useState(false);

  // show hint after 120 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCheckmate) setShowHint(true);
    }, 120_000); // 120 seconds

    return () => clearTimeout(timer);
  }, [isCheckmate]);

  const isLightSquare = (row: number, col: number): boolean => (row + col) % 2 === 0;

  const getValidMoves = useCallback((piece: Piece): [number, number][] => {
    // helper: stopper-aware sliding moves
    const addSliding = (moves: [number, number][], row:number, col:number, dr:number, dc:number, piece:Piece) => {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const blocking = pieces.find(p => p.position[0] === r && p.position[1] === c);
        if (!blocking) {
          moves.push([r,c]);
        } else {
          if (blocking.color !== piece.color) moves.push([r,c]);
          break; // stop sliding when encountering any piece
        }
        r += dr;
        c += dc;
      }
    };

    const [row, col] = piece.position;
    const moves: [number, number][] = [];

    switch (piece.type) {
      case 'queen': {
        // 8 directions
        const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        for (const [dr, dc] of dirs) addSliding(moves, row, col, dr, dc, piece);
        break;
      }

      case 'rook': {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dr, dc] of dirs) addSliding(moves, row, col, dr, dc, piece);
        break;
      }

      case 'bishop': {
        const dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
        for (const [dr, dc] of dirs) addSliding(moves, row, col, dr, dc, piece);
        break;
      }

      case 'king': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const p = pieces.find(p => p.position[0] === r && p.position[1] === c);
              if (!p || p.color !== piece.color) moves.push([r,c]);
            }
          }
        }
        break;
      }

      // other pieces: knights/pawns are not used in these puzzles, leave fallback
      default:
        break;
    }

    return moves;
  }, [pieces]);

  const handleSquareClick = useCallback((row:number, col:number) => {
    if (isCheckmate || moveCount > 0) return; // allow only one move for mate-in-1 puzzles

    const clickedPiece = pieces.find(p => p.position[0] === row && p.position[1] === col);

    if (clickedPiece && clickedPiece.color === 'white') {
      setSelectedPiece(clickedPiece);
      setValidMoves(getValidMoves(clickedPiece));
    } else if (selectedPiece) {
      const isValid = validMoves.some(([r,c]) => r === row && c === col);
      if (!isValid) return;

      // Build new pieces: capture if exists and move selected
      const newPieces = pieces
        .filter(p => !(p.position[0] === row && p.position[1] === col))
        .map(p => {
          if (p.position[0] === selectedPiece.position[0] && p.position[1] === selectedPiece.position[1] && p.color === selectedPiece.color && p.type === selectedPiece.type) {
            return { ...p, position: [row, col] as [number, number] };
          }
          return p;
        });

      setPieces(newPieces);
      setMoveCount(prev => prev + 1);
      setSelectedPiece(null);
      setValidMoves([]);

      // After the move, check if it was the designed solution
      const wasSolution =
        selectedPiece.position[0] === puzzle.solution.from[0] &&
        selectedPiece.position[1] === puzzle.solution.from[1] &&
        row === puzzle.solution.to[0] &&
        col === puzzle.solution.to[1];

      if (wasSolution) {
        setIsCheckmate(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const speedBonus = Math.max(0, 100 - Math.floor(timeSpent * 5));
        const movePenalty = Math.max(0, (moveCount) * 20);
        const score = Math.max(100, 250 + speedBonus - movePenalty);

        setTimeout(() => onComplete(true, timeSpent, score), 1000);
      }
    }
  }, [pieces, selectedPiece, validMoves, isCheckmate, moveCount, getValidMoves, puzzle, startTime, onComplete]);

  const handleReset = useCallback(() => {
    setPieces(puzzle.pieces);
    setSelectedPiece(null);
    setValidMoves([]);
    setIsCheckmate(false);
    setMoveCount(0);
    setShowHint(false);
  }, [puzzle]);

  return (
    <ChallengeBase title="Chess Puzzle" description="Find checkmate in one move" timeLimit={timeLimit} challengeId={challengeId} onComplete={onComplete} hideTimer>
      <Timer timeLimit={timeLimit} />
      <Container>
        <Header>
          <PuzzleTitle initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>{puzzle.name}</PuzzleTitle>
          <PuzzleDescription>{puzzle.description}</PuzzleDescription>
        </Header>

        <Instruction initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          {isCheckmate ? '♔ Checkmate! Well played!' : selectedPiece ? 'Click a highlighted square to move' : 'White to move - Click a white piece to begin'}
        </Instruction>

        {moveCount > 0 && !isCheckmate && (<MoveCounter>Moves made: {moveCount}</MoveCounter>)}

        <BoardContainer initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Board>
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => {
                const piece = pieces.find(p => p.position[0] === row && p.position[1] === col);
                const isSelected = selectedPiece?.position[0] === row && selectedPiece?.position[1] === col;
                const isValidMove = validMoves.some(([r,c]) => r === row && c === col);

                return (
                  <Square key={`${row}-${col}`} $isLight={isLightSquare(row, col)} $isSelected={!!isSelected} $isValidMove={!!isValidMove} $isCheckmate={isCheckmate && !!piece && piece.color === 'black' && piece.type === 'king'} onClick={() => handleSquareClick(row, col)} whileHover={isValidMove ? { scale: 1.05 } : {}}>
                    {piece && (
                      <PieceDisplay $color={piece.color} initial={{ scale: 0, rotate: -180, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.3 }} whileHover={piece.color === 'white' && !isCheckmate ? { scale: 1.15, filter: 'brightness(1.1)' } : {}}>
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                      </PieceDisplay>
                    )}
                    {isValidMove && (<MoveIndicator initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} />)}
                  </Square>
                );
              })
            )}
          </Board>
        </BoardContainer>

        {!isCheckmate && showHint && (
          <HintCard initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <HintLabel>Hint</HintLabel>
            <HintText>{puzzle.hint}</HintText>
          </HintCard>
        )}

        <AnimatePresence>
          {isCheckmate && (
            <ResultCard $success={true} initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <ResultEmoji>♔</ResultEmoji>
              <ResultText>Checkmate!</ResultText>
              <ResultSubtext>Perfect execution in {moveCount} move{moveCount !== 1 ? 's' : ''}!</ResultSubtext>
            </ResultCard>
          )}
        </AnimatePresence>

        <ButtonContainer>
          <Button onClick={handleReset} disabled={moveCount === 0 && !isCheckmate} size="md" variant={moveCount > 0 ? 'primary' : 'secondary'}>↺ Reset Puzzle</Button>
        </ButtonContainer>
      </Container>
    </ChallengeBase>
  );
};

export default ChessPuzzleChallenge;
