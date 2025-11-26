import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game constants
 */
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 700;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 50;
const ASTEROID_BASE_SIZE = 30;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;
const GAME_DURATION = 30;
const ASTEROID_SPAWN_INTERVAL = 800;
const BULLET_SPEED = 10;
const BASE_ASTEROID_SPEED = 2;
const PLAYER_SPEED = 8;
const WIN_SCORE = 1000;
const LOSE_SCORE = 200;

/**
 * Game objects interfaces with depth (z)
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
  z: number; // depth 0-1
  width: number;
  height: number;
}

interface Asteroid {
  id: number;
  x: number;
  y: number;
  z: number; // depth 0-1 (0 = far, 1 = near)
  size: number;
  speed: number;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  speed: number;
}

/**
 * Styled container
 */
const Container = styled(motion.div)`
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
  background: #000;
  border: 4px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg}, 0 0 30px rgba(99, 102, 241, 0.3);
`;

/**
 * Styled canvas
 */
const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, #001a33 0%, #000000 100%);
`;

/**
 * Styled stats container
 */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: ${CANVAS_WIDTH}px;
`;

/**
 * Styled stat card
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled health bar container
 */
const HealthBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

/**
 * Styled health bar fill
 */
const HealthBarFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
  border-radius: ${theme.borderRadius.full};
  box-shadow: 0 0 10px currentColor;
`;

/**
 * Styled message
 */
const Message = styled(motion.div)<{ $type: 'success' | 'error' }>`
  padding: ${theme.spacing.xl};
  background: ${props =>
    props.$type === 'success'
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props =>
    props.$type === 'success' ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  color: ${props =>
    props.$type === 'success' ? theme.colors.success : theme.colors.error};
  width: 100%;
  max-width: ${CANVAS_WIDTH}px;
`;

/**
 * Styled controls
 */
const Controls = styled.div`
  text-align: center;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.md};
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.md};
  width: 100%;
  max-width: ${CANVAS_WIDTH}px;
`;

/**
 * Generate stars for background
 */
const generateStars = (count: number): Star[] => {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      z: Math.random(),
      speed: 0.5 + Math.random() * 1.5,
    });
  }
  return stars;
};

/**
 * Space Shooter Challenge Component - 2.5D
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
  const [combo, setCombo] = useState(0);
  const [startTime] = useState(() => Date.now());

  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 40,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>(generateStars(100));
  const keysPressed = useRef<Record<string, boolean>>({});
  const bulletCounterRef = useRef(0);
  const asteroidCounterRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastComboTimeRef = useRef(Date.now());

  /**
   * Create explosion particles
   */
  const createExplosion = useCallback((x: number, y: number, z: number, color: string) => {
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  /**
   * Draw game on canvas with 2.5D effects
   */
  const drawGame = useCallback((
    ctx: CanvasRenderingContext2D,
    player: Player,
    bullets: Bullet[],
    asteroids: Asteroid[],
    particles: Particle[],
    stars: Star[]
  ) => {
    // Clear canvas with gradient
    const gradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 2
    );
    gradient.addColorStop(0, '#001a33');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars with parallax
    stars.forEach(star => {
      const size = 1 + star.z * 2;
      const opacity = 0.3 + star.z * 0.7;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Glow for brighter stars
      if (star.z > 0.7) {
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Sort objects by depth (far to near)
    const allObjects = [
      ...asteroids.map(a => ({ type: 'asteroid' as const, obj: a, z: a.z })),
      ...bullets.map(b => ({ type: 'bullet' as const, obj: b, z: b.z })),
    ].sort((a, b) => a.z - b.z);

    // Draw objects in depth order
    allObjects.forEach(({ type, obj }) => {
      if (type === 'asteroid') {
        const asteroid = obj as Asteroid;
        const scale = 0.5 + asteroid.z * 1.5;
        const size = asteroid.size * scale;
        const opacity = 0.5 + asteroid.z * 0.5;
        
        ctx.save();
        ctx.translate(asteroid.x + size / 2, asteroid.y + size / 2);
        ctx.rotate(asteroid.rotation);
        
        // Shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10 * scale;
        ctx.shadowOffsetY = 5 * scale;
        
        // Asteroid body with gradient
        const asteroidGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
        asteroidGradient.addColorStop(0, `rgba(255, 136, 0, ${opacity})`);
        asteroidGradient.addColorStop(0.7, `rgba(255, 68, 0, ${opacity})`);
        asteroidGradient.addColorStop(1, `rgba(139, 0, 0, ${opacity * 0.8})`);
        ctx.fillStyle = asteroidGradient;
        
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Crater details
        ctx.fillStyle = `rgba(139, 0, 0, ${opacity * 0.6})`;
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI * 2) / 3;
          const dist = size / 4;
          ctx.beginPath();
          ctx.arc(
            Math.cos(angle) * dist,
            Math.sin(angle) * dist,
            size / 8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        
        ctx.restore();
      } else {
        const bullet = obj as Bullet;
        const scale = 0.7 + bullet.z * 0.6;
        const width = bullet.width * scale;
        const height = bullet.height * scale;
        
        // Bullet glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15 * scale;
        
        // Bullet trail
        const trailGradient = ctx.createLinearGradient(
          bullet.x + width / 2,
          bullet.y,
          bullet.x + width / 2,
          bullet.y + height + 20
        );
        trailGradient.addColorStop(0, `rgba(0, 255, 255, ${0.8 * scale})`);
        trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = trailGradient;
        ctx.fillRect(bullet.x, bullet.y, width, height + 20);
        
        // Bullet body
        const bulletGradient = ctx.createLinearGradient(
          bullet.x,
          bullet.y,
          bullet.x + width,
          bullet.y
        );
        bulletGradient.addColorStop(0, '#00ffff');
        bulletGradient.addColorStop(0.5, '#ffffff');
        bulletGradient.addColorStop(1, '#00ffff');
        ctx.fillStyle = bulletGradient;
        ctx.fillRect(bullet.x, bullet.y, width, height);
        
        ctx.shadowBlur = 0;
      }
    });

    // Draw particles
    particles.forEach(p => {
      const scale = 0.5 + p.z * 1;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw player ship with 3D effect
    ctx.save();
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 20;
    
    // Ship body
    const shipGradient = ctx.createLinearGradient(
      player.x,
      player.y,
      player.x + player.width,
      player.y
    );
    shipGradient.addColorStop(0, '#00ff00');
    shipGradient.addColorStop(0.5, '#00ff88');
    shipGradient.addColorStop(1, '#00ff00');
    ctx.fillStyle = shipGradient;
    
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height - 10);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#00aa00';
    ctx.beginPath();
    ctx.arc(
      player.x + player.width / 2,
      player.y + 15,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Engine flames with animation
    const flameSize = 15 + Math.sin(Date.now() / 100) * 5;
    const flameGradient = ctx.createLinearGradient(
      player.x + player.width / 2,
      player.y + player.height,
      player.x + player.width / 2,
      player.y + player.height + flameSize
    );
    flameGradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
    flameGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.7)');
    flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = flameGradient;
    
    // Left flame
    ctx.beginPath();
    ctx.moveTo(player.x + 10, player.y + player.height);
    ctx.lineTo(player.x + 5, player.y + player.height + flameSize);
    ctx.lineTo(player.x + 15, player.y + player.height);
    ctx.fill();
    
    // Right flame
    ctx.beginPath();
    ctx.moveTo(player.x + player.width - 10, player.y + player.height);
    ctx.lineTo(player.x + player.width - 5, player.y + player.height + flameSize);
    ctx.lineTo(player.x + player.width - 15, player.y + player.height);
    ctx.fill();
    
    ctx.restore();
  }, []);

  /**
   * Check collision with depth consideration
   */
  const checkCollision = useCallback((
    rect1: { x: number; y: number; width: number; height: number; z?: number },
    circle: { x: number; y: number; radius: number; z: number }
  ): boolean => {
    // Check depth proximity first
    if (rect1.z !== undefined && Math.abs(rect1.z - circle.z) > 0.3) {
      return false;
    }

    const circleX = circle.x + circle.radius;
    const circleY = circle.y + circle.radius;
    const closestX = Math.max(rect1.x, Math.min(circleX, rect1.x + rect1.width));
    const closestY = Math.max(rect1.y, Math.min(circleY, rect1.y + rect1.height));
    const distance = Math.sqrt((circleX - closestX) ** 2 + (circleY - closestY) ** 2);
    
    return distance < circle.radius;
  }, []);

  /**
   * Main game loop
   */
  useEffect(() => {
    if (!gameActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const player = playerRef.current;

      // Update player position
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
        player.x = Math.max(0, player.x - PLAYER_SPEED);
      }
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
        player.x = Math.min(CANVAS_WIDTH - player.width, player.x + PLAYER_SPEED);
      }

      // Update stars (parallax scrolling)
      starsRef.current.forEach(star => {
        star.y += star.speed * (1 + star.z);
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * CANVAS_WIDTH;
        }
      });

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        return bullet.y > -bullet.height;
      });

      // Update asteroids (move towards camera and down)
      asteroidsRef.current = asteroidsRef.current.filter(asteroid => {
        asteroid.y += asteroid.speed * (1 + asteroid.z);
        asteroid.z += 0.005; // Approach camera
        asteroid.rotation += 0.02;
        return asteroid.y < CANVAS_HEIGHT + asteroid.size && asteroid.z < 1.5;
      });

      // Update particles
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.02,
        }))
        .filter(p => p.life > 0);

      // Check bullet-asteroid collisions
      bulletsRef.current = bulletsRef.current.filter(bullet => {
        for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
          const asteroid = asteroidsRef.current[i];
          const scale = 0.5 + asteroid.z * 1.5;
          const asteroidRadius = (asteroid.size * scale) / 2;
          
          if (checkCollision(bullet, {
            x: asteroid.x,
            y: asteroid.y,
            radius: asteroidRadius,
            z: asteroid.z,
          })) {
            createExplosion(
              asteroid.x + asteroidRadius,
              asteroid.y + asteroidRadius,
              asteroid.z,
              '#ff8800'
            );
            
            asteroidsRef.current.splice(i, 1);
            const points = Math.round(20 * (1 + asteroid.z));
            const comboBonus = combo * 5;
            setScore(prev => prev + points + comboBonus);
            setAsteroidsDestroyed(prev => prev + 1);
            setCombo(prev => prev + 1);
            lastComboTimeRef.current = Date.now();
            return false;
          }
        }
        return true;
      });

      // Check player-asteroid collisions
      asteroidsRef.current = asteroidsRef.current.filter(asteroid => {
        const scale = 0.5 + asteroid.z * 1.5;
        const asteroidRadius = (asteroid.size * scale) / 2;
        
        if (checkCollision({
          x: player.x,
          y: player.y,
          width: player.width,
          height: player.height,
          z: 0.9,
        }, {
          x: asteroid.x,
          y: asteroid.y,
          radius: asteroidRadius,
          z: asteroid.z,
        })) {
          createExplosion(player.x + player.width / 2, player.y + player.height / 2, 0.9, '#ff0000');
          setHealth(prev => {
            const newHealth = Math.max(0, prev - 1);
            if (newHealth === 0) {
              setGameActive(false);
            }
            return newHealth;
          });
          setScore(prev => Math.max(0, prev - 50));
          setCombo(0);
          return false;
        }
        return true;
      });

      // Reset combo if too much time passed
      if (Date.now() - lastComboTimeRef.current > 3000) {
        setCombo(0);
      }

      drawGame(ctx, player, bulletsRef.current, asteroidsRef.current, particlesRef.current, starsRef.current);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameActive, drawGame, checkCollision, createExplosion, combo]);

  /**
   * Asteroid spawning
   */
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      const asteroidX = Math.random() * (CANVAS_WIDTH - ASTEROID_BASE_SIZE * 2);
      const z = Math.random() * 0.3; // Start in background
      const newAsteroid: Asteroid = {
        id: asteroidCounterRef.current++,
        x: asteroidX,
        y: -ASTEROID_BASE_SIZE * 2,
        z,
        size: ASTEROID_BASE_SIZE,
        speed: BASE_ASTEROID_SPEED + Math.random() * 2,
        rotation: 0,
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
          const z = 0.8;
          const newBullet: Bullet = {
            id: bulletCounterRef.current++,
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y,
            z,
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
      setTimeLeft(prev => {
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
    if (!gameActive) {
      const timeSpent = (Date.now() - startTime) / 1000;
      const success = score >= WIN_SCORE;
      const finalScore = success ? score : Math.max(score, LOSE_SCORE);
      
      setTimeout(() => {
        onComplete(success, timeSpent, finalScore);
      }, 2000);
    }
  }, [gameActive, score, startTime, onComplete]);

  const healthPercent = (health / 3) * 100;
  const gameEnded = !gameActive;
  const won = score >= WIN_SCORE;

  return (
    <ChallengeBase
      title="Space Shooter Challenge"
      description="Destroy asteroids and survive for 30 seconds"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CanvasWrapper>
          <Canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        </CanvasWrapper>

        <StatsContainer>
          <StatCard>
            <StatLabel>Time</StatLabel>
            <StatValue
              key={timeLeft}
              animate={{ scale: timeLeft <= 5 ? [1, 1.2, 1] : 1 }}
              style={{ color: timeLeft <= 5 ? theme.colors.error : theme.colors.primary }}
            >
              {timeLeft}s
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Score</StatLabel>
            <StatValue
              key={score}
              animate={{ scale: [1.3, 1] }}
              transition={{ duration: 0.2 }}
            >
              {score}
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Combo</StatLabel>
            <StatValue
              key={combo}
              animate={{ 
                scale: combo > 0 ? [1.3, 1] : 1,
                color: combo >= 5 ? theme.colors.warning : theme.colors.primary
              }}
            >
              {combo}x
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Health</StatLabel>
            <StatValue
              style={{ color: health <= 1 ? theme.colors.error : theme.colors.primary }}
            >
              {health}/3
            </StatValue>
          </StatCard>
        </StatsContainer>

        <div style={{ width: '100%', maxWidth: `${CANVAS_WIDTH}px` }}>
          <HealthBarContainer>
            <HealthBarFill
              animate={{ width: `${healthPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </HealthBarContainer>
        </div>

        <AnimatePresence>
          {gameEnded && (
            <Message
              $type={won ? 'success' : 'error'}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {won ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>🏆</div>
                  <div>Victory! Final Score: {score}</div>
                  <div style={{ fontSize: theme.fontSizes.sm, opacity: 0.8, marginTop: theme.spacing.sm }}>
                    {asteroidsDestroyed} asteroids destroyed
                  </div>
                </>
              ) : health === 0 ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>💥</div>
                  <div>Ship Destroyed! Score: {score}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏱️</div>
                  <div>Time's Up! Score: {score}</div>
                  <div style={{ fontSize: theme.fontSizes.sm, opacity: 0.8, marginTop: theme.spacing.sm }}>
                    Need {WIN_SCORE} points to win
                  </div>
                </>
              )}
            </Message>
          )}
        </AnimatePresence>

        <Controls>
          <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.xs }}>
            🎮 Controls
          </div>
          <div>
            <strong>A/D</strong> or <strong>← →</strong> to move • <strong>SPACE</strong> to shoot
          </div>
          <div style={{ marginTop: theme.spacing.xs, opacity: 0.7 }}>
            Goal: Score {WIN_SCORE}+ points in {GAME_DURATION} seconds
          </div>
        </Controls>
      </Container>
    </ChallengeBase>
  );
};

export default SpaceShooterChallenge;