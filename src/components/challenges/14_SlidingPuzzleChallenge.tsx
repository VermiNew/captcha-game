import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Tile type (0 = empty)
 */
type TileValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Goal state
 */
const GOAL_STATE = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

/**
 * Check if two grids are equal
 */
const gridsEqual = (grid1: TileValue[][], grid2: TileValue[][]): boolean => {
  return grid1.every((row, i) => row.every((val, j) => val === grid2[i][j]));
};

/**
 * Check if puzzle is solvable (inversion count must be even)
 */
const isSolvable = (grid: TileValue[][]): boolean => {
  const flat = grid.flat().filter((x) => x !== 0);
  let inversions = 0;

  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) {
        inversions++;
      }
    }
  }

  return inversions % 2 === 0;
};

/**
 * Generate random solvable puzzle
 */
const generateSolvablePuzzle = (): TileValue[][] => {
  let grid: TileValue[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0],
  ];

  // Fisher-Yates shuffle but keep solvability
  let flat = grid.flat();
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }

  grid = [
    [flat[0] as TileValue, flat[1] as TileValue, flat[2] as TileValue],
    [flat[3] as TileValue, flat[4] as TileValue, flat[5] as TileValue],
    [flat[6] as TileValue, flat[7] as TileValue, flat[8] as TileValue],
  ];

  // If not solvable, swap two adjacent tiles (except 0)
  if (!isSolvable(grid)) {
    let swapped = false;
    for (let i = 0; i < 3 && !swapped; i++) {
      for (let j = 0; j < 3 && !swapped; j++) {
        if (grid[i][j] !== 0) {
          // Find next non-zero
          for (let ii = i; ii < 3 && !swapped; ii++) {
            const jStart = ii === i ? j + 1 : 0;
            for (let jj = jStart; jj < 3; jj++) {
              if (grid[ii][jj] !== 0) {
                [grid[i][j], grid[ii][jj]] = [grid[ii][jj], grid[i][j]];
                swapped = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  return grid;
};

/**
 * Find tile position
 */
const findTilePosition = (grid: TileValue[][], value: TileValue): [number, number] | null => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i][j] === value) {
        return [i, j];
      }
    }
  }
  return null;
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
 * Styled stats section
 */
const StatsSection = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`;

/**
 * Styled stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled grid container
 */
const GridContainer = styled(motion.div)`
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
 * Styled tile
 */
const Tile = styled(motion.button)<{ $isEmpty: boolean }>`
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease;

  ${(props) =>
    props.$isEmpty
      ? `
    background: ${theme.colors.background};
    border: 2px dashed ${theme.colors.border};
    color: transparent;
    cursor: default;

    &:hover {
      background: ${theme.colors.background};
    }
  `
      : `
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    }
  `}
`;

/**
 * Styled completion message
 */
const CompletionMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid ${theme.colors.success};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.success};
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
 * Sliding Puzzle Challenge Component
 * User must arrange tiles in the correct order
 */
const SlidingPuzzleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [grid, setGrid] = useState<TileValue[][]>(() => generateSolvablePuzzle());
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [lastMovedTile, setLastMovedTile] = useState<TileValue | null>(null);

  /**
   * Find empty position
   */
  const findEmpty = (): [number, number] | null => {
    return findTilePosition(grid, 0);
  };

  /**
   * Check if two positions are adjacent
   */
  const isAdjacent = (pos1: [number, number], pos2: [number, number]): boolean => {
    const [r1, c1] = pos1;
    const [r2, c2] = pos2;
    const distance = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    return distance === 1;
  };

  /**
   * Handle tile click
   */
  const handleTileClick = (value: TileValue) => {
    if (value === 0 || completed) return;

    const emptyPos = findEmpty();
    const tilePos = findTilePosition(grid, value);

    if (!emptyPos || !tilePos) return;

    // Check if adjacent
    if (!isAdjacent(emptyPos, tilePos)) return;

    // Swap tiles
    const newGrid = grid.map((row) => [...row]);
    [newGrid[emptyPos[0]][emptyPos[1]], newGrid[tilePos[0]][tilePos[1]]] = [
      newGrid[tilePos[0]][tilePos[1]],
      newGrid[emptyPos[0]][emptyPos[1]],
    ];

    setGrid(newGrid);
    setMoves(moves + 1);
    setLastMovedTile(value);

    // Check if solved
    if (gridsEqual(newGrid, GOAL_STATE)) {
      setCompleted(true);

      const timeSpent = (Date.now() - startTime) / 1000;
      const score = Math.max(0, 200 - moves * 5);

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1500);
    }
  };

  return (
    <ChallengeBase
      title="Sliding Puzzle Challenge"
      description="Arrange the tiles in numerical order"
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
          Solve the Puzzle!
        </Title>

        <Instruction>Click tiles adjacent to the empty space to move them</Instruction>

        <StatsSection>
          <StatItem>
            <StatLabel>Moves</StatLabel>
            <StatValue
              key={moves}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {moves}
            </StatValue>
          </StatItem>
        </StatsSection>

        <GridContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {grid.map((row, rowIdx) =>
              row.map((value, colIdx) => (
                <Tile
                  key={`${rowIdx}-${colIdx}`}
                  $isEmpty={value === 0}
                  onClick={() => handleTileClick(value)}
                  disabled={value === 0 || completed}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  whileHover={value !== 0 && !completed ? { scale: 1.05 } : {}}
                  whileTap={value !== 0 && !completed ? { scale: 0.95 } : {}}
                >
                  {value !== 0 && (
                    <motion.span
                      key={value}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {value}
                    </motion.span>
                  )}
                </Tile>
              )),
            )}
          </AnimatePresence>
        </GridContainer>

        {completed && (
          <CompletionMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Emoji>🎉</Emoji>
            <div>
              <p style={{ margin: 0, marginBottom: '0.5rem' }}>Puzzle Solved!</p>
              <p style={{ margin: 0, fontSize: theme.fontSizes.sm }}>
                {moves} moves • {Math.max(0, 200 - moves * 5)} points
              </p>
            </div>
          </CompletionMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default SlidingPuzzleChallenge;
