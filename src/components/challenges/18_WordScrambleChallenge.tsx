import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Word list (5-7 letters)
 */
const WORDS = [
  'PLANET',
  'FUTURE',
  'GARDEN',
  'BRIDGE',
  'SUMMER',
  'PUZZLE',
  'CASTLE',
  'WINDOW',
  'FLOWER',
  'MOUNTAIN',
  'JOURNEY',
  'LIBRARY',
  'SHELTER',
  'CRYSTAL',
  'BALANCE',
  'CHAPTER',
  'WEATHER',
  'PATTERN',
  'KITCHEN',
  'ARTICLE',
];

/**
 * Shuffle array
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
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
 * Styled word display
 */
const WordDisplay = styled(motion.div)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  letter-spacing: 2px;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Styled scrambled tiles container
 */
const ScrambledContainer = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  min-height: 120px;
  align-content: flex-start;
`;

/**
 * Styled drop zone
 */
const DropZone = styled.div<{ $isCorrect: boolean }>`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  padding: ${theme.spacing.lg};
  background: ${(props) =>
    props.$isCorrect ? 'rgba(16, 185, 129, 0.1)' : theme.colors.background};
  border: 3px dashed
    ${(props) => (props.$isCorrect ? theme.colors.success : theme.colors.primary)};
  border-radius: ${theme.borderRadius.lg};
  min-height: 120px;
  transition: all 0.3s ease;
`;

/**
 * Styled draggable tile
 */
const DraggableTile = styled(motion.div)<{ $isDragging: boolean }>`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  border-radius: ${theme.borderRadius.md};
  cursor: ${(props) => (props.$isDragging ? 'grabbing' : 'grab')};
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  touch-action: none;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transform: ${(props) =>
    props.$isDragging ? 'scale(1.1) rotate(5deg)' : 'scale(1)'};
  transition: all 0.2s ease;
`;

/**
 * Styled letter item
 */
const LetterItem = styled(motion.div)`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  background: linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.info} 100%);
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

/**
 * Styled divider
 */
const Divider = styled.div`
  width: 100%;
  height: 2px;
  background: ${theme.colors.border};
  margin: ${theme.spacing.lg} 0;
`;

/**
 * Styled check button
 */
const CheckButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.secondary};
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid
    ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.semibold};
  width: 100%;
`;

/**
 * Styled emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes.xl};
  line-height: 1;
`;

/**
 * Draggable Tile Component
 */
interface DraggableTileProps {
  id: string;
  letter: string;
}

const SortableDraggableTile: React.FC<DraggableTileProps> = ({ id, letter }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DraggableTile
        $isDragging={isDragging}
        layout
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
      >
        {letter}
      </DraggableTile>
    </div>
  );
};

/**
 * Word Scramble Challenge Component
 * User must arrange scrambled letters to form a word
 */
const WordScrambleChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [targetWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [scrambledLetters] = useState<string[]>(() =>
    shuffleArray(targetWord.split(''))
  );
  const [arrangedLetters, setArrangedLetters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const remainingLetters = useMemo(
    () => scrambledLetters.filter((letter, idx) => !arrangedLetters.includes(`${idx}`)),
    [scrambledLetters, arrangedLetters]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Moving within drop zone
    if (over.id === 'dropzone' && active.data.current?.sortable.index !== undefined) {
      const fromIndex = active.data.current.sortable.index;
      const toIndex = arrangedLetters.length;

      if (fromIndex >= 0 && fromIndex < scrambledLetters.length) {
        const letterToMove = `${fromIndex}`;
        if (!arrangedLetters.includes(letterToMove)) {
          setArrangedLetters([...arrangedLetters, letterToMove]);
        }
      }
    }

    // Removing from drop zone
    if (over.id === 'scrambled' && active.id !== over.id) {
      const letterToRemove = arrangedLetters[arrangedLetters.length - 1];
      setArrangedLetters(arrangedLetters.filter((_, idx) => idx !== arrangedLetters.length - 1));
    }
  };

  /**
   * Handle drop on zone
   */
  const handleDropOnZone = (letterId: string) => {
    if (!arrangedLetters.includes(letterId)) {
      setArrangedLetters([...arrangedLetters, letterId]);
    }
  };

  /**
   * Check answer
   */
  const handleCheck = () => {
    const arrangedWord = arrangedLetters
      .map((idx) => scrambledLetters[parseInt(idx)])
      .join('');

    const isCorrect = arrangedWord === targetWord;

    if (isCorrect) {
      setFeedback('success');
      setCompleted(true);

      const timeSpent = (Date.now() - startTime) / 1000;
      const speedBonus = Math.max(0, 50 - Math.floor(timeSpent / 2));
      const score = 150 + speedBonus;

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 2000);
    } else {
      setFeedback('error');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  /**
   * Handle letter click (remove from arranged)
   */
  const handleRemoveLetter = (index: number) => {
    setArrangedLetters(arrangedLetters.filter((_, idx) => idx !== index));
  };

  const arrangedWord = arrangedLetters
    .map((idx) => scrambledLetters[parseInt(idx)])
    .join('');
  const isReady = arrangedLetters.length === targetWord.length;

  return (
    <ChallengeBase
      title="Word Scramble Challenge"
      description="Arrange the scrambled letters to form the correct word"
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
          Unscramble the Word!
        </Title>

        <Instruction>
          Drag letters from below to arrange them in the correct order
        </Instruction>

        <WordDisplay
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {targetWord}
        </WordDisplay>

        <Divider />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <DropZone
            $isCorrect={feedback === 'success'}
            onClick={(e) => {
              if ((e.target as HTMLElement).id === 'drop-letter') {
                const letterId = (e.target as HTMLElement).dataset.id;
                if (letterId) {
                  handleRemoveLetter(parseInt(letterId));
                }
              }
            }}
          >
            <SortableContext
              items={arrangedLetters}
              strategy={horizontalListSortingStrategy}
              id="dropzone"
            >
              <AnimatePresence mode="popLayout">
                {arrangedLetters.map((letterId, idx) => (
                  <motion.div
                    key={letterId}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleRemoveLetter(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <LetterItem>
                      {scrambledLetters[parseInt(letterId)]}
                    </LetterItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DropZone>

          <ScrambledContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <SortableContext
              items={remainingLetters}
              strategy={horizontalListSortingStrategy}
              id="scrambled"
            >
              <AnimatePresence>
                {remainingLetters.map((letterId) => (
                  <SortableDraggableTile
                    key={letterId}
                    id={letterId}
                    letter={scrambledLetters[parseInt(letterId)]}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </ScrambledContainer>
        </DndContext>

        <CheckButton
          onClick={handleCheck}
          disabled={!isReady || completed}
          whileHover={isReady && !completed ? { scale: 1.05 } : {}}
          whileTap={isReady && !completed ? { scale: 0.95 } : {}}
        >
          {isReady ? '✓ Check Answer' : `${arrangedLetters.length}/${targetWord.length}`}
        </CheckButton>

        <AnimatePresence>
          {feedback && (
            <FeedbackMessage
              $success={feedback === 'success'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Emoji>{feedback === 'success' ? '✓' : '✗'}</Emoji>
              <span>
                {feedback === 'success'
                  ? `Correct! The word is "${targetWord}"`
                  : `Incorrect. Try again!`}
              </span>
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default WordScrambleChallenge;
