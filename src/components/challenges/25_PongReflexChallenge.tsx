import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game state
 */
interface GameState {
  ballX: number;
  ballY: number;
  ballVelX: number;
  ballVelY: number;
  playerY: number;
  aiY: number;
  playerScore: number;
  aiScore: number;
}

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Canvas element
 */
const GameCanvas = styled.canvas`
  border: 3px solid ${theme.colors.primary};
  background-color: #000;
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  image-rendering: pixelated;
`;

/**
 * Scores display
 */
const ScoresDisplay = styled.div`
  display: flex;
  gap: ${theme.spacing['2xl']};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Score label
 */
const ScoreLabel = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Instructions
 */
const Instructions = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Pong Reflex Challenge Component
 */
const PongReflexChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState(Date.now());
  const gameStateRef = useRef<GameState>({
    ballX: 200,
    ballY: 150,
    ballVelX: 5,
    ballVelY: 5,
    playerY: 120,
    aiY: 120,
    playerScore: 0,
    aiScore: 0,
  });

  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [completed, setCompleted] = useState(false);
  const [playerMouseY, setPlayerMouseY] = useState(150);

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 300;
  const PADDLE_WIDTH = 8;
  const PADDLE_HEIGHT = 60;
  const BALL_SIZE = 8;

  /**
   * Handle mouse move
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      setPlayerMouseY(Math.max(0, Math.min(y, CANVAS_HEIGHT - PADDLE_HEIGHT)));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /**
   * Game loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Update ball position
      state.ballX += state.ballVelX;
      state.ballY += state.ballVelY;

      // Ball collision with top/bottom
      if (state.ballY - BALL_SIZE / 2 <= 0 || state.ballY + BALL_SIZE / 2 >= CANVAS_HEIGHT) {
        state.ballVelY *= -1;
        state.ballY = Math.max(BALL_SIZE / 2, Math.min(CANVAS_HEIGHT - BALL_SIZE / 2, state.ballY));
      }

      // Update player paddle
      state.playerY = playerMouseY;

      // Update AI paddle (simple tracking)
      const ballCenter = state.ballY;
      const aiPaddleCenter = state.aiY + PADDLE_HEIGHT / 2;
      const diff = ballCenter - aiPaddleCenter;
      state.aiY += diff * 0.08;
      state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY));

      // Player paddle collision
      if (
        state.ballX - BALL_SIZE / 2 <= PADDLE_WIDTH &&
        state.ballY >= state.playerY &&
        state.ballY <= state.playerY + PADDLE_HEIGHT
      ) {
        state.ballVelX *= -1.05;
        state.ballX = PADDLE_WIDTH + BALL_SIZE / 2;
      }

      // AI paddle collision
      if (
        state.ballX + BALL_SIZE / 2 >= CANVAS_WIDTH - PADDLE_WIDTH &&
        state.ballY >= state.aiY &&
        state.ballY <= state.aiY + PADDLE_HEIGHT
      ) {
        state.ballVelX *= -1.05;
        state.ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE / 2;
      }

      // Score points
      if (state.ballX < 0) {
        state.aiScore++;
        setScores({ ...state.playerScore, player: state.playerScore, ai: state.aiScore });
        state.ballX = CANVAS_WIDTH / 2;
        state.ballY = CANVAS_HEIGHT / 2;
        state.ballVelX = -5;
        state.ballVelY = 5;
      }

      if (state.ballX > CANVAS_WIDTH) {
        state.playerScore++;
        setScores({ player: state.playerScore, ai: state.aiScore });
        state.ballX = CANVAS_WIDTH / 2;
        state.ballY = CANVAS_HEIGHT / 2;
        state.ballVelX = 5;
        state.ballVelY = 5;
      }

      // Check win condition
      if (state.playerScore >= 3 || state.aiScore >= 3) {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const scoreDiff = state.playerScore - state.aiScore;
        let score = 100;
        if (scoreDiff === 3) score = 200;
        else if (scoreDiff === 2) score = 150;

        setTimeout(() => {
          onComplete(state.playerScore > state.aiScore, timeSpent, score);
        }, 1500);
      }

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }, [completed, playerMouseY, startTime, onComplete]);

  if (completed) {
    const isWon = scores.player > scores.ai;
    return (
      <ChallengeBase
        title="Pong Reflex Challenge"
        description="Beat the AI at Pong"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <FeedbackMessage
          $success={isWon}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>{isWon ? '🎉' : '😔'}</Emoji>
          <span>{isWon ? 'You won!' : 'AI won!'}</span>
          <span>
            Final Score: {scores.player} - {scores.ai}
          </span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Pong Reflex Challenge"
      description="Beat the AI at Pong"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Instructions>Move your paddle with the mouse. First to 3 points wins!</Instructions>

        <GameCanvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          as={motion.canvas}
        />

        <ScoresDisplay>
          <ScoreLabel>
            You
            <span>{scores.player}</span>
          </ScoreLabel>
          <ScoreLabel>
            AI
            <span>{scores.ai}</span>
          </ScoreLabel>
        </ScoresDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default PongReflexChallenge;
