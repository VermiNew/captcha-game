import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type GameState = 'countdown' | 'showing' | 'waiting' | 'result' | 'complete';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];
const LABELS = ['Red', 'Cyan', 'Yellow', 'Green'];
const ROUNDS_TO_WIN = 8;

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

const GridContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 380px;
  aspect-ratio: 1;
`;

const Button = styled(motion.button)<{ $color: string; $active: boolean }>`
  border: none;
  border-radius: 1rem;
  background: ${props => props.$active ? `brightness(1.4) ${props.$color}` : props.$color};
  filter: ${props => props.$active ? 'brightness(1.4) saturate(1.3)' : 'brightness(1) saturate(1)'};
  cursor: pointer;
  padding: 0;
  opacity: ${props => props.$active ? 1 : 0.8};
  box-shadow: ${props => props.$active 
    ? `0 0 50px ${props.$color}80, inset 0 0 40px rgba(255, 255, 255, 0.6), 0 0 30px ${props.$color}40`
    : `0 0 15px ${props.$color}30, inset 0 0 20px rgba(0, 0, 0, 0.2)`};
  transition: all 0.15s ease;
  transform: ${props => props.$active ? 'scale(0.98)' : 'scale(1)'};

  &:disabled {
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
    filter: brightness(1.15) saturate(1.1);
    box-shadow: 0 0 25px ${props => props.$color}50, inset 0 0 25px rgba(0, 0, 0, 0.15);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
`;

const SimonSaysChallenge: React.FC<ChallengeProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<GameState>('countdown');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Start countdown
  useEffect(() => {
    if (gameState !== 'countdown') return;

    let count = 3;
    startTimeRef.current = Date.now();
    
    const tick = () => {
      if (count <= 0) {
        setGameState('showing');
        nextRound([]);
        return;
      }
      setCountdown(count);
      count--;
      timeoutRef.current = setTimeout(tick, 1000);
    };

    tick();
  }, [gameState]);

  // Flash button
  const flashButton = useCallback((index: number): Promise<void> => {
    return new Promise(resolve => {
      setActiveButton(index);
      timeoutRef.current = setTimeout(() => {
        setActiveButton(null);
        timeoutRef.current = setTimeout(resolve, 400);
      }, 800);
    });
  }, []);

  // Show sequence
  const showSequence = useCallback(async (seq: number[]) => {
    setGameState('showing');
    setUserSequence([]);
    
    // Wait before showing
    await new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, 1000);
    });

    // Flash each button
    for (const buttonIdx of seq) {
      await flashButton(buttonIdx);
    }

    setGameState('waiting');
  }, [flashButton]);

  // Next round
  const nextRound = useCallback((newSeq: number[]) => {
    const updatedSeq = [...newSeq, Math.floor(Math.random() * 4)];
    setSequence(updatedSeq);
    setRound(updatedSeq.length);
    
    timeoutRef.current = setTimeout(() => {
      showSequence(updatedSeq);
    }, 1000);
  }, [showSequence]);

  // Handle button click
  const handleButtonClick = useCallback((index: number) => {
    if (gameState !== 'waiting' || error) return;

    const newUserSeq = [...userSequence, index];
    setUserSequence(newUserSeq);
    
    flashButton(index);

    // Check if correct
    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
      // Wrong
      setError(true);
      setGameState('result');
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      const score = Math.max(0, (round - 1) * 30);
      
      timeoutRef.current = setTimeout(() => {
        onComplete(false, timeSpent, score);
      }, 2000);
      return;
    }

    // Check if completed round
    if (newUserSeq.length === sequence.length) {
      if (sequence.length === ROUNDS_TO_WIN) {
        // Won!
        setGameState('complete');
        const timeSpent = (Date.now() - startTimeRef.current) / 1000;
        const score = 250 + Math.max(0, Math.round(100 - timeSpent / 5)) + 50;
        
        timeoutRef.current = setTimeout(() => {
          onComplete(true, timeSpent, score);
        }, 2500);
        return;
      }

      // Next round
      setGameState('showing');
      timeoutRef.current = setTimeout(() => {
        nextRound(sequence);
      }, 1500);
    }
  }, [gameState, userSequence, sequence, round, error, flashButton, nextRound, onComplete]);

  const getStatus = () => {
    if (gameState === 'countdown') return '🎮 Get ready...';
    if (gameState === 'showing') return '👀 Watch...';
    if (gameState === 'waiting') return `🎯 Your turn (${userSequence.length}/${round})`;
    if (gameState === 'result') return '💔 Wrong!';
    if (gameState === 'complete') return '🎉 Perfect!';
    return '';
  };

  return (
    <ChallengeBase
      title="Simon Says"
      description="Memorize and repeat the color sequence"
    >
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
          {getStatus()}
        </p>

        {/* Countdown */}
        <AnimatePresence>
          {gameState === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: '#6366f1',
                textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              }}
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {gameState !== 'countdown' && (
          <StatsContainer>
            <StatBox>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Round</p>
              <p style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#6366f1',
                margin: 0,
              }}>
                {round}/{ROUNDS_TO_WIN}
              </p>
            </StatBox>
            <StatBox>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Progress</p>
              <p style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: userSequence.length === round && round > 0 ? '#10b981' : '#6366f1',
                margin: 0,
              }}>
                {userSequence.length}/{round}
              </p>
            </StatBox>
          </StatsContainer>
        )}

        {/* Buttons */}
        {gameState !== 'countdown' && gameState !== 'complete' && (
          <GridContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {COLORS.map((color, idx) => (
              <Button
                key={idx}
                $color={color}
                $active={activeButton === idx}
                onClick={() => handleButtonClick(idx)}
                disabled={gameState !== 'waiting' || error}
                whileHover={gameState === 'waiting' && !error ? { opacity: 0.85 } : {}}
                whileTap={gameState === 'waiting' && !error ? { scale: 0.95 } : {}}
                aria-label={LABELS[idx]}
              />
            ))}
          </GridContainer>
        )}

        {/* Result */}
        <AnimatePresence>
          {(gameState === 'result' || gameState === 'complete') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: `2px solid ${gameState === 'complete' ? '#10b981' : '#ef4444'}`,
                background: gameState === 'complete' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: gameState === 'complete' ? '#10b981' : '#ef4444',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
                {gameState === 'complete' ? '🎉' : '💔'}
              </div>
              <div>
                {gameState === 'complete'
                  ? `Perfect memory! All ${ROUNDS_TO_WIN} rounds completed!`
                  : `Nice try! You completed ${round - 1} round${round !== 2 ? 's' : ''}.`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default SimonSaysChallenge;
