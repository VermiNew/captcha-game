import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
 * Constants
 */
const CANVAS_SIZE = 400;
const MIN_POINTS = 20;
const SUCCESS_THRESHOLD = 85;
const LINE_WIDTH = 4;

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

/**
 * Stats row
 */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Stat card
 */
const StatCard = styled(motion.div)<{ $highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.lg};
  background: ${props => props.$highlight ? 
    `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)` :
    theme.colors.surface};
  border: 2px solid ${props => props.$highlight ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
`;

const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled(motion.p)<{ $color?: string }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$color || theme.colors.primary};
  margin: 0;
  line-height: 1;
  text-shadow: 0 2px 10px currentColor;
`;

/**
 * Canvas wrapper
 */
const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: ${CANVAS_SIZE}px;
  aspect-ratio: 1;
`;

/**
 * Canvas
 */
const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  border: 4px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  background: white;
  cursor: crosshair;
  box-shadow: ${theme.shadows.lg};
  touch-action: none;
  user-select: none;
`;

/**
 * Hint overlay
 */
const HintOverlay = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8rem;
  opacity: 0.1;
  pointer-events: none;
  user-select: none;
  line-height: 1;
`;

/**
 * Feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $accuracy: number }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  background: ${props => {
    if (props.$accuracy >= SUCCESS_THRESHOLD) return 'rgba(16, 185, 129, 0.1)';
    if (props.$accuracy >= 70) return 'rgba(245, 158, 11, 0.1)';
    if (props.$accuracy >= 50) return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(107, 114, 128, 0.1)';
  }};
  border: 2px solid ${props => {
    if (props.$accuracy >= SUCCESS_THRESHOLD) return theme.colors.success;
    if (props.$accuracy >= 70) return theme.colors.warning;
    if (props.$accuracy >= 50) return theme.colors.error;
    return theme.colors.border;
  }};
  color: ${props => {
    if (props.$accuracy >= SUCCESS_THRESHOLD) return theme.colors.success;
    if (props.$accuracy >= 70) return theme.colors.warning;
    if (props.$accuracy >= 50) return theme.colors.error;
    return theme.colors.textSecondary;
  }};
`;

/**
 * Button
 */
const StyledButton = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.bold};
  border: 2px solid ${theme.colors.primary};
  background: ${theme.colors.surface};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};

  &:hover:not(:disabled) {
    background: ${theme.colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/**
 * Hint text
 */
const HintText = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.info};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(59, 130, 246, 0.1);
  border-radius: ${theme.borderRadius.md};
`;

/**
 * Calculate circularity of drawn shape
 */
const calculateCircularity = (points: Point[]): number => {
  if (points.length < MIN_POINTS) return 0;

  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  const distances = points.map(p =>
    Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
  );

  const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  if (avgRadius === 0) return 0;

  // Radius consistency (50%)
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) / distances.length;
  const stdDev = Math.sqrt(variance);
  const radiusScore = Math.max(0, 100 - (stdDev / avgRadius) * 100);

  // Closure (25%)
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const closureDistance = Math.sqrt(
    Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2)
  );
  const closureScore = Math.max(0, 100 - (closureDistance / avgRadius) * 80);

  // Aspect ratio (25%)
  const xDistances = points.map(p => Math.abs(p.x - centerX));
  const yDistances = points.map(p => Math.abs(p.y - centerY));
  const maxX = Math.max(...xDistances);
  const maxY = Math.max(...yDistances);
  const aspectRatio = Math.min(maxX, maxY) / Math.max(maxX, maxY);
  const aspectScore = aspectRatio * 100;

  const finalScore = radiusScore * 0.5 + closureScore * 0.25 + aspectScore * 0.25;
  return Math.min(100, Math.max(0, finalScore));
};

/**
 * Draw Circle Challenge Component
 */
const DrawCircleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [successTriggered, setSuccessTriggered] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  /**
   * Get accuracy color
   */
  const accuracyColor = useMemo(() => {
    if (accuracy >= SUCCESS_THRESHOLD) return theme.colors.success;
    if (accuracy >= 70) return theme.colors.warning;
    if (accuracy >= 50) return theme.colors.error;
    return theme.colors.textSecondary;
  }, [accuracy]);

  /**
   * Get feedback message
   */
  const feedbackMessage = useMemo(() => {
    if (!hasDrawn) return '⭕ Draw a circle to begin';
    if (accuracy >= SUCCESS_THRESHOLD) return '🎉 Perfect circle! Challenge completed!';
    if (accuracy >= 80) return '😊 Almost there! Very close!';
    if (accuracy >= 70) return '👍 Good attempt! Try once more';
    if (accuracy >= 50) return '💪 Keep practicing! Go slower';
    if (accuracy > 0) return '🔄 Try again! You can do it';
    return '⚠️ Draw must have at least 20 points';
  }, [hasDrawn, accuracy]);

  /**
   * Initialize canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = theme.colors.primary;

    ctxRef.current = ctx;
  }, []);

  /**
   * Get coordinates from event
   */
  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  /**
   * Start drawing
   */
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setHasDrawn(true);
    setShowHint(false);
    setPoints([coords]);

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  }, [getCoordinates]);

  /**
   * Continue drawing
   */
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    setPoints(prev => [...prev, coords]);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [isDrawing, getCoordinates]);

  /**
   * Stop drawing and calculate accuracy
   */
  const stopDrawing = useCallback(() => {
    if (!isDrawing || points.length === 0) return;

    setIsDrawing(false);
    setAttempts(prev => prev + 1);

    if (points.length < MIN_POINTS) {
      setAccuracy(0);
      return;
    }

    const circularity = calculateCircularity(points);
    const roundedAccuracy = Math.round(circularity);
    setAccuracy(roundedAccuracy);
    setBestAccuracy(prev => Math.max(prev, roundedAccuracy));

    if (circularity >= SUCCESS_THRESHOLD && !successTriggered) {
      setSuccessTriggered(true);
      const timeSpent = (Date.now() - startTime) / 1000;
      const perfectionBonus = Math.round((circularity - SUCCESS_THRESHOLD) * 10);
      const score = 300 + perfectionBonus;

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 2000);
    }
  }, [isDrawing, points, successTriggered, startTime, onComplete]);

  /**
   * Handle clear button
   */
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setAccuracy(0);
    setHasDrawn(false);
    setShowHint(true);
  }, []);

  return (
    <ChallengeBase
      title="Draw a Perfect Circle"
      description="Draw a circle in one smooth stroke"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      maxWidth="600px"
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StatsRow>
          <StatCard $highlight={accuracy >= SUCCESS_THRESHOLD}>
            <StatLabel>Accuracy</StatLabel>
            <StatValue
              $color={accuracyColor}
              key={accuracy}
              animate={{ scale: [1.3, 1] }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {accuracy}%
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Best</StatLabel>
            <StatValue $color={theme.colors.success}>
              {bestAccuracy}%
            </StatValue>
          </StatCard>
        </StatsRow>

        <CanvasWrapper>
          <Canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <AnimatePresence>
            {showHint && (
              <HintOverlay
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                ⭕
              </HintOverlay>
            )}
          </AnimatePresence>
        </CanvasWrapper>

        <AnimatePresence mode="wait">
          <FeedbackMessage
            key={feedbackMessage}
            $accuracy={accuracy}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {feedbackMessage}
          </FeedbackMessage>
        </AnimatePresence>

        <StyledButton
          onClick={handleClear}
          disabled={!hasDrawn}
          whileHover={{ scale: hasDrawn ? 1.02 : 1 }}
          whileTap={{ scale: hasDrawn ? 0.98 : 1 }}
        >
          🗑️ Clear & Try Again
        </StyledButton>

        <HintText
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 Draw slowly and steadily for best results • Target: {SUCCESS_THRESHOLD}%+
        </HintText>

        {attempts > 0 && (
          <HintText
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Attempts: {attempts} • Keep practicing!
          </HintText>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default DrawCircleChallenge;