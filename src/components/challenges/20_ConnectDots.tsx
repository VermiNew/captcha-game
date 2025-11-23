import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
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
  valid: boolean; // true if no intersections detected
}

/**
 * Orientation type for CCW test
 */
type Orientation = 'clockwise' | 'counterclockwise' | 'collinear';

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
 * Check if two line segments intersect
 */
const doSegmentsIntersect = (p1: Point, q1: Point, p2: Point, q2: Point): boolean => {
  const o1 = getOrientation(p1, q1, p2);
  const o2 = getOrientation(p1, q1, q2);
  const o3 = getOrientation(p2, q2, p1);
  const o4 = getOrientation(p2, q2, q1);

  // General case
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special cases - collinear
  if (o1 === 'collinear' && onSegment(p1, p2, q1)) return true;
  if (o2 === 'collinear' && onSegment(p1, q2, q1)) return true;
  if (o3 === 'collinear' && onSegment(p2, p1, q2)) return true;
  if (o4 === 'collinear' && onSegment(p2, q1, q2)) return true;

  return false;
};

/**
 * Check if any two lines intersect
 */
const checkForIntersections = (lines: Line[]): boolean => {
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      if (doSegmentsIntersect(lines[i].from, lines[i].to, lines[j].from, lines[j].to)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Generate random points on canvas
 */
const generatePoints = (): Point[] => {
  const points: Point[] = [];
  const minDist = 60;
  const padding = 50;

  for (let i = 1; i <= 8; i++) {
    let point: Point;
    let valid = false;

    while (!valid) {
      point = {
        x: Math.random() * (400 - 2 * padding) + padding,
        y: Math.random() * (400 - 2 * padding) + padding,
        number: i,
      };

      valid = points.every((p) => {
        const dx = p.x - point!.x;
        const dy = p.y - point!.y;
        return Math.sqrt(dx * dx + dy * dy) >= minDist;
      });
    }

    points.push(point!);
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
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Canvas element
 */
const StyledCanvas = styled.canvas`
  border: 3px solid ${theme.colors.primary};
  background-color: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  cursor: crosshair;
  touch-action: none;
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
 * Progress text
 */
const ProgressText = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
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
const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
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
  const [hasIntersection, setHasIntersection] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  /**
   * Find point at coordinates
   */
  const getPointAtCoords = (x: number, y: number): Point | null => {
    const radius = 20;
    for (const point of points) {
      const dx = point.x - x;
      const dy = point.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        return point;
      }
    }
    return null;
  };

  /**
   * Draw canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 400);

    // Draw lines
    drawnLines.forEach((line) => {
      ctx.strokeStyle = line.valid ? '#10B981' : '#EF4444';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    });

    // Draw points
    points.forEach((point) => {
      const isSelected = selectedPoint?.number === point.number;
      ctx.fillStyle = isSelected ? '#3B82F6' : '#10B981';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.number.toString(), point.x, point.y);
    });
  }, [drawnLines, points, selectedPoint]);

  /**
   * Handle canvas click
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

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

    // If clicking next point in sequence, draw line
    if (clickedPoint.number === selectedPoint.number + 1) {
      const newLine: Line = {
        from: selectedPoint,
        to: clickedPoint,
        valid: true,
      };

      const newLines = [...drawnLines, newLine];
      const hasIntersect = checkForIntersections(newLines);

      newLine.valid = !hasIntersect;
      setDrawnLines(newLines);
      setHasIntersection(hasIntersect);

      // Check if completed
      if (newLines.length === 7 && !hasIntersect) {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const bonus = attempts === 0 ? 50 : 0;
        setTimeout(() => {
          onComplete(true, timeSpent, 200 + bonus);
        }, 2000);
      }

      setSelectedPoint(clickedPoint.number < 8 ? clickedPoint : null);
    }
  };

  /**
   * Reset game
   */
  const handleReset = () => {
    setDrawnLines([]);
    setSelectedPoint(null);
    setHasIntersection(false);
    setAttempts(attempts + 1);
  };

  const progress = `${drawnLines.length}/7 connections`;
  const statusMessage = hasIntersection ? 'Lines intersected! Click Reset.' : 'Keep connecting...';

  if (completed) {
    return (
      <ChallengeBase
        title="Connect Dots Challenge"
        description="Connect all dots without crossing lines"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <FeedbackMessage
          $success={true}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>✨</Emoji>
          <span>Perfect! All dots connected without crossing!</span>
          <span>{attempts === 0 ? 'First try!' : `Completed in ${attempts + 1} tries`}</span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Connect Dots Challenge"
      description="Connect all dots without crossing lines"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <CanvasContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Instructions>Click points 1→2→3→...→8 in order. Lines cannot cross!</Instructions>

        <StyledCanvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={handleCanvasClick}
        />

        <ProgressText
          key={progress}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {progress}
        </ProgressText>

        <Instructions style={{ color: hasIntersection ? theme.colors.error : theme.colors.info }}>
          {statusMessage}
        </Instructions>

        <Controls>
          <Button onClick={handleReset}>Reset</Button>
        </Controls>
      </CanvasContainer>
    </ChallengeBase>
  );
};

export default ConnectDotsChallenge;
