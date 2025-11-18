import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Maze dimensions
 */
const MAZE_WIDTH = 20;
const MAZE_HEIGHT = 15;
const CELL_SIZE = 25;

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
 * Styled canvas
 */
const GameCanvas = styled.canvas`
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background: #000;
  display: block;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled status
 */
const Status = styled.div`
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
 * Styled completion message
 */
const CompletionMessage = styled(motion.div)`
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
 * Generate random maze using recursive backtracking
 */
const generateMaze = (width: number, height: number): number[][] => {
  const maze = Array(height).fill(null).map(() => Array(width).fill(1));

  const carve = (x: number, y: number) => {
    maze[y][x] = 0;
    const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  };

  carve(1, 1);
  maze[1][1] = 0; // Start
  return maze;
};

/**
 * Maze Key Quest Challenge Component
 * Navigate maze, find key, reach exit
 */
const MazeKeyQuestChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maze] = useState<number[][]>(() => generateMaze(MAZE_WIDTH, MAZE_HEIGHT));
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [keyPos] = useState(() => ({
    x: Math.floor(Math.random() * (MAZE_WIDTH - 4)) + 2,
    y: Math.floor(Math.random() * (MAZE_HEIGHT - 4)) + 2,
  }));
  const [hasKey, setHasKey] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(() => Date.now());
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  /**
   * Keyboard controls
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * Game loop for movement
   */
  useEffect(() => {
    if (isComplete) return;

    const moveLoop = setInterval(() => {
      setPlayerPos((prev) => {
        let newPos = { ...prev };

        if (keysPressed.current['arrowup'] || keysPressed.current['w']) {
          if (maze[prev.y - 1]?.[prev.x] === 0) newPos.y -= 1;
        }
        if (keysPressed.current['arrowdown'] || keysPressed.current['s']) {
          if (maze[prev.y + 1]?.[prev.x] === 0) newPos.y += 1;
        }
        if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
          if (maze[prev.y]?.[prev.x - 1] === 0) newPos.x -= 1;
        }
        if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
          if (maze[prev.y]?.[prev.x + 1] === 0) newPos.x += 1;
        }

        // Check if reached key
        if (newPos.x === keyPos.x && newPos.y === keyPos.y) {
          setHasKey(true);
        }

        // Check if reached exit
        if (hasKey && newPos.x === MAZE_WIDTH - 2 && newPos.y === MAZE_HEIGHT - 2) {
          setIsComplete(true);
        }

        return newPos;
      });
    }, 100);

    return () => clearInterval(moveLoop);
  }, [isComplete, hasKey, maze, keyPos]);

  /**
   * Render maze
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, MAZE_WIDTH * CELL_SIZE, MAZE_HEIGHT * CELL_SIZE);

    // Draw maze walls
    ctx.fillStyle = '#fff';
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (maze[y][x] === 1) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw start
    ctx.fillStyle = '#0f0';
    ctx.fillRect(1 * CELL_SIZE, 1 * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw exit
    ctx.fillStyle = hasKey ? '#0ff' : '#888';
    ctx.fillRect(
      (MAZE_WIDTH - 2) * CELL_SIZE,
      (MAZE_HEIGHT - 2) * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );

    // Draw key
    if (!hasKey) {
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(
        keyPos.x * CELL_SIZE + CELL_SIZE / 2,
        keyPos.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw player
    ctx.fillStyle = '#f00';
    ctx.fillRect(playerPos.x * CELL_SIZE, playerPos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }, [maze, playerPos, keyPos, hasKey]);

  /**
   * Handle completion
   */
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, 250);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isComplete, startTime, onComplete]);

  return (
    <ChallengeBase
      title="Maze Key Quest"
      description="Navigate the maze, find the key (yellow), and reach the exit"
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
          Maze Key Quest
        </Title>

        <Instruction>
          Use Arrow Keys or WASD to move. Find the key (yellow), then reach the exit (cyan).
        </Instruction>

        <GameCanvas
          ref={canvasRef}
          width={MAZE_WIDTH * CELL_SIZE}
          height={MAZE_HEIGHT * CELL_SIZE}
          role="img"
          aria-label="Maze game showing white walls, green start position, yellow key, and cyan exit"
        />

        <Status>
          <div>
            <p>Status</p>
            <p>{isComplete ? '✓ Done' : hasKey ? 'Key Found' : 'Searching'}</p>
          </div>
          <div>
            <p>Key</p>
            <p>{hasKey ? '✓' : '✗'}</p>
          </div>
          <div>
            <p>Time</p>
            <p>{((startTime !== null ? Date.now() - startTime : 0) / 1000).toFixed(1)}s</p>
          </div>
        </Status>

        {isComplete && (
          <CompletionMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ✓ Quest Complete! You found the key and escaped!
          </CompletionMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default MazeKeyQuestChallenge;
