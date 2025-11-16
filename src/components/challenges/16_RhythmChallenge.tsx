import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game phase type
 */
type GamePhase = 'playing-sequence' | 'waiting-input' | 'complete';

/**
 * Feedback type
 */
type HitFeedback = 'hit' | 'miss';

/**
 * Audio context for beep sounds
 */
let audioContext: AudioContext | null = null;

/**
 * Play beep sound
 */
const playBeep = (frequency: number = 800, duration: number = 100) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

  osc.start(now);
  osc.stop(now + duration / 1000);
};

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * Styled title
 */
const Title = styled(motion.h2)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin: 0;
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
`;

/**
 * Styled beats container
 */
const BeatsContainer = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  align-items: center;
  height: 160px;
  width: 100%;
  margin: ${theme.spacing.lg} 0;
`;

/**
 * Styled beat circle
 */
const BeatCircle = styled(motion.div)<{ $index: number }>`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.full};
  background: ${(props) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.success,
      theme.colors.info,
    ];
    return colors[props.$index % 5];
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
`;

/**
 * Styled input section
 */
const InputSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled spacebar hint
 */
const SpacebarHint = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-align: center;
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
 * Styled feedback grid
 */
const FeedbackGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled feedback item
 */
const FeedbackItem = styled(motion.div)<{ $hit: HitFeedback | null }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) =>
    props.$hit === 'hit'
      ? 'rgba(16, 185, 129, 0.1)'
      : props.$hit === 'miss'
        ? 'rgba(239, 68, 68, 0.1)'
        : theme.colors.surface};
  border: 2px solid
    ${(props) =>
      props.$hit === 'hit'
        ? theme.colors.success
        : props.$hit === 'miss'
          ? theme.colors.error
          : theme.colors.border};
`;

/**
 * Styled feedback icon
 */
const FeedbackIcon = styled.span`
  font-size: ${theme.fontSizes.xl};
  line-height: 1;
`;

/**
 * Styled feedback label
 */
const FeedbackLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled stats
 */
const Stats = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  width: 100%;
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
  font-weight: ${theme.fontWeights.medium};
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
 * Styled completion message
 */
const CompletionMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Styled emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Rhythm Challenge Component
 * User must follow a rhythm by tapping to the beat
 */
const RhythmChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [phase, setPhase] = useState<GamePhase>('playing-sequence');
  const [beatIndex, setBeatIndex] = useState(-1);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<(HitFeedback | null)[]>([null, null, null, null, null]);
  const [startTime] = useState(Date.now());

  const beatTimingsRef = useRef<number[]>([]);
  const sequenceStartRef = useRef<number>(0);
  const phaseTimeoutRef = useRef<NodeJS.Timeout>();

  const BEAT_DURATION = 400; // ms
  const BEAT_INTERVAL = 600; // 400ms pulse + 200ms gap
  const TOLERANCE = 150; // ±150ms tolerance

  /**
   * Play visual sequence
   */
  useEffect(() => {
    if (phase !== 'playing-sequence') return;

    const playSequence = async () => {
      await new Promise((resolve) => {
        phaseTimeoutRef.current = setTimeout(resolve, 500);
      });

      sequenceStartRef.current = Date.now();
      const timings: number[] = [];

      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => {
          phaseTimeoutRef.current = setTimeout(() => {
            setBeatIndex(i);
            timings.push(Date.now() - sequenceStartRef.current);
            playBeep(400 + i * 100, BEAT_DURATION);

            phaseTimeoutRef.current = setTimeout(() => {
              setBeatIndex(-1);
              resolve(null);
            }, BEAT_DURATION);
          }, i * BEAT_INTERVAL);
        });
      }

      beatTimingsRef.current = timings;
      setPhase('waiting-input');
    };

    playSequence();

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, [phase]);

  /**
   * Handle tap/spacebar
   */
  const handleTap = () => {
    if (phase !== 'waiting-input' || userTaps.length >= 5) return;

    const tapTime = Date.now() - sequenceStartRef.current;
    const newTaps = [...userTaps, tapTime];
    setUserTaps(newTaps);

    const expectedTime = beatTimingsRef.current[newTaps.length - 1];
    const timeDiff = Math.abs(tapTime - expectedTime);
    const isHit = timeDiff <= TOLERANCE;

    const newFeedback = [...feedback];
    newFeedback[newTaps.length - 1] = isHit ? 'hit' : 'miss';
    setFeedback(newFeedback);

    playBeep(isHit ? 1000 : 300, 100);

    // Check if complete
    if (newTaps.length === 5) {
      phaseTimeoutRef.current = setTimeout(() => {
        setPhase('complete');
      }, 1000);
    }
  };

  /**
   * Handle spacebar press
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, userTaps]);

  // Calculate statistics
  const hits = feedback.filter((f) => f === 'hit').length;
  const success = hits >= 4;
  const isPerfect = hits === 5;
  const score = hits * 20 + (isPerfect ? 50 : 0);

  return (
    <ChallengeBase
      title="Rhythm Challenge"
      description="Follow the rhythm and tap in sync with the beats"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Feel the Beat!
        </Title>

        <Instruction>
          {phase === 'playing-sequence'
            ? 'Watch the rhythm pattern...'
            : phase === 'waiting-input'
              ? 'Tap the beat in sync! Use spacebar or click the button.'
              : 'Great performance!'}
        </Instruction>

        {phase === 'playing-sequence' && (
          <BeatsContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {[0, 1, 2, 3, 4].map((idx) => (
              <BeatCircle
                key={idx}
                $index={idx}
                animate={
                  beatIndex === idx
                    ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          '0 4px 12px rgba(0, 0, 0, 0.15)',
                          '0 0 30px currentColor',
                          '0 4px 12px rgba(0, 0, 0, 0.15)',
                        ],
                      }
                    : { scale: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }
                }
                transition={{ duration: BEAT_DURATION / 1000 }}
                initial={{ scale: 0, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {idx + 1}
              </BeatCircle>
            ))}
          </BeatsContainer>
        )}

        {phase === 'waiting-input' && (
          <InputSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TapButton onClick={handleTap} disabled={userTaps.length >= 5}>
              <span>TAP</span>
              <span style={{ fontSize: theme.fontSizes.sm, fontWeight: 'normal' }}>
                or SPACE
              </span>
            </TapButton>
            <SpacebarHint>
              Progress: {userTaps.length}/5 taps • Hits: {userTaps.filter((_, idx) => feedback[idx] === 'hit').length}/5
            </SpacebarHint>
          </InputSection>
        )}

        {phase === 'waiting-input' && userTaps.length > 0 && (
          <FeedbackGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {feedback.map((fb, idx) => (
              <FeedbackItem
                key={idx}
                $hit={fb}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <FeedbackIcon>
                  {fb === 'hit' ? '✓' : fb === 'miss' ? '✗' : '◯'}
                </FeedbackIcon>
                <FeedbackLabel>Beat {idx + 1}</FeedbackLabel>
              </FeedbackItem>
            ))}
          </FeedbackGrid>
        )}

        {phase === 'complete' && (
          <>
            <FeedbackGrid
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {feedback.map((fb, idx) => (
                <FeedbackItem
                  key={idx}
                  $hit={fb}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <FeedbackIcon>
                    {fb === 'hit' ? '✓' : fb === 'miss' ? '✗' : '◯'}
                  </FeedbackIcon>
                  <FeedbackLabel>Beat {idx + 1}</FeedbackLabel>
                </FeedbackItem>
              ))}
            </FeedbackGrid>

            <Stats
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatItem>
                <StatLabel>Accuracy</StatLabel>
                <StatValue>{hits}/5</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Score</StatLabel>
                <StatValue>{score}</StatValue>
              </StatItem>
            </Stats>

            <CompletionMessage
              $success={success}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <Emoji>{success ? (isPerfect ? '🎵' : '🎉') : '😢'}</Emoji>
              <div>
                {success
                  ? isPerfect
                    ? 'Perfect! Flawless rhythm!'
                    : 'Great! You got the beat!'
                  : 'Keep practicing your rhythm!'}
              </div>
            </CompletionMessage>
          </>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default RhythmChallenge;
