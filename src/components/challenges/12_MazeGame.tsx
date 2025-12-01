/**
 * Maze Game Challenge
 * 
 * Inspired by: https://codepen.io/chaofix/pen/VrWZga
 * Keep your mouse cursor on the path to navigate the maze
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.lg};
`;

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 3px solid #D04D3C;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const GameCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  cursor: none;
`;

const Instructions = styled.p`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.borderLight};
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #A855F7);
  width: ${props => props.$progress * 100}%;
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

interface PathPoint {
  x: number;
  y: number;
}

interface MazeLevel {
  path: PathPoint[];
  difficulty: string;
}

const MazeGame: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const gameStateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    onPath: true,
    distanceTraveled: 0,
  });

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const TOLERANCE = 25;
  const FINISH_RADIUS = 20;

  // Maze levels with different paths
  const mazeLevels: MazeLevel[] = [
    {
      difficulty: 'Easy',
      path: generateSimplePath(),
    },
    {
      difficulty: 'Medium',
      path: generateMediumPath(),
    },
  ];

  function generateSimplePath(): PathPoint[] {
    const path: PathPoint[] = [];
    // Simple S-shaped path
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = 50 + Math.sin(t * Math.PI) * 100 + t * 150;
      const y = 50 + t * 300;
      path.push({ x, y });
    }
    return path;
  }

  function generateMediumPath(): PathPoint[] {
    const path: PathPoint[] = [];
    // More complex path with multiple turns
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    
    // Start at top middle
    path.push({ x: width / 2, y: 30 });
    
    // Go right
    for (let i = 0; i <= 50; i++) {
      path.push({ x: width / 2 + (i / 50) * (width / 2 - 50), y: 30 + (i / 50) * 50 });
    }
    
    // Go down right
    for (let i = 0; i <= 50; i++) {
      path.push({ x: width - 50, y: 80 + (i / 50) * 150 });
    }
    
    // Go left
    for (let i = 0; i <= 50; i++) {
      path.push({ x: width - 50 - (i / 50) * (width - 100), y: 230 });
    }
    
    // Go down left
    for (let i = 0; i <= 50; i++) {
      path.push({ x: 50, y: 230 + (i / 50) * 130 });
    }
    
    // End
    path.push({ x: 50, y: height - 30 });
    
    return path;
  }

  const drawMaze = (ctx: CanvasRenderingContext2D) => {
    const maze = mazeLevels[currentLevel];
    const path = maze.path;

    // Clear canvas
    ctx.fillStyle = '#F8F3A9';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw path
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    // Draw start point
    ctx.fillStyle = '#37C87B';
    ctx.beginPath();
    ctx.arc(path[0].x, path[0].y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw finish point
    ctx.fillStyle = '#1279B6';
    ctx.beginPath();
    ctx.arc(path[path.length - 1].x, path[path.length - 1].y, FINISH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw cursor
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gameStateRef.current.mouseX, gameStateRef.current.mouseY, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Draw crosshair
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gameStateRef.current.mouseX - 5, gameStateRef.current.mouseY);
    ctx.lineTo(gameStateRef.current.mouseX + 5, gameStateRef.current.mouseY);
    ctx.moveTo(gameStateRef.current.mouseX, gameStateRef.current.mouseY - 5);
    ctx.lineTo(gameStateRef.current.mouseX, gameStateRef.current.mouseY + 5);
    ctx.stroke();
  };

  const isNearPath = (x: number, y: number, path: PathPoint[]): boolean => {
    for (const point of path) {
      const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (dist < TOLERANCE) return true;
    }
    return false;
  };

  const getProgressOnPath = (x: number, y: number, path: PathPoint[]): number => {
    let closestDist = Infinity;
    let closestIdx = 0;

    for (let i = 0; i < path.length; i++) {
      const dist = Math.sqrt((x - path[i].x) ** 2 + (y - path[i].y) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    return closestIdx / path.length;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || won || !isReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    gameStateRef.current.mouseX = x;
    gameStateRef.current.mouseY = y;

    const maze = mazeLevels[currentLevel];
    const onPath = isNearPath(x, y, maze.path);

    if (!onPath) {
      setGameOver(true);
      setTimeout(() => {
        onComplete(false, 10, 0);
      }, 2000);
      return;
    }

    gameStateRef.current.onPath = true;
    const prog = getProgressOnPath(x, y, maze.path);
    setProgress(prog);

    // Check if reached finish
    const finishPoint = maze.path[maze.path.length - 1];
    const distToFinish = Math.sqrt((x - finishPoint.x) ** 2 + (y - finishPoint.y) ** 2);

    if (distToFinish < FINISH_RADIUS) {
      if (currentLevel + 1 < mazeLevels.length) {
        setCurrentLevel(currentLevel + 1);
        setProgress(0);
        setIsReady(false);
      } else {
        setWon(true);
        setTimeout(() => {
          onComplete(true, 10, 150);
        }, 1500);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!gameOver && !won) {
      setGameOver(true);
    }
  };

  // Initialize game with ready delay
  useEffect(() => {
    if (isReady) return;
    
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isReady, currentLevel]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver || won) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawMaze(ctx);
      requestAnimationFrame(animate);
    };

    animate();
  }, [gameOver, won, currentLevel]);

  return (
    <ChallengeBase
      title="Maze Game"
      description="Keep your cursor on the path to reach the finish"
 
 

    >
      <Container>
        <Instructions>
          {!isReady ? '⏳ Get ready...' : `Level ${currentLevel + 1}/${mazeLevels.length} - ${mazeLevels[currentLevel].difficulty}`}
        </Instructions>

        <GameContainer
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <GameCanvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
        </GameContainer>

        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>

        <AnimatePresence>
          {gameOver && (
            <ResultBox
              $type="loss"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultText>❌ You left the path!</ResultText>
            </ResultBox>
          )}
          {won && (
            <ResultBox
              $type="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultText>🎉 All Levels Complete!</ResultText>
            </ResultBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default MazeGame;
