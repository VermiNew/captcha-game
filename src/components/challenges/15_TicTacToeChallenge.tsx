import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Board cell type
 */
type CellValue = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

/**
 * Initial board state
 */
const INITIAL_BOARD: CellValue[] = Array(9).fill(null);

/**
 * Winning combinations
 */
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Check if someone won
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
 * Check if board is full
 */
const isBoardFull = (board: CellValue[]): boolean => {
  return board.every((cell) => cell !== null);
};

/**
 * Get available moves
 */
const getAvailableMoves = (board: CellValue[]): number[] => {
  return board.map((cell, idx) => (cell === null ? idx : null)).filter((x) => x !== null) as number[];
};

/**
 * Simple AI strategy: 70% chance to make smart move, 30% random
 */
const getAIMove = (board: CellValue[]): number => {
  const available = getAvailableMoves(board);

  if (available.length === 0) return -1;

  // 70% chance to play smart, 30% random
  if (Math.random() < 0.7) {
    // Try to win
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'O';
      if (checkWinner(testBoard) === 'O') {
        return move;
      }
    }

    // Try to block player from winning
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'X';
      if (checkWinner(testBoard) === 'X') {
        return move;
      }
    }

    // Prefer center
    if (available.includes(4)) {
      return 4;
    }

    // Prefer corners
    const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
  }

  // Random move
  return available[Math.floor(Math.random() * available.length)];
};

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
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
 * Styled game info
 */
const GameInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`;

/**
 * Styled info item
 */
const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled info label
 */
const InfoLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled info value
 */
const InfoValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled game board
 */
const GameBoard = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  aspect-ratio: 1;
  width: 100%;
  max-width: 360px;
`;

/**
 * Styled cell
 */
const Cell = styled(motion.button)<{ $hasValue: boolean; $isWinning: boolean }>`
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background};
  cursor: pointer;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  ${(props) =>
    props.$isWinning
      ? `
    background: rgba(16, 185, 129, 0.2);
    border-color: ${theme.colors.success};
    box-shadow: 0 0 15px ${theme.colors.success};
  `
      : props.$hasValue
        ? `
    background: rgba(99, 102, 241, 0.1);
    cursor: default;
  `
        : `
    &:hover {
      background: rgba(99, 102, 241, 0.05);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
    }

    &:active {
      transform: scale(0.95);
    }
  `}
`;

/**
 * Styled result message
 */
const ResultMessage = styled(motion.div)<{ $type: 'win' | 'loss' | 'draw' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid
    ${(props) => {
      switch (props.$type) {
        case 'win':
          return theme.colors.success;
        case 'loss':
          return theme.colors.error;
        default:
          return theme.colors.info;
      }
    }};
  background: ${(props) => {
    switch (props.$type) {
      case 'win':
        return 'rgba(16, 185, 129, 0.1)';
      case 'loss':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(59, 130, 246, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case 'win':
        return theme.colors.success;
      case 'loss':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  }};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Styled emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Styled message text
 */
const MessageText = styled.p`
  margin: 0;
  font-size: ${theme.fontSizes.lg};
`;

/**
 * Tic Tac Toe Challenge Component
 * Player vs AI
 */
const TicTacToeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [board, setBoard] = useState<CellValue[]>(INITIAL_BOARD);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [startTime] = useState(() => Date.now());
  const aiMovePendingRef = useRef(false);

  /**
   * Make AI move
   */
  const makeAIMove = (currentBoard: CellValue[]) => {
    if (aiMovePendingRef.current) return;

    aiMovePendingRef.current = true;

    setTimeout(() => {
      const moveIndex = getAIMove(currentBoard);

      if (moveIndex === -1) {
        // No moves available - draw
        setGameStatus('draw');
        return;
      }

      const newBoard = [...currentBoard];
      newBoard[moveIndex] = 'O';

      const winner = checkWinner(newBoard);
      if (winner === 'O') {
        setGameStatus('lost');
        // Find winning cells
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
      aiMovePendingRef.current = false;
    }, 600);
  };

  /**
   * Handle player move
   */
  const handleCellClick = (index: number) => {
    if (board[index] !== null || gameStatus !== 'playing' || aiMovePendingRef.current) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('won');
      // Find winning cells
      for (const combo of WINNING_COMBINATIONS) {
        if (
          newBoard[combo[0]] === 'X' &&
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

    if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setBoard(newBoard);
      return;
    }

    setBoard(newBoard);

    // AI move
    makeAIMove(newBoard);
  };

  /**
   * Handle game end
   */
  useEffect(() => {
    if (gameStatus !== 'playing') {
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = gameStatus === 'won' ? 250 : gameStatus === 'draw' ? 150 : 0;
      const success = gameStatus !== 'lost';

      setTimeout(() => {
        onComplete(success, timeSpent, score);
      }, 2000);
    }
  }, [gameStatus, startTime, onComplete]);

  return (
    <ChallengeBase
      title="Tic Tac Toe Challenge"
      description="Defeat the AI in a game of tic tac toe"
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
          Play Against AI!
        </Title>

        <Instruction>
          {gameStatus === 'playing'
            ? 'You are X, AI is O. Make your move!'
            : gameStatus === 'won'
              ? 'You won! 🎉'
              : gameStatus === 'draw'
                ? "It's a draw!"
                : 'AI won. Better luck next time!'}
        </Instruction>

        <GameInfo>
          <InfoItem>
            <InfoLabel>Your Symbol</InfoLabel>
            <InfoValue>X</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>AI Symbol</InfoLabel>
            <InfoValue>O</InfoValue>
          </InfoItem>
        </GameInfo>

        <GameBoard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {board.map((cell, index) => (
              <Cell
                key={index}
                $hasValue={cell !== null}
                $isWinning={winningCells.includes(index)}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || gameStatus !== 'playing'}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={cell === null && gameStatus === 'playing' ? { scale: 1.05 } : {}}
                whileTap={cell === null && gameStatus === 'playing' ? { scale: 0.95 } : {}}
              >
                {cell && (
                  <motion.span
                    key={`${index}-${cell}`}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 180, scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    {cell}
                  </motion.span>
                )}
              </Cell>
            ))}
          </AnimatePresence>
        </GameBoard>

        {gameStatus !== 'playing' && (
          <ResultMessage
            $type={
              gameStatus === 'won' ? 'win' : gameStatus === 'draw' ? 'draw' : 'loss'
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Emoji>
              {gameStatus === 'won' ? '🏆' : gameStatus === 'draw' ? '🤝' : '😢'}
            </Emoji>
            <MessageText>
              {gameStatus === 'won'
                ? 'Congratulations! You beat the AI!'
                : gameStatus === 'draw'
                  ? 'Well played! It was a tie.'
                  : 'The AI won this round.'}
            </MessageText>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: theme.fontSizes.sm }}>
              {gameStatus === 'won'
                ? '250 points'
                : gameStatus === 'draw'
                  ? '150 points'
                  : '0 points'}
            </p>
          </ResultMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default TicTacToeChallenge;
