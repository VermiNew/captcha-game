import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Sentences for drag and drop challenge
 */
const sentences = [
  'The cat sleeps on chair',
  'I love to eat pizza',
  'Birds fly high in sky',
  'Water flows down the river',
  'She plays piano very well',
];

/**
 * Word item interface
 */
interface WordItem {
  id: string;
  word: string;
}

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
 * Styled target sentence display
 */
const TargetSentence = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.primary};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Styled words container
 */
const WordsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Styled word card for sortable items
 */
const WordCard = styled(motion.div)<{ $isDragging: boolean; $isCorrect: boolean | null }>`
  background: ${theme.colors.background};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.medium};
  text-align: center;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.sm};
  user-select: none;
  touch-action: none;

  ${(props) =>
    props.$isDragging &&
    `
    opacity: 0.5;
    cursor: grabbing;
  `}

  ${(props) =>
    props.$isCorrect === true &&
    `
    border-color: ${theme.colors.success};
    background: rgba(34, 197, 94, 0.1);
    color: ${theme.colors.success};
  `}

  ${(props) =>
    props.$isCorrect === false &&
    `
    border-color: ${theme.colors.error};
    background: rgba(239, 68, 68, 0.1);
    animation: shake 0.4s ease-in-out;
  `}

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
`;

/**
 * Styled check button
 */
const CheckButton = styled(motion.button)<{ $isCorrect: boolean | null }>`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => {
    if (props.$isCorrect === true) return theme.colors.success;
    if (props.$isCorrect === false) return theme.colors.error;
    return theme.colors.primary;
  }};
  color: white;
  box-shadow: ${theme.shadows.md};

  &:hover:not(:disabled) {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

/**
 * Sortable word component
 */
const SortableWord: React.FC<{
  id: string;
  word: string;
  isCorrect: boolean | null;
}> = ({ id, word, isCorrect }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <WordCard
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      $isCorrect={isCorrect}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      {...attributes}
      {...listeners}
    >
      {word}
    </WordCard>
  );
};

/**
 * Drag & Drop Sentence Challenge Component
 * User must arrange words in correct order
 */
const DragDropSentenceChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [targetSentence] = useState(() =>
    sentences[Math.floor(Math.random() * sentences.length)],
  );

  const targetWords = targetSentence.split(' ');

  const [words, setWords] = useState<WordItem[]>(() => {
    // Shuffle words
    const shuffled = [...targetWords]
      .map((word) => ({ id: Math.random().toString(36).substring(7), word }))
      .sort(() => Math.random() - 0.5);
    return shuffled;
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (_event: DragStartEvent) => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (over && active.id !== over.id) {
      setWords((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCheck = () => {
    setIsChecking(true);
    const userSentence = words.map((w) => w.word).join(' ');
    const correct = userSentence === targetSentence;
    setIsCorrect(correct);

    if (correct) {
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = Math.max(100, 150 - Math.floor(timeSpent));

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsChecking(false);
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <ChallengeBase
      title="Drag & Drop Sentence Challenge"
      description="Arrange the words in the correct order"
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
          Build the Sentence
        </Title>

        <Instruction>Drag the words to build this sentence:</Instruction>

        <TargetSentence
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {targetSentence}
        </TargetSentence>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={words.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <WordsContainer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <AnimatePresence mode="popLayout">
                {words.map((word) => (
                  <SortableWord
                    key={word.id}
                    id={word.id}
                    word={word.word}
                    isCorrect={isCorrect}
                  />
                ))}
              </AnimatePresence>
            </WordsContainer>
          </SortableContext>
        </DndContext>

        <CheckButton
          onClick={handleCheck}
          disabled={isChecking || isDragging}
          $isCorrect={isCorrect}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {isChecking
            ? isCorrect
              ? '✓ Correct!'
              : '✗ Try Again!'
            : 'Check Answer'}
        </CheckButton>
      </Container>
    </ChallengeBase>
  );
};

export default DragDropSentenceChallenge;
