import React, { useState, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  path: Point[];
  start: Point;
  end: Point;
  corridorWidth: number;
}

/**
 * Constants
 */
const SVG_WIDTH = 700;
const SVG_HEIGHT = 450;
const CURSOR_RADIUS = 10;
const END_ZONE_RADIUS = 35;
const TRAIL_LENGTH = 60;

/**
 * Predefined mazes - 3 different difficulty levels
 */
const MAZES: Maze[] = [
  {
    name: 'Gentle Curves',
    difficulty: 'Easy',
    corridorWidth: 50,
    start: { x: 50, y: 225 },
    end: { x: 650, y: 225 },
    path: [
      { x: 50, y: 225 },
      { x: 120, y: 225 },
      { x: 180, y: 180 },
      { x: 240, y: 150 },
      { x: 300, y: 180 },
      { x: 360, y: 225 },
      { x: 420, y: 270 },
      { x: 480, y: 225 },
      { x: 540, y: 180 },
      { x: 600, y: 225 },
      { x: 650, y: 225 },
    ],
  },
  {
    name: 'Twisted Path',
    difficulty: 'Medium',
    corridorWidth: 42,
    start: { x: 50, y: 120 },
    end: { x: 650, y: 330 },
    path: [
      { x: 50, y: 120 },
      { x: 110, y: 120 },
      { x: 170, y: 170 },
      { x: 170, y: 280 },
      { x: 240, y: 280 },
      { x: 300, y: 170 },
      { x: 360, y: 120 },
      { x: 430, y: 170 },
      { x: 490, y: 280 },
      { x: 550, y: 230 },
      { x: 610, y: 280 },
      { x: 650, y: 330 },
    ],
  },
  {
    name: 'Spiral Challenge',
    difficulty: 'Hard',
    corridorWidth: 36,
    start: { x: 50, y: 225 },
    end: { x: 650, y: 225 },
    path: [
      { x: 50, y: 225 },
      { x: 100, y: 180 },
      { x: 150, y: 130 },
      { x: 200, y: 100 },
      { x: 250, y: 130 },
      { x: 300, y: 180 },
      { x: 350, y: 225 },
      { x: 400, y: 180 },
      { x: 450, y: 130 },
      { x: 500, y: 180 },
      { x: 550, y: 225 },
      { x: 600, y: 270 },
      { x: 650, y: 225 },
    ],
  },
];

/**
 * Get closest point on path segment
 */
const getClosestPointOnSegment = (point: Point, segStart: Point, segEnd: Point): Point => {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return segStart;

  const t = Math.max(0, Math.min(1, 
    ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared
  ));

  return {
    x: segStart.x + t * dx,
    y: segStart.y + t * dy,
  };
};

/**
 * Check if point is within corridor
 */
const isPointInCorridor = (point: Point, path: Point[], corridorWidth: number): boolean => {
  let minDist = Infinity;

  for (let i = 1; i < path.length; i++) {
    const closest = getClosestPointOnSegment(point, path[i - 1], path[i]);
    const dx = point.x - closest.x;
    const dy = point.y - closest.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    minDist = Math.min(minDist, dist);
  }

  return minDist <= corridorWidth / 2;
};

/**
 * Get progress along path (0-100)
 */
const getProgressAlongPath = (point: Point, path: Point[]): number => {
  let closestIdx = 0;
  let minDist = Infinity;

  for (let i = 0; i < path.length; i++) {
    const dx = point.x - path[i].x;
    const dy = point.y - path[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }

  return (closestIdx / (path.length - 1)) * 100;
};

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Instruction text
 */
const Instruction = styled(motion.p)<{ $warning?: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${props => props.$warning ? theme.colors.error : theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: ${props => props.$warning ? theme.fontWeights.bold : theme.fontWeights.medium};
  transition: all 0.3s ease;
`;

/**
 * SVG Maze Container
 */
const MazeContainer = styled(motion.svg)`
  border: 3px solid ${theme.colors.primary};
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  cursor: none;
  user-select: none;
  touch-action: none;

  &:hover {
    border-color: ${theme.colors.secondary};
  }
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
 * Difficulty badge
 */
const DifficultyBadge = styled.span<{ $difficulty: string }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  background: ${props => 
    props.$difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.15)' :
    props.$difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' :
    'rgba(239, 68, 68, 0.15)'};
  color: ${props => 
    props.$difficulty === 'Easy' ? theme.colors.success :
    props.$difficulty === 'Medium' ? '#F59E0B' :
    theme.colors.error};
  border: 2px solid ${props => 
    props.$difficulty === 'Easy' ? theme.colors.success :
    props.$difficulty === 'Medium' ? '#F59E0B' :
    theme.colors.error};
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
  max-width: 700px;
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
  max-width: 700px;
`;

/**
 * Progress bar
 */
const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 700px;
  height: 12px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.success}, ${theme.colors.info});
  border-radius: ${theme.borderRadius.full};
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
  const [startTime] = useState(() => Date.now());
  const [maze] = useState(() => MAZES[Math.floor(Math.random() * MAZES.length)]);
  const [cursorPos, setCursorPos] = useState<Point>(maze.start);
  const [cursorTrail, setCursorTrail] = useState<Point[]>([maze.start]);
  const [hitWall, setHitWall] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isInMaze, setIsInMaze] = useState(false);
  const [maxProgress, setMaxProgress] = useState(0);

  /**
   * Calculate distance to end
   */
  const distanceToEnd = useMemo(() => {
    const dx = cursorPos.x - maze.end.x;
    const dy = cursorPos.y - maze.end.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [cursorPos, maze.end]);

  /**
   * Reset to start position
   */
  const resetPosition = useCallback(() => {
    setCursorPos(maze.start);
    setCursorTrail([maze.start]);
    setProgress(0);
  }, [maze.start]);

  /**
   * Handle mouse move
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (completed) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPos: Point = { x, y };
    setCursorPos(newPos);

    const inCorridor = isPointInCorridor(newPos, maze.path, maze.corridorWidth);

    if (!inCorridor && isInMaze && !hitWall) {
      // Hit wall!
      setHitWall(true);
      setAttempts(prev => prev + 1);

      setTimeout(() => {
        resetPosition();
        setHitWall(false);
      }, 1000);
    } else if (inCorridor) {
      setIsInMaze(true);
      
      // Update trail
      setCursorTrail(prev => {
        const newTrail = [...prev, newPos];
        return newTrail.length > TRAIL_LENGTH ? newTrail.slice(-TRAIL_LENGTH) : newTrail;
      });

      // Update progress
      const newProgress = getProgressAlongPath(newPos, maze.path);
      setProgress(newProgress);
      setMaxProgress(prev => Math.max(prev, newProgress));

      // Check if reached end
      if (distanceToEnd < END_ZONE_RADIUS) {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const difficultyBonus = 
          maze.difficulty === 'Hard' ? 75 : 
          maze.difficulty === 'Medium' ? 40 : 0;
        const perfectBonus = attempts === 0 ? 50 : 0;
        
        setTimeout(() => {
          onComplete(true, timeSpent, 300 + difficultyBonus + perfectBonus);
        }, 2000);
      }
    }
  }, [completed, isInMaze, hitWall, maze, distanceToEnd, startTime, attempts, onComplete, resetPosition]);

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    if (!completed && isInMaze) {
      resetPosition();
      setIsInMaze(false);
    }
  }, [completed, isInMaze, resetPosition]);

  /**
   * Handle mouse enter
   */
  const handleMouseEnter = useCallback(() => {
    setIsInMaze(false);
  }, []);

  if (completed) {
    return (
      <ChallengeBase
        title="Mouse Maze Challenge"
        description="Navigate through the maze without hitting walls"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <Container>
          <FeedbackMessage
            $success={true}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Emoji>🎯</Emoji>
            <div style={{ fontSize: theme.fontSizes.xl }}>
              Maze Completed!
            </div>
            <div style={{ fontSize: theme.fontSizes.md, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              {maze.name} <DifficultyBadge $difficulty={maze.difficulty}>{maze.difficulty}</DifficultyBadge>
            </div>
            {attempts === 0 && (
              <div style={{ fontSize: theme.fontSizes.md, fontWeight: 'normal' }}>
                ✨ Perfect run - no wall hits!
              </div>
            )}
          </FeedbackMessage>
        </Container>
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
        transition={{ duration: 0.5 }}
      >
        <Instruction $warning={hitWall}>
          {hitWall ? 
            '💥 Hit a wall! Resetting to start...' : 
            'Guide your cursor from START (green) to END (blue) without touching the walls!'}
        </Instruction>

        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          <span style={{ fontFamily: theme.fonts.primary, color: theme.colors.textSecondary }}>
            {maze.name}
          </span>
          <DifficultyBadge $difficulty={maze.difficulty}>
            {maze.difficulty}
          </DifficultyBadge>
        </div>

        <MazeContainer
          ref={svgRef}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Background with subtle grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F3F4F6" />
              <stop offset="50%" stopColor="#E5E7EB" />
              <stop offset="100%" stopColor="#F3F4F6" />
            </linearGradient>
          </defs>

          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#grid)" />

          {/* Draw path corridor */}
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
                stroke="url(#pathGradient)"
                strokeWidth={maze.corridorWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Draw corridor walls */}
          {maze.path.map((point, i) => {
            if (i === 0) return null;
            const prevPoint = maze.path[i - 1];
            return (
              <g key={`wall-${i}`}>
                <line
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke="#1F2937"
                  strokeWidth={maze.corridorWidth + 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.4"
                />
                <line
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke="#374151"
                  strokeWidth={maze.corridorWidth + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.6"
                />
              </g>
            );
          })}

          {/* Center guide line */}
          <polyline
            points={maze.path.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="8,4"
            opacity="0.4"
          />

          {/* Start marker */}
          <g>
            <circle cx={maze.start.x} cy={maze.start.y} r="18" fill="#10B981" opacity="0.9" />
            <circle cx={maze.start.x} cy={maze.start.y} r="14" fill="white" opacity="0.3" />
            <text 
              x={maze.start.x} 
              y={maze.start.y} 
              textAnchor="middle" 
              dy="0.35em" 
              fontSize="12" 
              fill="white" 
              fontWeight="bold"
              fontFamily={theme.fonts.primary}
            >
              START
            </text>
          </g>

          {/* End marker with pulse */}
          <g>
            <motion.circle 
              cx={maze.end.x} 
              cy={maze.end.y} 
              r="22" 
              fill="#3B82F6" 
              opacity="0.3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx={maze.end.x} cy={maze.end.y} r="18" fill="#3B82F6" opacity="0.9" />
            <circle cx={maze.end.x} cy={maze.end.y} r="14" fill="white" opacity="0.3" />
            <text 
              x={maze.end.x} 
              y={maze.end.y} 
              textAnchor="middle" 
              dy="0.35em" 
              fontSize="12" 
              fill="white" 
              fontWeight="bold"
              fontFamily={theme.fonts.primary}
            >
              END
            </text>
          </g>

          {/* Cursor trail */}
          {cursorTrail.map((point, i) => (
            <circle
              key={`trail-${i}`}
              cx={point.x}
              cy={point.y}
              r={3 + (i / cursorTrail.length) * 2}
              fill="#3B82F6"
              opacity={0.15 + (i / cursorTrail.length) * 0.35}
            />
          ))}

          {/* Cursor */}
          <motion.g
            animate={{ 
              scale: hitWall ? [1, 1.5, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <circle
              cx={cursorPos.x}
              cy={cursorPos.y}
              r={CURSOR_RADIUS + 3}
              fill={hitWall ? '#EF4444' : '#3B82F6'}
              opacity="0.3"
            />
            <circle
              cx={cursorPos.x}
              cy={cursorPos.y}
              r={CURSOR_RADIUS}
              fill={hitWall ? '#EF4444' : '#3B82F6'}
              opacity="0.9"
            />
            <circle
              cx={cursorPos.x}
              cy={cursorPos.y}
              r={CURSOR_RADIUS - 4}
              fill="white"
              opacity="0.6"
            />
          </motion.g>
        </MazeContainer>

        {/* Progress bar */}
        <ProgressBarContainer>
          <ProgressBarFill
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </ProgressBarContainer>

        {/* Stats */}
        <StatsContainer>
          <StatCard $highlight={progress > 0}>
            <StatLabel>Progress</StatLabel>
            <StatValue
              key={Math.floor(progress)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {Math.round(progress)}%
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Best Run</StatLabel>
            <StatValue>{Math.round(maxProgress)}%</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Wall Hits</StatLabel>
            <StatValue
              key={attempts}
              animate={{ 
                scale: attempts > 0 ? [1, 1.3, 1] : 1,
                color: attempts > 0 ? [theme.colors.error, theme.colors.primary] : theme.colors.primary
              }}
            >
              {attempts}
            </StatValue>
          </StatCard>
        </StatsContainer>

        <AnimatePresence>
          {progress === 0 && attempts === 0 && (
            <HintText
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              💡 Tip: Move slowly and follow the dashed center line for best results!
            </HintText>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default MouseMazeChallenge;