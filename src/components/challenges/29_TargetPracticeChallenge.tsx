import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Target on canvas
 */
interface Target {
  id: string;
  x: number;
  y: number;
  radius: number;
  createdAt: number;
  hit: boolean;
}

/**
 * Hit feedback
 */
interface HitFeedback {
  id: string;
  x: number;
  y: number;
  type: 'hit' | 'miss';
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
  cursor: crosshair;
  image-rendering: pixelated;
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
 * Stat item
 */
const StatItem = styled.div`
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
 * Feedback overlay
 */
const FeedbackOverlay = styled(motion.div)`
  position: fixed;
  pointer-events: none;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  z-index: 1000;
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
 * Target Practice Challenge Component
 */
const TargetPracticeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState(Date.now());

  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<HitFeedback[]>([]);

  const targetIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const TARGET_RADIUS = 30;

  /**
   * Spawn a target
   */
  const spawnTarget = () => {
    const id = `target-${targetIdRef.current++}`;
    const x = Math.random() * (CANVAS_WIDTH - TARGET_RADIUS * 2) + TARGET_RADIUS;
    const y = Math.random() * (CANVAS_HEIGHT - TARGET_RADIUS * 2) + TARGET_RADIUS;

    setTargets((prev) => [
      ...prev,
      {
        id,
        x,
        y,
        radius: TARGET_RADIUS,
        createdAt: Date.now(),
        hit: false,
      },
    ]);

    setTotalTargets((prev) => prev + 1);
  };

  /**
   * Handle canvas click
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hitTarget = false;

    setTargets((prev) =>
      prev.map((target) => {
        if (target.hit) return target;

        const dx = clickX - target.x;
        const dy = clickY - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= target.radius) {
          hitTarget = true;
          setHits((h) => h + 1);
          addFeedback(clickX, clickY, 'hit');
          return { ...target, hit: true };
        }

        return target;
      })
    );

    if (!hitTarget) {
      addFeedback(clickX, clickY, 'miss');
    }
  };

  /**
   * Add feedback message
   */
  const addFeedback = (x: number, y: number, type: 'hit' | 'miss') => {
    const id = `feedback-${Date.now()}-${Math.random()}`;
    const feedback: HitFeedback = { id, x, y, type };

    setFeedbacks((prev) => [...prev, feedback]);

    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  };

  /**
   * Animation loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;

      // End game after 35 seconds
      if (elapsedSeconds >= 35) {
        setCompleted(true);
        const score = hits * 20;
        const success = hits >= 10;

        setTimeout(() => {
          onComplete(success, elapsedSeconds, score);
        }, 1500);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw grid
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw targets
      targets.forEach((target) => {
        const targetAge = now - target.createdAt;

        if (!target.hit) {
          // Pulsing animation
          const pulse = Math.sin(targetAge / 200) * 5;

          // Outer ring
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.radius + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Middle ring
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.radius / 2, 0, Math.PI * 2);
          ctx.stroke();

          // Center dot
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targets, completed, startTime, onComplete, hits]);

  /**
   * Spawn targets at intervals
   */
  useEffect(() => {
    if (completed || totalTargets >= 15) return;

    spawnIntervalRef.current = setInterval(() => {
      spawnTarget();
    }, 2000);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [completed, totalTargets]);

  if (completed) {
    const success = hits >= 10;

    return (
      <ChallengeBase
        title="Target Practice Challenge"
        description="Click on the targets before time runs out"
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
          <Emoji>{success ? '🎯' : '🎪'}</Emoji>
          <span>{success ? 'Excellent aim!' : 'Keep practicing!'}</span>
          <span>
            Hits: {hits}/15
          </span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Target Practice Challenge"
      description="Click on the targets before time runs out"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Instructions>Click on the green targets!</Instructions>

        <GameCanvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          as={motion.canvas}
        />

        <StatsDisplay>
          <StatItem>
            <Label>Hits</Label>
            <span>{hits}</span>
          </StatItem>
          <StatItem>
            <Label>Targets</Label>
            <span>
              {totalTargets}/15
            </span>
          </StatItem>
        </StatsDisplay>

        {feedbacks.map((feedback) => (
          <FeedbackOverlay
            key={feedback.id}
            style={{
              left: feedback.x,
              top: feedback.y,
              color: feedback.type === 'hit' ? '#10B981' : '#EF4444',
            }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
          >
            {feedback.type === 'hit' ? 'HIT!' : 'MISS!'}
          </FeedbackOverlay>
        ))}
      </Container>
    </ChallengeBase>
  );
};

export default TargetPracticeChallenge;
