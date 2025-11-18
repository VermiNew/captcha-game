import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Note frequencies (Hz)
 */
const NOTE_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
};

/**
 * Note colors
 */
const NOTE_COLORS: Record<string, string> = {
  C: '#FF6B6B',
  D: '#4ECDC4',
  E: '#FFE66D',
  F: '#95E1D3',
  G: '#A8E6CF',
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
`;

/**
 * Styled phase display
 */
const PhaseDisplay = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textSecondary};
  text-align: center;
`;

/**
 * Styled notes container
 */
const NotesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
`;

/**
 * Styled note button
 */
const NoteButton = styled(motion.button)<{
  $note: string;
  $isActive?: boolean;
}>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid ${(props) => NOTE_COLORS[props.$note]};
  background: ${(props) =>
    props.$isActive
      ? NOTE_COLORS[props.$note]
      : 'rgba(255, 255, 255, 0.8)'};
  color: ${(props) =>
    props.$isActive
      ? 'white'
      : NOTE_COLORS[props.$note]};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$isActive
      ? `0 0 20px ${NOTE_COLORS[props.$note]}`
      : theme.shadows.md};
  font-family: ${theme.fonts.primary};

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled sequence display
 */
const SequenceDisplay = styled.div`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

/**
 * Styled sequence label
 */
const SequenceLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md} 0;
`;

/**
 * Styled sequence items
 */
const SequenceItems = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

/**
 * Styled sequence item
 */
const SequenceItem = styled.div<{ $note: string; $played?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${(props) =>
    props.$played
      ? NOTE_COLORS[props.$note]
      : 'rgba(200, 200, 200, 0.3)'};
  border: 2px solid ${(props) => NOTE_COLORS[props.$note]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) =>
    props.$played ? 'white' : theme.colors.textSecondary};
  font-family: ${theme.fonts.primary};
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $correct?: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
    props.$correct
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid
    ${(props) =>
      props.$correct ? theme.colors.success : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) =>
    props.$correct ? theme.colors.success : theme.colors.error};
`;

/**
 * Styled action buttons
 */
const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`;

/**
 * Audio context for playing notes
 */
let audioContext: AudioContext | null = null;

/**
 * Play a note using Web Audio API
 */
const playNote = (frequency: number, duration: number = 600) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration / 1000
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
};

/**
 * Music Notes Challenge Component
 * Repeat a sequence of musical notes
 */
const MusicNotesChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [sequence, setSequence] = useState<string[]>(['C', 'E', 'G', 'D']);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [phase, setPhase] = useState<'play' | 'listen' | 'repeat'>('play');
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);

  const notes = ['C', 'D', 'E', 'F', 'G'] as const;

  /**
   * Play the sequence
   */
  const playSequence = async () => {
    setPhase('play');
    setPlayingIndex(0);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          setPlayingIndex(i);
          const frequency =
            NOTE_FREQUENCIES[sequence[i]];
          playNote(frequency, 600);
          resolve(null);
        }, i * 700);
      });
    }

    setPlayingIndex(-1);
    setPhase('listen');
    setTimeout(() => {
      setPhase('repeat');
      setPlayerSequence([]);
    }, 500);
  };

  /**
   * Initialize phase
   */
  useEffect(() => {
    playSequence();
  }, []);

  /**
   * Handle note click
   */
  const handleNoteClick = (note: string) => {
    if (phase !== 'repeat' || completed) return;

    // Play note
    const frequency = NOTE_FREQUENCIES[note];
    playNote(frequency, 600);

    const newPlayerSequence = [...playerSequence, note];
    setPlayerSequence(newPlayerSequence);

    // Check if correct so far
    let correct = true;
    for (let i = 0; i < newPlayerSequence.length; i++) {
      if (newPlayerSequence[i] !== sequence[i]) {
        correct = false;
        break;
      }
    }

    if (!correct) {
      setIsCorrect(false);
      setFeedback('✗ Wrong note! Try again.');
      setPlayerSequence([]);
      return;
    }

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      setIsCorrect(true);
      setFeedback('✓ Perfect! Sequence completed!');
      setCompleted(true);
      setTimeout(() => {
        onComplete(true, 0, 200);
      }, 1000);
    }
  };

  return (
    <ChallengeBase
      title="Music Notes Challenge"
      description="Listen to the sequence and repeat it by clicking the notes"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <PhaseDisplay>
          {phase === 'play'
            ? 'Listen to the sequence...'
            : phase === 'listen'
              ? 'Get ready...'
              : 'Your turn! Repeat the sequence'}
        </PhaseDisplay>

        <SequenceDisplay>
          <SequenceLabel>Target sequence:</SequenceLabel>
          <SequenceItems>
            {sequence.map((note, idx) => (
              <SequenceItem
                key={idx}
                $note={note}
                $played={playingIndex >= idx && phase === 'play'}
              >
                {note}
              </SequenceItem>
            ))}
          </SequenceItems>
        </SequenceDisplay>

        <SequenceDisplay>
          <SequenceLabel>Your sequence:</SequenceLabel>
          <SequenceItems>
            {playerSequence.length === 0 ? (
              <p style={{ color: theme.colors.textTertiary }}>
                No notes yet...
              </p>
            ) : (
              playerSequence.map((note, idx) => (
                <SequenceItem
                  key={idx}
                  $note={note}
                  $played={true}
                >
                  {note}
                </SequenceItem>
              ))
            )}
          </SequenceItems>
        </SequenceDisplay>

        <NotesContainer>
          {notes.map((note) => (
            <NoteButton
              key={note}
              $note={note}
              $isActive={
                playingIndex !== -1 &&
                sequence[playingIndex] === note &&
                phase === 'play'
              }
              onClick={() => handleNoteClick(note)}
              disabled={
                phase !== 'repeat' || completed
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {note}
            </NoteButton>
          ))}
        </NotesContainer>

        {feedback && (
          <Feedback
            $correct={isCorrect}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {feedback}
          </Feedback>
        )}

        {phase === 'listen' && (
          <ActionButtons>
            <Button
              onClick={playSequence}
              disabled={false}
              size="md"
              variant="secondary"
            >
              Replay Sequence
            </Button>
          </ActionButtons>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default MusicNotesChallenge;
