import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Block colors - vibrant gradient palette
 */
const BLOCK_COLORS = [
  '#667EEA', '#764BA2', '#F093FB', '#F5576C',
  '#4FACFE', '#00F2FE', '#FFD1FF', '#FFA8E1',
];

/**
 * Game constants
 */
const BLOCK_WIDTH = 80;
const BLOCK_HEIGHT = 40;
const CONTAINER_WIDTH = 320;
const CONTAINER_HEIGHT = 500;
const TARGET_BLOCKS = 8;
const MIN_OVERLAP_PERCENTAGE = 30;
const BASE_SCORE_PER_BLOCK = 30;
const PRECISION_BONUS = 10;
const MOVE_SPEED = 2.5; // pixels per frame

/**
 * Challenge props interface
 */
interface ChallengeProps {
  onComplete: (success: boolean, timeSpent: number, score: number) => void;
  timeLimit?: number;
  challengeId: string;
}

/**
 * Interface for a block in the tower
 */
interface TowerBlock {
  id: number;
  x: number;
  y: number;
  color: string;
  overlapPercentage: number;
}

/**
 * Tower Builder Challenge Component
 */
const TowerBuilderChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit = 120,
  challengeId,
}) => {
  const [blocks, setBlocks] = useState<TowerBlock[]>([]);
  const [currentBlockId, setCurrentBlockId] = useState(0);
  const [currentBlockX, setCurrentBlockX] = useState(CONTAINER_WIDTH / 2 - BLOCK_WIDTH / 2);
  const [isMovingLeft, setIsMovingLeft] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lastOverlapPercentage, setLastOverlapPercentage] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const blockMovementRef = useRef<number | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const directionRef = useRef<number>(isMovingLeft ? -1 : 1);

  /**
   * Calculate block Y position based on tower height
   */
  const getBlockYPosition = useCallback(() => {
    if (blocks.length === 0) {
      return CONTAINER_HEIGHT - BLOCK_HEIGHT - 10;
    }
    const topBlock = blocks[blocks.length - 1];
    return topBlock.y - BLOCK_HEIGHT - 2;
  }, [blocks]);

  /**
   * Calculate overlap percentage between current block and top block
   */
  const calculateOverlapPercentage = useCallback((): number => {
    if (blocks.length === 0) {
      return 100; // Perfect placement on base
    }

    const topBlock = blocks[blocks.length - 1];
    const topBlockLeft = topBlock.x;
    const topBlockRight = topBlock.x + BLOCK_WIDTH;
    const currentBlockLeft = currentBlockX;
    const currentBlockRight = currentBlockX + BLOCK_WIDTH;

    const overlapLeft = Math.max(topBlockLeft, currentBlockLeft);
    const overlapRight = Math.min(topBlockRight, currentBlockRight);
    const overlapWidth = Math.max(0, overlapRight - overlapLeft);

    const overlapPercentage = (overlapWidth / BLOCK_WIDTH) * 100;
    return Math.round(overlapPercentage);
  }, [blocks, currentBlockX]);

  /**
   * Show message with auto-hide
   */
  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info', duration: number = 1500) => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    
    setMessage({ text, type });
    messageTimerRef.current = setTimeout(() => {
      setMessage(null);
    }, duration);
  }, []);

  /**
   * Handle block placement
   */
  const handleBlockClick = useCallback(() => {
    if (gameOver || blocks.length >= TARGET_BLOCKS) {
      return;
    }

    // Hide instructions after first click
    if (showInstructions) {
      setShowInstructions(false);
    }

    // Start timer on first block
    if (blocks.length === 0) {
      startTimeRef.current = Date.now();
    }

    const overlapPercentage = calculateOverlapPercentage();
    setLastOverlapPercentage(overlapPercentage);

    // Check if placement is valid
    if (overlapPercentage < MIN_OVERLAP_PERCENTAGE) {
      showMessage(
        `❌ Block fell! Only ${overlapPercentage}% overlap. Need ${MIN_OVERLAP_PERCENTAGE}%+`,
        'error',
        2000
      );
      setGameOver(true);
      
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      setTimeout(() => {
        onComplete(false, timeSpent, score);
      }, 2000);
      return;
    }

    // Add block to tower
    const newBlock: TowerBlock = {
      id: currentBlockId,
      x: currentBlockX,
      y: getBlockYPosition(),
      color: BLOCK_COLORS[currentBlockId % BLOCK_COLORS.length],
      overlapPercentage,
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);

    // Calculate score with bonuses
    const blockScore = BASE_SCORE_PER_BLOCK;
    const bonusScore =
      overlapPercentage === 100
        ? PRECISION_BONUS
        : overlapPercentage >= 90
          ? Math.floor(PRECISION_BONUS * 0.8)
          : overlapPercentage >= 80
            ? Math.floor(PRECISION_BONUS * 0.6)
            : 0;
    const newScore = score + blockScore + bonusScore;
    setScore(newScore);

    // Show success message
    const precisionText =
      overlapPercentage === 100
        ? '🎯 Perfect! +40 pts'
        : overlapPercentage >= 90
          ? `✨ Excellent! ${overlapPercentage}% +38 pts`
          : overlapPercentage >= 80
            ? `👍 Great! ${overlapPercentage}% +36 pts`
            : `✓ Good! ${overlapPercentage}% +30 pts`;

    showMessage(precisionText, 'success');

    // Check if tower is complete
    if (newBlocks.length >= TARGET_BLOCKS) {
      setGameOver(true);
      const completionBonus = 50;
      const finalScore = newScore + completionBonus;
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      
      setTimeout(() => {
        onComplete(true, timeSpent, finalScore);
      }, 2000);
      return;
    }

    // Prepare next block
    setCurrentBlockId(currentBlockId + 1);
    setCurrentBlockX(CONTAINER_WIDTH / 2 - BLOCK_WIDTH / 2);
    setIsMovingLeft(true);
    directionRef.current = -1;
  }, [gameOver, blocks, currentBlockX, currentBlockId, score, calculateOverlapPercentage, getBlockYPosition, showInstructions, showMessage, onComplete]);

  /**
   * Animate block movement
   */
  useEffect(() => {
    if (gameOver || blocks.length >= TARGET_BLOCKS) {
      if (blockMovementRef.current) {
        cancelAnimationFrame(blockMovementRef.current);
        blockMovementRef.current = null;
      }
      return;
    }

    let currentX = currentBlockX;

    const moveBlock = () => {
      currentX += directionRef.current * MOVE_SPEED;

      // Bounce at edges
      if (currentX <= 0) {
        currentX = 0;
        directionRef.current = 1;
        setIsMovingLeft(false);
      } else if (currentX + BLOCK_WIDTH >= CONTAINER_WIDTH) {
        currentX = CONTAINER_WIDTH - BLOCK_WIDTH;
        directionRef.current = -1;
        setIsMovingLeft(true);
      }

      setCurrentBlockX(currentX);
      blockMovementRef.current = requestAnimationFrame(moveBlock);
    };

    blockMovementRef.current = requestAnimationFrame(moveBlock);

    return () => {
      if (blockMovementRef.current) {
        cancelAnimationFrame(blockMovementRef.current);
        blockMovementRef.current = null;
      }
    };
  }, [gameOver, blocks.length, currentBlockX]);

  /**
   * Handle keyboard input
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameOver && blocks.length < TARGET_BLOCKS) {
        e.preventDefault();
        handleBlockClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBlockClick, gameOver, blocks.length]);

  /**
   * Cleanup timers
   */
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (blockMovementRef.current) cancelAnimationFrame(blockMovementRef.current);
    };
  }, []);

  /**
   * Calculate tower height
   */
  const towerHeight = useMemo(() => {
    if (blocks.length === 0) return 0;
    const topBlock = blocks[blocks.length - 1];
    return Math.round((CONTAINER_HEIGHT - topBlock.y) / 10);
  }, [blocks]);

  /**
   * Get message color
   */
  const getMessageColor = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1rem',
    }}>
      {/* Game Area */}
      <div
        onClick={handleBlockClick}
        style={{
          position: 'relative',
          width: `${CONTAINER_WIDTH}px`,
          height: `${CONTAINER_HEIGHT}px`,
          background: 'linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%)',
          border: '3px solid #6366f1',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
          cursor: !gameOver && blocks.length < TARGET_BLOCKS ? 'pointer' : 'default',
        }}
      >
        {/* Stacked blocks */}
        <AnimatePresence>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              style={{
                position: 'absolute',
                left: block.x,
                bottom: CONTAINER_HEIGHT - block.y,
                width: BLOCK_WIDTH,
                height: BLOCK_HEIGHT,
                background: block.color,
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                userSelect: 'none',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Current moving block */}
        {!gameOver && blocks.length < TARGET_BLOCKS && (
          <motion.div
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              left: currentBlockX,
              top: 20,
              width: BLOCK_WIDTH,
              height: BLOCK_HEIGHT,
              background: BLOCK_COLORS[currentBlockId % BLOCK_COLORS.length],
              borderRadius: '0.5rem',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          />
        )}

        {/* Base platform */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '10px',
          background: '#6b7280',
          borderTop: '2px solid #1f2937',
        }} />

        {/* Instructions overlay */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                pointerEvents: 'none',
                maxWidth: '80%',
              }}
            >
              Click or press SPACE to drop block
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        width: '100%',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '1rem',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase',
          }}>Blocks</p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#6366f1',
            margin: 0,
          }}>{blocks.length}/{TARGET_BLOCKS}</p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase',
          }}>Height</p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#6366f1',
            margin: 0,
          }}>{towerHeight}px</p>
        </div>

        {lastOverlapPercentage > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0,
              textTransform: 'uppercase',
            }}>Overlap</p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: lastOverlapPercentage >= 90 ? '#10b981' : 
                     lastOverlapPercentage >= 80 ? '#f59e0b' : '#6366f1',
              margin: 0,
            }}>{lastOverlapPercentage}%</p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase',
          }}>Score</p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#6366f1',
            margin: 0,
          }}>{score}</p>
        </div>
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            style={{
              padding: '1rem 1.5rem',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                         message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                         'rgba(59, 130, 246, 0.1)',
              border: `2px solid ${getMessageColor(message.type)}`,
              borderRadius: '0.75rem',
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: '600',
              color: getMessageColor(message.type),
              width: '100%',
            }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Message */}
      {gameOver && blocks.length >= TARGET_BLOCKS && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            padding: '1.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid #10b981',
            borderRadius: '0.75rem',
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: '#10b981',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
          Perfect tower! {blocks.length} blocks stacked!
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>
            +50 completion bonus
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      {!gameOver && blocks.length < TARGET_BLOCKS && !showInstructions && (
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
          💡 Tip: Aim for 80%+ overlap for bonus points. Perfect = 100%!
        </motion.p>
      )}
    </div>
  );
};

export default TowerBuilderChallenge;