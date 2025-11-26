import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type TileValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const GOAL_STATE: TileValue[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

const gridsEqual = (grid1: TileValue[][], grid2: TileValue[][]): boolean => {
    return grid1.every((row, i) => row.every((val, j) => val === grid2[i][j]));
};

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

const generateSolvablePuzzle = (): TileValue[][] => {
    let grid: TileValue[][] = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
    ];

    const flat = grid.flat();
    for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
    }

    grid = [
        [flat[0] as TileValue, flat[1] as TileValue, flat[2] as TileValue],
        [flat[3] as TileValue, flat[4] as TileValue, flat[5] as TileValue],
        [flat[6] as TileValue, flat[7] as TileValue, flat[8] as TileValue],
    ];

    if (!isSolvable(grid)) {
        let swapped = false;
        for (let i = 0; i < 3 && !swapped; i++) {
            for (let j = 0; j < 3 && !swapped; j++) {
                if (grid[i][j] !== 0) {
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
`;

const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const MovesCounter = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${theme.colors.border};
`;

const MovesLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.medium};
`;

const MovesValue = styled(motion.span)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  min-width: 24px;
  text-align: center;
`;

const GridContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  border: 2px solid ${theme.colors.border};
  aspect-ratio: 1;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Tile = styled(motion.button) <{ $isEmpty: boolean }>`
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  aspect-ratio: 1;

  ${(props) =>
        props.$isEmpty
            ? `
    background: rgba(99, 102, 241, 0.03);
    border: 2px dashed ${theme.colors.border};
    color: transparent;
    cursor: default;
    pointer-events: none;
  `
            : `
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
    
    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `}
`;

const CompletionMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 2px solid ${theme.colors.success};
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.success};
  font-family: ${theme.fonts.primary};
  width: 100%;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
`;

const Emoji = styled.span`
  font-size: 48px;
  line-height: 1;
`;

const CompletionTitle = styled.p`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
`;

const CompletionStats = styled.p`
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  opacity: 0.8;
  margin: 0;
`;

const SlidingPuzzleChallenge: React.FC<ChallengeProps> = ({
    onComplete,
    timeLimit,
    challengeId,
}) => {
    const [grid, setGrid] = useState<TileValue[][]>(() => generateSolvablePuzzle());
    const [moves, setMoves] = useState(0);
    const [startTime] = useState(() => Date.now());
    const [completed, setCompleted] = useState(false);

    const findEmpty = (): [number, number] | null => {
        return findTilePosition(grid, 0);
    };

    const isAdjacent = (pos1: [number, number], pos2: [number, number]): boolean => {
        const [r1, c1] = pos1;
        const [r2, c2] = pos2;
        const distance = Math.abs(r1 - r2) + Math.abs(c1 - c2);
        return distance === 1;
    };

    const handleTileClick = (value: TileValue) => {
        if (value === 0 || completed) return;

        const emptyPos = findEmpty();
        const tilePos = findTilePosition(grid, value);

        if (!emptyPos || !tilePos) return;
        if (!isAdjacent(emptyPos, tilePos)) return;

        const newGrid: TileValue[][] = grid.map((row) => [...row] as TileValue[]);
        [newGrid[emptyPos[0]][emptyPos[1]], newGrid[tilePos[0]][tilePos[1]]] = [
            newGrid[tilePos[0]][tilePos[1]],
            newGrid[emptyPos[0]][emptyPos[1]],
        ];

        setGrid(newGrid);
        setMoves(moves + 1);

        if (gridsEqual(newGrid, GOAL_STATE)) {
            setCompleted(true);
        }
    };

    useEffect(() => {
        if (completed) {
            const timeSpent = (Date.now() - startTime) / 1000;
            const score = Math.max(0, 200 - moves * 5);

            const timer = setTimeout(() => {
                onComplete(true, timeSpent, score);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [completed, moves, startTime, onComplete]);

    return (
        <ChallengeBase
            title="Sliding Puzzle Challenge"
            description="Arrange the tiles in numerical order"
            timeLimit={timeLimit}
            challengeId={challengeId}
            onComplete={onComplete}
        >
            <Container>
                <Instruction>Kliknij kafelki obok pustego pola, aby je przesunąć</Instruction>

                <MovesCounter>
                    <MovesLabel>Ruchy:</MovesLabel>
                    <MovesValue
                        key={moves}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                        {moves}
                    </MovesValue>
                </MovesCounter>

                <GridContainer
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {grid.map((row, rowIdx) =>
                        row.map((value, colIdx) => (
                            <Tile
                                key={`${rowIdx}-${colIdx}`}
                                $isEmpty={value === 0}
                                onClick={() => handleTileClick(value)}
                                disabled={value === 0 || completed}
                                whileHover={value !== 0 && !completed ? { scale: 1.05 } : {}}
                                whileTap={value !== 0 && !completed ? { scale: 0.95 } : {}}
                            >
                                {value !== 0 && value}
                            </Tile>
                        )),
                    )}
                </GridContainer>

                {completed && (
                    <CompletionMessage
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <Emoji>🎉</Emoji>
                        <CompletionTitle>Gratulacje! Puzzle rozwiązane!</CompletionTitle>
                        <CompletionStats>
                            {moves} ruchów • {Math.max(0, 200 - moves * 5)} punktów
                        </CompletionStats>
                    </CompletionMessage>
                )}
            </Container>
        </ChallengeBase>
    );
};

export default SlidingPuzzleChallenge;
