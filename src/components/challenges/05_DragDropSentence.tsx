import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverEvent,
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
import { sentenceDataset } from '../../utils/sentenceDataset';

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
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
`;

/**
 * Styled target sentence
 */
const TargetSentence = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.primary};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(99, 102, 241, 0.3);
  text-align: center;
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.6;
  word-break: break-word;
`;

/**
 * Styled words container with scroll
 */
const WordsContainerScroll = styled.div`
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid rgba(99, 102, 241, 0.2);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(99, 102, 241, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 10px;

    &:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  }
`;

/**
 * Styled words container
 */
const WordsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

/**
 * Styled word card
 */
const WordCard = styled(motion.div)<{
  $isDragging: boolean;
  $isCorrect: boolean | null;
  $isOver: boolean;
}>`
  background: ${theme.colors.background};
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  font-weight: ${theme.fontWeights.medium};
  text-align: center;
  cursor: grab;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  user-select: none;
  touch-action: none;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-word;

  ${(props) =>
    props.$isDragging &&
    `
    opacity: 1;
    cursor: grabbing;
    transform: scale(1.05) rotateZ(1deg);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    border-color: #6366f1;
    background: #6366f1;
    color: white;
    z-index: 50;
  `}

  ${(props) =>
    props.$isCorrect === true &&
    `
    border-color: ${theme.colors.success};
    background: rgba(16, 185, 129, 0.1);
    color: ${theme.colors.success};
  `}

  ${(props) =>
    props.$isCorrect === false &&
    `
    border-color: ${theme.colors.error};
    background: rgba(239, 68, 68, 0.1);
    animation: shake 0.4s ease-in-out;
  `}

  ${(props) =>
    props.$isOver &&
    `
    border: 2px dashed #6366f1;
    background: rgba(99, 102, 241, 0.2);
  `}

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
`;

/**
 * Styled check button
 */
const CheckButton = styled(motion.button)<{ $isCorrect: boolean | null }>`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 280px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

/**
 * Styled progress info
 */
const ProgressInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};

  span {
    font-family: ${theme.fonts.mono};
    color: ${theme.colors.primary};
    font-weight: ${theme.fontWeights.semibold};
  }
`;

/**
 * Sortable word component
 */
const SortableWord: React.FC<{
  id: string;
  word: string;
  isCorrect: boolean | null;
  isOver: boolean;
}> = ({ id, word, isCorrect, isOver }) => {
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
      $isOver={isOver}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      {...attributes}
      {...listeners}
    >
      {word}
    </WordCard>
  );
};

/**
 * Drag & Drop Sentence Challenge Component
 */
const DragDropSentenceChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [targetSentence] = useState(() =>
    sentenceDataset[Math.floor(Math.random() * sentenceDataset.length)],
  );

  const targetWords = targetSentence.split(' ').filter((word) => word.trim() !== '');

  const [words, setWords] = useState<WordItem[]>(() => {
    const shuffled = [...targetWords]
      .map((word) => ({ id: Math.random().toString(36).substring(7), word }))
      .sort(() => Math.random() - 0.5);
    return shuffled;
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(() => Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setOverId(null);

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
    const userSentence = words
      .map((w) => w.word)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const targetForComparison = targetSentence.replace(/\s+/g, ' ').trim();
    const correct = userSentence === targetForComparison;
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
      title="Drag & Drop Sentence"
      description="Arrange the words in the correct order"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <TargetSentence
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {targetSentence}
        </TargetSentence>

        <ProgressInfo>
          <div>
            Words: <span>{words.length}</span>
          </div>
        </ProgressInfo>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={words.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <WordsContainerScroll>
              <WordsContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  {words.map((word) => (
                    <SortableWord
                      key={word.id}
                      id={word.id}
                      word={word.word}
                      isCorrect={isCorrect}
                      isOver={overId === word.id}
                    />
                  ))}
                </AnimatePresence>
              </WordsContainer>
            </WordsContainerScroll>
          </SortableContext>
        </DndContext>

        <CheckButton
          onClick={handleCheck}
          disabled={isChecking || isDragging}
          $isCorrect={isCorrect}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
