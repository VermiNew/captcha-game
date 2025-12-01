/**
 * Tic Tac Toe Challenge
 * 
 * Inspired by: https://codepen.io/ziga-miklic/pen/QWrGyW
 * Adapted to React/TypeScript with modern styling and AI gameplay
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type Cell = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.lg};
`;

const StatusBar = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.borderLight};
`;

const PlayerInfo = styled(motion.div)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  border: 2px solid ${props => props.$active ? theme.colors.primary : 'transparent'};
  transition: all 0.3s ease;
`;

const Symbol = styled.span<{ $player: 'X' | 'O' }>`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$player === 'X' ? '#3B82F6' : '#A855F7'};
`;

const Board = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 80px);
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  margin: 0 auto;
`;

const Cell = styled(motion.button)<{ $filled: boolean; $winning: boolean }>`
  width: 80px;
  height: 80px;
  background: ${props => 
    props.$winning ? 'rgba(34, 197, 94, 0.3)' :
    props.$filled ? 'rgba(99, 102, 241, 0.1)' :
    theme.colors.background};
  border: 2px solid ${props =>
    props.$winning ? theme.colors.success :
    props.$filled ? theme.colors.borderLight :
    theme.colors.borderLight};
  border-radius: ${theme.borderRadius.md};
  cursor: ${props => props.$filled ? 'default' : 'pointer'};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => !props.$filled ? 'transparent' : 'inherit'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;

  &:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.15);
    transform: scale(1.05);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ResultBox = styled(motion.div)<{ $type: 'win' | 'loss' | 'draw' }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  background: ${props =>
    props.$type === 'win' ? 'rgba(34, 197, 94, 0.1)' :
    props.$type === 'draw' ? 'rgba(59, 130, 246, 0.1)' :
    'rgba(220, 104, 90, 0.1)'};
  border: 2px solid ${props =>
    props.$type === 'win' ? theme.colors.success :
    props.$type === 'draw' ? theme.colors.primary :
    '#dc685a'};
`;

const ResultText = styled.p`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
  color: ${theme.colors.textPrimary};
`;

const TicTacToe: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isXNext, setIsXNext] = useState(true);
  const [winningCells, setWinningCells] = useState<number[]>([]);

  const checkWinner = (cells: Cell[]): { winner: Cell; cells: number[] } | null => {
    for (const [a, b, c] of WINNING_COMBOS) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { winner: cells[a], cells: [a, b, c] };
      }
    }
    return null;
  };

  const getAIMove = (cells: Cell[]): number => {
    const empty = cells.map((cell, idx) => cell === null ? idx : null).filter(x => x !== null) as number[];
    
    // Try to win
    for (const move of empty) {
      const test = [...cells];
      test[move] = 'O';
      if (checkWinner(test)?.winner === 'O') return move;
    }
    
    // Block player
    for (const move of empty) {
      const test = [...cells];
      test[move] = 'X';
      if (checkWinner(test)?.winner === 'X') return move;
    }
    
    // Take center
    if (empty.includes(4)) return 4;
    
    // Take corner
    const corners = [0, 2, 6, 8].filter(i => empty.includes(i));
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    
    return empty[0];
  };

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = 'X';

    const result = checkWinner(newBoard);
    if (result) {
      setWinningCells(result.cells);
      setGameStatus('won');
      setBoard(newBoard);
      setTimeout(() => {
        onComplete(true, 5, 100);
      }, 2000);
      return;
    }

    if (newBoard.every(c => c !== null)) {
      setGameStatus('draw');
      setBoard(newBoard);
      setTimeout(() => {
        onComplete(true, 4, 75);
      }, 2000);
      return;
    }

    setBoard(newBoard);
    setIsXNext(false);

    // AI move
    setTimeout(() => {
      const aiMove = getAIMove(newBoard);
      newBoard[aiMove] = 'O';

      const aiResult = checkWinner(newBoard);
      if (aiResult) {
        setWinningCells(aiResult.cells);
        setGameStatus('lost');
        setBoard(newBoard);
        setTimeout(() => {
          onComplete(false, 5, 0);
        }, 2000);
        return;
      }

      if (newBoard.every(c => c !== null)) {
        setGameStatus('draw');
      }

      setBoard(newBoard);
      setIsXNext(true);
    }, 1000);
  }, [board, gameStatus, onComplete]);

  return (
    <ChallengeBase
      title="Tic Tac Toe"
      description="Beat the AI in a classic game"
 
 

    >
      <Container>
        <StatusBar>
          <PlayerInfo $active={isXNext && gameStatus === 'playing'}>
            <Symbol $player="X">X</Symbol>
            <span>You</span>
          </PlayerInfo>
          <PlayerInfo $active={!isXNext && gameStatus === 'playing'}>
            <Symbol $player="O">O</Symbol>
            <span>AI</span>
          </PlayerInfo>
        </StatusBar>

        <Board
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {board.map((cell, idx) => (
            <Cell
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={cell !== null || gameStatus !== 'playing'}
              $filled={cell !== null}
              $winning={winningCells.includes(idx)}
              whileHover={!cell && gameStatus === 'playing' ? { scale: 1.1 } : {}}
              whileTap={!cell && gameStatus === 'playing' ? { scale: 0.95 } : {}}
            >
              <motion.span
                initial={cell ? { scale: 0, rotate: -180 } : {}}
                animate={cell ? { scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {cell === 'X' ? <Symbol $player="X">X</Symbol> :
                 cell === 'O' ? <Symbol $player="O">O</Symbol> : ''}
              </motion.span>
            </Cell>
          ))}
        </Board>

        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <ResultBox
              $type={gameStatus === 'won' ? 'win' : gameStatus === 'draw' ? 'draw' : 'loss'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultText>
                {gameStatus === 'won' ? '🏆 You Win!' :
                 gameStatus === 'draw' ? '🤝 Draw!' :
                 '🤖 AI Wins'}
              </ResultText>
            </ResultBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default TicTacToe;
