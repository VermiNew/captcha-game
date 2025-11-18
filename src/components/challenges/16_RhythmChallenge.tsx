import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game phase type
 */
type GamePhase = 'waiting' | 'playing' | 'complete';

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  justify-content: center;
  min-height: 400px;
`;

/**
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled rhythm button
 */
const RhythmButton = styled(motion.button)<{ $isActive: boolean }>`
  width: 160px;
  height: 160px;
  border-radius: ${theme.borderRadius.full};
  border: 3px solid ${theme.colors.primary};
  background: ${(props) => (props.$isActive ? theme.colors.primary : 'white')};
  color: ${(props) => (props.$isActive ? 'white' : theme.colors.primary)};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  box-shadow: ${(props) =>
    props.$isActive ? `0 0 30px ${theme.colors.primary}` : 'none'};

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled stats
 */
const Stats = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 400px;
`;

/**
 * Styled stat box
 */
const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
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
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled result message
 */
const ResultMessage = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.base};
  grid-column: 1 / -1;
`;

/**
 * Play beep sound
 */
function playBeep(frequency: number = 800, duration: number = 100) {
  try {
    const audioContext = new (window.AudioContext || (window as Record<string, unknown>).webkitAudioContext)() as AudioContext;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    osc.start(now);
    osc.stop(now + duration / 1000);
  } catch {
    console.debug('Audio context not available');
  }
}

/**
 * Rhythm Challenge Component
 * Click the button when it pulses in rhythm
 */
const RhythmChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalBeats, setTotalBeats] = useState(0);

  const sequenceStartRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const activeWindowRef = useRef<{ start: number; end: number } | null>(null);
  const beatCountRef = useRef(0);

  const BEAT_INTERVAL = 800; // ms between beats
  const ACTIVE_DURATION = 300; // ms button stays active
  const TOLERANCE = 150; // ms tolerance for clicking

  /**
   * Start the game
   */
  const startGame = () => {
    setPhase('playing');
    setHits(0);
    setMisses(0);
    beatCountRef.current = 0;
    sequenceStartRef.current = Date.now();

    playNextBeat();
  };

  /**
   * Play next beat
   */
  const playNextBeat = () => {
    if (beatCountRef.current >= 8) {
      // Game complete
      timerRef.current = setTimeout(() => {
        setPhase('complete');
      }, 500);
      return;
    }

    const beatIdx = beatCountRef.current;
    const activateTime = Date.now();
    const windowStart = activateTime;
    const windowEnd = activateTime + ACTIVE_DURATION + TOLERANCE;

    activeWindowRef.current = { start: windowStart, end: windowEnd };
    setIsButtonActive(true);
    playBeep(600, 150);
    beatCountRef.current++;
    setTotalBeats(beatCountRef.current);

    timerRef.current = setTimeout(() => {
      setIsButtonActive(false);
      // If not clicked in time, it's a miss
      if (activeWindowRef.current && Date.now() > activeWindowRef.current.end) {
        setMisses((prev) => prev + 1);
      }
      // Schedule next beat
      timerRef.current = setTimeout(playNextBeat, BEAT_INTERVAL - ACTIVE_DURATION);
    }, ACTIVE_DURATION);
  };

  /**
   * Handle button click
   */
  const handleClick = () => {
    if (phase !== 'playing' || !activeWindowRef.current) return;

    const clickTime = Date.now();
    const { start, end } = activeWindowRef.current;

    if (clickTime >= start && clickTime <= end) {
      setHits((prev) => prev + 1);
      playBeep(1200, 100);
    } else {
      setMisses((prev) => prev + 1);
      playBeep(300, 100);
    }

    // Disable further clicks for this beat
    activeWindowRef.current = null;
  };

  /**
   * Handle spacebar
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'waiting') {
          startGame();
        } else if (phase === 'playing') {
          handleClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase]);

  /**
   * Calculate score
   */
  const success = hits >= 6;
  const score = hits * 60;
  const accuracy = totalBeats > 0 ? Math.round((hits / totalBeats) * 100) : 0;

  /**
   * Complete the challenge
   */
  useEffect(() => {
    if (phase === 'complete') {
      timerRef.current = setTimeout(() => {
        onComplete(success, 0, score);
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, success, score, onComplete]);

  return (
    <ChallengeBase
      title="Rhythm Challenge"
      description="Click the button when it pulses"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instruction>
          {phase === 'waiting'
            ? 'Click the button in rhythm with the beat'
            : phase === 'playing'
              ? 'Click when it glows!'
              : 'Complete!'}
        </Instruction>

        <RhythmButton
          $isActive={isButtonActive}
          onClick={handleClick}
          disabled={phase !== 'playing'}
          animate={
            isButtonActive
              ? {
                  scale: 1.1,
                  boxShadow: `0 0 40px ${theme.colors.primary}`,
                }
              : {
                  scale: 1,
                  boxShadow: 'none',
                }
          }
          transition={{ duration: 0.1 }}
        >
          {phase === 'waiting' ? 'START' : phase === 'playing' ? '●' : '✓'}
        </RhythmButton>

        {phase === 'complete' && (
          <Stats
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatBox>
              <StatLabel>Hits</StatLabel>
              <StatValue>{hits}/8</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Accuracy</StatLabel>
              <StatValue>{accuracy}%</StatValue>
            </StatBox>

            <ResultMessage
              $success={success}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {success
                ? hits === 8
                  ? 'Perfect! Flawless rhythm!'
                  : 'Great! You got it!'
                : 'Keep practicing!'}
            </ResultMessage>
          </Stats>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default RhythmChallenge;
