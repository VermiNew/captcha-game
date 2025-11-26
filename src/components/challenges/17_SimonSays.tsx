import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Game phase type
 */
type GamePhase = 'ready' | 'playing' | 'showing' | 'waiting' | 'complete';

/**
 * Button colors for Simon game
 */
const SIMON_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];
const SIMON_LABELS = ['Red', 'Cyan', 'Yellow', 'Green'];

/**
 * Challenge props interface
 */
interface ChallengeProps {
  onComplete: (success: boolean, timeSpent: number, score: number) => void;
  timeLimit?: number;
  challengeId: string;
}

/**
 * Simon Says Challenge
 * Memorize and repeat the color sequence
 */
const SimonSaysChallenge: React.FC<ChallengeProps> = ({
  onComplete,
}) => {
  const ROUNDS_TO_WIN = 8;
  const SHOW_DURATION = 500; // ms per button flash
  const BUTTON_DELAY = 400; // ms between button flashes
  const ROUND_DELAY = 800; // ms before starting new round

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [wrongButton, setWrongButton] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentRound, setCurrentRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buttonFlashRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isShowingSequenceRef = useRef(false);

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
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      if (buttonFlashRef.current) clearTimeout(buttonFlashRef.current);
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
    };
  }, [startCountdown]);

  /**
   * Play button flash animation
   */
  const playButtonFlash = useCallback((buttonIndex: number): Promise<void> => {
    return new Promise<void>((resolve) => {
      setActiveButton(buttonIndex);

      buttonFlashRef.current = setTimeout(() => {
        setActiveButton(null);
        resolve();
      }, SHOW_DURATION);
    });
  }, []);

  /**
   * Show the entire sequence
   */
  const showSequence = useCallback(async (seq: number[]) => {
    if (isShowingSequenceRef.current) return;
    
    isShowingSequenceRef.current = true;
    setPhase('showing');
    setPlayerSequence([]);
    setWrongButton(null);

    // Wait before starting
    await new Promise((resolve) => {
      sequenceTimeoutRef.current = setTimeout(resolve, 500);
    });

    // Flash each button in sequence
    for (const buttonIndex of seq) {
      await playButtonFlash(buttonIndex);
      await new Promise((resolve) => {
        sequenceTimeoutRef.current = setTimeout(resolve, BUTTON_DELAY);
      });
    }

    isShowingSequenceRef.current = false;
    setPhase('waiting');
  }, [playButtonFlash]);

  /**
   * Start new round
   */
  useEffect(() => {
    if (phase !== 'playing' || gameOver || completed) return;

    setSequence((prevSeq) => {
      const newSequence = [...prevSeq, Math.floor(Math.random() * 4)];
      setCurrentRound(newSequence.length);

      sequenceTimeoutRef.current = setTimeout(() => {
        showSequence(newSequence);
      }, ROUND_DELAY);

      return newSequence;
    });

    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [phase, gameOver, completed, showSequence]);

  /**
   * Handle button click
   */
  const handleButtonClick = useCallback(async (buttonIndex: number) => {
    if (phase !== 'waiting' || gameOver || completed || isShowingSequenceRef.current) return;

    const newPlayerSequence = [...playerSequence, buttonIndex];
    setPlayerSequence(newPlayerSequence);

    // Flash the button
    await playButtonFlash(buttonIndex);

    // Check if correct
    const expectedButton = sequence[newPlayerSequence.length - 1];
    if (expectedButton !== buttonIndex) {
      // Wrong button!
      setWrongButton(buttonIndex);
      setGameOver(true);
      setPhase('complete');

      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      const roundScore = (currentRound - 1) * 30; // Score for completed rounds
      
      completionTimeoutRef.current = setTimeout(() => {
        onComplete(false, timeSpent, roundScore);
      }, 2000);
      return;
    }

    // Check if player completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      if (sequence.length === ROUNDS_TO_WIN) {
        // Victory!
        setCompleted(true);
        setPhase('complete');

        const timeSpent = (Date.now() - startTimeRef.current) / 1000;
        const baseScore = 250;
        const speedBonus = Math.max(0, Math.round(100 - (timeSpent / 5)));
        const perfectBonus = 50; // Bonus for completing all rounds
        const score = baseScore + speedBonus + perfectBonus;

        completionTimeoutRef.current = setTimeout(() => {
          onComplete(true, timeSpent, score);
        }, 2500);
      } else {
        // Next round - small delay before showing next sequence
        sequenceTimeoutRef.current = setTimeout(() => {
          setPhase('playing');
        }, 800);
      }
    }
  }, [phase, gameOver, completed, playerSequence, sequence, currentRound, playButtonFlash, onComplete]);

  /**
   * Get instruction text
   */
  const getInstruction = () => {
    if (phase === 'ready') return '🎮 Get ready to memorize...';
    if (phase === 'showing') return '👀 Watch the sequence carefully...';
    if (phase === 'waiting') return `🎯 Repeat ${currentRound} button${currentRound > 1 ? 's' : ''}`;
    if (phase === 'complete') return completed ? '🎉 Challenge complete!' : '💔 Game over!';
    return '⏳ Next round starting...';
  };

  return (
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
        Simon Says
      </motion.h2>

      <p style={{
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        margin: 0,
        minHeight: '1.5rem',
      }}>
        {getInstruction()}
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

      {/* Info Section */}
      {phase !== 'ready' && (
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          width: '100%',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.5rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            border: '2px solid #e5e7eb',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500',
            }}>Round</p>
            <motion.p
              key={currentRound}
              initial={{ scale: 1.2 }}
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
              {currentRound}/{ROUNDS_TO_WIN}
            </motion.p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.5rem',
            background: '#f9fafb',
            borderRadius: '0.75rem',
            border: '2px solid #e5e7eb',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500',
            }}>Progress</p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: playerSequence.length === currentRound && currentRound > 0 ? '#10b981' : '#6366f1',
              margin: 0,
            }}>
              {playerSequence.length}/{currentRound}
            </p>
          </div>
        </div>
      )}

      {/* Simon Grid */}
      {phase !== 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '380px',
            aspectRatio: '1',
          }}
        >
          {SIMON_COLORS.map((color, idx) => {
            const isActive = activeButton === idx;
            const isWrong = wrongButton === idx;
            const isDisabled = phase !== 'waiting' || gameOver || isShowingSequenceRef.current;

            return (
              <motion.button
                key={idx}
                onClick={() => handleButtonClick(idx)}
                disabled={isDisabled}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 0.95 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: idx * 0.1,
                }}
                whileHover={!isDisabled ? { opacity: 0.85, scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                style={{
                  border: 'none',
                  borderRadius: '1rem',
                  background: color,
                  cursor: isDisabled ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 0,
                  boxShadow: isActive 
                    ? 'inset 0 0 40px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 0, 0, 0.3)'
                    : isWrong
                      ? 'inset 0 0 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.8)'
                      : 'inset 0 0 20px rgba(0, 0, 0, 0.2)',
                  animation: isWrong ? 'shake 0.4s ease-out' : 'none',
                }}
                aria-label={`${SIMON_LABELS[idx]} button`}
              />
            );
          })}
        </motion.div>
      )}

      {/* Feedback Message */}
      <AnimatePresence>
        {(gameOver || completed) && (
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
              borderRadius: '0.75rem',
              border: `2px solid ${completed ? '#10b981' : '#ef4444'}`,
              background: completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: completed ? '#10b981' : '#ef4444',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>
              {completed ? '🎉' : '💔'}
            </span>
            <span style={{ fontSize: '1.125rem' }}>
              {completed
                ? `Perfect memory! All ${ROUNDS_TO_WIN} rounds completed!`
                : `Nice try! You completed ${currentRound - 1} round${currentRound - 1 !== 1 ? 's' : ''}.`}
            </span>
            {completed && (
              <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                +50 perfect completion bonus!
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      {phase === 'waiting' && !gameOver && !completed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            textAlign: 'center',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          💡 Tip: Focus on the sequence and take your time clicking!
        </motion.p>
      )}

      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default SimonSaysChallenge;