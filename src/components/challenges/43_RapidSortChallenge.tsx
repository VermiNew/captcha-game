import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Sorting rule type
 */
type SortRule = 'ascending' | 'descending' | 'even-odd' | 'divisible-3';

/**
 * Number with UI state
 */
interface NumberItem {
  value: number;
  id: string;
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
  max-width: 800px;
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
 * Styled progress
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled sets grid
 */
const SetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled set card
 */
const SetCard = styled(motion.div)`
  background: ${theme.colors.background};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  border: 2px solid ${theme.colors.borderLight};
`;

/**
 * Styled rule label
 */
const RuleLabel = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.md};
  text-align: center;
`;

/**
 * Styled numbers container
 */
const NumbersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  min-height: 120px;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 2px dashed ${theme.colors.borderLight};
  align-content: flex-start;
`;

/**
 * Styled number item
 */
const NumberItem = styled(motion.div)<{ $isDragging?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.borderRadius.md};
  cursor: move;
  font-weight: ${theme.fontWeights.semibold};
  user-select: none;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }
`;

/**
 * Styled numbers available
 */
const NumbersAvailable = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  min-height: 50px;
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.borderLight};
  align-content: flex-start;
`;

/**
 * Styled submit button
 */
const SubmitButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};
  width: 100%;

  &:hover:not(:disabled) {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Helper function to get rule description
 */
const getRuleDescription = (rule: SortRule): string => {
  switch (rule) {
    case 'ascending':
      return 'Ascending (Low → High)';
    case 'descending':
      return 'Descending (High → Low)';
    case 'even-odd':
      return 'Even First, Then Odd';
    case 'divisible-3':
      return 'Divisible by 3, Then Others';
    default:
      return '';
  }
};

/**
 * Check if set is sorted correctly
 */
const isSortedCorrectly = (numbers: number[], rule: SortRule): boolean => {
  switch (rule) {
    case 'ascending':
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] < numbers[i - 1]) return false;
      }
      return true;
    case 'descending':
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > numbers[i - 1]) return false;
      }
      return true;
    case 'even-odd':
      let lastEven = true;
      for (const num of numbers) {
        const isEven = num % 2 === 0;
        if (!isEven && lastEven) return false;
        if (!isEven) lastEven = false;
      }
      return true;
    case 'divisible-3':
      let lastDiv3 = true;
      for (const num of numbers) {
        const isDiv3 = num % 3 === 0;
        if (!isDiv3 && lastDiv3) return false;
        if (!isDiv3) lastDiv3 = false;
      }
      return true;
    default:
      return false;
  }
};

/**
 * Rapid Sort Challenge Component
 * Sort 4 sets of 7 numbers with different rules
 */
const RapidSortChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Generate 4 sets of 7 random numbers
  const [sets, setSets] = useState<{ numbers: NumberItem[]; rule: SortRule }[]>(() => {
    const rules: SortRule[] = ['ascending', 'descending', 'even-odd', 'divisible-3'];
    return rules.map((rule) => {
      const numbers: NumberItem[] = Array.from({ length: 7 }, (_, i) => ({
        value: Math.floor(Math.random() * 100),
        id: `${rule}-${i}`,
      })).sort(() => Math.random() - 0.5); // Shuffle initially
      return { numbers, rule };
    });
  });

  const [sortedSets, setSortedSets] = useState<number[][]>(() => Array.from({ length: 4 }, () => []));
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Handle drag start
   */
  const handleDragStart = (e: React.DragEvent, setIndex: number, numIndex: number) => {
    const numbers = sets[setIndex].numbers;
    if (numIndex < numbers.length) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ setIndex, numIndex, value: numbers[numIndex].value })
      );
    }
  };

  /**
   * Handle drop on sorted area
   */
  const handleDrop = (e: React.DragEvent, setIndex: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));

    if (data.setIndex === setIndex && data.value !== undefined) {
      const newSortedSets = sortedSets.map((s) => [...s]);
      newSortedSets[setIndex].push(data.value);

      // Remove from available
      const newSets = sets.map((set, idx) => {
        if (idx === setIndex) {
          return {
            ...set,
            numbers: set.numbers.filter(
              (_, numIdx) => numIdx !== data.numIndex || set.numbers[numIdx].value !== data.value
            ),
          };
        }
        return set;
      });

      setSets(newSets);
      setSortedSets(newSortedSets);
    }
  };

  /**
   * Handle undo - remove last added number
   */
  const handleUndo = (setIndex: number) => {
    const newSortedSets = sortedSets.map((s) => [...s]);
    const removedValue = newSortedSets[setIndex].pop();

    if (removedValue !== undefined) {
      // Add back to available
      const newItem: NumberItem = {
        value: removedValue,
        id: `${sets[setIndex].rule}-undo-${Date.now()}`,
      };

      const newSets = sets.map((set, idx) => {
        if (idx === setIndex) {
          return {
            ...set,
            numbers: [...set.numbers, newItem],
          };
        }
        return set;
      });

      setSets(newSets);
      setSortedSets(newSortedSets);
    }
  };

  /**
   * Submit answers
   */
  const handleSubmit = () => {
    let correct = 0;
    for (let i = 0; i < sets.length; i++) {
      if (isSortedCorrectly(sortedSets[i], sets[i].rule)) {
        correct++;
      }
    }

    setCorrectCount(correct);
    setIsSubmitted(true);

    setTimeout(() => {
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = correct * 75; // 75 points per correct set
      onComplete(true, timeSpent, score);
    }, 2000);
  };

  const allComplete = sortedSets.every((s) => s.length === 7);

  return (
    <ChallengeBase
      title="Rapid Sort Challenge"
      description="Sort 4 sets of 7 numbers according to different rules"
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
          Rapid Sort
        </Title>

        <ProgressText>
          Drag numbers to sort them according to each rule
        </ProgressText>

        <SetsGrid>
          {sets.map((set, setIndex) => (
            <SetCard
              key={setIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: setIndex * 0.1 }}
            >
              <RuleLabel>{getRuleDescription(set.rule)}</RuleLabel>

              <NumbersAvailable>
                {set.numbers.map((num, numIndex) => (
                  <NumberItem
                    key={num.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, setIndex, numIndex)}
                    whileHover={{ scale: 1.1 }}
                  >
                    {num.value}
                  </NumberItem>
                ))}
              </NumbersAvailable>

              <NumbersContainer
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, setIndex)}
              >
                {sortedSets[setIndex].map((value, idx) => (
                  <NumberItem key={idx}>{value}</NumberItem>
                ))}
              </NumbersContainer>

              {sortedSets[setIndex].length > 0 && (
                <motion.button
                  onClick={() => handleUndo(setIndex)}
                  style={{
                    marginTop: theme.spacing.md,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    fontSize: theme.fontSizes.sm,
                    background: theme.colors.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Undo
                </motion.button>
              )}
            </SetCard>
          ))}
        </SetsGrid>

        <SubmitButton
          onClick={handleSubmit}
          disabled={!allComplete || isSubmitted}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {isSubmitted ? `Correct: ${correctCount}/4` : 'Submit All'}
        </SubmitButton>
      </Container>
    </ChallengeBase>
  );
};

export default RapidSortChallenge;
