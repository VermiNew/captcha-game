import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
import { theme } from '../../styles/theme';

/**
 * Point on canvas
 */
interface Point {
  x: number;
  y: number;
  number: number;
}

/**
 * Drawn line between two points
 */
interface Line {
  from: Point;
  to: Point;
  valid: boolean;
}

/**
 * Orientation type for CCW test
 */
type Orientation = 'clockwise' | 'counterclockwise' | 'collinear';

/**
 * Constants
 */
const CANVAS_SIZE = 500;
const POINT_RADIUS = 18;
const POINT_HIT_RADIUS = 25;
const MIN_POINT_DISTANCE = 80;
const CANVAS_PADDING = 60;
const TOTAL_POINTS = 8;
const LINE_WIDTH = 4;

/**
 * Calculate orientation of ordered triplet (p, q, r)
 */
const getOrientation = (p: Point, q: Point, r: Point): Orientation => {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 'collinear';
  return val > 0 ? 'clockwise' : 'counterclockwise';
};

/**
 * Check if point q lies on segment pr
 */
const onSegment = (p: Point, q: Point, r: Point): boolean => {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
};

/**
 * Check if two line segments intersect (excluding shared endpoints)
 */
const doSegmentsIntersect = (l1: Line, l2: Line): boolean => {
  const { from: p1, to: q1 } = l1;
  const { from: p2, to: q2 } = l2;

  // Don't count as intersection if lines share an endpoint
  if (
    (p1.number === p2.number || p1.number === q2.number ||
     q1.number === p2.number || q1.number === q2.number)
  ) {
    return false;
  }

  const o1 = getOrientation(p1, q1, p2);
  const o2 = getOrientation(p1, q1, q2);
  const o3 = getOrientation(p2, q2, p1);
  const o4 = getOrientation(p2, q2, q1);

  // General case
  if (o1 !== o2 && o3 !== o4) return true;

  // Special collinear cases
  if (o1 === 'collinear' && onSegment(p1, p2, q1)) return true;
  if (o2 === 'collinear' && onSegment(p1, q2, q1)) return true;
  if (o3 === 'collinear' && onSegment(p2, p1, q2)) return true;
  if (o4 === 'collinear' && onSegment(p2, q1, q2)) return true;

  return false;
};

/**
 * Check if a new line would intersect with existing lines
 */
const wouldLineIntersect = (newLine: Line, existingLines: Line[]): boolean => {
  return existingLines.some(line => doSegmentsIntersect(newLine, line));
};

/**
 * Generate random points on canvas with minimum distance
 */
const generatePoints = (): Point[] => {
  const points: Point[] = [];
  const maxAttempts = 1000;

  for (let i = 1; i <= TOTAL_POINTS; i++) {
    let point: Point | null = null;
    let attempts = 0;

    while (!point && attempts < maxAttempts) {
      attempts++;
      const candidate: Point = {
        x: Math.random() * (CANVAS_SIZE - 2 * CANVAS_PADDING) + CANVAS_PADDING,
        y: Math.random() * (CANVAS_SIZE - 2 * CANVAS_PADDING) + CANVAS_PADDING,
        number: i,
      };

      const tooClose = points.some((p) => {
        const dx = p.x - candidate.x;
        const dy = p.y - candidate.y;
        return Math.sqrt(dx * dx + dy * dy) < MIN_POINT_DISTANCE;
      });

      if (!tooClose) {
        point = candidate;
      }
    }

    if (point) {
      points.push(point);
    }
  }

  return points;
};

/**
 * Canvas container
 */
const CanvasContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Canvas wrapper with shadow
 */
const CanvasWrapper = styled.div`
  position: relative;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Canvas element
 */
const StyledCanvas = styled.canvas`
  border: 3px solid ${theme.colors.primary};
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: ${theme.borderRadius.lg};
  cursor: crosshair;
  touch-action: none;
  display: block;

  &:hover {
    border-color: ${theme.colors.secondary};
  }
`;

/**
 * Instructions
 */
const Instructions = styled(motion.p)<{ $warning?: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${props => props.$warning ? theme.colors.error : theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: ${props => props.$warning ? theme.fontWeights.bold : theme.fontWeights.medium};
  transition: all 0.3s ease;
`;

/**
 * Stats container
 */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 600px;
`;

/**
 * Stat card
 */
const StatCard = styled(motion.div)<{ $highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${props => props.$highlight ? 
    `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)` : 
    theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${props => props.$highlight ? theme.colors.primary : theme.colors.border};
  transition: all 0.3s ease;
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
 * Stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Controls
 */
const Controls = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
  justify-content: center;
`;

/**
 * Button
 */
const StyledButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${props => props.$variant === 'secondary' ? 
    theme.colors.surface : 
    `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  color: ${props => props.$variant === 'secondary' ? theme.colors.primary : 'white'};
  border: 2px solid ${props => props.$variant === 'secondary' ? theme.colors.primary : 'transparent'};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

/**
 * Feedback message
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

/**
 * Hint text
 */
const HintText = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.info};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.md};
  background: rgba(59, 130, 246, 0.1);
  border-radius: ${theme.borderRadius.md};
  max-width: 600px;
`;

/**
 * Connect Dots Challenge Component
 */
const ConnectDotsChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState(() => Date.now());
  const points = useMemo(() => generatePoints(), []);

  const [drawnLines, setDrawnLines] = useState<Line[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [hasIntersection, setHasIntersection] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const progress = useMemo(() => 
    `${drawnLines.length}/${TOTAL_POINTS - 1}`,
    [drawnLines.length]
  );

  const nextNumber = useMemo(() => 
    selectedPoint ? selectedPoint.number + 1 : 1,
    [selectedPoint]
  );

  /**
   * Find point at coordinates
   */
  const getPointAtCoords = useCallback((x: number, y: number): Point | null => {
    for (const point of points) {
      const dx = point.x - x;
      const dy = point.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= POINT_HIT_RADIUS) {
        return point;
      }
    }
    return null;
  }, [points]);

  /**
   * Draw canvas
   */
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw preview line if point selected and mouse hovering
    if (selectedPoint && hoveredPoint && hoveredPoint.number === nextNumber) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(selectedPoint.x, selectedPoint.y);
      ctx.lineTo(hoveredPoint.x, hoveredPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw lines
    drawnLines.forEach((line) => {
      ctx.strokeStyle = line.valid ? '#10B981' : '#EF4444';
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = line.valid ? 1 : 0.7;
      
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();

      // Draw arrow at midpoint
      const midX = (line.from.x + line.to.x) / 2;
      const midY = (line.from.y + line.to.y) / 2;
      const angle = Math.atan2(line.to.y - line.from.y, line.to.x - line.from.x);
      
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.fillStyle = line.valid ? '#10B981' : '#EF4444';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = 1;
    });

    // Draw points
    points.forEach((point) => {
      const isSelected = selectedPoint?.number === point.number;
      const isHovered = hoveredPoint?.number === point.number;
      const isNext = point.number === nextNumber;
      const isCompleted = drawnLines.some(l => l.to.number === point.number);

      // Outer glow for next point
      if (isNext && !isCompleted) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, POINT_RADIUS + 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Point circle
      const radius = isHovered ? POINT_RADIUS + 3 : POINT_RADIUS;
      ctx.fillStyle = isSelected ? '#3B82F6' : 
                      isCompleted ? '#10B981' : 
                      isNext ? '#F59E0B' : 
                      '#6B7280';
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.number.toString(), point.x, point.y);
    });
  }, [drawnLines, points, selectedPoint, hoveredPoint, nextNumber]);

  /**
   * Redraw on state changes
   */
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  /**
   * Handle mouse move for hover preview
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = getPointAtCoords(x, y);
    setHoveredPoint(point);
  }, [completed, getPointAtCoords]);

  /**
   * Handle canvas click
   */
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || completed || hasIntersection) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedPoint = getPointAtCoords(x, y);
    if (!clickedPoint) return;

    if (!selectedPoint) {
      // First point must be #1
      if (clickedPoint.number !== 1) return;
      setSelectedPoint(clickedPoint);
      return;
    }

    // If clicking same point, deselect
    if (selectedPoint.number === clickedPoint.number) {
      setSelectedPoint(null);
      return;
    }

    // Must click next point in sequence
    if (clickedPoint.number !== selectedPoint.number + 1) return;

    const newLine: Line = {
      from: selectedPoint,
      to: clickedPoint,
      valid: true,
    };

    const hasIntersect = wouldLineIntersect(newLine, drawnLines);
    newLine.valid = !hasIntersect;

    const newLines = [...drawnLines, newLine];
    setDrawnLines(newLines);
    setHasIntersection(hasIntersect);

    // Check if completed
    if (newLines.length === TOTAL_POINTS - 1 && !hasIntersect) {
      setCompleted(true);
      const timeSpent = (Date.now() - startTime) / 1000;
      const bonus = attempts === 0 ? 50 : 0;
      setTimeout(() => {
        onComplete(true, timeSpent, 200 + bonus);
      }, 2000);
    }

    setSelectedPoint(clickedPoint.number < TOTAL_POINTS ? clickedPoint : null);
  }, [completed, hasIntersection, selectedPoint, getPointAtCoords, drawnLines, startTime, attempts, onComplete]);

  /**
   * Reset game
   */
  const handleReset = useCallback(() => {
    setDrawnLines([]);
    setSelectedPoint(null);
    setHoveredPoint(null);
    setHasIntersection(false);
    setAttempts(prev => prev + 1);
  }, []);

  if (completed) {
    return (
      <ChallengeBase
        title="Connect the Dots"
        description="Connect numbered dots in sequence without crossing lines"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
        hideTimer
      >
        <Timer timeLimit={timeLimit} />
        <CanvasContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FeedbackMessage
            $success={true}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Emoji>🎉</Emoji>
            <div style={{ fontSize: theme.fontSizes.xl }}>
              Perfect! All dots connected!
            </div>
            <div style={{ fontSize: theme.fontSizes.md, fontWeight: 'normal' }}>
              {attempts === 0 ? '✨ First try bonus!' : `Completed in ${attempts + 1} attempt${attempts !== 0 ? 's' : ''}`}
            </div>
          </FeedbackMessage>
        </CanvasContainer>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Connect the Dots"
      description="Connect numbered dots in sequence without crossing lines"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      hideTimer
    >
      <Timer timeLimit={timeLimit} />
      <CanvasContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Instructions $warning={hasIntersection}>
          {hasIntersection ? 
            '❌ Lines crossed! Reset to try again.' : 
            selectedPoint ? 
              `Click point ${nextNumber} to continue...` : 
              'Click point 1 to start connecting'}
        </Instructions>

        <CanvasWrapper>
          <StyledCanvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        </CanvasWrapper>

        <StatsContainer>
          <StatCard $highlight={drawnLines.length > 0}>
            <StatLabel>Progress</StatLabel>
            <StatValue
              key={progress}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {progress}
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Next Point</StatLabel>
            <StatValue
              key={nextNumber}
              initial={{ scale: 1.3, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              #{nextNumber}
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Attempts</StatLabel>
            <StatValue>{attempts + 1}</StatValue>
          </StatCard>
        </StatsContainer>

        <AnimatePresence>
          {!selectedPoint && drawnLines.length === 0 && (
            <HintText
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              💡 Tip: Plan your path before connecting. Lines cannot cross!
            </HintText>
          )}
        </AnimatePresence>

        <Controls>
          <StyledButton
            $variant="secondary"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Reset
          </StyledButton>
        </Controls>
      </CanvasContainer>
    </ChallengeBase>
  );
};

export default ConnectDotsChallenge;