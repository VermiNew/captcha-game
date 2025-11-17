import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game constants
 */
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 50;
const ASTEROID_SIZE = 30;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;
const GAME_DURATION = 60; // seconds
const ASTEROID_SPAWN_INTERVAL = 1000; // milliseconds
const BULLET_SPEED = 7;
const ASTEROID_SPEED = 3;
const PLAYER_SPEED = 6;

/**
 * Game objects interfaces
 */
interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Bullet {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Asteroid {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
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
 * Styled game canvas wrapper
 */
const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: ${CANVAS_WIDTH}px;
  aspect-ratio: ${CANVAS_WIDTH} / ${CANVAS_HEIGHT};
  background: linear-gradient(180deg, #000033 0%, #000011 100%);
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled canvas
 */
const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #000033 0%, #000011 100%);
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
  flex-wrap: wrap;
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
 * Styled health bar container
 */
const HealthBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.md};
`;

/**
 * Styled health bar fill
 */
const HealthBarFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ffff44, #44ff44);
  border-radius: ${theme.borderRadius.full};
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
 * Space Shooter Challenge Component
 */
const SpaceShooterChallenge: React.FC<ChallengeProps> = ({
    onComplete,
    timeLimit,
    challengeId,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameActive, setGameActive] = useState(true);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(3);
    const [asteroidsDestroyed, setAsteroidsDestroyed] = useState(0);

    // Game state refs for game loop
    const playerRef = useRef<Player>({
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
    });

    const bulletsRef = useRef<Bullet[]>([]);
    const asteroidsRef = useRef<Asteroid[]>([]);
    const keysPressed = useRef<Record<string, boolean>>({});
    const bulletCounterRef = useRef(0);
    const asteroidCounterRef = useRef(0);
    const gameLoopRef = useRef<number | null>(null);

    /**
     * Draw game on canvas
     */
    const drawGame = (
        ctx: CanvasRenderingContext2D,
        player: Player,
        bullets: Bullet[],
        asteroids: Asteroid[]
    ) => {
        // Clear canvas
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw stars
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 50; i++) {
            const x = (i * 97) % CANVAS_WIDTH;
            const y = (i * 31) % CANVAS_HEIGHT;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

        // Draw player ship
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        // Cockpit
        ctx.fillStyle = '#00aa00';
        ctx.fillRect(
            player.x + player.width / 2 - 5,
            player.y + 5,
            10,
            10
        );
        // Flame
        ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
        ctx.fillRect(player.x + 8, player.y + player.height, 24, 10);

        // Draw bullets
        ctx.fillStyle = '#ffff00';
        bullets.forEach((bullet) => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw asteroids
        asteroids.forEach((asteroid) => {
            ctx.fillStyle = '#ff8800';
            ctx.beginPath();
            ctx.arc(
                asteroid.x + asteroid.size / 2,
                asteroid.y + asteroid.size / 2,
                asteroid.size / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Asteroid detail
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    };

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
     * Check collision between circle and rectangle
     */
    const checkCircleRectCollision = (
        circle: { x: number; y: number; radius: number },
        rect: { x: number; y: number; width: number; height: number }
    ): boolean => {
        const circleX = circle.x;
        const circleY = circle.y;
        const rectX = rect.x;
        const rectY = rect.y;
        const rectW = rect.width;
        const rectH = rect.height;

        const closestX = Math.max(rectX, Math.min(circleX, rectX + rectW));
        const closestY = Math.max(rectY, Math.min(circleY, rectY + rectH));

        const distance = Math.sqrt(
            (circleX - closestX) ** 2 + (circleY - closestY) ** 2
        );

        return distance < circle.radius;
    };

    /**
     * Main game loop
     */
    useEffect(() => {
        if (!gameActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gameLoop = () => {
            // Update player position
            const player = playerRef.current;
            if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
                player.x = Math.max(0, player.x - PLAYER_SPEED);
            }
            if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
                player.x = Math.min(CANVAS_WIDTH - player.width, player.x + PLAYER_SPEED);
            }

            // Update bullets
            bulletsRef.current = bulletsRef.current.filter((bullet) => {
                bullet.y -= BULLET_SPEED;
                return bullet.y > 0;
            });

            // Update asteroids
            asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
                asteroid.y += asteroid.speed;
                return asteroid.y < CANVAS_HEIGHT;
            });

            // Check collisions between bullets and asteroids
            bulletsRef.current = bulletsRef.current.filter((bullet) => {
                for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
                    const asteroid = asteroidsRef.current[i];
                    if (
                        checkCircleRectCollision(
                            {
                                x: asteroid.x + asteroid.size / 2,
                                y: asteroid.y + asteroid.size / 2,
                                radius: asteroid.size / 2,
                            },
                            bullet
                        )
                    ) {
                        asteroidsRef.current.splice(i, 1);
                        setScore((prev) => prev + 15);
                        setAsteroidsDestroyed((prev) => prev + 1);
                        return false;
                    }
                }
                return true;
            });

            // Check collisions between player and asteroids
            asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
                if (
                    checkCollision(player, {
                        x: asteroid.x,
                        y: asteroid.y,
                        width: asteroid.size,
                        height: asteroid.size,
                    })
                ) {
                    setHealth((prev) => {
                        const newHealth = Math.max(0, prev - 1);
                        if (newHealth === 0) {
                            setGameActive(false);
                        }
                        return newHealth;
                    });
                    setScore((prev) => Math.max(0, prev - 20));
                    return false;
                }
                return true;
            });

            // Draw everything
            drawGame(ctx, player, bulletsRef.current, asteroidsRef.current);

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameActive]);

    /**
     * Asteroid spawning
     */
    useEffect(() => {
        if (!gameActive) return;

        const spawnInterval = setInterval(() => {
            const asteroidX = Math.random() * (CANVAS_WIDTH - ASTEROID_SIZE);
            const newAsteroid: Asteroid = {
                id: asteroidCounterRef.current++,
                x: asteroidX,
                y: -ASTEROID_SIZE,
                size: ASTEROID_SIZE,
                speed: ASTEROID_SPEED + Math.random() * 2,
            };
            asteroidsRef.current.push(newAsteroid);
        }, ASTEROID_SPAWN_INTERVAL);

        return () => clearInterval(spawnInterval);
    }, [gameActive]);

    /**
     * Keyboard controls
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            if (['a', 'd', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
                keysPressed.current[key] = true;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                if (gameActive) {
                    const player = playerRef.current;
                    const newBullet: Bullet = {
                        id: bulletCounterRef.current++,
                        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
                        y: player.y,
                        width: BULLET_WIDTH,
                        height: BULLET_HEIGHT,
                    };
                    bulletsRef.current.push(newBullet);
                }
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
    }, [gameActive]);

    /**
     * Timer countdown
     */
    useEffect(() => {
        if (!gameActive) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameActive]);

    /**
     * Complete game
     */
    useEffect(() => {
        if (!gameActive && timeLeft === 0) {
            const finalScore = score;
            const success = finalScore > 150; // Threshold for success
            setTimeout(() => {
                onComplete(success, GAME_DURATION, finalScore);
            }, 1500);
        }
    }, [gameActive, timeLeft, score, onComplete]);

    const healthPercent = (health / 3) * 100;

    return (
        <ChallengeBase
            title="Space Shooter Challenge"
            description="Destroy asteroids and survive for 60 seconds"
            timeLimit={timeLimit}
            challengeId={challengeId}
            onComplete={onComplete}
        >
            <Container>
                <CanvasWrapper>
                    <Canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
                </CanvasWrapper>

                <StatsContainer>
                    <StatItem>
                        <StatLabel>Time Left</StatLabel>
                        <StatValue>{timeLeft}s</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Score</StatLabel>
                        <StatValue>{score}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Destroyed</StatLabel>
                        <StatValue>{asteroidsDestroyed}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Health</StatLabel>
                        <StatValue>{health}/3</StatValue>
                    </StatItem>
                </StatsContainer>

                <div style={{ width: '100%' }}>
                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: theme.fontSizes.sm,
                            color: theme.colors.textSecondary,
                            margin: `0 0 ${theme.spacing.sm} 0`,
                        }}
                    >
                        Health
                    </p>
                    <HealthBarContainer>
                        <HealthBarFill
                            animate={{ width: `${healthPercent}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </HealthBarContainer>
                </div>

                {!gameActive && timeLeft === 0 && (
                    <Message $type={score > 150 ? 'success' : 'error'}>
                        {score > 150
                            ? `✓ Great job! Final Score: ${score}`
                            : `✗ Game Over. Score: ${score}`}
                    </Message>
                )}

                {!gameActive && health === 0 && (
                    <Message $type="error">
                        ✗ All lives lost! Final Score: {score}
                    </Message>
                )}

                <div style={{ textAlign: 'center', fontSize: theme.fontSizes.sm }}>
                    <p style={{ color: theme.colors.textSecondary }}>
                        Use A/D or Arrow Keys to move, Space to shoot
                    </p>
                </div>
            </Container>
        </ChallengeBase>
    );
};

export default SpaceShooterChallenge;
