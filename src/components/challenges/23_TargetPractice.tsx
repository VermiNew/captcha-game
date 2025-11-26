import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * 3D Target
 */
interface Target {
  id: string;
  x: number; // Screen X
  y: number; // Screen Y
  z: number; // Depth (0-1, closer = larger)
  radius: number;
  createdAt: number;
  hit: boolean;
  vz: number; // Velocity in Z direction
}

/**
 * Hit feedback
 */
interface HitFeedback {
  id: string;
  x: number;
  y: number;
  z: number;
  type: 'hit' | 'miss';
}

/**
 * Particle for explosion effect
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  perspective: 1000px;
`;

/**
 * Canvas wrapper with 3D effect
 */
const CanvasWrapper = styled.div`
  position: relative;
  transform-style: preserve-3d;
  box-shadow: ${theme.shadows.lg};
  border-radius: ${theme.borderRadius.lg};
`;

/**
 * Canvas element
 */
const GameCanvas = styled.canvas`
  border: 4px solid ${theme.colors.primary};
  background: linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 100%);
  border-radius: ${theme.borderRadius.lg};
  cursor: crosshair;
  display: block;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
`;

/**
 * Stats container
 */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 700px;
`;

/**
 * Stat card with 3D effect
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.border}20);
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  transform-style: preserve-3d;
  transition: all 0.3s ease;

  &:hover {
    transform: translateZ(10px);
    border-color: ${theme.colors.primary};
  }
`;

/**
 * Stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Stat value with 3D text effect
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

/**
 * Instructions with glow
 */
const Instructions = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  text-shadow: 0 0 10px ${theme.colors.primary}40;
`;

/**
 * Feedback overlay with 3D positioning
 */
const FeedbackOverlay = styled(motion.div)<{ $z: number }>`
  position: absolute;
  pointer-events: none;
  font-family: ${theme.fonts.mono};
  font-size: ${props => 12 + props.$z * 24}px;
  font-weight: ${theme.fontWeights.bold};
  z-index: ${props => Math.floor(props.$z * 100)};
  text-shadow: 0 0 10px currentColor;
  transform: translateZ(${props => props.$z * 50}px);
`;

/**
 * Completion message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${props => props.$success ? theme.colors.success : theme.colors.error};
  background: ${props => props.$success ? 
    'rgba(16, 185, 129, 0.1)' : 
    'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.$success ? theme.colors.success : theme.colors.error};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
  max-width: 600px;
`;

/**
 * Emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['4xl']};
  line-height: 1;
`;

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;
const BASE_TARGET_RADIUS = 25;

/**
 * Target Practice Challenge Component - 2.5D Version
 */
const TargetPracticeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState(() => Date.now());

  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<HitFeedback[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  const targetIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  /**
   * Spawn a target at random position with depth
   */
  const spawnTarget = useCallback(() => {
    const id = `target-${targetIdRef.current++}`;
    const z = Math.random(); // Start at back (0) to front (1)
    const radius = BASE_TARGET_RADIUS * (0.5 + z * 1.5); // Scale by depth
    
    const x = Math.random() * (CANVAS_WIDTH - radius * 2) + radius;
    const y = Math.random() * (CANVAS_HEIGHT - radius * 2) + radius;

    setTargets(prev => [
      ...prev,
      {
        id,
        x,
        y,
        z: 0.1, // Start far
        radius,
        createdAt: Date.now(),
        hit: false,
        vz: 0.15 + Math.random() * 0.15, // Speed towards camera
      },
    ]);

    setTotalTargets(prev => prev + 1);
  }, []);

  /**
   * Create explosion particles
   */
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  /**
   * Handle canvas click
   */
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hitTarget = false;

    setTargets(prev => {
      return prev.map(target => {
        if (target.hit) return target;

        const screenRadius = BASE_TARGET_RADIUS * (0.5 + target.z * 1.5);
        const dx = clickX - target.x;
        const dy = clickY - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= screenRadius) {
          hitTarget = true;
          setHits(h => h + 1);
          addFeedback(target.x, target.y, target.z, 'hit');
          createExplosion(target.x, target.y, '#10B981');
          return { ...target, hit: true };
        }

        return target;
      });
    });

    if (!hitTarget) {
      addFeedback(clickX, clickY, 0.5, 'miss');
      createExplosion(clickX, clickY, '#EF4444');
    }
  }, [completed, createExplosion]);

  /**
   * Add feedback message
   */
  const addFeedback = useCallback((x: number, y: number, z: number, type: 'hit' | 'miss') => {
    const id = `feedback-${Date.now()}-${Math.random()}`;
    const feedback: HitFeedback = { id, x, y, z, type };

    setFeedbacks(prev => [...prev, feedback]);

    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 1000);
  }, []);

  /**
   * Animation loop with 2.5D rendering
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0a0a1e');
      gradient.addColorStop(1, '#1a1a3e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw perspective grid
      ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
      ctx.lineWidth = 1;
      
      // Horizontal lines with perspective
      for (let i = 0; i <= 10; i++) {
        const y = (CANVAS_HEIGHT / 10) * i;
        const depth = i / 10;
        ctx.strokeStyle = `rgba(100, 100, 150, ${0.1 + depth * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Vertical lines with perspective
      for (let i = 0; i <= 14; i++) {
        const x = (CANVAS_WIDTH / 14) * i;
        const offset = Math.abs(i - 7) * 10;
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + offset, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Update and draw particles
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // Gravity
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0);
      });

      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Update target positions (move towards camera)
      setTargets(prev => {
        return prev
          .map(target => ({
            ...target,
            z: target.z + target.vz * 0.016, // ~60fps
          }))
          .filter(target => !target.hit && target.z < 1.5); // Remove if too close or hit
      });

      // Sort targets by depth (far to near)
      const sortedTargets = [...targets].sort((a, b) => a.z - b.z);

      // Draw targets with 2.5D effect
      sortedTargets.forEach(target => {
        if (target.hit) return;

        const targetAge = now - target.createdAt;
        const scale = 0.5 + target.z * 1.5;
        const screenRadius = BASE_TARGET_RADIUS * scale;
        
        // Opacity based on depth
        const opacity = Math.min(1, target.z + 0.3);
        
        // Shadow
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(target.x + 5, target.y + 5, screenRadius, screenRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing animation
        const pulse = Math.sin(targetAge / 200) * 3;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          target.x, target.y, 0,
          target.x, target.y, screenRadius + pulse + 15
        );
        glowGradient.addColorStop(0, `rgba(16, 185, 129, ${opacity * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(target.x, target.y, screenRadius + pulse + 15, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring
        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.arc(target.x, target.y, screenRadius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Middle ring
        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.6})`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(target.x, target.y, screenRadius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.4})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(target.x, target.y, screenRadius * 0.35, 0, Math.PI * 2);
        ctx.stroke();

        // Center dot with glow
        const centerGradient = ctx.createRadialGradient(
          target.x, target.y, 0,
          target.x, target.y, 8 * scale
        );
        centerGradient.addColorStop(0, `rgba(16, 185, 129, ${opacity})`);
        centerGradient.addColorStop(1, `rgba(16, 185, 129, ${opacity * 0.3})`);
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(target.x, target.y, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Depth indicator (crosshair)
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(target.x - 10 * scale, target.y);
        ctx.lineTo(target.x + 10 * scale, target.y);
        ctx.moveTo(target.x, target.y - 10 * scale);
        ctx.lineTo(target.x, target.y + 10 * scale);
        ctx.stroke();

        // Distance indicator
        const distText = Math.floor((1 - target.z) * 100) + 'm';
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
        ctx.font = `${10 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(distText, target.x, target.y + screenRadius + 15);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targets, particles, completed, startTime, onComplete, hits]);

  /**
   * Spawn targets at intervals
   */
  useEffect(() => {
    if (completed || totalTargets >= 15) return;

    // Initial spawn
    if (totalTargets === 0) {
      spawnTarget();
    }

    spawnIntervalRef.current = setInterval(() => {
      spawnTarget();
    }, 2000);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [completed, totalTargets, spawnTarget]);

  if (completed) {
    const success = hits >= 10;

    return (
      <ChallengeBase
        title="Target Practice Challenge"
        description="Shoot the approaching targets!"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <Container>
          <FeedbackMessage
            $success={success}
            initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Emoji>{success ? '🎯' : '🎪'}</Emoji>
            <div style={{ fontSize: theme.fontSizes.xl }}>
              {success ? 'Excellent aim!' : 'Keep practicing!'}
            </div>
            <div style={{ fontSize: theme.fontSizes.md, fontWeight: 'normal' }}>
              Hits: {hits}/15 ({Math.round((hits / 15) * 100)}% accuracy)
            </div>
          </FeedbackMessage>
        </Container>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Target Practice Challenge"
      description="Shoot the approaching targets!"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Instructions
          animate={{ 
            textShadow: [
              '0 0 10px rgba(99, 102, 241, 0.4)',
              '0 0 20px rgba(99, 102, 241, 0.6)',
              '0 0 10px rgba(99, 102, 241, 0.4)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎯 Click the approaching targets before they get too close!
        </Instructions>

        <CanvasWrapper>
          <GameCanvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
          />

          <AnimatePresence>
            {feedbacks.map(feedback => {
              const canvas = canvasRef.current;
              if (!canvas) return null;
              
              const rect = canvas.getBoundingClientRect();
              
              return (
                <FeedbackOverlay
                  key={feedback.id}
                  $z={feedback.z}
                  style={{
                    left: rect.left + feedback.x,
                    top: rect.top + feedback.y,
                    color: feedback.type === 'hit' ? '#10B981' : '#EF4444',
                  }}
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -50, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  {feedback.type === 'hit' ? '+100' : 'MISS'}
                </FeedbackOverlay>
              );
            })}
          </AnimatePresence>
        </CanvasWrapper>

        <StatsContainer>
          <StatCard
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatLabel>Hits</StatLabel>
            <StatValue
              key={hits}
              animate={{ scale: [1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              {hits}
            </StatValue>
          </StatCard>

          <StatCard
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatLabel>Targets</StatLabel>
            <StatValue>{totalTargets}/15</StatValue>
          </StatCard>

          <StatCard
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatLabel>Active</StatLabel>
            <StatValue
              animate={{
                color: targets.length > 5 ? theme.colors.error : theme.colors.primary
              }}
            >
              {targets.length}
            </StatValue>
          </StatCard>
        </StatsContainer>
      </Container>
    </ChallengeBase>
  );
};

export default TargetPracticeChallenge;