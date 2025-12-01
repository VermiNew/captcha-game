/**
 * Connect Dots Challenge
 * 
 * Inspired by: https://codepen.io/meiq/pen/drGYVj
 * Click on numbered dots in sequence to draw a shape
 */

import React, { useState, useRef, useEffect } from 'react';
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
  max-width: 600px;
  padding: ${theme.spacing.lg};
`;

const GameCanvas = styled.canvas`
  border: 3px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  background: #DDDDDD;
  display: block;
  width: 100%;
  max-width: 500px;
  cursor: crosshair;
`;

const Instructions = styled.p`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const ProgressText = styled(motion.p)`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  margin: 0;
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

interface Dot {
  x: number;
  y: number;
  index: number;
}

const ConnectDots: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [completedDots, setCompletedDots] = useState<Dot[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 500;
  const DOT_SIZE = 12;
  const DOT_TOLERANCE = 20;

  // Guide dots forming a star/complex shape
  const guideDots: Dot[] = [
    { x: 162, y: 218, index: 0 },
    { x: 122, y: 240, index: 1 },
    { x: 266, y: 308, index: 2 },
    { x: 310, y: 218, index: 3 },
    { x: 300, y: 314, index: 4 },
    { x: 458, y: 360, index: 5 },
    { x: 430, y: 316, index: 6 },
    { x: 458, y: 220, index: 7 },
    { x: 448, y: 170, index: 8 },
    { x: 500, y: 216, index: 9 },
    { x: 472, y: 310, index: 10 },
    { x: 214, y: 148, index: 11 },
  ];

  const isWithinDot = (px: number, py: number, dot: Dot): boolean => {
    const distance = Math.sqrt((px - dot.x) ** 2 + (py - dot.y) ** 2);
    return distance < DOT_TOLERANCE;
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw guide dots
    guideDots.forEach((dot, idx) => {
      const isCompleted = completedDots.some(d => d.index === idx);

      // Draw dot
      ctx.fillStyle = isCompleted ? '#5A5A5A' : '#A0A0A0';
      ctx.strokeStyle = isCompleted ? '#2A2A2A' : '#505050';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw number
      ctx.fillStyle = '#5A5A5A';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((idx + 1).toString(), dot.x + 2, dot.y + 2);
    });

    // Draw completed path
    if (completedDots.length > 0) {
      ctx.strokeStyle = '#DE373F';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(completedDots[0].x, completedDots[0].y);

      for (let i = 1; i < completedDots.length; i++) {
        ctx.lineTo(completedDots[i].x, completedDots[i].y);
      }
      ctx.stroke();

      // Draw completed dots
      completedDots.forEach((dot) => {
        ctx.fillStyle = '#5A5A5A';
        ctx.strokeStyle = '#5A5A5A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_SIZE - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw line from last dot to current mouse position
    if (completedDots.length > 0 && !gameComplete) {
      ctx.strokeStyle = 'rgba(222, 55, 111, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(completedDots[completedDots.length - 1].x, completedDots[completedDots.length - 1].y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw start hint
    if (completedDots.length === 0) {
      ctx.fillStyle = '#DE373F';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('👇 Start here!', guideDots[0].x - 10, guideDots[0].y - 25);
    }

    // Draw completion message
    if (gameComplete) {
      // Draw filled shape
      ctx.fillStyle = 'rgba(222, 55, 111, 0.3)';
      ctx.strokeStyle = '#DE373F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(completedDots[0].x, completedDots[0].y);
      for (let i = 1; i < completedDots.length; i++) {
        ctx.lineTo(completedDots[i].x, completedDots[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#5A5A5A';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('✨ Completed!', CANVAS_WIDTH / 2, 20);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameComplete) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on next dot
    const nextDotIndex = completedDots.length;
    if (nextDotIndex < guideDots.length) {
      const nextDot = guideDots[nextDotIndex];
      if (isWithinDot(x, y, nextDot)) {
        const newDots = [...completedDots, nextDot];
        setCompletedDots(newDots);

        // Check if completed all dots
        if (newDots.length === guideDots.length) {
          setGameComplete(true);
          setTimeout(() => {
            onComplete(true, 10, 100);
          }, 1500);
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setMousePos({ x, y });
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      drawGame(ctx);
      requestAnimationFrame(animate);
    };

    animate();
  }, [completedDots, mousePos, gameComplete]);

  return (
    <ChallengeBase
      title="Connect Dots"
      description="Click on the numbered dots in order to draw a shape"
 
 

    >
      <Container>
        <Instructions>Click the dots in numerical order</Instructions>

        <GameCanvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />

        <ProgressText
          key={`progress-${completedDots.length}`}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {completedDots.length} / {guideDots.length}
        </ProgressText>

        <AnimatePresence>
          {gameComplete && (
            <ResultBox
              $type="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultText>🎉 Perfect!</ResultText>
            </ResultBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default ConnectDots;
