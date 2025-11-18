import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game dimensions
 */
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const PADDLE_SPEED = 6;

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 700px;
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
  margin: ${theme.spacing.lg} 0;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled.div`
  display: flex;
  justify-content: space-around;
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
 * Styled game over message
 */
const GameOverMessage = styled(motion.div)`
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
 * Pong Game State
 */
interface GameState {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  ballDX: number;
  ballDY: number;
  playerScore: number;
  aiScore: number;
}

/**
 * Pong Arcade Challenge Component
 * Play Pong against AI - need to win 3 rounds
 */
const PongArcadeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballDX: BALL_SPEED,
    ballDY: BALL_SPEED,
    playerScore: 0,
    aiScore: 0,
  });

  const [roundsWon, setRoundsWon] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime] = useState(Date.now());
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  /**
   * Handle keyboard events
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
   * Game loop
   */
  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(() => {
      setGameState((prevState) => {
        let newState = { ...prevState };

        // Player paddle movement
        if (keysPressed.current['arrowup'] || keysPressed.current['w']) {
          newState.playerY = Math.max(0, newState.playerY - PADDLE_SPEED);
        }
        if (keysPressed.current['arrowdown'] || keysPressed.current['s']) {
          newState.playerY = Math.min(
            CANVAS_HEIGHT - PADDLE_HEIGHT,
            newState.playerY + PADDLE_SPEED
          );
        }

        // AI paddle movement
        const aiCenter = newState.aiY + PADDLE_HEIGHT / 2;
        const ballCenter = newState.ballY;
        const diff = ballCenter - aiCenter;

        if (Math.abs(diff) > 25) {
          if (diff > 0) {
            newState.aiY = Math.min(
              CANVAS_HEIGHT - PADDLE_HEIGHT,
              newState.aiY + PADDLE_SPEED * 0.8
            );
          } else {
            newState.aiY = Math.max(0, newState.aiY - PADDLE_SPEED * 0.8);
          }
        }

        // Ball movement
        newState.ballX += newState.ballDX;
        newState.ballY += newState.ballDY;

        // Ball collision with top/bottom
        if (newState.ballY - BALL_SIZE / 2 < 0 || newState.ballY + BALL_SIZE / 2 > CANVAS_HEIGHT) {
          newState.ballDY = -newState.ballDY;
          newState.ballY = Math.max(
            BALL_SIZE / 2,
            Math.min(CANVAS_HEIGHT - BALL_SIZE / 2, newState.ballY)
          );
        }

        // Ball collision with player paddle
        if (
          newState.ballX - BALL_SIZE / 2 < PADDLE_WIDTH &&
          newState.ballY > newState.playerY &&
          newState.ballY < newState.playerY + PADDLE_HEIGHT
        ) {
          newState.ballDX = -newState.ballDX;
          const collidePoint = newState.ballY - (newState.playerY + PADDLE_HEIGHT / 2);
          newState.ballDY = (collidePoint / (PADDLE_HEIGHT / 2)) * BALL_SPEED;
        }

        // Ball collision with AI paddle
        if (
          newState.ballX + BALL_SIZE / 2 > CANVAS_WIDTH - PADDLE_WIDTH &&
          newState.ballY > newState.aiY &&
          newState.ballY < newState.aiY + PADDLE_HEIGHT
        ) {
          newState.ballDX = -newState.ballDX;
          const collidePoint = newState.ballY - (newState.aiY + PADDLE_HEIGHT / 2);
          newState.ballDY = (collidePoint / (PADDLE_HEIGHT / 2)) * BALL_SPEED;
        }

        // Scoring
        if (newState.ballX < 0) {
          newState.aiScore += 1;
          newState.ballX = CANVAS_WIDTH / 2;
          newState.ballY = CANVAS_HEIGHT / 2;
          newState.ballDX = BALL_SPEED;
          newState.ballDY = BALL_SPEED;
        }

        if (newState.ballX > CANVAS_WIDTH) {
          newState.playerScore += 1;
          newState.ballX = CANVAS_WIDTH / 2;
          newState.ballY = CANVAS_HEIGHT / 2;
          newState.ballDX = -BALL_SPEED;
          newState.ballDY = BALL_SPEED;
        }

        return newState;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [isGameOver]);

  /**
   * Render game
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#666';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#0ff';
    ctx.fillRect(0, gameState.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [gameState]);

  /**
   * Check round completion
   */
  useEffect(() => {
    const maxScore = 11;
    if (gameState.playerScore >= maxScore) {
      const newRoundsWon = roundsWon + 1;
      setRoundsWon(newRoundsWon);

      if (newRoundsWon >= 3) {
        setIsGameOver(true);
        setTimeout(() => {
          const timeSpent = (Date.now() - startTime) / 1000;
          onComplete(true, timeSpent, 300);
        }, 2000);
      } else {
        // Reset for next round
        setGameState({
          playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          ballX: CANVAS_WIDTH / 2,
          ballY: CANVAS_HEIGHT / 2,
          ballDX: BALL_SPEED,
          ballDY: BALL_SPEED,
          playerScore: 0,
          aiScore: 0,
        });
      }
    }
  }, [gameState.playerScore, roundsWon, startTime, onComplete]);

  return (
    <ChallengeBase
      title="Pong Arcade"
      description="Win 3 rounds of Pong against AI (first to 11 points)"
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
          Pong Arcade
        </Title>

        <Instruction>
          Use Arrow Keys or WASD to move your paddle (left side). Win 3 rounds!
        </Instruction>

        <GameCanvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        <ScoreDisplay>
          <div>
            <p>You</p>
            <p>{gameState.playerScore}</p>
          </div>
          <div>
            <p>AI</p>
            <p>{gameState.aiScore}</p>
          </div>
          <div>
            <p>Rounds Won</p>
            <p>{roundsWon} / 3</p>
          </div>
        </ScoreDisplay>

        {isGameOver && (
          <GameOverMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ✓ Victory! You won 3 rounds!
          </GameOverMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default PongArcadeChallenge;
