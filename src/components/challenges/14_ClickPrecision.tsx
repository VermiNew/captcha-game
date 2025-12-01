import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
 

/**
 * Game phase type
 */
type GamePhase = 'ready' | 'active' | 'showing-result' | 'complete';

/**
 * Result item
 */
interface AttemptResult {
  distance: number;
  x: number;
  y: number;
  accuracy: number;
}

/**
 * Get quality level based on distance
 */
const getQuality = (distance: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (distance <= 15) return 'excellent';
  if (distance <= 30) return 'good';
  if (distance <= 50) return 'fair';
  return 'poor';
};

/**
 * Get quality color
 */
const getQualityColor = (quality: 'excellent' | 'good' | 'fair' | 'poor'): string => {
  switch (quality) {
    case 'excellent': return '#10b981';
    case 'good': return '#3b82f6';
    case 'fair': return '#f59e0b';
    case 'poor': return '#ef4444';
  }
};

/**
 * Click Precision Challenge Component
 * User must click the center of a shrinking circle
 */
const ClickPrecisionChallenge: React.FC<ChallengeProps> = ({
  onComplete,
}) => {
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [missIndicator, setMissIndicator] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [countdown, setCountdown] = useState(3);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const TOTAL_ATTEMPTS = 3;
  const CIRCLE_SIZE = 200; // px
  const ANIMATION_DURATION = 3000; // ms
  const MIN_CIRCLE_SIZE = 20; // px
  const CENTER_THRESHOLD = 20; // px - considered "miss" if outside this

  /**
   * Calculate distance from center
   */
  const calculateDistance = useCallback((clickX: number, clickY: number, centerX: number, centerY: number): number => {
    return Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
  }, []);

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
        setPhase('active');
        startTimeRef.current = Date.now();
      }
    };
    
    runCountdown();
  }, []);

  /**
   * Handle click on game area
   */
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'active' || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const distance = calculateDistance(clickX, clickY, centerX, centerY);
    const currentCircleRadius = (CIRCLE_SIZE * scale) / 2;
    const accuracy = Math.max(0, 100 - (distance / currentCircleRadius) * 100);

    // Show miss indicator if click is outside center threshold
    if (distance > CENTER_THRESHOLD) {
      setMissIndicator({ x: clickX, y: clickY });
      setTimeout(() => setMissIndicator(null), 600);
    }

    // Record result
    const newResults = [...results, { distance, x: clickX, y: clickY, accuracy }];
    setResults(newResults);

    // Show result phase
    setPhase('showing-result');

    // Next attempt or complete
    if (currentAttempt < TOTAL_ATTEMPTS) {
      setTimeout(() => {
        setCurrentAttempt(currentAttempt + 1);
        setScale(1);
        setPhase('active');
      }, 1800);
    } else {
      // Challenge complete
      setTimeout(() => {
        setPhase('complete');
      }, 1800);
    }
  }, [phase, currentAttempt, results, scale, calculateDistance]);

  /**
   * Animate circle shrinking
   */
  useEffect(() => {
    if (phase !== 'active') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    animationStartRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - animationStartRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      // Exponential easing for more dramatic shrinking
      const easeProgress = Math.pow(progress, 1.5);
      const newScale = 1 - easeProgress * (1 - MIN_CIRCLE_SIZE / CIRCLE_SIZE);

      setScale(newScale);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [phase, currentAttempt]);

  /**
   * Start countdown on mount
   */
  useEffect(() => {
    startCountdown();
    
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startCountdown]);

  /**
   * Complete challenge
   */
  useEffect(() => {
    if (phase === 'complete' && results.length === TOTAL_ATTEMPTS) {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      
      setTimeout(() => {
        onComplete(stats.success, timeSpent, stats.score);
      }, 2500);
    }
  }, [phase, results]);

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    if (results.length === 0) {
      return { avgDistance: 0, avgAccuracy: 0, bestDistance: 0, success: false, score: 0 };
    }

    const avgDistance = results.reduce((a, b) => a + b.distance, 0) / results.length;
    const avgAccuracy = results.reduce((a, b) => a + b.accuracy, 0) / results.length;
    const bestDistance = Math.min(...results.map(r => r.distance));
    
    // Success if average distance < 30px
    const success = avgDistance < 30;
    
    // Scoring: Base 200 points - distance penalty + bonus for consistency
    const baseScore = 200;
    const distancePenalty = avgDistance * 3;
    const consistencyBonus = results.every(r => r.distance < 30) ? 50 : 0;
    const perfectBonus = results.filter(r => r.distance <= 15).length * 30;
    
    const score = Math.max(0, Math.round(baseScore - distancePenalty + consistencyBonus + perfectBonus));

    return { avgDistance, avgAccuracy, bestDistance, success, score };
  }, [results]);

  return (
    <ChallengeBase
      title="Click Precision"
      description="Click the center of the shrinking circle"
 
 


    >
 
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '1rem',
      }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Hit the Target!
      </motion.h2>

      <p style={{
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
      }}>
        {phase === 'ready' && '🎯 Get ready...'}
        {phase === 'active' && '⚡ Click the center before it disappears!'}
        {phase === 'showing-result' && '📊 Recording result...'}
        {phase === 'complete' && '✨ Challenge complete!'}
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
              textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            }}
          >
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'complete' && phase !== 'ready' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#6366f1',
            margin: 0,
          }}
        >
          Attempt {currentAttempt}/{TOTAL_ATTEMPTS}
        </motion.p>
      )}

      {/* Game Area */}
      {phase !== 'complete' && phase !== 'ready' && (
        <motion.div
          ref={gameAreaRef}
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            aspectRatio: '1',
            maxWidth: '400px',
            background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
            borderRadius: '1rem',
            border: '3px solid #6366f1',
            position: 'relative',
            overflow: 'hidden',
            cursor: phase === 'active' ? 'crosshair' : 'default',
            touchAction: 'none',
          }}
        >
          {/* Target Circle */}
          {phase === 'active' && (
            <motion.div
              animate={{
                width: CIRCLE_SIZE * scale,
                height: CIRCLE_SIZE * scale,
              }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 0 20px #a855f7, inset 0 0 10px rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {/* Center dot */}
              <div style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: 'white',
                borderRadius: '50%',
                zIndex: 10,
              }} />
            </motion.div>
          )}

          {/* Miss Indicator */}
          <AnimatePresence>
            {missIndicator && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  left: missIndicator.x - 10,
                  top: missIndicator.y - 10,
                  width: '20px',
                  height: '20px',
                  border: '3px solid #ef4444',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Individual Result Display */}
      <AnimatePresence>
        {phase === 'showing-result' && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '1rem',
              border: '2px solid #6366f1',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500',
            }}>
              Attempt {currentAttempt} Result
            </p>
            <motion.p
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0,
                color: getQualityColor(getQuality(results[results.length - 1].distance)),
              }}
            >
              {Math.round(results[results.length - 1].distance)}px from center
            </motion.p>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
            }}>
              {getQuality(results[results.length - 1].distance) === 'excellent' && '🎯 Excellent!'}
              {getQuality(results[results.length - 1].distance) === 'good' && '👍 Good shot!'}
              {getQuality(results[results.length - 1].distance) === 'fair' && '📍 Not bad!'}
              {getQuality(results[results.length - 1].distance) === 'poor' && '🎲 Keep trying!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Results */}
      {phase === 'complete' && (
        <>
          {/* Attempts Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              width: '100%',
            }}
          >
            {results.map((result, idx) => {
              const quality = getQuality(result.distance);
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: quality === 'excellent' ? 'rgba(16, 185, 129, 0.1)' :
                               quality === 'good' ? 'rgba(59, 130, 246, 0.1)' :
                               quality === 'fair' ? 'rgba(245, 158, 11, 0.1)' :
                               'rgba(239, 68, 68, 0.1)',
                    border: `2px solid ${getQualityColor(quality)}`,
                  }}
                >
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0,
                    fontWeight: '600',
                  }}>
                    #{idx + 1}
                  </p>
                  <motion.p
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      margin: 0,
                      color: getQualityColor(quality),
                    }}
                  >
                    {Math.round(result.distance)}px
                  </motion.p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
                fontWeight: '500',
              }}>Average</p>
              <motion.p
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#6366f1',
                  margin: 0,
                }}
              >
                {Math.round(stats.avgDistance)}px
              </motion.p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
                fontWeight: '500',
              }}>Best</p>
              <motion.p
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#10b981',
                  margin: 0,
                }}
              >
                {Math.round(stats.bestDistance)}px
              </motion.p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0,
                fontWeight: '500',
              }}>Score</p>
              <motion.p
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#6366f1',
                  margin: 0,
                }}
              >
                {stats.score}
              </motion.p>
            </div>
          </motion.div>

          {/* Completion Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: `2px solid ${stats.success ? '#10b981' : '#ef4444'}`,
              background: stats.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: stats.success ? '#10b981' : '#ef4444',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>
              {stats.success ? '🎯' : '💪'}
            </span>
            <div style={{ fontSize: '1.125rem' }}>
              {stats.success
                ? 'Excellent precision!'
                : 'Keep practicing your accuracy!'}
            </div>
          </motion.div>
        </>
      )}

      {/* Help Text */}
      {phase === 'active' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            textAlign: 'center',
            margin: 0,
            fontStyle: 'italic',
            }}
            >
            💡 Tip: Aim for the white dot in the center. The circle shrinks over time!
            </motion.p>
            )}
            </div>
            </ChallengeBase>
            );
            };

            export default ClickPrecisionChallenge;