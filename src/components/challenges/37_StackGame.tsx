/**
 * Stack Game Challenge
 * 
 * Inspired by: https://codepen.io/ste-vg/pen/ppLQNW
 * Adapted to React/TypeScript with 2D canvas rendering
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

const GameCanvas = styled.canvas`
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  display: block;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1;
`;

const ScoreDisplay = styled(motion.div)`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
`;

const Instructions = styled.p`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const GameOverBox = styled(motion.div)`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: rgba(220, 104, 90, 0.1);
  border: 2px solid #dc685a;
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const GameOverText = styled.p`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: #dc685a;
  margin: 0;
`;

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const StackGame: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [direction, setDirection] = useState(1);
  const gameStateRef = useRef({
    isMoving: true,
    score: 0,
    gameOver: false,
  });

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 400;
  const BLOCK_HEIGHT = 20;
  const INITIAL_WIDTH = 80;
  const SPEED = 2;

  const colors = [
    '#3B82F6',
    '#A855F7',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
  ];

  const generateColor = (index: number) => colors[index % colors.length];

  const createNewBlock = () => {
    const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
    const width = lastBlock
      ? Math.max(INITIAL_WIDTH * 0.8, lastBlock.width - 10)
      : INITIAL_WIDTH;
    const y = lastBlock
      ? lastBlock.y - BLOCK_HEIGHT - 5
      : CANVAS_HEIGHT - BLOCK_HEIGHT;

    return {
      x: CANVAS_WIDTH / 2 - width / 2,
      y,
      width,
      height: BLOCK_HEIGHT,
      color: generateColor(blocks.length),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize first block
    if (blocks.length === 0) {
      const firstBlock = createNewBlock();
      setBlocks([firstBlock]);
      setCurrentBlock(firstBlock);
      return;
    }

    if (!currentBlock) return;

    const animate = () => {
      if (gameStateRef.current.gameOver) return;

      // Draw canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw placed blocks
      blocks.forEach((block) => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
      });

      // Move current block
      if (gameStateRef.current.isMoving) {
        const newBlock = {
          ...currentBlock,
          x: currentBlock.x + direction * SPEED,
        };

        // Bounce detection
        if (
          newBlock.x <= 0 ||
          newBlock.x + newBlock.width >= CANVAS_WIDTH
        ) {
          setDirection(-direction);
        } else {
          setCurrentBlock(newBlock);
        }
      }

      // Draw current block
      ctx.fillStyle = currentBlock.color;
      ctx.fillRect(
        currentBlock.x,
        currentBlock.y,
        currentBlock.width,
        currentBlock.height
      );
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBlock.x,
        currentBlock.y,
        currentBlock.width,
        currentBlock.height
      );

      requestAnimationFrame(animate);
    };

    animate();
  }, [blocks, currentBlock, direction]);

  const handlePlaceBlock = () => {
    if (!currentBlock || gameStateRef.current.gameOver) return;

    const lastBlock = blocks[blocks.length - 1];

    // Check for overlap
    const overlapLeft = Math.max(
      lastBlock.x,
      currentBlock.x
    );
    const overlapRight = Math.min(
      lastBlock.x + lastBlock.width,
      currentBlock.x + currentBlock.width
    );
    const overlap = overlapRight - overlapLeft;

    if (overlap <= 0) {
      // Miss!
      gameStateRef.current.gameOver = true;
      setGameOver(true);
      setTimeout(() => {
        onComplete(false, 5, 0);
      }, 2000);
      return;
    }

    // Place block with overlap
    const placedBlock: Block = {
      ...currentBlock,
      x: overlapLeft,
      width: overlap,
    };

    const newBlocks = [...blocks, placedBlock];
    setBlocks(newBlocks);

    const newScore = newBlocks.length - 1;
    setScore(newScore);
    gameStateRef.current.score = newScore;

    // Win condition
    if (newScore >= 5) {
      gameStateRef.current.gameOver = true;
      setGameOver(true);
      setTimeout(() => {
        onComplete(true, 5, Math.max(100, newScore * 20));
      }, 1500);
      return;
    }

    // Create next block
    const nextBlock = createNewBlock();
    setCurrentBlock(nextBlock);
    setDirection(direction);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlaceBlock();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentBlock, blocks, gameOver]);

  return (
    <ChallengeBase
      title="Stack Game"
      description="Stack blocks higher and higher"
 
 

    >
      <Container>
        <ScoreDisplay
          key={`score-${score}`}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {score}
        </ScoreDisplay>

        <GameCanvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        <Instructions>Click or press SPACE to place block</Instructions>

        <motion.button
          onClick={handlePlaceBlock}
          disabled={gameOver}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            background: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.lg,
            cursor: gameOver ? 'not-allowed' : 'pointer',
            fontFamily: theme.fonts.primary,
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.bold,
            opacity: gameOver ? 0.5 : 1,
          }}
          whileHover={!gameOver ? { scale: 1.05 } : {}}
          whileTap={!gameOver ? { scale: 0.95 } : {}}
        >
          Place Block
        </motion.button>

        <AnimatePresence>
          {gameOver && (
            <GameOverBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <GameOverText>
                {score >= 5 ? '🎉 You Won!' : '💥 Game Over!'}
              </GameOverText>
              <GameOverText style={{ fontSize: theme.fontSizes.md, marginTop: theme.spacing.sm }}>
                Score: {score}
              </GameOverText>
            </GameOverBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default StackGame;
