import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Point interface for drawing coordinates
 */
interface Point {
  x: number;
  y: number;
}

/**
 * Calculate circularity of drawn shape (0-100%)
 * Based on how consistently distant points are from center
 */
const calculateCircularity = (points: Point[]): number => {
  if (points.length < 10) return 0;

  // Find center (average x, y)
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  // Calculate distances from center to each point
  const distances = points.map((p) =>
    Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2)),
  );

  // Calculate average radius
  const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  if (avgRadius === 0) return 0;

  // Calculate standard deviation of radii
  const variance = distances.reduce(
    (sum, d) => sum + Math.pow(d - avgRadius, 2),
    0,
  ) / distances.length;
  const stdDev = Math.sqrt(variance);

  // Circularity: lower std dev = more circular
  // Normalize to 0-100%
  const circularity = Math.max(0, 100 - (stdDev / avgRadius) * 100);

  return Math.min(100, circularity);
};

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
 * Styled accuracy display
 */
const AccuracyDisplay = styled(motion.div)<{ $color: string }>`
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  width: 100%;
  border: 2px solid ${(props) => props.$color};
`;

/**
 * Styled accuracy label
 */
const AccuracyLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.sm} 0;
  letter-spacing: 1px;
`;

/**
 * Styled accuracy value
 */
const AccuracyValue = styled(motion.div)<{ $color: string }>`
  font-family: ${theme.fonts.primary};
  font-size: 5rem;
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => props.$color};
  line-height: 1;
  margin-bottom: ${theme.spacing.sm};
`;

/**
 * Styled success message
 */
const SuccessMessage = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.success};
  margin: ${theme.spacing.md} 0 0 0;
`;

/**
 * Styled canvas wrapper
 */
const CanvasWrapper = styled(motion.div)`
  position: relative;
  display: inline-block;
  margin: 0 auto ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled canvas element
 */
const Canvas = styled.canvas`
  display: block;
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background};
  cursor: crosshair;
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 500px;
  height: auto;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
`;

/**
 * Styled canvas hint
 */
const CanvasHint = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  opacity: 0.15;
  pointer-events: none;
  user-select: none;
  line-height: 1;
`;

/**
 * Styled button group
 */
const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
`;

/**
 * Styled action button
 */
const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: ${theme.shadows.md};

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }

    &:active {
      transform: translateY(0);
    }
  `
      : `
    background: ${theme.colors.background};
    border: 2px solid ${theme.colors.primary};
    color: ${theme.colors.primary};

    &:hover {
      background: ${theme.colors.surface};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }

    &:active {
      transform: translateY(0);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Styled tip
 */
const Tip = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-style: italic;
  opacity: 0.8;
`;

/**
 * Draw Circle Challenge Component
 * User must draw a perfect circle with 90% accuracy
 */
const DrawCircleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime] = useState(Date.now());
  const [successTriggered, setSuccessTriggered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  /**
   * Initialize canvas context
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set actual canvas size
    canvas.width = 500;
    canvas.height = 500;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = theme.colors.primary;

    ctxRef.current = ctx;
  }, []);

  /**
   * Handle mouse down - start drawing
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPoints([{ x, y }]);

    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  /**
   * Handle mouse move - draw
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints((prev) => [...prev, { x, y }]);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  /**
   * Handle mouse up - stop drawing and calculate accuracy
   */
  const handleMouseUp = () => {
    if (!isDrawing || points.length === 0) return;

    setIsDrawing(false);

    // Calculate circularity
    const circularity = calculateCircularity(points);
    const roundedAccuracy = Math.round(circularity);
    setAccuracy(roundedAccuracy);

    // Check if user succeeded
    if (circularity >= 90 && !successTriggered) {
      setSuccessTriggered(true);
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = 250; // High score for difficult challenge

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1000);
    }
  };

  /**
   * Handle clear button
   */
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setAccuracy(0);
  };

  /**
   * Get color based on accuracy
   */
  const getAccuracyColor = (): string => {
    if (accuracy >= 90) return theme.colors.success;
    if (accuracy >= 70) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <ChallengeBase
      title="Draw Circle Challenge"
      description="Draw a perfect circle with 90% accuracy"
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
          Draw a Perfect Circle
        </Title>

        <Instruction>
          Draw a circle in one stroke. Achieve 90% accuracy to pass!
        </Instruction>

        <AccuracyDisplay
          $color={getAccuracyColor()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <AccuracyLabel>Accuracy</AccuracyLabel>
          <AccuracyValue
            $color={getAccuracyColor()}
            key={accuracy}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {accuracy}%
          </AccuracyValue>
          {accuracy >= 90 && (
            <SuccessMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              ✓ Perfect!
            </SuccessMessage>
          )}
        </AccuracyDisplay>

        <CanvasWrapper
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <CanvasHint>⭕</CanvasHint>
        </CanvasWrapper>

        <ButtonGroup
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ActionButton
            $variant="secondary"
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️ Try Again
          </ActionButton>
        </ButtonGroup>

        <Tip>
          💡 Tip: Draw slowly and steadily for better accuracy!
        </Tip>
      </Container>
    </ChallengeBase>
  );
};

export default DrawCircleChallenge;
