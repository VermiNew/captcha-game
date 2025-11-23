import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game configuration constants
 */
const TILE_SIZE = 32; // Base tile size for road elements
const CANVAS_WIDTH = 320; // 10 tiles wide
const CANVAS_HEIGHT = 640; // 20 tiles tall
const PLAYER_CAR_WIDTH = 64;
const PLAYER_CAR_HEIGHT = 96;
const ENEMY_CAR_WIDTH = 64;
const ENEMY_CAR_HEIGHT = 96;
const GAME_DURATION = 30; // seconds
const ROAD_LANES = 3; // Number of driving lanes
const LANE_WIDTH = TILE_SIZE * 2; // Each lane is 2 tiles wide
const ROAD_WIDTH = ROAD_LANES * LANE_WIDTH; // Total road width
const GRASS_WIDTH = (CANVAS_WIDTH - ROAD_WIDTH) / 2; // Grass on each side
const CAR_SPEED = 3; // Player movement speed
const TRAFFIC_SPEED = 5; // Enemy car speed
const SPAWN_INTERVAL = 1500; // Spawn enemy every 1.5 seconds

/**
 * Represents an enemy car on the road
 */
interface EnemyCar {
  id: number;
  lane: number; // 0, 1, or 2
  y: number;
  passed: boolean;
}

/**
 * Main container with centered layout
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

/**
 * Header section with title and instructions
 */
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Game title with gradient
 */
const GameTitle = styled(motion.h2)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0;
  
  @media (max-width: 600px) {
    font-size: ${theme.fontSizes['2xl']};
  }
`;

/**
 * Instruction text
 */
const Instructions = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
  
  kbd {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.borderLight};
    border-radius: ${theme.borderRadius.sm};
    font-family: ${theme.fonts.mono};
    font-size: ${theme.fontSizes.xs};
    margin: 0 ${theme.spacing.xs};
  }
`;

/**
 * Game canvas container
 */
const GameCanvas = styled(motion.div)`
  position: relative;
  width: ${CANVAS_WIDTH}px;
  height: ${CANVAS_HEIGHT}px;
  border: 4px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  background: #87CEEB; /* Sky blue background */
  
  @media (max-width: 400px) {
    transform: scale(0.85);
    transform-origin: top center;
  }
`;

/**
 * Grass strip (left and right sides)
 */
const Grass = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  ${props => props.$side}: 0;
  width: ${GRASS_WIDTH}px;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    #2d5016 0px,
    #2d5016 16px,
    #3a6b1f 16px,
    #3a6b1f 32px
  );
`;

/**
 * Road surface
 */
const Road = styled.div`
  position: absolute;
  left: ${GRASS_WIDTH}px;
  top: 0;
  width: ${ROAD_WIDTH}px;
  height: 100%;
  background: #404040;
`;

/**
 * Scrolling road markings container
 */
const RoadMarkings = styled(motion.div)`
  position: absolute;
  left: ${GRASS_WIDTH}px;
  width: ${ROAD_WIDTH}px;
  height: 200%;
  pointer-events: none;
`;

/**
 * Lane divider line
 */
const LaneDivider = styled.div<{ $lane: number }>`
  position: absolute;
  left: ${props => props.$lane * LANE_WIDTH}px;
  width: 4px;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    #FFD700 0px,
    #FFD700 20px,
    transparent 20px,
    transparent 40px
  );
`;

/**
 * Player car sprite
 */
const PlayerCar = styled(motion.div)<{ $lane: number }>`
  position: absolute;
  width: ${PLAYER_CAR_WIDTH}px;
  height: ${PLAYER_CAR_HEIGHT}px;
  left: ${props => GRASS_WIDTH + props.$lane * LANE_WIDTH + (LANE_WIDTH - PLAYER_CAR_WIDTH) / 2}px;
  bottom: 80px;
  z-index: 10;
  
  /* Car body */
  background: linear-gradient(180deg, #FF4444 0%, #CC0000 100%);
  border-radius: 8px 8px 4px 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  
  /* Windshield */
  &::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    right: 15%;
    height: 25%;
    background: linear-gradient(180deg, #4444FF 0%, #2222BB 100%);
    border-radius: 4px 4px 0 0;
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
  
  /* Rear window */
  &::after {
    content: '';
    position: absolute;
    bottom: 15%;
    left: 15%;
    right: 15%;
    height: 20%;
    background: linear-gradient(180deg, #333333 0%, #111111 100%);
    border-radius: 0 0 4px 4px;
  }
`;

/**
 * Enemy car sprite
 */
const EnemyCar = styled(motion.div)<{ $lane: number; $y: number }>`
  position: absolute;
  width: ${ENEMY_CAR_WIDTH}px;
  height: ${ENEMY_CAR_HEIGHT}px;
  left: ${props => GRASS_WIDTH + props.$lane * LANE_WIDTH + (LANE_WIDTH - ENEMY_CAR_WIDTH) / 2}px;
  top: ${props => props.$y}px;
  z-index: 5;
  
  /* Car body */
  background: linear-gradient(180deg, #4444FF 0%, #0000CC 100%);
  border-radius: 4px 4px 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  
  /* Front window */
  &::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    right: 15%;
    height: 20%;
    background: linear-gradient(180deg, #111111 0%, #333333 100%);
    border-radius: 4px 4px 0 0;
  }
  
  /* Rear windshield */
  &::after {
    content: '';
    position: absolute;
    bottom: 15%;
    left: 15%;
    right: 15%;
    height: 25%;
    background: linear-gradient(180deg, #2222BB 0%, #4444FF 100%);
    border-radius: 0 0 4px 4px;
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }
`;

/**
 * Timer overlay
 */
const TimerOverlay = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.lg};
  color: white;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  min-width: 80px;
  text-align: center;
`;

/**
 * Statistics panel
 */
const StatsPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid rgba(99, 102, 241, 0.3);
  
  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

/**
 * Individual stat display
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm};
`;

/**
 * Stat label
 */
const StatLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: ${theme.fontWeights.semibold};
  text-align: center;
`;

/**
 * Stat value
 */
const StatValue = styled(motion.span)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  line-height: 1;
`;

/**
 * Result message card
 */
const ResultCard = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
  background: ${props =>
    props.$success
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))'};
  border: 3px solid ${props => props.$success ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.xl};
  text-align: center;
  width: 100%;
  box-shadow: 0 8px 32px ${props =>
    props.$success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

/**
 * Result emoji
 */
const ResultEmoji = styled.div`
  font-size: ${theme.fontSizes['5xl']};
  margin-bottom: ${theme.spacing.md};
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  @keyframes bounceIn {
    0% { 
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    60% { 
      transform: scale(1.2) rotate(20deg);
      opacity: 1;
    }
    100% { 
      transform: scale(1) rotate(0deg);
    }
  }
`;

/**
 * Result text
 */
const ResultText = styled.p<{ $success: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$success ? theme.colors.success : theme.colors.error};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

/**
 * Result subtext
 */
const ResultSubtext = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Calculates the X position for a given lane
 */
const getLaneX = (lane: number): number => {
  return GRASS_WIDTH + lane * LANE_WIDTH + (LANE_WIDTH - PLAYER_CAR_WIDTH) / 2;
};

/**
 * Checks collision between player car and enemy car
 */
const checkCollision = (
  playerLane: number,
  playerY: number,
  enemyCar: EnemyCar
): boolean => {
  if (playerLane !== enemyCar.lane) return false;
  
  const playerTop = playerY;
  const playerBottom = playerY + PLAYER_CAR_HEIGHT;
  const enemyTop = enemyCar.y;
  const enemyBottom = enemyCar.y + ENEMY_CAR_HEIGHT;
  
  // Check vertical overlap
  return !(playerBottom < enemyTop || playerTop > enemyBottom);
};

/**
 * Car Driving Challenge Component
 * 
 * A retro-style driving game where players navigate through traffic
 * for 30 seconds without crashing.
 * 
 * Features:
 * - 3-lane highway with grass borders
 * - Player car (red) controlled with A/D or Arrow keys
 * - Enemy cars (blue) spawning in random lanes
 * - Scrolling road markings for motion effect
 * - Collision detection
 * - Real-time statistics tracking
 * 
 * Controls:
 * - A or Left Arrow: Move left
 * - D or Right Arrow: Move right
 * 
 * Objective:
 * Survive for 30 seconds without hitting any traffic
 * 
 * Scoring:
 * - Base: 300 points for completion
 * - Bonus: +10 points per car avoided
 * - Speed bonus: based on time remaining
 */
const CarDrivingChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Game state
  const [playerLane, setPlayerLane] = useState(1); // Start in middle lane
  const [enemyCars, setEnemyCars] = useState<EnemyCar[]>([]);
  const [roadOffset, setRoadOffset] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [carsAvoided, setCarsAvoided] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [startTime] = useState(() => Date.now());
  
  // Refs
  const enemyIdCounter = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastSpawnTimeRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());

  /**
   * Keyboard input handling
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      
      const key = e.key.toLowerCase();
      if (['a', 'd', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver]);

  /**
   * Spawns a new enemy car in a random lane
   */
  const spawnEnemyCar = useCallback(() => {
    const lane = Math.floor(Math.random() * ROAD_LANES);
    const newCar: EnemyCar = {
      id: enemyIdCounter.current++,
      lane,
      y: -ENEMY_CAR_HEIGHT,
      passed: false,
    };
    
    setEnemyCars(prev => [...prev, newCar]);
  }, []);

  /**
   * Main game loop
   */
  useEffect(() => {
    if (isGameOver) return;

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Handle player movement
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        setPlayerLane(prev => Math.max(0, prev - 1));
        keysPressed.current.clear(); // Move one lane at a time
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        setPlayerLane(prev => Math.min(ROAD_LANES - 1, prev + 1));
        keysPressed.current.clear(); // Move one lane at a time
      }

      // Update road scrolling
      setRoadOffset(prev => (prev + TRAFFIC_SPEED) % 40);

      // Spawn enemy cars
      if (currentTime - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
        spawnEnemyCar();
        lastSpawnTimeRef.current = currentTime;
      }

      // Update enemy cars
      setEnemyCars(prev => {
        const updated = prev.map(car => ({
          ...car,
          y: car.y + TRAFFIC_SPEED,
        }));

        // Remove off-screen cars and count avoided
        return updated.filter(car => {
          if (car.y > CANVAS_HEIGHT) {
            if (!car.passed) {
              setCarsAvoided(c => c + 1);
            }
            return false;
          }
          return true;
        });
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameOver, spawnEnemyCar]);

  /**
   * Collision detection
   */
  useEffect(() => {
    if (isGameOver) return;

    const playerY = CANVAS_HEIGHT - 80 - PLAYER_CAR_HEIGHT;

    for (const enemyCar of enemyCars) {
      if (checkCollision(playerLane, playerY, enemyCar)) {
        setIsGameOver(true);
        setIsSuccess(false);
        return;
      }
    }
  }, [playerLane, enemyCars, isGameOver]);

  /**
   * Timer countdown
   */
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          setIsSuccess(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver]);

  /**
   * Handle game completion
   */
  useEffect(() => {
    if (!isGameOver) return;

    const timeSpent = (Date.now() - startTime) / 1000;
    
    if (isSuccess) {
      // Successful completion
      const baseScore = 300;
      const avoidBonus = carsAvoided * 10;
      const totalScore = baseScore + avoidBonus;
      
      setTimeout(() => {
        onComplete(true, timeSpent, totalScore);
      }, 2000);
    } else {
      // Crash - incomplete
      const partialScore = Math.floor((GAME_DURATION - timeLeft) * 5);
      
      setTimeout(() => {
        onComplete(false, timeSpent, partialScore);
      }, 2000);
    }
  }, [isGameOver, isSuccess, timeLeft, carsAvoided, startTime, onComplete]);

  return (
    <ChallengeBase
      title="Highway Racer"
      description="Navigate through traffic for 30 seconds"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        {/* Header */}
        <Header>
          <GameTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            🏎️ Highway Racer
          </GameTitle>
          
          <Instructions
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Use <kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> to change lanes
          </Instructions>
        </Header>

        {/* Game Canvas */}
        <GameCanvas
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Grass borders */}
          <Grass $side="left" />
          <Grass $side="right" />
          
          {/* Road surface */}
          <Road />
          
          {/* Scrolling road markings */}
          <RoadMarkings
            style={{ top: roadOffset - CANVAS_HEIGHT }}
            animate={{ top: roadOffset - CANVAS_HEIGHT }}
            transition={{ duration: 0, ease: 'linear' }}
          >
            <LaneDivider $lane={1} />
            <LaneDivider $lane={2} />
          </RoadMarkings>
          
          {/* Player car */}
          <PlayerCar
            $lane={playerLane}
            animate={{ left: getLaneX(playerLane) }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          
          {/* Enemy cars */}
          <AnimatePresence>
            {enemyCars.map(car => (
              <EnemyCar
                key={car.id}
                $lane={car.lane}
                $y={car.y}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </AnimatePresence>
          
          {/* Timer overlay */}
          <TimerOverlay>
            {timeLeft}s
          </TimerOverlay>
        </GameCanvas>

        {/* Statistics panel */}
        <StatsPanel>
          <StatItem>
            <StatLabel>Time Left</StatLabel>
            <StatValue
              key={timeLeft}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {timeLeft}s
            </StatValue>
          </StatItem>
          
          <StatItem>
            <StatLabel>Cars Avoided</StatLabel>
            <StatValue
              key={carsAvoided}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {carsAvoided}
            </StatValue>
          </StatItem>
          
          <StatItem>
            <StatLabel>Distance</StatLabel>
            <StatValue>
              {Math.floor((GAME_DURATION - timeLeft) * 50)}m
            </StatValue>
          </StatItem>
        </StatsPanel>

        {/* Result message */}
        <AnimatePresence>
          {isGameOver && (
            <ResultCard
              $success={isSuccess}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <ResultEmoji>
                {isSuccess ? '🏆' : '💥'}
              </ResultEmoji>
              <ResultText $success={isSuccess}>
                {isSuccess 
                  ? 'Perfect Drive!' 
                  : 'Crash!'}
              </ResultText>
              <ResultSubtext>
                {isSuccess
                  ? `You avoided ${carsAvoided} cars and completed the challenge!`
                  : `You survived ${GAME_DURATION - timeLeft} seconds and avoided ${carsAvoided} cars.`}
              </ResultSubtext>
            </ResultCard>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default CarDrivingChallenge;