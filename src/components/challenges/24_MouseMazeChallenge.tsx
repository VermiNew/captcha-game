import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Point in maze
 */
interface Point {
  x: number;
  y: number;
}

/**
 * Maze definition
 */
interface Maze {
  name: string;
  path: Point[]; // Center line of the path
  start: Point;
  end: Point;
}

/**
 * Predefined mazes - 3 different difficulty levels
 */
const MAZES: Maze[] = [
  {
    name: 'Simple Path',
    start: { x: 50, y: 200 },
    end: { x: 550, y: 200 },
    path: [
      { x: 50, y: 200 },
      { x: 100, y: 200 },
      { x: 150, y: 150 },
      { x: 200, y: 100 },
      { x: 250, y: 150 },
      { x: 300, y: 200 },
      { x: 350, y: 250 },
      { x: 400, y: 200 },
      { x: 450, y: 150 },
      { x: 500, y: 200 },
      { x: 550, y: 200 },
    ],
  },
  {
    name: 'Twisted Maze',
    start: { x: 50, y: 100 },
    end: { x: 550, y: 300 },
    path: [
      { x: 50, y: 100 },
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 150, y: 250 },
      { x: 200, y: 250 },
      { x: 250, y: 150 },
      { x: 300, y: 100 },
      { x: 350, y: 150 },
      { x: 400, y: 250 },
      { x: 450, y: 200 },
      { x: 500, y: 250 },
      { x: 550, y: 300 },
    ],
  },
  {
    name: 'Spiral Maze',
    start: { x: 50, y: 200 },
    end: { x: 550, y: 200 },
    path: [
      { x: 50, y: 200 },
      { x: 100, y: 150 },
      { x: 150, y: 100 },
      { x: 200, y: 150 },
      { x: 250, y: 200 },
      { x: 300, y: 150 },
      { x: 350, y: 100 },
      { x: 400, y: 150 },
      { x: 450, y: 200 },
      { x: 500, y: 250 },
      { x: 550, y: 200 },
    ],
  },
];

/**
 * Get closest point on path to a given point
 */
const getClosestPointOnPath = (point: Point, path: Point[]): Point => {
  let closest = path[0];
  let minDist = Infinity;

  for (const pathPoint of path) {
    const dx = point.x - pathPoint.x;
    const dy = point.y - pathPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closest = pathPoint;
    }
  }

  return closest;
};

/**
 * Check if point is within corridor (40px width from center)
 */
const isPointInCorridor = (point: Point, path: Point[], corridorWidth: number = 40): boolean => {
  const closest = getClosestPointOnPath(point, path);
  const dx = point.x - closest.x;
  const dy = point.y - closest.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist <= corridorWidth / 2;
};

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
 * Instruction text
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * SVG Maze Container
 */
const MazeContainer = styled(motion.svg)`
  border: 3px solid ${theme.colors.primary};
  background-color: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  cursor: none;
  user-select: none;
  touch-action: none;
`;

/**
 * Custom cursor
 */
const CursorTrail = styled(motion.circle)`
  pointer-events: none;
`;

/**
 * Status message
 */
const StatusMessage = styled(motion.p)<{ $warning?: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => (props.$warning ? theme.colors.error : theme.colors.success)};
  margin: 0;
  text-align: center;
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
 * Mouse Maze Challenge Component
 */
const MouseMazeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [startTime] = useState(Date.now());

  // Randomly select a maze
  const maze = useMemo(() => MAZES[Math.floor(Math.random() * MAZES.length)], []);

  const [cursorPos, setCursorPos] = useState<Point>(maze.start);
  const [cursorTrail, setCursorTrail] = useState<Point[]>([maze.start]);
  const [hitWall, setHitWall] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 along the path
  const [attempts, setAttempts] = useState(0);

  /**
   * Get progress along path
   */
  const getProgressAlongPath = useCallback(
    (point: Point): number => {
      let closest = maze.path[0];
      let closestIdx = 0;
      let minDist = Infinity;

      for (let i = 0; i < maze.path.length; i++) {
        const dx = point.x - maze.path[i].x;
        const dy = point.y - maze.path[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          minDist = dist;
          closest = maze.path[i];
          closestIdx = i;
        }
      }

      return (closestIdx / (maze.path.length - 1)) * 100;
    },
    [maze.path]
  );

  /**
   * Handle mouse move
   */
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (completed) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPos: Point = { x, y };
    setCursorPos(newPos);

    // Check if in corridor
    const inCorridor = isPointInCorridor(newPos, maze.path, 40);

    if (!inCorridor && !hitWall) {
      // Hit wall!
      setHitWall(true);
      setAttempts(attempts + 1);

      // Reset after 1 second
      setTimeout(() => {
        setCursorPos(maze.start);
        setCursorTrail([maze.start]);
        setHitWall(false);
        setProgress(0);
      }, 1000);
    } else if (inCorridor) {
      // Update trail
      setCursorTrail((prev) => {
        const newTrail = [...prev, newPos];
        return newTrail.length > 50 ? newTrail.slice(-50) : newTrail;
      });

      // Update progress
      const newProgress = getProgressAlongPath(newPos);
      setProgress(newProgress);

      // Check if reached end
      const dx = newPos.x - maze.end.x;
      const dy = newPos.y - maze.end.y;
      const distToEnd = Math.sqrt(dx * dx + dy * dy);

      if (distToEnd < 30) {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const difficultyBonus = maze.name === 'Spiral Maze' ? 50 : maze.name === 'Twisted Maze' ? 25 : 0;
        setTimeout(() => {
          onComplete(true, timeSpent, 300 + difficultyBonus);
        }, 2000);
      }
    }
  };

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = () => {
    setCursorPos(maze.start);
    setCursorTrail([maze.start]);
  };

  if (completed) {
    return (
      <ChallengeBase
        title="Mouse Maze Challenge"
        description="Navigate through the maze without hitting walls"
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
          <Emoji>🎯</Emoji>
          <span>Maze completed!</span>
          <span>{maze.name}</span>
          {attempts === 0 && <span>Perfect run - no wall hits!</span>}
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Mouse Maze Challenge"
      description="Navigate through the maze without hitting walls"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Instruction>Move your mouse through the maze from START to END without touching walls!</Instruction>

        <MazeContainer
          ref={svgRef}
          width={600}
          height={400}
          viewBox="0 0 600 400"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Draw walls (corridor borders) */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="600" height="400" fill="white" />

          {/* Draw path as thick corridor */}
          <g>
            {maze.path.map((point, i) => {
              if (i === 0) return null;
              const prevPoint = maze.path[i - 1];
              return (
                <line
                  key={`corridor-${i}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke="#F3F4F6"
                  strokeWidth="40"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* Draw corridor outline (walls) */}
          <g>
            {maze.path.map((point, i) => {
              if (i === 0) return null;
              const prevPoint = maze.path[i - 1];
              return (
                <line
                  key={`wall-${i}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke="#1F2937"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.3"
                />
              );
            })}
          </g>

          {/* Draw path line */}
          <polyline
            points={maze.path.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />

          {/* Start marker */}
          <circle cx={maze.start.x} cy={maze.start.y} r="12" fill="#10B981" opacity="0.8" />
          <text x={maze.start.x} y={maze.start.y} textAnchor="middle" dy="0.3em" fontSize="10" fill="white" fontWeight="bold">
            S
          </text>

          {/* End marker */}
          <circle cx={maze.end.x} cy={maze.end.y} r="12" fill="#3B82F6" opacity="0.8" />
          <text x={maze.end.x} y={maze.end.y} textAnchor="middle" dy="0.3em" fontSize="10" fill="white" fontWeight="bold">
            E
          </text>

          {/* Cursor trail */}
          {cursorTrail.map((point, i) => (
            <circle
              key={`trail-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3B82F6"
              opacity={0.2 + (i / cursorTrail.length) * 0.4}
            />
          ))}

          {/* Cursor */}
          <circle
            cx={cursorPos.x}
            cy={cursorPos.y}
            r="8"
            fill="#EF4444"
            opacity={hitWall ? 1 : 0.7}
          />
        </MazeContainer>

        <StatusMessage $warning={hitWall}>
          {hitWall
            ? '💥 Hit a wall! Resetting...'
            : `Progress: ${Math.round(progress)}% | Attempts: ${attempts}`}
        </StatusMessage>

        <Instruction>{maze.name}</Instruction>
      </Container>
    </ChallengeBase>
  );
};

export default MouseMazeChallenge;
