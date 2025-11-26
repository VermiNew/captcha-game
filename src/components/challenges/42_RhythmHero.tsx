import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
import { theme } from '../../styles/theme';

/**
 * Note falling from top
 */
interface Note {
  id: string;
  lane: number; // 0-3 (4 lanes)
  time: number; // when to hit (in seconds)
  y: number; // current Y position
  hit: boolean;
  missed: boolean;
}

/**
 * Beat detection result
 */
interface BeatDetection {
  time: number;
  energy: number;
  lane: number;
}

/**
 * Constants
 */
const LANES = 4;
const LANE_WIDTH = 120;
const NOTE_HEIGHT = 20;
const HIT_ZONE_Y = 500;
const HIT_TOLERANCE = 50;
const FALL_SPEED = 200;
const CANVAS_HEIGHT = 600;
const BASS_THRESHOLD = 1.3;
const MIN_BEAT_INTERVAL = 0.15;

// Single audio URL - zmień na swój
const AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/**
 * Lane colors
 */
const LANE_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];
const LANE_KEYS = ['A', 'S', 'D', 'F'];

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Loading indicator
 */
const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 300px;
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.full};
`;

/**
 * Game area
 */
const GameArea = styled.div`
  position: relative;
  width: ${LANES * LANE_WIDTH}px;
  height: ${CANVAS_HEIGHT}px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid ${theme.colors.primary};
  box-shadow: ${theme.shadows.lg};
  overflow: hidden;
`;

/**
 * Lane
 */
const Lane = styled.div<{ $index: number }>`
  position: absolute;
  left: ${props => props.$index * LANE_WIDTH}px;
  top: 0;
  width: ${LANE_WIDTH}px;
  height: 100%;
  border-right: 2px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-right: none;
  }
`;

/**
 * Hit zone indicator
 */
const HitZone = styled.div<{ $color: string; $active: boolean }>`
  position: absolute;
  left: 0;
  top: ${HIT_ZONE_Y - 30}px;
  width: 100%;
  height: 60px;
  background: ${props => props.$active ? 
    `${props.$color}40` : 
    `${props.$color}15`};
  border: 3px solid ${props => props.$color};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$color};
  font-family: ${theme.fonts.mono};
  box-shadow: ${props => props.$active ? 
    `0 0 20px ${props.$color}80` : 
    'none'};
`;

/**
 * Note element
 */
const NoteElement = styled(motion.div)<{ $color: string; $hit: boolean }>`
  position: absolute;
  left: 10px;
  width: ${LANE_WIDTH - 20}px;
  height: ${NOTE_HEIGHT}px;
  background: ${props => props.$hit ? 
    `linear-gradient(135deg, ${props.$color}80, ${props.$color})` :
    `linear-gradient(135deg, ${props.$color}, ${props.$color}CC)`};
  border: 2px solid ${props => props.$color};
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 0 15px ${props => props.$color}60;
  opacity: ${props => props.$hit ? 0 : 1};
  pointer-events: none;
`;

/**
 * Stats container
 */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: ${LANES * LANE_WIDTH}px;
`;

/**
 * Stat card
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Stat label
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
 * Stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Feedback popup
 */
const FeedbackPopup = styled(motion.div)<{ $type: 'perfect' | 'good' | 'miss' }>`
  position: absolute;
  top: ${HIT_ZONE_Y - 80}px;
  left: 50%;
  transform: translateX(-50%);
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => 
    props.$type === 'perfect' ? theme.colors.success :
    props.$type === 'good' ? theme.colors.warning :
    theme.colors.error};
  color: white;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.xl};
  pointer-events: none;
  z-index: 100;
`;

/**
 * Detect beats from audio buffer
 */
const detectBeats = async (audioBuffer: AudioBuffer): Promise<BeatDetection[]> => {
  const offlineContext = new OfflineAudioContext(
    1,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  const lowpass = offlineContext.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 150;

  source.connect(lowpass);
  lowpass.connect(offlineContext.destination);
  source.start(0);

  const renderedBuffer = await offlineContext.startRendering();
  const data = renderedBuffer.getChannelData(0);
  
  const beats: BeatDetection[] = [];
  const windowSize = Math.floor(audioBuffer.sampleRate * 0.05);
  const hopSize = Math.floor(windowSize / 2);
  
  let lastBeatTime = -MIN_BEAT_INTERVAL;

  for (let i = 0; i < data.length - windowSize; i += hopSize) {
    let energy = 0;
    for (let j = 0; j < windowSize; j++) {
      energy += data[i + j] * data[i + j];
    }
    energy = Math.sqrt(energy / windowSize);

    const time = i / audioBuffer.sampleRate;

    if (energy > BASS_THRESHOLD && time - lastBeatTime >= MIN_BEAT_INTERVAL) {
      beats.push({
        time,
        energy,
        lane: Math.floor(Math.random() * LANES),
      });
      lastBeatTime = time;
    }
  }

  return beats;
};

/**
 * Rhythm Hero Challenge Component
 */
const RhythmHeroChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const [startTime] = useState(() => Date.now());

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [beats, setBeats] = useState<BeatDetection[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState<'perfect' | 'good' | 'miss' | null>(null);

  const accuracy = useMemo(() => {
    const total = hits + misses;
    return total > 0 ? Math.round((hits / total) * 100) : 100;
  }, [hits, misses]);

  /**
   * Load and analyze audio on mount
   */
  useEffect(() => {
    const loadAudio = async () => {
      try {
        setLoadingProgress(20);
        const response = await fetch(AUDIO_URL);
        const arrayBuffer = await response.arrayBuffer();
        
        setLoadingProgress(50);
        
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        setLoadingProgress(70);
        
        const detectedBeats = await detectBeats(audioBuffer);
        setBeats(detectedBeats);
        
        setLoadingProgress(90);
        
        const audio = new Audio(AUDIO_URL);
        audioRef.current = audio;
        
        setLoadingProgress(100);
        
        setTimeout(() => {
          setIsLoading(false);
          startGame(detectedBeats, audio);
        }, 500);
        
      } catch (error) {
        console.error('Error loading audio:', error);
        alert('Failed to load audio. Please refresh the page.');
      }
    };

    loadAudio();
  }, []);

  /**
   * Start game
   */
  const startGame = useCallback((detectedBeats: BeatDetection[], audio: HTMLAudioElement) => {
    const generatedNotes: Note[] = detectedBeats.map((beat, index) => ({
      id: `note-${index}`,
      lane: beat.lane,
      time: beat.time,
      y: -NOTE_HEIGHT,
      hit: false,
      missed: false,
    }));

    setNotes(generatedNotes);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setGameStartTime(Date.now());
    setIsPlaying(true);

    audio.play();

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      const timeSpent = (Date.now() - startTime) / 1000;
      const finalScore = score + combo * 10;
      onComplete(true, timeSpent, finalScore);
    });
  }, [startTime, score, combo, onComplete]);

  /**
   * Update note positions
   */
  useEffect(() => {
    if (!isPlaying) return;

    const updateGame = () => {
      const currentTime = (Date.now() - gameStartTime) / 1000;

      setNotes(prevNotes => {
        return prevNotes.map(note => {
          if (note.hit || note.missed) return note;

          const timeUntilHit = note.time - currentTime;
          const y = HIT_ZONE_Y - (timeUntilHit * FALL_SPEED);

          if (y > HIT_ZONE_Y + HIT_TOLERANCE && !note.hit && !note.missed) {
            setMisses(prev => prev + 1);
            setCombo(0);
            setFeedback('miss');
            setTimeout(() => setFeedback(null), 500);
            return { ...note, missed: true };
          }

          return { ...note, y };
        });
      });

      animationFrameRef.current = requestAnimationFrame(updateGame);
    };

    animationFrameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameStartTime]);

  /**
   * Handle key press
   */
  const handleKeyPress = useCallback((lane: number) => {
    if (!isPlaying) return;

    setActiveKeys(prev => new Set(prev).add(lane));
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(lane);
        return next;
      });
    }, 100);

    const hittableNotes = notes.filter(note => 
      note.lane === lane && 
      !note.hit && 
      !note.missed &&
      Math.abs(note.y - HIT_ZONE_Y) <= HIT_TOLERANCE
    );

    if (hittableNotes.length === 0) return;

    const closestNote = hittableNotes.reduce((prev, curr) => 
      Math.abs(curr.y - HIT_ZONE_Y) < Math.abs(prev.y - HIT_ZONE_Y) ? curr : prev
    );

    const distance = Math.abs(closestNote.y - HIT_ZONE_Y);
    const isPerfect = distance <= 15;
    const isGood = distance <= HIT_TOLERANCE;

    if (isGood) {
      setNotes(prevNotes => 
        prevNotes.map(n => n.id === closestNote.id ? { ...n, hit: true } : n)
      );

      const points = isPerfect ? 100 : 50;
      setScore(prev => prev + points + combo * 5);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        return newCombo;
      });
      setHits(prev => prev + 1);
      setFeedback(isPerfect ? 'perfect' : 'good');
      setTimeout(() => setFeedback(null), 500);
    }
  }, [isPlaying, notes, combo]);

  /**
   * Keyboard controls
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = LANE_KEYS.indexOf(key);
      if (laneIndex !== -1) {
        e.preventDefault();
        handleKeyPress(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <ChallengeBase
        title="Rhythm Hero"
        description="Hit the notes in sync with the music!"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
        hideTimer
      >
        <Timer timeLimit={timeLimit} />
        <LoadingContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '4rem' }}
          >
            🎵
          </motion.div>
          <h3 style={{ margin: 0, color: theme.colors.primary }}>
            Analyzing beat patterns...
          </h3>
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </ProgressBar>
          <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
            {loadingProgress < 50 ? 'Loading audio...' :
             loadingProgress < 70 ? 'Decoding audio...' :
             loadingProgress < 90 ? 'Detecting beats...' :
             'Get ready!'}
          </p>
        </LoadingContainer>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Rhythm Hero"
      description="Hit the notes in sync with the music!"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      hideTimer
    >
      <Timer timeLimit={timeLimit} />
      <Container>
        <StatsContainer>
          <StatCard>
            <StatLabel>Score</StatLabel>
            <StatValue
              key={score}
              animate={{ scale: [1.2, 1] }}
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
                scale: combo > 0 ? [1.2, 1] : 1,
                color: combo >= 10 ? theme.colors.warning : theme.colors.primary
              }}
            >
              {combo}x
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Accuracy</StatLabel>
            <StatValue
              style={{ 
                color: accuracy >= 90 ? theme.colors.success : 
                       accuracy >= 70 ? theme.colors.warning : 
                       theme.colors.error 
              }}
            >
              {accuracy}%
            </StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Max Combo</StatLabel>
            <StatValue>{maxCombo}x</StatValue>
          </StatCard>
        </StatsContainer>

        <GameArea>
          {Array.from({ length: LANES }).map((_, index) => (
            <Lane key={`lane-${index}`} $index={index}>
              <HitZone 
                $color={LANE_COLORS[index]} 
                $active={activeKeys.has(index)}
              >
                {LANE_KEYS[index]}
              </HitZone>
            </Lane>
          ))}

          <AnimatePresence>
            {notes
              .filter(note => !note.hit && !note.missed && note.y >= -NOTE_HEIGHT)
              .map(note => (
                <NoteElement
                  key={note.id}
                  $color={LANE_COLORS[note.lane]}
                  $hit={note.hit}
                  style={{
                    left: note.lane * LANE_WIDTH,
                    top: note.y,
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                />
              ))}
          </AnimatePresence>

          <AnimatePresence>
            {feedback && (
              <FeedbackPopup
                $type={feedback}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {feedback === 'perfect' ? 'PERFECT!' : 
                 feedback === 'good' ? 'GOOD!' : 
                 'MISS!'}
              </FeedbackPopup>
            )}
          </AnimatePresence>
        </GameArea>

        <div style={{ 
          textAlign: 'center', 
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.mono 
        }}>
          Press {LANE_KEYS.join(' · ')} to hit notes
        </div>
      </Container>
    </ChallengeBase>
  );
};

export default RhythmHeroChallenge;