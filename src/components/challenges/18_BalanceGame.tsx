import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Game phase type
 */
type GamePhase = 'ready' | 'playing' | 'complete';

/**
 * Balance Game Challenge
 * Keep the platform balanced by moving left and right
 */
const BalanceGame: React.FC = () => {
  const GAME_DURATION = 30; // seconds
  const PLATFORM_WIDTH = 300;
  const BALL_SIZE = 40;
  const GRAVITY = 0.15; // Reduced from 0.3 for lighter feel
  const TILT_SPEED = 0.3; // Greatly reduced from 2.5 for precise control
  const MAX_TILT = 10; // Reduced from 20 for minimal tilt
  const DAMPING = 0.99; // High damping for smooth deceleration
  const BALL_FRICTION = 0.95; // High friction to keep ball stable
  const RANDOM_TILT_STRENGTH = 0.05; // Minimal random movement
  const RANDOM_TILT_INTERVAL = 5000; // Rare random disruptions

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [tilt, setTilt] = useState(0);
  const [ballPosition, setBallPosition] = useState(0);
  const [ballVelocity, setBallVelocity] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const randomTiltIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  /**
   * Start countdown before game
   */
  const startCountdown = useCallback(() => {
    setPhase('ready');
    setCountdown(3);
    let count = 3;
    
    const runCountdown = () => {
      if (count > 0) {
        setCountdown(count);
        count--;
        countdownTimerRef.current = setTimeout(runCountdown, 1000);
      } else {
        startTimeRef.current = Date.now();
        lastUpdateRef.current = Date.now();
        setPhase('playing');
      }
    };
    
    runCountdown();
  }, []);

  /**
   * Start game on mount
   */
  useEffect(() => {
    startCountdown();
    
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (randomTiltIntervalRef.current) clearInterval(randomTiltIntervalRef.current);
    };
  }, [startCountdown]);

  /**
   * Game timer
   */
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setCompleted(true);
          setPhase('complete');
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  /**
   * Keyboard controls
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase]);

  /**
   * Random platform movements
   */
  useEffect(() => {
    if (phase !== 'playing' || gameOver) return;

    const applyRandomTilt = () => {
      setTilt((prevTilt) => {
        const randomPush = (Math.random() - 0.5) * RANDOM_TILT_STRENGTH;
        return prevTilt + randomPush;
      });
    };

    randomTiltIntervalRef.current = setInterval(applyRandomTilt, RANDOM_TILT_INTERVAL);

    return () => {
      if (randomTiltIntervalRef.current) clearInterval(randomTiltIntervalRef.current);
    };
  }, [phase, gameOver]);

  /**
   * Game physics loop
   */
  useEffect(() => {
    if (phase !== 'playing' || gameOver) return;

    const updateGame = () => {
      const now = Date.now();
      lastUpdateRef.current = now;

      // Update tilt based on input
      setTilt((prevTilt) => {
        let newTilt = prevTilt;
        let tiltChange = 0;

        if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
          tiltChange -= TILT_SPEED;
        }
        if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
          tiltChange += TILT_SPEED;
        }

        // Apply tilt change
        newTilt += tiltChange;
        
        // Return to center when no input
        if (tiltChange === 0) {
          newTilt *= DAMPING;
        }

        // Clamp tilt
        newTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, newTilt));

        return newTilt;
      });

      // Update ball physics
      setBallVelocity((prevVelocity) => {
        const tiltRadians = (tilt * Math.PI) / 180;
        const tiltForce = Math.sin(tiltRadians) * GRAVITY;
        let newVelocity = prevVelocity + tiltForce;
        newVelocity *= BALL_FRICTION;
        return newVelocity;
      });

      setBallPosition((prevPosition) => {
        const newPosition = prevPosition + ballVelocity;

        // Check boundaries
        const maxPosition = (PLATFORM_WIDTH / 2 - BALL_SIZE / 2) / (PLATFORM_WIDTH / 2);
        if (Math.abs(newPosition) > maxPosition) {
          setGameOver(true);
          setPhase('complete');
          return prevPosition;
        }

        return newPosition;
      });

      // Increase score
      setScore((prevScore) => {
        const balanceQuality = Math.max(0, 1 - Math.abs(ballPosition) * 1.5);
        return prevScore + balanceQuality * 0.5;
      });

      animationFrameRef.current = requestAnimationFrame(updateGame);
    };

    animationFrameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase, gameOver, tilt, ballVelocity, ballPosition]);

  /**
   * Restart game
   */
  const restartGame = () => {
    setPhase('ready');
    setCountdown(3);
    setTimeLeft(GAME_DURATION);
    setTilt(0);
    setBallPosition(0);
    setBallVelocity(0);
    setGameOver(false);
    setCompleted(false);
    setScore(0);
    keysPressed.current.clear();
    startCountdown();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      minHeight: '100vh',
      padding: '2rem',
      background: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Balance Game
      </motion.h1>

      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
      }}>
        {phase === 'ready' && '🎮 Get ready...'}
        {phase === 'playing' && '⚖️ Keep the ball balanced!'}
        {phase === 'complete' && (completed ? '🎉 You survived!' : '💔 Ball fell off!')}
      </p>

      {/* Countdown Display */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: '#6366f1',
            }}
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Stats */}
      {phase !== 'ready' && (
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          width: '100%',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: 'white',
            borderRadius: '1rem',
            border: '2px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500',
            }}>Time Left</p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: timeLeft <= 5 ? '#ef4444' : '#1f2937',
              margin: 0,
            }}>
              {timeLeft}s
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: 'white',
            borderRadius: '1rem',
            border: '2px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500',
            }}>Score</p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0,
            }}>
              {Math.round(score)}
            </p>
          </div>
        </div>
      )}

      {/* Game Area */}
      {phase !== 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            padding: '3rem',
            background: 'white',
            borderRadius: '1rem',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Platform and Ball */}
          <div style={{
            position: 'relative',
            width: '400px',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Platform */}
            <div
              style={{
                transform: `rotate(${tilt}deg)`,
                width: `${PLATFORM_WIDTH}px`,
                height: '15px',
                background: '#6366f1',
                borderRadius: '8px',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Ball */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: `${((ballPosition + 1) / 2) * 100}%`,
                  top: `-${BALL_SIZE + 5}px`,
                  transform: 'translateX(-50%)',
                  width: `${BALL_SIZE}px`,
                  height: `${BALL_SIZE}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                }}
              />
            </div>

            {/* Danger zones */}
            <div style={{
              position: 'absolute',
              bottom: '130px',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 20px',
            }}>
              <div style={{
                width: '2px',
                height: '40px',
                background: '#ef4444',
                opacity: 0.3,
              }} />
              <div style={{
                width: '2px',
                height: '40px',
                background: '#ef4444',
                opacity: 0.3,
              }} />
            </div>
          </div>

          {/* Controls hint */}
          {phase === 'playing' && !gameOver && (
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: 0,
            }}>
              ⌨️ Use Arrow Keys or A/D to tilt the platform
            </p>
          )}
        </motion.div>
      )}

      {/* Game Over / Complete Message */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '2rem',
              borderRadius: '1rem',
              background: 'white',
              border: `3px solid ${completed ? '#10b981' : '#ef4444'}`,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              minWidth: '300px',
            }}
          >
            <span style={{ fontSize: '4rem', lineHeight: 1 }}>
              {completed ? '🎉' : '💔'}
            </span>
            <div>
              <h2 style={{ 
                fontSize: '2rem', 
                margin: '0 0 0.5rem 0',
                fontWeight: 'bold',
                color: '#1f2937',
              }}>
                {completed ? 'Congratulations!' : 'Game Over!'}
              </h2>
              <p style={{ 
                fontSize: '1.125rem', 
                margin: 0,
                color: '#6b7280',
              }}>
                {completed
                  ? `You kept your balance for ${GAME_DURATION} seconds!`
                  : 'The ball fell off the platform!'}
              </p>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#6366f1',
            }}>
              Score: {Math.round(score)}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'white',
                background: '#6366f1',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              🔄 Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BalanceGame;
