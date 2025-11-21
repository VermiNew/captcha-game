import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type CellValue = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';
type RoundStatus = 'in-progress' | 'complete';

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

/**
 * Check if there's a winner on the board
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
 * Check if board is completely filled
 */
const isBoardFull = (board: CellValue[]): boolean => {
  return board.every((cell) => cell !== null);
};

/**
 * Get all available empty cells
 */
const getAvailableMoves = (board: CellValue[]): number[] => {
  return board.map((cell, idx) => (cell === null ? idx : null)).filter((x) => x !== null) as number[];
};

/**
 * Get AI move - medium difficulty (smart defensive play)
 */
const getAIMove = (board: CellValue[]): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // Win if possible
  for (const move of available) {
    const testBoard = [...board];
    testBoard[move] = 'O';
    if (checkWinner(testBoard) === 'O') return move;
  }

  // Block player's win
  for (const move of available) {
    const testBoard = [...board];
    testBoard[move] = 'X';
    if (checkWinner(testBoard) === 'X') return move;
  }

  // Take center if available
  if (available.includes(4)) return 4;

  // Take corners
  const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
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
 * Styled round counter
 */
const RoundCounter = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid rgba(99, 102, 241, 0.2);
`;

const RoundIndicator = styled(motion.div)<{ $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  background: ${(props) => props.$completed ? theme.colors.success : theme.colors.surface};
  border: 2px solid ${(props) => props.$completed ? theme.colors.success : theme.colors.border};
  color: ${(props) => props.$completed ? 'white' : theme.colors.textPrimary};
  box-shadow: ${(props) => props.$completed ? `0 0 10px ${theme.colors.success}` : 'none'};
`;

/**
 * Styled instruction
 */
const Instruction = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  min-height: 28px;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled info bar
 */
const InfoBar = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid rgba(99, 102, 241, 0.2);
`;

/**
 * Styled player indicator
 */
const PlayerIndicator = styled(motion.div)<{ $player: 'X' | 'O'; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background: ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(168, 85, 247, 0.1)'};
  border: 2px solid ${(props) => {
    if (!props.$active) return 'transparent';
    return props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.5)'
      : 'rgba(168, 85, 247, 0.5)';
  }};
  box-shadow: ${(props) => 
    props.$active 
      ? props.$player === 'X'
        ? '0 0 20px rgba(59, 130, 246, 0.3)'
        : '0 0 20px rgba(168, 85, 247, 0.3)'
      : 'none'
  };
  transition: all 0.3s ease;
`;

/**
 * Styled player symbol
 */
const PlayerSymbol = styled.span<{ $player: 'X' | 'O' }>`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) =>
    props.$player === 'X'
      ? '#3B82F6'
      : '#A855F7'};
  text-shadow: ${(props) =>
    props.$player === 'X'
      ? '0 0 10px rgba(59, 130, 246, 0.5)'
      : '0 0 10px rgba(168, 85, 247, 0.5)'};
`;

/**
 * Styled player label
 */
const PlayerLabel = styled.span`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Turn indicator arrow
 */
const TurnArrow = styled(motion.span)`
  font-size: ${theme.fontSizes.xl};
`;

/**
 * Styled game board
 */
const GameBoard = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
  border: 3px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.xl};
  aspect-ratio: 1;
  width: 100%;
  max-width: 400px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15), 
    inset 0 0 40px rgba(99, 102, 241, 0.1);
`;

/**
 * Styled cell with enhanced visuals
 */
const Cell = styled(motion.button)<{ $hasValue: boolean; $isWinning: boolean; $value: CellValue }>`
  border: 3px solid rgba(99, 102, 241, 0.3);
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
  transition: all 0.2s ease;
  min-height: 100px;

  ${(props) =>
    props.$isWinning
      ? `
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.15));
    border-color: ${theme.colors.success};
    box-shadow: 0 0 30px ${theme.colors.success};
    animation: winPulse 1s ease-in-out infinite;
  `
      : props.$hasValue
        ? `
    background: linear-gradient(135deg, 
      ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)'},
      ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)'}
    );
    border-color: ${props.$value === 'X' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(168, 85, 247, 0.6)'};
    cursor: default;
  `
        : `
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(168, 85, 247, 0.03));
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
      transform: translateY(-3px);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }
  `}

  @keyframes winPulse {
    0%, 100% {
      box-shadow: 0 0 20px ${theme.colors.success};
    }
    50% {
      box-shadow: 0 0 40px ${theme.colors.success};
    }
  }
`;

/**
 * Styled cell content
 */
const CellContent = styled(motion.span)<{ $player: 'X' | 'O' }>`
  font-size: inherit;
  font-weight: inherit;
  color: ${(props) =>
    props.$player === 'X'
      ? '#3B82F6'
      : '#A855F7'};
  text-shadow: 0 0 15px ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.6)'
      : 'rgba(168, 85, 247, 0.6)'};
  filter: drop-shadow(0 4px 8px ${(props) =>
    props.$player === 'X'
      ? 'rgba(59, 130, 246, 0.4)'
      : 'rgba(168, 85, 247, 0.4)'});
`;

/**
 * Stats bar
 */
const StatsBar = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.05) 0%, 
    rgba(168, 85, 247, 0.05) 100%);
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const StatLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Styled AI thinking indicator
 */
const AIThinking = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: rgba(168, 85, 247, 0.15);
  border: 2px solid rgba(168, 85, 247, 0.4);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.fontWeights.semibold};
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
`;

/**
 * Styled loading dots
 */
const Dot = styled(motion.span)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #A855F7;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
`;

/**
 * Styled result container
 */
const ResultContainer = styled(motion.div)<{ $type: 'win' | 'loss' | 'draw' }>`
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.xl};
  text-align: center;
  background: linear-gradient(
    135deg,
    ${(props) => {
      switch (props.$type) {
        case 'win':
          return 'rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08)';
        case 'loss':
          return 'rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08)';
        default:
          return 'rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08)';
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
  box-shadow: 0 8px 32px ${(props) => {
    switch (props.$type) {
      case 'win':
        return 'rgba(16, 185, 129, 0.4)';
      case 'loss':
        return 'rgba(239, 68, 68, 0.4)';
      default:
        return 'rgba(59, 130, 246, 0.4)';
    }
  }};
  width: 100%;
`;

/**
 * Styled result emoji
 */
const ResultEmoji = styled.div`
  font-size: ${theme.fontSizes['4xl']};
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
 * Styled result text
 */
const ResultText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
  color: ${theme.colors.textPrimary};
`;

/**
 * Styled score text
 */
const ScoreText = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.sm} 0 0 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Reset button
 */
const ResetButton = styled(motion.button)`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

/**
 * Enhanced Tic Tac Toe Challenge Component - 3 Rounds
 */
const TicTacToeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const TOTAL_ROUNDS = 3;

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
   * Calculate score based on wins
   */
  const calculateScore = useCallback((wins: number): number => {
    const baseScore = wins * 150;
    return baseScore;
  }, []);

  /**
   * Make AI move
   */
  const makeAIMove = useCallback((currentBoard: CellValue[]) => {
    if (aiMovePendingRef.current) return;

    aiMovePendingRef.current = true;
    setIsAIThinking(true);

    setTimeout(() => {
      const moveIndex = getAIMove(currentBoard);

      if (moveIndex === -1) {
        setGameStatus('draw');
        setIsAIThinking(false);
        aiMovePendingRef.current = false;
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
      setMoveCount(prev => prev + 1);
      setIsAIThinking(false);
      aiMovePendingRef.current = false;
    }, 700);
  }, []);

  /**
   * Handle cell click
   */
  const handleCellClick = useCallback((index: number) => {
    if (board[index] !== null || gameStatus !== 'playing' || aiMovePendingRef.current) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setMoveCount(prev => prev + 1);

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
  }, [board, gameStatus, makeAIMove]);

  /**
   * Start next round or complete challenge
   */
  const nextRound = useCallback(() => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(currentRound + 1);
      setBoard(INITIAL_BOARD);
      setGameStatus('playing');
      setWinningCells([]);
      setIsAIThinking(false);
      setMoveCount(0);
      setRoundStatus('in-progress');
      aiMovePendingRef.current = false;
    } else {
      // Challenge complete
      const wins = roundResults.filter(r => r === 'won').length;
      const score = calculateScore(wins);
      const timeSpent = (Date.now() - startTime) / 1000;
      const success = wins >= 2; // Need to win at least 2 out of 3

      setTimeout(() => {
        onComplete(success, timeSpent, score);
      }, 500);
    }
  }, [currentRound, roundResults, startTime, calculateScore, onComplete]);

  /**
   * Handle round end
   */
  useEffect(() => {
    if (gameStatus !== 'playing') {
      setRoundStatus('complete');
      const newResults = [...roundResults, gameStatus as ('won' | 'lost' | 'draw')];
      setRoundResults(newResults);

      setTimeout(() => {
        nextRound();
      }, 2500);
    }
  }, [gameStatus]);

  /**
   * Current turn indicator
   */
  const isPlayerTurn = useMemo(() => {
    return gameStatus === 'playing' && !isAIThinking;
  }, [gameStatus, isAIThinking]);

  return (
    <ChallengeBase
      title="Tic Tac Toe Challenge"
      description="Defeat the AI in a strategic game"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <RoundCounter>
          {Array.from({ length: TOTAL_ROUNDS }).map((_, idx) => (
            <RoundIndicator
              key={idx}
              $completed={idx < currentRound || (idx === currentRound - 1 && roundStatus === 'complete')}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              {idx + 1}
            </RoundIndicator>
          ))}
        </RoundCounter>

        <AnimatePresence mode="wait">
          <Instruction
            key={gameStatus + String(isAIThinking)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            Round {currentRound} of {TOTAL_ROUNDS} - {gameStatus === 'playing'
              ? isAIThinking
                ? 'AI is thinking...'
                : 'Your turn! Make your move'
              : gameStatus === 'won'
              ? 'You won! 🎉'
              : gameStatus === 'draw'
                ? "It's a draw! Well played!"
                : 'AI won this round'}
          </Instruction>
        </AnimatePresence>

        <InfoBar>
          <PlayerIndicator $player="X" $active={isPlayerTurn}>
            <PlayerSymbol $player="X">X</PlayerSymbol>
            <PlayerLabel>You</PlayerLabel>
          </PlayerIndicator>
          
          <TurnArrow
            animate={{ x: isPlayerTurn ? -5 : 5 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            {isPlayerTurn ? '👈' : '👉'}
          </TurnArrow>
          
          <PlayerIndicator $player="O" $active={!isPlayerTurn && gameStatus === 'playing'}>
            <PlayerSymbol $player="O">O</PlayerSymbol>
            <PlayerLabel>AI</PlayerLabel>
          </PlayerIndicator>
        </InfoBar>

        <StatsBar>
          <StatItem>
            <StatLabel>Wins</StatLabel>
            <StatValue>{roundResults.filter(r => r === 'won').length}/{currentRound - 1}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Moves</StatLabel>
            <StatValue>{moveCount}</StatValue>
          </StatItem>
        </StatsBar>

        <GameBoard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
        >
          <AnimatePresence>
            {board.map((cell, index) => (
              <Cell
                key={index}
                $hasValue={cell !== null}
                $isWinning={winningCells.includes(index)}
                $value={cell}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || gameStatus !== 'playing' || isAIThinking}
                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 20,
                  delay: index * 0.05 
                }}
                whileHover={
                  cell === null && gameStatus === 'playing' && !isAIThinking
                    ? { scale: 1.05, y: -3 }
                    : {}
                }
                whileTap={
                  cell === null && gameStatus === 'playing' && !isAIThinking
                    ? { scale: 0.95 }
                    : {}
                }
                aria-label={`Cell ${index + 1}${cell ? `, filled with ${cell}` : ', empty'}`}
              >
                <AnimatePresence>
                  {cell && (
                    <CellContent
                      $player={cell}
                      initial={{ opacity: 0, rotate: -180, scale: 0 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 200, 
                        damping: 15 
                      }}
                    >
                      {cell}
                    </CellContent>
                  )}
                </AnimatePresence>
              </Cell>
            ))}
          </AnimatePresence>
        </GameBoard>

        <AnimatePresence>
          {isAIThinking && (
            <AIThinking
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span>AI thinking</span>
              {[0, 1, 2].map((i) => (
                <Dot
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 0.6, 
                    delay: i * 0.1, 
                    repeat: Infinity 
                  }}
                />
              ))}
            </AIThinking>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <ResultContainer
              $type={
                gameStatus === 'won' ? 'win' : gameStatus === 'draw' ? 'draw' : 'loss'
              }
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ResultEmoji>
                {gameStatus === 'won' ? '🏆' : gameStatus === 'draw' ? '🤝' : '🤖'}
              </ResultEmoji>
              <ResultText>
                {gameStatus === 'won'
                  ? 'Victory! You Beat the AI!'
                  : gameStatus === 'draw'
                    ? 'Draw! Well Played!'
                    : 'AI Victory!'}
              </ResultText>
              <ScoreText>
                {currentRound < TOTAL_ROUNDS
                  ? `Next round...`
                  : `Final Score: ${calculateScore(roundResults.filter(r => r === 'won').length)} points`}
              </ScoreText>
            </ResultContainer>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default TicTacToeChallenge;
