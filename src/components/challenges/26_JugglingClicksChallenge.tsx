import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Falling ball
 */
interface FallingBall {
  id: string;
  x: number;
  y: number;
  velocity: number;
  createdAt: number;
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
 * Game area
 */
const GameArea = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 500px;
  background: linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%);
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  cursor: pointer;
`;

/**
 * Ball element
 */
const Ball = styled(motion.div)<{ $hit: boolean }>`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
  cursor: pointer;
  opacity: ${(props) => (props.$hit ? 0 : 1)};
  pointer-events: ${(props) => (props.$hit ? 'none' : 'auto')};
`;

/**
 * Stats display
 */
const StatsDisplay = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Stat
 */
const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Label
 */
const Label = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
 * Juggling Clicks Challenge Component
 */
const JugglingClicksChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [startTime] = useState(() => Date.now());
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [fallingBalls, setFallingBalls] = useState<FallingBall[]>([]);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hitBallIds, setHitBallIds] = useState<Set<string>>(new Set());

  const ballIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  /**
   * Spawn a new ball
   */
  const spawnBall = () => {
    const id = `ball-${ballIdRef.current++}`;
    const x = Math.random() * 360; // 400 - 40
    const newBall: FallingBall = {
      id,
      x,
      y: -40,
      velocity: 2,
      createdAt: Date.now(),
    };
    setFallingBalls((prev) => [...prev, newBall]);
  };

  /**
   * Handle ball click
   */
  const handleBallClick = (ballId: string) => {
    if (hitBallIds.has(ballId)) return;

    setCaught((prev) => prev + 1);
    setHitBallIds((prev) => new Set([...prev, ballId]));

    setTimeout(() => {
      setFallingBalls((prev) => prev.filter((b) => b.id !== ballId));
    }, 100);
  };

  /**
   * Game loop
   */
  useEffect(() => {
    if (completed) return;

    const gameLoop = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;

      // End game after 20 seconds
      if (elapsedSeconds >= 20) {
        setCompleted(true);
        const totalCaught = caught;
        const score = Math.round(totalCaught * 20);
        const success = totalCaught >= 8;

        setTimeout(() => {
          onComplete(success, elapsedSeconds, score);
        }, 1500);
        return;
      }

      setFallingBalls((prevBalls) => {
        const updated = prevBalls
          .map((ball) => ({
            ...ball,
            y: ball.y + ball.velocity,
            velocity: ball.velocity + 0.1, // Gravity
          }))
          .filter((ball) => {
            if (ball.y > 500) {
              if (!hitBallIds.has(ball.id)) {
                setMissed((prev) => prev + 1);
              }
              return false;
            }
            return true;
          });

        return updated;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [caught, completed, startTime, hitBallIds, onComplete]);

  /**
   * Spawn balls at intervals
   */
  useEffect(() => {
    if (completed) return;

    spawnIntervalRef.current = setInterval(() => {
      spawnBall();
    }, 2000);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [completed]);

  if (completed) {
    const total = caught + missed;
    const success = caught >= 8;

    return (
      <ChallengeBase
        title="Juggling Clicks Challenge"
        description="Catch the falling balls"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <FeedbackMessage
          $success={success}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>{success ? '🎪' : '😅'}</Emoji>
          <span>{success ? 'Great juggling!' : 'Keep practicing!'}</span>
          <span>
            Caught: {caught}/{total} balls
          </span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Juggling Clicks Challenge"
      description="Catch the falling balls"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Instructions>Click on the falling balls before they hit the ground!</Instructions>

        <GameArea
          ref={gameAreaRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {fallingBalls.map((ball) => (
            <Ball
              key={ball.id}
              $hit={hitBallIds.has(ball.id)}
              style={{
                left: ball.x,
                top: ball.y,
              }}
              onClick={() => handleBallClick(ball.id)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </GameArea>

        <StatsDisplay>
          <Stat>
            <Label>Caught</Label>
            <span>{caught}</span>
          </Stat>
          <Stat>
            <Label>Missed</Label>
            <span>{missed}</span>
          </Stat>
        </StatsDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default JugglingClicksChallenge;
