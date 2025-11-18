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
`;

/**
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  height: 24px;
`;

/**
 * Styled beats grid
 */
const BeatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  margin: ${theme.spacing.xl} 0;
`;

/**
 * Styled beat tile
 */
const BeatTile = styled(motion.div)<{ $active: boolean; $hit?: boolean | null }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    if (props.$hit === true) return theme.colors.success;
    if (props.$hit === false) return theme.colors.error;
    return props.$active ? theme.colors.primary : theme.colors.surface;
  }};
  border: 2px solid ${(props) => {
    if (props.$hit === true) return theme.colors.success;
    if (props.$hit === false) return theme.colors.error;
    return props.$active ? theme.colors.primary : theme.colors.border;
  }};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.xl};
  color: ${(props) => (props.$active || props.$hit ? 'white' : theme.colors.textSecondary)};
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

/**
 * Styled tap button
 */
const TapButton = styled(motion.button)`
  width: 140px;
  height: 140px;
  border-radius: ${theme.borderRadius.full};
  border: 3px solid ${theme.colors.primary};
  background: white;
  color: ${theme.colors.primary};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 0 20px ${theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 0 30px ${theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

/**
 * Styled progress fill
 */
const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
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
 * Player must follow a rhythm pattern by tapping beats
 */
const RhythmChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [gameStarted, setGameStarted] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [taps, setTaps] = useState<{ beat: number; correct: boolean }[]>([]);

  const sequenceStartRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const BEAT_INTERVAL = 600; // ms between beats
  const TOLERANCE = 150; // ms tolerance for hitting beat

  /**
   * Start the game and play sequence
   */
  const startGame = () => {
    setGameStarted(true);
    setPhase('playing');
    setUserTaps([]);
    setTaps([]);

    // Generate random sequence
    const beatSequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
    setSequence(beatSequence);

    // Play sequence
    sequenceStartRef.current = Date.now();
    let beatIdx = 0;

    const playNextBeat = () => {
      if (beatIdx >= 5) {
        // Sequence complete, wait for user input
        setTimeout(() => {
          setPhase('playing');
          setCurrentBeat(-1);
        }, 500);
        return;
      }

      setCurrentBeat(beatIdx);
      playBeep(400 + beatIdx * 100, 100);

      timerRef.current = setTimeout(() => {
        setCurrentBeat(-1);
        beatIdx++;
        timerRef.current = setTimeout(playNextBeat, BEAT_INTERVAL);
      }, 100);
    };

    playNextBeat();
  };

  /**
   * Handle beat tap/click
   */
  const handleTap = (beatIdx: number) => {
    if (phase !== 'playing' || taps.length >= 5) return;

    const tapTime = Date.now() - sequenceStartRef.current;
    const expectedTime = beatIdx * BEAT_INTERVAL + 500; // 500ms delay before sequence starts
    const timeDiff = Math.abs(tapTime - expectedTime);
    const isCorrect = timeDiff <= TOLERANCE;

    const newTaps = [...taps, { beat: beatIdx, correct: isCorrect }];
    setTaps(newTaps);
    setUserTaps([...userTaps, beatIdx]);

    playBeep(isCorrect ? 1000 : 300, 80);

    // Check if game complete
    if (newTaps.length === 5) {
      timerRef.current = setTimeout(() => {
        setPhase('complete');
      }, 800);
    }
  };

  /**
   * Handle spacebar
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'waiting' && !gameStarted) {
          startGame();
        } else if (phase === 'playing' && userTaps.length < 5) {
          handleTap(userTaps.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, gameStarted, userTaps, taps]);

  /**
   * Calculate score
   */
  const hits = taps.filter((t) => t.correct).length;
  const success = hits >= 4;
  const score = hits * 50;

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
      description="Follow the rhythm and tap each beat in sync"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instruction>
          {phase === 'waiting'
            ? 'Watch the rhythm, then tap each beat'
            : phase === 'playing'
              ? 'Tap the beats in order!'
              : 'Complete!'}
        </Instruction>

        <BeatsGrid>
          {[0, 1, 2, 3, 4].map((idx) => {
            const hit = taps[idx];
            return (
              <BeatTile
                key={idx}
                $active={currentBeat === idx}
                $hit={hit ? hit.correct : null}
                onClick={() => handleTap(idx)}
                animate={
                  currentBeat === idx
                    ? { scale: 1.15, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }
                    : { scale: 1, boxShadow: 'none' }
                }
                transition={{ duration: 0.1 }}
              >
                {idx + 1}
              </BeatTile>
            );
          })}
        </BeatsGrid>

        {phase === 'waiting' && !gameStarted && (
          <TapButton
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>START</span>
            <span style={{ fontSize: theme.fontSizes.sm, fontWeight: 'normal' }}>
              or SPACE
            </span>
          </TapButton>
        )}

        {phase === 'playing' && gameStarted && (
          <>
            <ProgressBar>
              <ProgressFill
                animate={{ width: `${(taps.length / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </ProgressBar>
            <Instruction>{taps.length}/5 taps</Instruction>
          </>
        )}

        {phase === 'complete' && (
          <Stats
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatBox>
              <StatLabel>Accuracy</StatLabel>
              <StatValue>{hits}/5</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Score</StatLabel>
              <StatValue>{score}</StatValue>
            </StatBox>

            <ResultMessage
              $success={success}
              style={{ gridColumn: '1 / -1' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {success ? (hits === 5 ? 'Perfect! Flawless rhythm!' : 'Great! You got it!') : 'Keep practicing!'}
            </ResultMessage>
          </Stats>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default RhythmChallenge;
