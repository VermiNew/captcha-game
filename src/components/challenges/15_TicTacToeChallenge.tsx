import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type CellValue = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

const INITIAL_BOARD: CellValue[] = Array(9).fill(null);

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

const checkWinner = (board: CellValue[]): 'X' | 'O' | null => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as 'X' | 'O';
    }
  }
  return null;
};

const isBoardFull = (board: CellValue[]): boolean => {
  return board.every((cell) => cell !== null);
};

const getAvailableMoves = (board: CellValue[]): number[] => {
  return board.map((cell, idx) => (cell === null ? idx : null)).filter((x) => x !== null) as number[];
};

const getAIMove = (board: CellValue[]): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  if (Math.random() < 0.7) {
    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'O';
      if (checkWinner(testBoard) === 'O') return move;
    }

    for (const move of available) {
      const testBoard = [...board];
      testBoard[move] = 'X';
      if (checkWinner(testBoard) === 'X') return move;
    }

    if (available.includes(4)) return 4;

    const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
  }

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
  max-width: 500px;
  margin: 0 auto;
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
  min-height: 24px;
`;

/**
 * Styled info bar
 */
const InfoBar = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(99, 102, 241, 0.2);
`;

/**
 * Styled player indicator
 */
const PlayerIndicator = styled.div<{ $player: 'X' | 'O' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background: ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(168, 85, 247, 0.1)'};
  border: 1px solid ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(168, 85, 247, 0.3)'};
`;

/**
 * Styled player symbol
 */
const PlayerSymbol = styled.span<{ $player: 'X' | 'O' }>`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) =>
    props.$player === 'X'
      ? '#3B82F6'
      : '#A855F7'};
`;

/**
 * Styled player label
 */
const PlayerLabel = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
`;

/**
 * Styled game board
 */
const GameBoard = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-radius: ${theme.borderRadius.lg};
  aspect-ratio: 1;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), inset 0 0 30px rgba(99, 102, 241, 0.05);
`;

/**
 * Styled cell
 */
const Cell = styled(motion.button)<{ $hasValue: boolean; $isWinning: boolean; $value: CellValue }>`
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background};
  cursor: pointer;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  ${(props) =>
    props.$isWinning
      ? `
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
    border-color: ${theme.colors.success};
    box-shadow: 0 0 20px ${theme.colors.success};
  `
      : props.$hasValue
        ? `
    background: linear-gradient(135deg, 
      ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)'},
      ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)'}
    );
    border-color: ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(168, 85, 247, 0.5)'};
    cursor: default;
  `
        : `
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(168, 85, 247, 0.02));
    
    &:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.95);
    }
  `}
`;

/**
 * Styled cell content (X or O with styling)
 */
const CellContent = styled(motion.span)<{ $player: 'X' | 'O' }>`
  font-size: inherit;
  font-weight: inherit;
  color: ${(props) =>
    props.$player === 'X'
      ? '#3B82F6'
      : '#A855F7'};
  text-shadow: 0 0 10px ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.5)'
      : 'rgba(168, 85, 247, 0.5)'};
`;

/**
 * Styled AI thinking indicator
 */
const AIThinking = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: ${theme.borderRadius.lg};
  color: theme.colors.textSecondary;
`;

/**
 * Styled loading dots
 */
const Dot = styled(motion.span)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #A855F7;
`;

/**
 * Styled result container
 */
const ResultContainer = styled(motion.div)<{ $type: 'win' | 'loss' | 'draw' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  background: linear-gradient(
    135deg,
    ${(props) => {
      switch (props.$type) {
        case 'win':
          return 'rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)';
        case 'loss':
          return 'rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)';
        default:
          return 'rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)';
      }
    }}
  );
  border: 2px solid ${(props) => {
    switch (props.$type) {
      case 'win':
        return theme.colors.success;
      case 'loss':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  box-shadow: 0 0 30px ${(props) => {
    switch (props.$type) {
      case 'win':
        return 'rgba(16, 185, 129, 0.3)';
      case 'loss':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return 'rgba(59, 130, 246, 0.3)';
    }
  }};
`;

/**
 * Styled result emoji
 */
const ResultEmoji = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  margin-bottom: ${theme.spacing.md};
  animation: bounce 0.6s ease-in-out;

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
`;

/**
 * Styled result text
 */
const ResultText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
  color: ${theme.colors.textPrimary};
`;

/**
 * Styled score text
 */
const ScoreText = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.sm} 0 0 0;
`;

/**
 * Tic Tac Toe Challenge Component
 */
const TicTacToeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [board, setBoard] = useState<CellValue[]>(INITIAL_BOARD);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [startTime] = useState(() => Date.now());
  const aiMovePendingRef = useRef(false);

  const makeAIMove = (currentBoard: CellValue[]) => {
    if (aiMovePendingRef.current) return;

    aiMovePendingRef.current = true;
    setIsAIThinking(true);

    setTimeout(() => {
      const moveIndex = getAIMove(currentBoard);

      if (moveIndex === -1) {
        setGameStatus('draw');
        setIsAIThinking(false);
        return;
      }

      const newBoard = [...currentBoard];
      newBoard[moveIndex] = 'O';

      const winner = checkWinner(newBoard);
      if (winner === 'O') {
        setGameStatus('lost');
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
      setIsAIThinking(false);
      aiMovePendingRef.current = false;
    }, 800);
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== null || gameStatus !== 'playing' || aiMovePendingRef.current) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('won');
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
    makeAIMove(newBoard);
  };

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
        <Instruction>
          {gameStatus === 'playing'
            ? isAIThinking
              ? 'AI is thinking...'
              : 'Your turn! Make your move'
            : gameStatus === 'won'
              ? 'You won! 🎉'
              : gameStatus === 'draw'
                ? "It's a draw!"
                : 'AI won this round'}
        </Instruction>

        <InfoBar>
          <PlayerIndicator $player="X">
            <PlayerSymbol $player="X">X</PlayerSymbol>
            <PlayerLabel>You</PlayerLabel>
          </PlayerIndicator>
          <PlayerIndicator $player="O">
            <PlayerSymbol $player="O">O</PlayerSymbol>
            <PlayerLabel>AI</PlayerLabel>
          </PlayerIndicator>
        </InfoBar>

        <GameBoard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {board.map((cell, index) => (
              <Cell
                key={index}
                $hasValue={cell !== null}
                $isWinning={winningCells.includes(index)}
                $value={cell}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || gameStatus !== 'playing' || isAIThinking}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={
                  cell === null && gameStatus === 'playing' && !isAIThinking
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  cell === null && gameStatus === 'playing' && !isAIThinking
                    ? { scale: 0.95 }
                    : {}
                }
              >
                {cell && (
                  <CellContent
                    $player={cell}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    {cell}
                  </CellContent>
                )}
              </Cell>
            ))}
          </AnimatePresence>
        </GameBoard>

        {isAIThinking && (
          <AIThinking
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span>AI thinking</span>
            {[0, 1, 2].map((i) => (
              <Dot
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
              />
            ))}
          </AIThinking>
        )}

        {gameStatus !== 'playing' && (
          <ResultContainer
            $type={
              gameStatus === 'won' ? 'win' : gameStatus === 'draw' ? 'draw' : 'loss'
            }
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <ResultEmoji>
              {gameStatus === 'won' ? '🏆' : gameStatus === 'draw' ? '🤝' : '🤖'}
            </ResultEmoji>
            <ResultText>
              {gameStatus === 'won'
                ? 'You Beat the AI!'
                : gameStatus === 'draw'
                  ? 'Well Played Draw!'
                  : 'AI Victory'}
            </ResultText>
            <ScoreText>
              {gameStatus === 'won'
                ? '+250 points'
                : gameStatus === 'draw'
                  ? '+150 points'
                  : '0 points'}
            </ScoreText>
          </ResultContainer>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default TicTacToeChallenge;
