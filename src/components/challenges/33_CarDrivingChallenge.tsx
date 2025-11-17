import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game constants
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 60;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 40;
const ROAD_WIDTH_MAX = 200;
const GAME_DURATION = 30; // seconds
const POINTS_PER_SECOND = 10;
const OBSTACLE_SPAWN_INTERVAL = 1500; // milliseconds

/**
 * Obstacle interface
 */
interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    passed: boolean;
}

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Styled game area
 */
const GameArea = styled.div`
  position: relative;
  width: 100%;
  max-width: ${CANVAS_WIDTH}px;
  aspect-ratio: ${CANVAS_WIDTH} / ${CANVAS_HEIGHT};
  background: linear-gradient(180deg, #87ceeb 0%, #e0f6ff 100%);
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled road element
 */
const RoadStripe = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    white 0px,
    white 20px,
    transparent 20px,
    transparent 40px
  );
  opacity: 0.6;
`;

/**
 * Styled car
 */
const Car = styled(motion.div)`
  position: absolute;
  width: ${CAR_WIDTH}px;
  height: ${CAR_HEIGHT}px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-radius: 4px;
  border: 2px solid #880000;
  box-shadow: ${theme.shadows.lg};

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 6px;
    width: 8px;
    height: 12px;
    background: #4444ff;
    border-radius: 2px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 28px;
    left: 6px;
    width: 8px;
    height: 12px;
    background: #ffff00;
    border-radius: 2px;
  }
`;

/**
 * Styled obstacle
 */
const Obstacle = styled(motion.div)`
  position: absolute;
  background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
  border: 2px solid #3d2817;
  border-radius: 2px;
  box-shadow: ${theme.shadows.md};
`;

/**
 * Styled stats container
 */
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  gap: ${theme.spacing.lg};
`;

/**
 * Styled stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled stat value
 */
const StatValue = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled message
 */
const Message = styled(motion.div)<{ $type: 'success' | 'error' }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
        props.$type === 'success'
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid
    ${(props) =>
        props.$type === 'success' ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) =>
        props.$type === 'success' ? theme.colors.success : theme.colors.error};
`;

/**
 * Styled timer display
 */
const TimerDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: ${theme.spacing.md};
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  z-index: 10;
`;

/**
 * Check collision between two rectangles
 */
const checkCollision = (
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
): boolean => {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
};

/**
 * Car Driving Challenge Component
 * Navigate obstacles and stay on the road
 */
const CarDrivingChallenge: React.FC<ChallengeProps> = ({
    onComplete,
    timeLimit,
    challengeId,
}) => {
    const [carX, setCarX] = useState(CANVAS_WIDTH / 2 - CAR_WIDTH / 2);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);
    const [obstaclesAvoided, setObstaclesAvoided] = useState(0);
    const [roadOffset, setRoadOffset] = useState(0);
    const keysPressed = useRef<Record<string, boolean>>({});
    const obstacleCounterRef = useRef(0);
    const gameLoopRef = useRef<number | null>(null);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // Road width based on time (gets narrower as time passes)
    const roadWidth = ROAD_WIDTH_MAX - (GAME_DURATION - timeLeft) * 2;
    const roadStartX = (CANVAS_WIDTH - roadWidth) / 2;
    const roadEndX = roadStartX + roadWidth;

    /**
     * Handle keydown
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;

            const key = e.key.toLowerCase();
            if (['a', 'd', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
                keysPressed.current[key] = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            keysPressed.current[key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStarted, gameOver]);

    /**
     * Game loop
     */
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const gameLoop = () => {
            setObstacles((prev) => {
                let updated = [...prev];

                // Move obstacles down
                updated = updated.map((obs) => ({
                    ...obs,
                    y: obs.y + 5,
                }));

                // Remove obstacles that are off screen and mark as avoided
                updated = updated.filter((obs) => {
                    if (obs.y > CANVAS_HEIGHT) {
                        if (!obs.passed) {
                            setObstaclesAvoided((c) => c + 1);
                        }
                        return false;
                    }
                    return true;
                });

                // Mark obstacles as passed when they're behind the car
                updated = updated.map((obs) => ({
                    ...obs,
                    passed: obs.y > CANVAS_HEIGHT - CAR_HEIGHT - 20,
                }));

                return updated;
            });

            // Road scrolling effect
            setRoadOffset((prev) => (prev + 5) % 40);

            // Check car movement input
            setCarX((prevX) => {
                let newX = prevX;

                if (
                    keysPressed.current['a'] ||
                    keysPressed.current['arrowleft']
                ) {
                    newX = Math.max(roadStartX, prevX - 5);
                }
                if (
                    keysPressed.current['d'] ||
                    keysPressed.current['arrowright']
                ) {
                    newX = Math.min(roadEndX - CAR_WIDTH, prevX + 5);
                }

                return newX;
            });

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameStarted, gameOver, roadStartX, roadEndX]);

    /**
     * Spawn obstacles periodically
     */
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const spawnObstacle = () => {
            const obstacleX =
                Math.random() * (roadWidth - OBSTACLE_WIDTH) + roadStartX;
            const newObstacle: Obstacle = {
                id: obstacleCounterRef.current++,
                x: obstacleX,
                y: -OBSTACLE_HEIGHT,
                width: OBSTACLE_WIDTH,
                height: OBSTACLE_HEIGHT,
                passed: false,
            };

            setObstacles((prev) => [...prev, newObstacle]);
        };

        const spawnInterval = setInterval(
            spawnObstacle,
            OBSTACLE_SPAWN_INTERVAL
        );

        return () => clearInterval(spawnInterval);
    }, [gameStarted, gameOver, roadStartX, roadWidth]);

    /**
     * Collision detection
     */
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const carBounds = {
            x: carX,
            y: CANVAS_HEIGHT - CAR_HEIGHT - 20,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
        };

        // Check collision with obstacles
        for (const obstacle of obstacles) {
            if (checkCollision(carBounds, obstacle)) {
                setGameOver(true);
                return;
            }
        }

        // Check if car is on the road
        if (
            carX < roadStartX ||
            carX + CAR_WIDTH > roadEndX
        ) {
            setGameOver(true);
        }
    }, [carX, obstacles, gameStarted, gameOver, roadStartX, roadEndX]);

    /**
     * Timer countdown
     */
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, gameOver]);

    /**
     * Update score every second
     */
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const scoreInterval = setInterval(() => {
            setScore((prev) => prev + POINTS_PER_SECOND);
        }, 1000);

        return () => clearInterval(scoreInterval);
    }, [gameStarted, gameOver]);

    /**
     * Handle game completion
     */
    useEffect(() => {
        if (gameStarted && timeLeft === 0) {
            setGameOver(true);
            setTimeout(() => {
                onComplete(true, GAME_DURATION, score);
            }, 1500);
        }
    }, [timeLeft, gameStarted, score, onComplete]);

    /**
     * Start game on mount
     */
    useEffect(() => {
        setGameStarted(true);
    }, []);

    return (
        <ChallengeBase
            title="Car Driving Challenge"
            description="Avoid obstacles and stay on the road for 30 seconds"
            timeLimit={timeLimit}
            challengeId={challengeId}
            onComplete={onComplete}
        >
            <Container>
                <GameArea ref={gameAreaRef}>
                    {/* Road stripes scrolling effect */}
                    <RoadStripe
                        style={{
                            top: roadOffset - 40,
                            height: 40,
                        }}
                    />
                    <RoadStripe
                        style={{
                            top: roadOffset,
                            height: 40,
                        }}
                    />

                    {/* Road boundaries visualization */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: roadStartX,
                            height: CANVAS_HEIGHT,
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRight: '3px dashed rgba(0, 0, 0, 0.5)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: CANVAS_WIDTH - roadEndX,
                            height: CANVAS_HEIGHT,
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderLeft: '3px dashed rgba(0, 0, 0, 0.5)',
                        }}
                    />

                    {/* Car */}
                    <Car
                        style={{
                            left: carX,
                            bottom: 20,
                        }}
                        animate={{ left: carX }}
                        transition={{ type: 'tween', duration: 0 }}
                    />

                    {/* Obstacles */}
                    <AnimatePresence>
                        {obstacles.map((obstacle) => (
                            <Obstacle
                                key={obstacle.id}
                                style={{
                                    left: obstacle.x,
                                    top: obstacle.y,
                                    width: OBSTACLE_WIDTH,
                                    height: OBSTACLE_HEIGHT,
                                }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Timer */}
                    <TimerDisplay>
                        {timeLeft}s
                    </TimerDisplay>
                </GameArea>

                <StatsContainer>
                    <StatItem>
                        <StatLabel>Time Left</StatLabel>
                        <StatValue>{timeLeft}s</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Obstacles Avoided</StatLabel>
                        <StatValue>{obstaclesAvoided}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Distance</StatLabel>
                        <StatValue>{Math.floor(score / POINTS_PER_SECOND * 10)}m</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Score</StatLabel>
                        <StatValue>{score}</StatValue>
                    </StatItem>
                </StatsContainer>

                {!gameStarted && (
                    <Message $type="success">
                        🎮 Use A/D or Arrow Keys to steer. Avoid obstacles!
                    </Message>
                )}

                {gameOver && timeLeft > 0 && (
                    <Message $type="error">
                        ✗ Collision! You survived {Math.floor(score / POINTS_PER_SECOND)} seconds
                    </Message>
                )}

                {gameOver && timeLeft === 0 && (
                    <Message $type="success">
                        ✓ Perfect! You survived 30 seconds!
                    </Message>
                )}
            </Container>
        </ChallengeBase>
    );
};

export default CarDrivingChallenge;
