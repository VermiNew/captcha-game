import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game dimensions
 */
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 25;

/**
 * Tetris pieces (tetrominos)
 */
const PIECES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
];

const COLORS = ['#00f', '#f0f', '#0ff', '#f00', '#0f0', '#ff0', '#f80'];

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
 * Styled game canvas
 */
const GameCanvas = styled.canvas`
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background: #000;
  display: block;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled stats
 */
const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;

  div {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    p {
      font-family: ${theme.fonts.primary};
      margin: 0;

      &:first-child {
        font-size: ${theme.fontSizes.sm};
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.fontWeights.medium};
      }

      &:last-child {
        font-size: ${theme.fontSizes.xl};
        font-weight: ${theme.fontWeights.bold};
        color: ${theme.colors.primary};
      }
    }
  }
`;

/**
 * Styled complete message
 */
const CompleteMessage = styled(motion.div)`
  padding: ${theme.spacing.xl};
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid ${theme.colors.success};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.success};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
`;

/**
 * Tetris Sprint Challenge Component
 * Play Tetris - goal is 5000 points or 10 lines
 */
const TetrisSprintChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(() => Math.floor(Math.random() * PIECES.length));
  const [nextPiece, setNextPiece] = useState(() => Math.floor(Math.random() * PIECES.length));
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState(Date.now());
  const [speed, setSpeed] = useState(600);
  const [hasCompleted, setHasCompleted] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const completionTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Get piece shape
   */
  const getPieceShape = (pieceIndex: number, rot: number) => {
    let piece = PIECES[pieceIndex];
    for (let i = 0; i < rot; i++) {
      const newPiece = [];
      for (let x = 0; x < piece[0].length; x++) {
        const row = [];
        for (let y = piece.length - 1; y >= 0; y--) {
          row.push(piece[y][x]);
        }
        newPiece.push(row);
      }
      piece = newPiece;
    }
    return piece;
  };

  /**
   * Check collision
   */
  const canMove = (piece: number[][], x: number, y: number): boolean => {
    for (let py = 0; py < piece.length; py++) {
      for (let px = 0; px < piece[py].length; px++) {
        if (piece[py][px]) {
          const nx = x + px;
          const ny = y + py;
          if (nx < 0 || nx >= GRID_WIDTH || ny >= GRID_HEIGHT) return false;
          if (ny >= 0 && grid[ny][nx]) return false;
        }
      }
    }
    return true;
  };

  /**
   * Place piece
   */
  const placePiece = (piece: number[][], x: number, y: number) => {
    const newGrid = grid.map((row) => [...row]);
    for (let py = 0; py < piece.length; py++) {
      for (let px = 0; px < piece[py].length; px++) {
        if (piece[py][px]) {
          const ny = y + py;
          if (ny >= 0) {
            newGrid[ny][x + px] = currentPiece + 1;
          }
        }
      }
    }
    return newGrid;
  };

  /**
   * Clear lines
   */
  const clearLines = (gridToCheck: number[][]) => {
    let newGrid = gridToCheck.filter((row) => !row.every((cell) => cell !== 0));
    const clearedLines = gridToCheck.length - newGrid.length;
    while (newGrid.length < GRID_HEIGHT) {
      newGrid.unshift(Array(GRID_WIDTH).fill(0));
    }
    return { grid: newGrid, cleared: clearedLines };
  };

  /**
   * Game loop
   */
  useEffect(() => {
    if (isGameOver) return;

    gameLoopRef.current = setInterval(() => {
      setPosition((prevPos) => {
        const piece = getPieceShape(currentPiece, rotation);
        const newY = prevPos.y + 1;

        if (canMove(piece, prevPos.x, newY)) {
          return { ...prevPos, y: newY };
        } else {
          // Place piece
          let newGrid = placePiece(piece, prevPos.x, prevPos.y);
          const { grid: clearedGrid, cleared } = clearLines(newGrid);
          newGrid = clearedGrid;

          if (cleared > 0) {
            setLines((prev) => prev + cleared);
            setScore((prev) => prev + cleared * 100);
          }

          setGrid(newGrid);
          setCurrentPiece(nextPiece);
          setNextPiece(Math.floor(Math.random() * PIECES.length));
          setRotation(0);

          // Check for game over
          const newPieceShape = getPieceShape(nextPiece, 0);
          if (!canMove(newPieceShape, 3, 0)) {
            setIsGameOver(true);
            return prevPos;
          }

          return { x: 3, y: 0 };
        }
      });
    }, speed);

    return () => clearInterval(gameLoopRef.current);
  }, [currentPiece, nextPiece, rotation, grid, isGameOver, speed]);

  /**
   * Keyboard controls
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      const piece = getPieceShape(currentPiece, rotation);

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          if (canMove(piece, position.x - 1, position.y)) {
            setPosition((p) => ({ ...p, x: p.x - 1 }));
          }
          break;
        case 'arrowright':
        case 'd':
          if (canMove(piece, position.x + 1, position.y)) {
            setPosition((p) => ({ ...p, x: p.x + 1 }));
          }
          break;
        case 'arrowup':
        case 'w':
          const newRot = (rotation + 1) % 4;
          const rotPiece = getPieceShape(currentPiece, newRot);
          if (canMove(rotPiece, position.x, position.y)) {
            setRotation(newRot);
          }
          break;
        case 'arrowdown':
        case 's':
          if (canMove(piece, position.x, position.y + 1)) {
            setPosition((p) => ({ ...p, y: p.y + 1 }));
          }
          setSpeed((prev) => Math.max(100, prev - 50));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, rotation, currentPiece, isGameOver]);

  /**
   * Render canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Draw grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = COLORS[grid[y][x] - 1];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Draw current piece
    const piece = getPieceShape(currentPiece, rotation);
    ctx.fillStyle = COLORS[currentPiece];
    for (let py = 0; py < piece.length; py++) {
      for (let px = 0; px < piece[py].length; px++) {
        if (piece[py][px]) {
          const x = position.x + px;
          const y = position.y + py;
          if (y >= 0) {
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        }
      }
    }
  }, [grid, currentPiece, position, rotation]);

  /**
   * Check win condition
   */
  useEffect(() => {
    if (hasCompleted || isGameOver) return;

    if (score >= 5000 || lines >= 10) {
      setIsGameOver(true);
      setHasCompleted(true);

      const timer = setTimeout(() => {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, Math.floor(score));
      }, 2000);

      completionTimeoutRef.current = timer;
    }
  }, [score, lines, hasCompleted, isGameOver, startTime, onComplete]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
    };
  }, []);

  return (
    <ChallengeBase
      title="Tetris Sprint"
      description="Clear lines and score 5000 points or clear 10 lines (arrow keys to move/rotate, down to speed up)"
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
          Tetris Sprint
        </Title>

        <Instruction>
          Arrow Keys: Move & Rotate | Down Arrow: Speed Up | Goal: 5000 points or 10 lines
        </Instruction>

        <GameCanvas ref={canvasRef} width={GRID_WIDTH * CELL_SIZE} height={GRID_HEIGHT * CELL_SIZE} />

        <Stats>
          <div>
            <p>Score</p>
            <p>{score}</p>
          </div>
          <div>
            <p>Lines</p>
            <p>{lines}</p>
          </div>
          <div>
            <p>Goal</p>
            <p>{Math.max(0, Math.min(5000 - score, 10 - lines))}</p>
          </div>
        </Stats>

        {isGameOver && (score >= 5000 || lines >= 10) && (
          <CompleteMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ✓ Success! Score: {score} | Lines: {lines}
          </CompleteMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default TetrisSprintChallenge;
