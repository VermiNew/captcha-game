import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
import { theme } from '../../styles/theme';

type CellValue = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';
type RoundStatus = 'in-progress' | 'complete';

const INITIAL_BOARD: CellValue[] = Array(9).fill(null);

/**
 * All possible winning combinations on a tic-tac-toe board
 */
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

/**
 * Checks if there's a winner on the current board state
 * @param board - Current board configuration
 * @returns 'X', 'O', or null if no winner
 */
const checkWinner = (board: CellValue[]): 'X' | 'O' | null => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as 'X' | 'O';
    }
  }
  return null;
};

/**
 * Checks if the board is completely filled (no empty cells)
 */
const isBoardFull = (board: CellValue[]): boolean => {
  return board.every((cell) => cell !== null);
};

/**
 * Returns an array of indices for all empty cells on the board
 */
const getAvailableMoves = (board: CellValue[]): number[] => {
  return board.map((cell, idx) => (cell === null ? idx : null)).filter((x) => x !== null) as number[];
};

/**
 * Implements minimax algorithm for optimal AI play
 * Used in Round 1 to ensure AI wins or draws
 * @param board - Current board state
 * @param isMaximizing - Whether current move is for maximizing player (AI)
 * @returns Best score for the position
 */
const minimax = (board: CellValue[], isMaximizing: boolean): number => {
  const winner = checkWinner(board);
  
  if (winner === 'O') return 10; // AI wins
  if (winner === 'X') return -10; // Player wins
  if (isBoardFull(board)) return 0; // Draw
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    const available = getAvailableMoves(board);
    
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'O';
      const score = minimax(testBoard, false);
      bestScore = Math.max(score, bestScore);
    }
    
    return bestScore;
  } else {
    let bestScore = Infinity;
    const available = getAvailableMoves(board);
    
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'X';
      const score = minimax(testBoard, true);
      bestScore = Math.min(score, bestScore);
    }
    
    return bestScore;
  }
};

/**
 * Gets the optimal AI move using minimax algorithm (Hard difficulty)
 * Used in Round 1 - AI plays perfectly
 */
const getOptimalAIMove = (board: CellValue[]): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    const testBoard = [...board];
    testBoard[move] = 'O';
    const score = minimax(testBoard, false);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

/**
 * Gets a medium-difficulty AI move with strategic play but occasional mistakes
 * Used in Round 2 - gives player better chance to win
 * - 70% chance of making optimal move
 * - 30% chance of making suboptimal move
 */
const getMediumAIMove = (board: CellValue[]): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // 70% chance to play optimally, 30% chance to make a mistake
  const playOptimally = Math.random() < 0.7;

  if (playOptimally) {
    // Try to win immediately if possible
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'O';
      if (checkWinner(testBoard) === 'O') return move;
    }

    // Block player's winning move
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'X';
      if (checkWinner(testBoard) === 'X') return move;
    }

    // Take center if available
    if (available.includes(4)) return 4;

    // Take a corner
    const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
  }

  // Random move (either suboptimal play or fallback)
  return available[Math.floor(Math.random() * available.length)];
};

/**
 * Main container with responsive layout
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

/**
 * Round progress indicator showing which round is active
 */
const RoundCounter = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
`;

/**
 * Individual round indicator with completion state
 */
const RoundIndicator = styled(motion.div)<{ $completed: boolean; $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => 
    props.$completed 
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
      : props.$active
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
        : 'transparent'};
  border: 2px solid ${(props) => 
    props.$completed 
      ? theme.colors.success 
      : props.$active
        ? theme.colors.primary
        : theme.colors.borderLight};
  transition: all 0.3s ease;
  position: relative;
  min-width: 120px;
  
  ${(props) => props.$active && `
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  `}
`;

/**
 * Round number badge
 */
const RoundBadge = styled.div<{ $completed: boolean; $active: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.xl};
  background: ${(props) => 
    props.$completed 
      ? theme.colors.success 
      : props.$active
        ? theme.colors.primary
        : theme.colors.surface};
  color: ${(props) => 
    props.$completed || props.$active 
      ? 'white' 
      : theme.colors.textSecondary};
  box-shadow: ${(props) => 
    props.$completed 
      ? `0 0 15px ${theme.colors.success}` 
      : props.$active
        ? `0 0 15px ${theme.colors.primary}`
        : 'none'};
`;

/**
 * Round difficulty label
 */
const RoundLabel = styled.span<{ $active: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) => props.$active ? theme.colors.primary : theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Instructional text with dynamic content
 */
const Instruction = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  min-height: 32px;
  font-weight: ${theme.fontWeights.medium};
  line-height: 1.5;
`;

/**
 * Player turn indicator bar
 */
const InfoBar = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
`;

/**
 * Individual player indicator with active state styling
 */
const PlayerIndicator = styled(motion.div)<{ $player: 'X' | 'O'; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) =>
    props.$player === 'X'
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))'
      : 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))'};
  border: 3px solid ${(props) => {
    if (!props.$active) return 'transparent';
    return props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.6)'
      : 'rgba(168, 85, 247, 0.6)';
  }};
  box-shadow: ${(props) => 
    props.$active 
      ? props.$player === 'X'
        ? '0 0 25px rgba(59, 130, 246, 0.4)'
        : '0 0 25px rgba(168, 85, 247, 0.4)'
      : 'none'
  };
  transition: all 0.3s ease;
  transform: ${(props) => props.$active ? 'scale(1.05)' : 'scale(1)'};
`;

/**
 * Player symbol (X or O) with glow effect
 */
const PlayerSymbol = styled.span<{ $player: 'X' | 'O' }>`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) =>
    props.$player === 'X'
      ? '#3B82F6'
      : '#A855F7'};
  text-shadow: ${(props) =>
    props.$player === 'X'
      ? '0 0 15px rgba(59, 130, 246, 0.6)'
      : '0 0 15px rgba(168, 85, 247, 0.6)'};
  line-height: 1;
`;

/**
 * Player name label
 */
const PlayerLabel = styled.span`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Animated turn indicator arrow
 */
const TurnArrow = styled(motion.span)`
  font-size: ${theme.fontSizes['2xl']};
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

/**
 * Game board grid container
 */
const GameBoard = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 3px solid rgba(99, 102, 241, 0.4);
  border-radius: ${theme.borderRadius.xl};
  aspect-ratio: 1;
  width: 100%;
  max-width: 450px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15), 
    inset 0 0 50px rgba(99, 102, 241, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
    border-radius: ${theme.borderRadius.xl};
    pointer-events: none;
  }
  
  @media (max-width: 600px) {
    max-width: 380px;
    padding: ${theme.spacing.lg};
    gap: ${theme.spacing.sm};
  }
`;

/**
 * Individual board cell with state-based styling
 */
const Cell = styled(motion.button)<{ $hasValue: boolean; $isWinning: boolean; $value: CellValue }>`
  border: 3px solid rgba(99, 102, 241, 0.4);
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background};
  cursor: pointer;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 110px;

  ${(props) =>
    props.$isWinning
      ? `
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.2));
    border-color: ${theme.colors.success};
    box-shadow: 0 0 35px ${theme.colors.success};
    animation: winningPulse 1.5s ease-in-out infinite;
  `
      : props.$hasValue
        ? `
    background: linear-gradient(135deg, 
      ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'},
      ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(168, 85, 247, 0.08)'}
    );
    border-color: ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(168, 85, 247, 0.7)'};
    cursor: default;
  `
        : `
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
      border-color: rgba(59, 130, 246, 0.8);
      box-shadow: 0 0 25px rgba(59, 130, 246, 0.3);
      transform: translateY(-4px);
    }

    &:active:not(:disabled) {
      transform: scale(0.95) translateY(0);
    }
  `}

  &:disabled {
    cursor: not-allowed;
  }

  @keyframes winningPulse {
    0%, 100% {
      box-shadow: 0 0 25px ${theme.colors.success};
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 45px ${theme.colors.success};
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 600px) {
    min-height: 90px;
    font-size: ${theme.fontSizes['3xl']};
  }
`;

/**
 * Styled cell content (X or O symbol)
 */
const CellContent = styled(motion.span)<{ $player: 'X' | 'O' }>`
  font-size: inherit;
  font-weight: inherit;
  color: ${(props) =>
    props.$player === 'X'
      ? '#3B82F6'
      : '#A855F7'};
  text-shadow: 0 0 20px ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.8)'
      : 'rgba(168, 85, 247, 0.8)'};
  filter: drop-shadow(0 6px 12px ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.5)'
      : 'rgba(168, 85, 247, 0.5)'});
`;

/**
 * Statistics display bar
 */
const StatsBar = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.08) 0%, 
    rgba(168, 85, 247, 0.08) 100%);
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
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
const StatLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Stat value display
 */
const StatValue = styled(motion.span)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  line-height: 1;
`;

/**
 * AI thinking indicator with animated dots
 */
const AIThinking = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1));
  border: 2px solid rgba(168, 85, 247, 0.5);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.25);
`;

/**
 * Animated loading dot
 */
const Dot = styled(motion.span)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #A855F7;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.8);
`;

/**
 * Round result display container
 */
const ResultContainer = styled(motion.div)<{ $type: 'win' | 'loss' | 'draw' }>`
  padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
  border-radius: ${theme.borderRadius.xl};
  text-align: center;
  background: linear-gradient(
    135deg,
    ${(props) => {
      switch (props.$type) {
        case 'win':
          return 'rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)';
        case 'loss':
          return 'rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1)';
        default:
          return 'rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)';
      }
    }}
  );
  border: 3px solid ${(props) => {
    switch (props.$type) {
      case 'win':
        return theme.colors.success;
      case 'loss':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  box-shadow: 0 10px 40px ${(props) => {
    switch (props.$type) {
      case 'win':
        return 'rgba(34, 197, 94, 0.4)';
      case 'loss':
        return 'rgba(239, 68, 68, 0.4)';
      default:
        return 'rgba(59, 130, 246, 0.4)';
    }
  }};
  width: 100%;
`;

/**
 * Result emoji with bounce animation
 */
const ResultEmoji = styled.div`
  font-size: ${theme.fontSizes['5xl']};
  margin-bottom: ${theme.spacing.md};
  animation: bounceIn 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  @keyframes bounceIn {
    0% { 
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    60% { 
      transform: scale(1.25) rotate(20deg);
      opacity: 1;
    }
    100% { 
      transform: scale(1) rotate(0deg);
    }
  }
`;

/**
 * Result message text
 */
const ResultText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.textPrimary};
  line-height: 1.3;
`;

/**
 * Secondary result information
 */
const ResultSubtext = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Tic Tac Toe Challenge Component
 * 
 * A two-round strategic challenge where players face an AI opponent with varying difficulty:
 * 
 * Round 1 (Hard): AI uses minimax algorithm for optimal play. Designed to let AI win
 * to demonstrate the challenge level and teach players strategic thinking.
 * 
 * Round 2 (Medium): AI plays with 70% optimal moves and 30% suboptimal moves,
 * giving players a fair chance to win through strategic play.
 * 
 * Features:
 * - Adaptive AI difficulty across rounds
 * - Visual feedback for winning combinations
 * - Real-time turn indicators
 * - Move tracking and statistics
 * - Smooth animations and transitions
 * - Responsive design for all screen sizes
 * 
 * Scoring:
 * - Win Round 1: 200 points
 * - Win Round 2: 200 points
 * - Maximum possible: 400 points
 * - Player needs at least 1 win to pass the challenge
 * 
 * User flow:
 * 1. Round 1 starts with hard AI (player likely loses but learns)
 * 2. After round completes, automatic transition to Round 2
 * 3. Round 2 with medium AI (player has good chance to win)
 * 4. Challenge completes after both rounds
 * 5. Success requires winning at least one round
 */
const TicTacToeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const TOTAL_ROUNDS = 2;

  // Game state
  const [currentRound, setCurrentRound] = useState(1);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>('in-progress');
  const [board, setBoard] = useState<CellValue[]>(INITIAL_BOARD);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [roundResults, setRoundResults] = useState<('won' | 'lost' | 'draw')[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const aiMovePendingRef = useRef(false);

  /**
   * Determines which AI algorithm to use based on current round
   * Round 1: Hard AI (minimax) - designed for AI to win
   * Round 2: Medium AI - player has fair chance
   */
  const getAIMoveForCurrentRound = useCallback((board: CellValue[]): number => {
    if (currentRound === 1) {
      return getOptimalAIMove(board); // Hard difficulty
    } else {
      return getMediumAIMove(board); // Medium difficulty
    }
  }, [currentRound]);

  /**
   * Calculates final score based on wins
   * 200 points per won round
   */
  const calculateScore = useCallback((wins: number): number => {
    return wins * 200;
  }, []);

  /**
   * Executes AI move with visual delay for better UX
   * Shows thinking indicator and updates board after delay
   */
  const makeAIMove = useCallback((currentBoard: CellValue[]) => {
    if (aiMovePendingRef.current) return;

    aiMovePendingRef.current = true;
    setIsAIThinking(true);

    // Simulate AI "thinking" time for better user experience
    setTimeout(() => {
      const moveIndex = getAIMoveForCurrentRound(currentBoard);

      if (moveIndex === -1) {
        setGameStatus('draw');
        setIsAIThinking(false);
        aiMovePendingRef.current = false;
        return;
      }

      const newBoard = [...currentBoard];
      newBoard[moveIndex] = 'O';

      // Check if AI won
      const winner = checkWinner(newBoard);
      if (winner === 'O') {
        setGameStatus('lost');
        // Find and highlight winning combination
        for (const combo of WINNING_COMBINATIONS) {
          if (
            newBoard[combo[0]] === 'O' &&
            newBoard[combo[1]] === 'O' &&
            newBoard[combo[2]] === 'O'
          ) {
            setWinningCells(combo);
            break;
          }
        }
      } else if (isBoardFull(newBoard)) {
        setGameStatus('draw');
      }

      setBoard(newBoard);
      setMoveCount(prev => prev + 1);
      setIsAIThinking(false);
      aiMovePendingRef.current = false;
    }, 800);
  }, [getAIMoveForCurrentRound]);

  /**
   * Handles player's cell selection
   * Validates move, checks for win/draw, and triggers AI response
   */
  const handleCellClick = useCallback((index: number) => {
    if (board[index] !== null || gameStatus !== 'playing' || aiMovePendingRef.current) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setMoveCount(prev => prev + 1);

    // Check if player won
    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('won');
      // Find and highlight winning combination
      for (const combo of WINNING_COMBINATIONS) {
        if (newBoard[combo[0]] === 'X' &&
          newBoard[combo[1]] === 'X' &&
          newBoard[combo[2]] === 'X'
        ) {
          setWinningCells(combo);
          break;
        }
      }
      setBoard(newBoard);
      return;
    }

    // Check for draw
    if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setBoard(newBoard);
      return;
    }

    // Continue game - trigger AI move
    setBoard(newBoard);
    makeAIMove(newBoard);
  }, [board, gameStatus, makeAIMove]);

  /**
   * Advances to next round or completes the challenge
   * Resets board state and prepares for next round
   */
  const nextRound = useCallback((result?: 'won' | 'lost' | 'draw') => {
    const updatedResults = result ? [...roundResults, result] : roundResults;
    
    if (currentRound < TOTAL_ROUNDS) {
      // Start next round
      setRoundStatus('complete');
      setCurrentRound(currentRound + 1);
      setBoard(INITIAL_BOARD);
      setGameStatus('playing');
      setWinningCells([]);
      setIsAIThinking(false);
      setMoveCount(0);
      setRoundStatus('in-progress');
      setRoundResults(updatedResults);
      aiMovePendingRef.current = false;
    } else {
      // Challenge complete - calculate final results
      const wins = updatedResults.filter(r => r === 'won').length;
      const score = calculateScore(wins);
      const timeSpent = (Date.now() - startTime) / 1000;
      const success = wins >= 1; // Need at least 1 win to pass

      setRoundResults(updatedResults);
      setTimeout(() => {
        onComplete(success, timeSpent, score);
      }, 500);
    }
  }, [currentRound, roundResults, startTime, calculateScore, onComplete]);

  /**
   * Monitors game status and handles round completion
   * Automatically progresses to next round after delay
   */
  useEffect(() => {
    if (gameStatus !== 'playing') {
      // Progress to next round after showing result
      const timer = setTimeout(() => {
        nextRound(gameStatus as 'won' | 'lost' | 'draw');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, nextRound]);

  /**
   * Determines if it's currently the player's turn
   */
  const isPlayerTurn = useMemo(() => {
    return gameStatus === 'playing' && !isAIThinking;
  }, [gameStatus, isAIThinking]);

  /**
   * Gets difficulty label for current round
   */
  const getRoundDifficulty = (round: number): string => {
    return round === 1 ? 'Hard Mode' : 'Medium Mode';
  };

  return (
    <ChallengeBase
      title="Tic Tac Toe Challenge"
      description="Face the AI in two strategic rounds"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      hideTimer
    >
      <Timer timeLimit={timeLimit} />
      <Container>
        {/* Round progress indicator */}
        <RoundCounter>
          {Array.from({ length: TOTAL_ROUNDS }).map((_, idx) => {
            const roundNumber = idx + 1;
            const isCompleted = idx < currentRound - 1 || (idx === currentRound - 1 && roundStatus === 'complete');
            const isActive = idx === currentRound - 1;
            
            return (
              <RoundIndicator
                key={idx}
                $completed={isCompleted}
                $active={isActive}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15, type: 'spring', stiffness: 200 }}
              >
                <RoundBadge $completed={isCompleted} $active={isActive}>
                  {isCompleted ? '✓' : roundNumber}
                </RoundBadge>
                <RoundLabel $active={isActive}>
                  {getRoundDifficulty(roundNumber)}
                </RoundLabel>
              </RoundIndicator>
            );
          })}
        </RoundCounter>

        {/* Dynamic instruction text */}
        <AnimatePresence mode="wait">
          <Instruction
            key={`${gameStatus}-${isAIThinking}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            {gameStatus === 'playing'
              ? isAIThinking
                ? 'AI is calculating the best move...'
                : 'Your turn! Click an empty cell to place your X'
              : gameStatus === 'won'
              ? '🎉 Victory! You outsmarted the AI!'
              : gameStatus === 'draw'
                ? '🤝 Draw! Both players played well!'
                : '🤖 AI wins this round. Try again!'}
          </Instruction>
        </AnimatePresence>

        {/* Player turn indicators */}
        <InfoBar>
          <PlayerIndicator $player="X" $active={isPlayerTurn}>
            <PlayerSymbol $player="X">X</PlayerSymbol>
            <PlayerLabel>You</PlayerLabel>
          </PlayerIndicator>
          
          <TurnArrow
            animate={{ 
              x: isPlayerTurn ? [-3, 3] : [3, -3],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              repeatType: 'reverse' 
            }}
          >
            {isPlayerTurn ? '👈' : '👉'}
          </TurnArrow>
          
          <PlayerIndicator $player="O" $active={!isPlayerTurn && gameStatus === 'playing'}>
            <PlayerSymbol $player="O">O</PlayerSymbol>
            <PlayerLabel>AI</PlayerLabel>
          </PlayerIndicator>
        </InfoBar>

        {/* Game statistics */}
        <StatsBar>
          <StatItem>
            <StatLabel>Round Wins</StatLabel>
            <StatValue
              key={`wins-${roundResults.filter(r => r === 'won').length}`}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {roundResults.filter(r => r === 'won').length}/{currentRound - (roundStatus === 'in-progress' ? 1 : 0)}
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Moves</StatLabel>
            <StatValue
              key={`moves-${moveCount}`}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350 }}
            >
              {moveCount}
            </StatValue>
          </StatItem>
        </StatsBar>

        {/* Game board */}
        <GameBoard
          initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ 
            duration: 0.6, 
            type: 'spring', 
            stiffness: 180,
            damping: 20
          }}
        >
          {board.map((cell, index) => (
            <Cell
              key={`${currentRound}-${index}`}
              $hasValue={cell !== null}
              $isWinning={winningCells.includes(index)}
              $value={cell}
              onClick={() => handleCellClick(index)}
              disabled={cell !== null || gameStatus !== 'playing' || isAIThinking}
              initial={{ opacity: 0, scale: 0.3, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20,
                delay: index * 0.04 
              }}
              whileHover={
                cell === null && gameStatus === 'playing' && !isAIThinking
                  ? { scale: 1.08, y: -4, rotate: 2 }
                  : {}
              }
              whileTap={
                cell === null && gameStatus === 'playing' && !isAIThinking
                  ? { scale: 0.92, rotate: -2 }
                  : {}
              }
              aria-label={`Cell ${index + 1}${cell ? `, filled with ${cell}` : ', empty'}`}
              aria-pressed={cell !== null}
              aria-disabled={cell !== null || gameStatus !== 'playing' || isAIThinking}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <CellContent
                    $player={cell}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0, rotate: 180 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 260, 
                      damping: 18 
                    }}
                  >
                    {cell}
                  </CellContent>
                )}
              </AnimatePresence>
            </Cell>
          ))}
        </GameBoard>

        {/* AI thinking indicator */}
        <AnimatePresence>
          {isAIThinking && (
            <AIThinking
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <span>AI thinking</span>
              {[0, 1, 2].map((i) => (
                <Dot
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ 
                    duration: 0.7, 
                    delay: i * 0.12, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </AIThinking>
          )}
        </AnimatePresence>

        {/* Round result display */}
        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <ResultContainer
              $type={
                gameStatus === 'won' ? 'win' : gameStatus === 'draw' ? 'draw' : 'loss'
              }
              initial={{ opacity: 0, scale: 0.7, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -40 }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 22 
              }}
            >
              <ResultEmoji>
                {gameStatus === 'won' ? '🏆' : gameStatus === 'draw' ? '🤝' : '🤖'}
              </ResultEmoji>
              <ResultText>
                {gameStatus === 'won'
                  ? 'Excellent Strategy!'
                  : gameStatus === 'draw'
                    ? "It's a Tie!"
                    : 'AI Wins This Round'}
              </ResultText>
              <ResultSubtext>
                {currentRound < TOTAL_ROUNDS
                  ? `Advancing to Round ${currentRound + 1}...`
                  : `Challenge Complete! Final Score: ${calculateScore(roundResults.filter(r => r === 'won').length)} points`}
              </ResultSubtext>
            </ResultContainer>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default TicTacToeChallenge;