import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';
import logger from '../../utils/logger';

/**
 * Game phase type
 */
type GamePhase = 'waiting' | 'countdown' | 'playing' | 'complete';

/**
 * Timing feedback type
 */
type TimingFeedback = 'perfect' | 'good' | 'okay' | 'miss' | null;

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
  min-height: 450px;
`;

/**
 * Styled instruction
 */
const Instruction = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Countdown display
 */
const CountdownDisplay = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
`;

/**
 * Beat indicator container
 */
const BeatIndicatorContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  margin-bottom: ${theme.spacing.lg};
`;

/**
 * Individual beat indicator
 */
const BeatIndicator = styled(motion.div)<{ $status: 'pending' | 'hit' | 'miss' }>`
  width: 16px;
  height: 16px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${(props) => {
    if (props.$status === 'hit') return theme.colors.success;
    if (props.$status === 'miss') return theme.colors.error;
    return theme.colors.border;
  }};
  background: ${(props) => {
    if (props.$status === 'hit') return theme.colors.success;
    if (props.$status === 'miss') return theme.colors.error;
    return 'transparent';
  }};
  box-shadow: ${(props) => {
    if (props.$status === 'hit') return `0 0 10px ${theme.colors.success}`;
    if (props.$status === 'miss') return `0 0 10px ${theme.colors.error}`;
    return 'none';
  }};
`;

/**
 * Styled rhythm button
 */
const RhythmButton = styled(motion.button)<{ $isActive: boolean }>`
  width: 180px;
  height: 180px;
  border-radius: ${theme.borderRadius.full};
  border: 4px solid ${(props) => props.$isActive ? theme.colors.secondary : theme.colors.primary};
  background: ${(props) => (props.$isActive ? theme.colors.primary : theme.colors.background)};
  color: ${(props) => (props.$isActive ? 'white' : theme.colors.primary)};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  box-shadow: ${(props) =>
    props.$isActive 
      ? `0 0 40px ${theme.colors.primary}, 0 8px 24px rgba(99, 102, 241, 0.4)` 
      : `0 4px 12px rgba(0, 0, 0, 0.1)`};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, 
      ${(props) => props.$isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'} 0%, 
      transparent 70%);
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Timing feedback overlay
 */
const TimingFeedbackOverlay = styled(motion.div)<{ $type: TimingFeedback }>`
  position: absolute;
  top: -60px;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => {
    if (props.$type === 'perfect') return theme.colors.success;
    if (props.$type === 'good') return '#10B981';
    if (props.$type === 'okay') return theme.colors.warning;
    return theme.colors.error;
  }};
  text-shadow: 0 0 10px currentColor;
  pointer-events: none;
`;

/**
 * Combo counter
 */
const ComboCounter = styled(motion.div)`
  position: absolute;
  top: -100px;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.warning};
  text-shadow: 0 0 15px ${theme.colors.warning};
  pointer-events: none;
`;

/**
 * Styled stats
 */
const Stats = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 500px;
`;

/**
 * Styled stat box
 */
const StatBox = styled.div<{ $highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.lg};
  background: ${(props) => 
    props.$highlight 
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
      : theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => props.$highlight ? theme.colors.success : theme.colors.border};
  transition: all 0.3s ease;
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
const StatValue = styled.p<{ $color?: string }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) => props.$color || theme.colors.primary};
  margin: 0;
`;

/**
 * Styled result message
 */
const ResultMessage = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${(props) =>
    props.$success 
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))'};
  border: 3px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  grid-column: 1 / -1;
  box-shadow: ${(props) =>
    props.$success 
      ? '0 4px 16px rgba(16, 185, 129, 0.3)' 
      : '0 4px 16px rgba(239, 68, 68, 0.3)'};
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  max-width: 500px;
  height: 8px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  border: 2px solid ${theme.colors.border};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.full};
`;

/**
 * Play beep sound with different tones
 */
function playBeep(frequency: number = 800, duration: number = 100, volume: number = 0.2) {
  try {
    const audioContext = new (window.AudioContext || (window as Record<string, unknown>).webkitAudioContext)() as AudioContext;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    osc.start(now);
    osc.stop(now + duration / 1000);
  } catch {
    logger.debug('Audio context not available');
  }
}

/**
 * Enhanced Rhythm Challenge Component
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
  const [beatResults, setBeatResults] = useState<('hit' | 'miss')[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<TimingFeedback>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timingScores, setTimingScores] = useState<number[]>([]);

  const sequenceStartRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const activeWindowRef = useRef<{ start: number; end: number } | null>(null);
  const beatCountRef = useRef(0);
  const clickedThisBeatRef = useRef(false);

  const TOTAL_BEATS = 10;
  const BEAT_INTERVAL = 750;
  const ACTIVE_DURATION = 250;
  const PERFECT_WINDOW = 50;
  const GOOD_WINDOW = 100;
  const OKAY_WINDOW = 150;

  /**
   * Calculate timing feedback
   */
  const getTimingFeedback = useCallback((timingOffset: number): { feedback: TimingFeedback; score: number } => {
    const absOffset = Math.abs(timingOffset);
    
    if (absOffset <= PERFECT_WINDOW) {
      return { feedback: 'perfect', score: 100 };
    } else if (absOffset <= GOOD_WINDOW) {
      return { feedback: 'good', score: 80 };
    } else if (absOffset <= OKAY_WINDOW) {
      return { feedback: 'okay', score: 60 };
    }
    
    return { feedback: 'miss', score: 0 };
  }, []);

  /**
   * Start countdown
   */
  const startCountdown = useCallback(() => {
    setPhase('countdown');
    let count = 3;
    
    const countdownInterval = setInterval(() => {
      if (count > 0) {
        playBeep(600 + (count * 100), 150, 0.3);
        count--;
      } else {
        clearInterval(countdownInterval);
        playBeep(1000, 200, 0.3);
        startGame();
      }
    }, 1000);
  }, []);

  /**
   * Start the game
   */
  const startGame = useCallback(() => {
    setPhase('playing');
    setHits(0);
    setMisses(0);
    setBeatResults([]);
    setCombo(0);
    setMaxCombo(0);
    setTimingScores([]);
    beatCountRef.current = 0;
    sequenceStartRef.current = Date.now();

    playNextBeat();
  }, []);

  /**
   * Play next beat
   */
  const playNextBeat = useCallback(() => {
    if (beatCountRef.current >= TOTAL_BEATS) {
      timerRef.current = setTimeout(() => {
        setPhase('complete');
      }, 500);
      return;
    }

    clickedThisBeatRef.current = false;
    const activateTime = Date.now();
    const windowStart = activateTime;
    const windowEnd = activateTime + ACTIVE_DURATION + OKAY_WINDOW;

    activeWindowRef.current = { start: windowStart, end: windowEnd };
    setIsButtonActive(true);
    playBeep(650, 120, 0.25);
    beatCountRef.current++;
    setTotalBeats(beatCountRef.current);

    timerRef.current = setTimeout(() => {
      setIsButtonActive(false);
      
      if (!clickedThisBeatRef.current && activeWindowRef.current) {
        setMisses((prev) => prev + 1);
        setBeatResults((prev) => [...prev, 'miss']);
        setCombo(0);
        setCurrentFeedback('miss');
        setTimingScores((prev) => [...prev, 0]);
        playBeep(300, 150, 0.2);
        
        setTimeout(() => setCurrentFeedback(null), 800);
      }
      
      timerRef.current = setTimeout(playNextBeat, BEAT_INTERVAL - ACTIVE_DURATION);
    }, ACTIVE_DURATION);
  }, []);

  /**
   * Handle button click
   */
  const handleClick = useCallback(() => {
    if (phase !== 'playing' || !activeWindowRef.current || clickedThisBeatRef.current) return;

    clickedThisBeatRef.current = true;
    const clickTime = Date.now();
    const { start } = activeWindowRef.current;
    const idealClickTime = start + (ACTIVE_DURATION / 2);
    const timingOffset = clickTime - idealClickTime;

    const { feedback, score } = getTimingFeedback(timingOffset);

    if (feedback !== 'miss') {
      setHits((prev) => prev + 1);
      setBeatResults((prev) => [...prev, 'hit']);
      setTimingScores((prev) => [...prev, score]);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
      
      const freqMap = { perfect: 1400, good: 1200, okay: 1000 };
      playBeep(freqMap[feedback as keyof typeof freqMap] || 1200, 100, 0.3);
    } else {
      setMisses((prev) => prev + 1);
      setBeatResults((prev) => [...prev, 'miss']);
      setTimingScores((prev) => [...prev, 0]);
      setCombo(0);
      playBeep(300, 150, 0.2);
    }

    setCurrentFeedback(feedback);
    setTimeout(() => setCurrentFeedback(null), 600);

    activeWindowRef.current = null;
  }, [phase, getTimingFeedback]);

  /**
   * Handle spacebar
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'waiting') {
          startCountdown();
        } else if (phase === 'playing') {
          handleClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, handleClick, startCountdown]);

  /**
   * Calculate final statistics
   */
  const stats = useMemo(() => {
    const accuracy = totalBeats > 0 ? Math.round((hits / totalBeats) * 100) : 0;
    const avgTiming = timingScores.length > 0 
      ? Math.round(timingScores.reduce((a, b) => a + b, 0) / timingScores.length) 
      : 0;
    const baseScore = hits * 50;
    const comboBonus = maxCombo >= 5 ? maxCombo * 20 : 0;
    const perfectBonus = avgTiming >= 95 ? 100 : avgTiming >= 80 ? 50 : 0;
    const totalScore = baseScore + comboBonus + perfectBonus;
    const success = hits >= 7;

    return { accuracy, avgTiming, totalScore, success, comboBonus, perfectBonus };
  }, [hits, totalBeats, timingScores, maxCombo]);

  /**
   * Complete the challenge
   */
  useEffect(() => {
    if (phase === 'complete') {
      timerRef.current = setTimeout(() => {
        onComplete(stats.success, 0, stats.totalScore);
      }, 2500);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, stats, onComplete]);

  /**
   * Progress percentage
   */
  const progress = (totalBeats / TOTAL_BEATS) * 100;

  return (
    <ChallengeBase
      title="Rhythm Challenge"
      description="Click the button in perfect rhythm"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <AnimatePresence mode="wait">
          <Instruction
            key={phase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {phase === 'waiting' && 'Press SPACE or click START to begin'}
            {phase === 'countdown' && 'Get ready...'}
            {phase === 'playing' && 'Click when the button glows!'}
            {phase === 'complete' && 'Challenge Complete!'}
          </Instruction>
        </AnimatePresence>

        {phase === 'playing' && (
          <BeatIndicatorContainer>
            {Array.from({ length: TOTAL_BEATS }).map((_, idx) => (
              <BeatIndicator
                key={idx}
                $status={
                  idx < beatResults.length 
                    ? beatResults[idx] 
                    : idx === totalBeats - 1 && isButtonActive
                    ? 'pending'
                    : 'pending'
                }
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              />
            ))}
          </BeatIndicatorContainer>
        )}

        {phase === 'playing' && (
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </ProgressBar>
        )}

        <div style={{ position: 'relative' }}>
          {combo >= 3 && phase === 'playing' && (
            <ComboCounter
              key={combo}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              🔥 {combo}x COMBO!
            </ComboCounter>
          )}

          <AnimatePresence>
            {currentFeedback && phase === 'playing' && (
              <TimingFeedbackOverlay
                $type={currentFeedback}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {currentFeedback === 'perfect' && '★ PERFECT!'}
                {currentFeedback === 'good' && '✓ GOOD!'}
                {currentFeedback === 'okay' && '○ OKAY'}
                {currentFeedback === 'miss' && '✗ MISS'}
              </TimingFeedbackOverlay>
            )}
          </AnimatePresence>

          <RhythmButton
            $isActive={isButtonActive}
            onClick={phase === 'waiting' ? startCountdown : handleClick}
            disabled={phase === 'countdown' || phase === 'complete'}
            animate={
              isButtonActive
                ? {
                    scale: 1.15,
                    boxShadow: `0 0 50px ${theme.colors.primary}, 0 10px 30px rgba(99, 102, 241, 0.5)`,
                  }
                : {
                    scale: 1,
                  }
            }
            transition={{ duration: 0.15, type: 'spring', stiffness: 300 }}
            whileHover={phase === 'waiting' ? { scale: 1.05 } : {}}
            whileTap={phase !== 'countdown' ? { scale: 0.95 } : {}}
            aria-label={phase === 'waiting' ? 'Start game' : 'Click in rhythm'}
          >
            {phase === 'waiting' && 'START'}
            {phase === 'countdown' && '●'}
            {phase === 'playing' && '●'}
            {phase === 'complete' && '✓'}
          </RhythmButton>
        </div>

        {phase === 'complete' && (
          <Stats
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatBox $highlight={hits === TOTAL_BEATS}>
              <StatLabel>Hits</StatLabel>
              <StatValue $color={hits === TOTAL_BEATS ? theme.colors.success : undefined}>
                {hits}/{TOTAL_BEATS}
              </StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Accuracy</StatLabel>
              <StatValue>{stats.accuracy}%</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Max Combo</StatLabel>
              <StatValue $color={maxCombo >= 5 ? theme.colors.warning : undefined}>
                {maxCombo}x
              </StatValue>
            </StatBox>

            <ResultMessage
              $success={stats.success}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {hits === TOTAL_BEATS
                ? '🎯 FLAWLESS! Perfect rhythm!'
                : stats.success
                ? `🎵 Great job! ${hits}/${TOTAL_BEATS} hits`
                : '📝 Keep practicing your timing!'}
              <div style={{ fontSize: theme.fontSizes.base, marginTop: theme.spacing.sm, opacity: 0.9 }}>
                Score: {stats.totalScore} points
                {stats.comboBonus > 0 && ` (+${stats.comboBonus} combo bonus)`}
                {stats.perfectBonus > 0 && ` (+${stats.perfectBonus} timing bonus)`}
              </div>
            </ResultMessage>
          </Stats>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default RhythmChallenge;
