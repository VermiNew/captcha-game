/**
 * Minesweeper Challenge
 * 
 * Inspired by: https://codepen.io/bali_balo/pen/BLJONZ
 * Classic Minesweeper game 9x9 with bomb detection
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type Cell = {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighbourMines: number;
};

const GRID_SIZE = 9;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const MINES_COUNT = 10;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.lg};
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.borderLight};
  font-family: 'Courier New', monospace;
`;

const InfoItem = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;

  .label {
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.textSecondary};
    display: block;
  }

  .value {
    display: block;
    font-size: ${theme.fontSizes['2xl']};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_SIZE}, 1fr);
  gap: 2px;
  padding: ${theme.spacing.lg};
  background: #808080;
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid #606060;
  width: 100%;
  max-width: 360px;
`;

const CellButton = styled(motion.button)<{
  $revealed: boolean;
  $flagged: boolean;
  $isMine: boolean;
  $neighbourCount: number;
}>`
  aspect-ratio: 1;
  padding: 0;
  border: 2px solid;
  background: ${props =>
    props.$isMine && props.$revealed
      ? '#ff4444'
      : props.$revealed
        ? '#c0c0c0'
        : '#dfdfdf'};
  border-color: ${props =>
    props.$revealed
      ? '#999 #666 #666 #999'
      : '#fff #999 #999 #fff'};
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: ${theme.fontSizes.md};
  color: ${props => {
    if (!props.$revealed) return 'transparent';
    if (props.$neighbourCount === 1) return '#0000FF';
    if (props.$neighbourCount === 2) return '#008100';
    if (props.$neighbourCount === 3) return '#FF0000';
    if (props.$neighbourCount === 4) return '#000083';
    if (props.$neighbourCount === 5) return '#810500';
    if (props.$neighbourCount === 6) return '#008080';
    if (props.$neighbourCount >= 7) return '#000000';
    return '#c0c0c0';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;

  &:active {
    background: ${props => (props.$revealed ? '#bdbdbd' : '#bdbdbd')};
    border-color: ${props => (props.$revealed ? '#999 #666 #666 #999' : '#666 #999 #999 #666')};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ResultBox = styled(motion.div)<{ $type: 'win' | 'loss' }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${props =>
    props.$type === 'win'
      ? 'rgba(34, 197, 94, 0.1)'
      : 'rgba(220, 104, 90, 0.1)'};
  border: 2px solid ${props =>
    props.$type === 'win'
      ? theme.colors.success
      : '#dc685a'};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const ResultText = styled.p`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
  color: ${theme.colors.textPrimary};
`;

const Minesweeper: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);

  const initializeGame = useCallback(() => {
    // Create empty grid
    const newGrid: Cell[] = Array(TOTAL_CELLS)
      .fill(null)
      .map((_, i) => ({
        id: i,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighbourMines: 0,
      }));

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const randomId = Math.floor(Math.random() * TOTAL_CELLS);
      if (!newGrid[randomId].isMine) {
        newGrid[randomId].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbour mines
    newGrid.forEach((cell, idx) => {
      if (cell.isMine) return;

      const row = Math.floor(idx / GRID_SIZE);
      const col = idx % GRID_SIZE;
      let count = 0;

      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            const neighbourId = r * GRID_SIZE + c;
            if (newGrid[neighbourId].isMine) count++;
          }
        }
      }
      cell.neighbourMines = count;
    });

    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
    setTime(0);
    setFlaggedCount(0);
  }, []);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    if (gameOver || won) return;

    const timer = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, won]);

  const revealCell = (id: number) => {
    if (gameOver || won) return;

    const newGrid = [...grid];
    const cell = newGrid[id];

    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
      // Mine hit - reveal all mines
      newGrid.forEach(c => {
        if (c.isMine) c.isRevealed = true;
      });
      setGrid(newGrid);
      setGameOver(true);
      setTimeout(() => {
        onComplete(false, time, 0);
      }, 2000);
      return;
    }

    // Reveal cell and flood fill if no neighbours
    revealArea(newGrid, id);
    setGrid(newGrid);

    // Check win condition
    if (checkWin(newGrid)) {
      setWon(true);
      setTimeout(() => {
        onComplete(true, time, Math.max(200 - time, 50));
      }, 1500);
    }
  };

  const revealArea = (gridToReveal: Cell[], id: number) => {
    const cell = gridToReveal[id];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    if (cell.neighbourMines === 0) {
      const row = Math.floor(id / GRID_SIZE);
      const col = id % GRID_SIZE;

      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            const neighbourId = r * GRID_SIZE + c;
            revealArea(gridToReveal, neighbourId);
          }
        }
      }
    }
  };

  const toggleFlag = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || won) return;

    const newGrid = [...grid];
    const cell = newGrid[id];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    setGrid(newGrid);
    setFlaggedCount(newGrid.filter(c => c.isFlagged).length);
  };

  const checkWin = (gridToCheck: Cell[]): boolean => {
    return gridToCheck.every(
      cell => cell.isMine ? cell.isFlagged : cell.isRevealed
    );
  };

  const minesLeft = MINES_COUNT - flaggedCount;
  const revealedCount = grid.filter(c => c.isRevealed).length;

  return (
    <ChallengeBase
      title="Minesweeper"
      description="Find and flag all 10 mines without hitting one"
 
 

    >
      <Container>
        <InfoBar>
          <InfoItem>
            <span className="label">Mines Left</span>
            <motion.span
              className="value"
              key={`mines-${minesLeft}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {minesLeft}
            </motion.span>
          </InfoItem>
          <InfoItem>
            <span className="label">Time</span>
            <motion.span
              className="value"
              key={`time-${time}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {String(Math.floor(time / 60)).padStart(2, '0')}:{String(time % 60).padStart(2, '0')}
            </motion.span>
          </InfoItem>
          <InfoItem>
            <span className="label">Revealed</span>
            <motion.span
              className="value"
              key={`revealed-${revealedCount}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {revealedCount}/{TOTAL_CELLS - MINES_COUNT}
            </motion.span>
          </InfoItem>
        </InfoBar>

        <Grid>
          {grid.map((cell) => (
            <CellButton
              key={cell.id}
              onClick={() => revealCell(cell.id)}
              onContextMenu={e => toggleFlag(cell.id, e)}
              disabled={gameOver || won}
              $revealed={cell.isRevealed}
              $flagged={cell.isFlagged}
              $isMine={cell.isMine}
              $neighbourCount={cell.neighbourMines}
              whileHover={!cell.isRevealed && !gameOver && !won ? { scale: 0.95 } : {}}
              whileTap={!cell.isRevealed && !gameOver && !won ? { scale: 0.9 } : {}}
            >
              {cell.isFlagged ? '🚩' : cell.isRevealed && cell.isMine ? '💣' : cell.isRevealed && cell.neighbourMines > 0 ? cell.neighbourMines : ''}
            </CellButton>
          ))}
        </Grid>

        <AnimatePresence>
          {gameOver && (
            <ResultBox
              $type="loss"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultText>💥 Game Over!</ResultText>
            </ResultBox>
          )}
          {won && (
            <ResultBox
              $type="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultText>🎉 Victory!</ResultText>
            </ResultBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default Minesweeper;
