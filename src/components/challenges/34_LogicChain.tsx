import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Logic puzzle data structure
 */
interface LogicPuzzle {
  entities: string[];
  clues: string[];
  solution: { [key: string]: string };
}

/**
 * Sample logic puzzles (4x4 grid problems)
 */
const LOGIC_PUZZLES: LogicPuzzle[] = [
  {
    entities: ['Alice', 'Bob', 'Charlie', 'Diana'],
    clues: [
      'Alice does not have the red ball',
      'Bob has the blue ball',
      'Charlie does not have the green ball',
      'Diana has the yellow ball',
      'The red ball belongs to either Charlie or Diana',
      'Alice does not have the green ball',
    ],
    solution: {
      'Alice': 'Yellow',
      'Bob': 'Blue',
      'Charlie': 'Red',
      'Diana': 'Green',
    },
  },
  {
    entities: ['Apple', 'Banana', 'Cherry', 'Date'],
    clues: [
      'The red fruit is not an apple',
      'The banana is yellow',
      'The cherry is red',
      'The date is brown',
      'Apple is either red or green',
      'Apple is not brown',
    ],
    solution: {
      'Apple': 'Green',
      'Banana': 'Yellow',
      'Cherry': 'Red',
      'Date': 'Brown',
    },
  },
  {
    entities: ['Cat', 'Dog', 'Parrot', 'Fish'],
    clues: [
      'The cat is furry',
      'The dog is not small',
      'The parrot can fly',
      'The fish cannot fly',
      'The cat is not large',
      'The parrot is small',
    ],
    solution: {
      'Cat': 'Furry',
      'Dog': 'Large',
      'Parrot': 'Small',
      'Fish': 'Silent',
    },
  },
];

const ATTRIBUTES = ['Red', 'Blue', 'Green', 'Yellow', 'Small', 'Large', 'Furry', 'Silent', 'Brown'];

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
 * Styled clues container
 */
const CluesContainer = styled(motion.div)`
  background: ${theme.colors.background};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
`;

/**
 * Styled clue title
 */
const ClueTitle = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
`;

/**
 * Styled clue item
 */
const ClueItem = styled(motion.div)`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-left: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Styled grid
 */
const GridContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

/**
 * Styled grid table
 */
const GridTable = styled.div`
  display: inline-block;
  border-collapse: collapse;
`;

/**
 * Styled grid row
 */
const GridRow = styled.div`
  display: flex;
  gap: 1px;
`;

/**
 * Styled grid cell
 */
const GridCell = styled.div<{ $isHeader?: boolean; $selected?: boolean }>`
  width: 80px;
  height: 60px;
  padding: ${theme.spacing.sm};
  background: ${(props) =>
    props.$isHeader
      ? theme.colors.primary
      : props.$selected
        ? `rgba(34, 197, 94, 0.2)`
        : theme.colors.background};
  color: ${(props) => (props.$isHeader ? 'white' : theme.colors.textPrimary)};
  border: 1px solid ${theme.colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.semibold};
  cursor: ${(props) => (props.$isHeader ? 'default' : 'pointer')};
  user-select: none;
  transition: all 0.2s ease;

  &:hover:not([disabled]) {
    background: ${(props) =>
      !props.$isHeader ? `rgba(99, 102, 241, 0.1)` : 'inherit'};
  }
`;

/**
 * Styled answer grid
 */
const AnswerGrid = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
`;

/**
 * Styled answer title
 */
const AnswerTitle = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.lg} 0;
`;

/**
 * Styled answers
 */
const AnswersDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

/**
 * Styled answer row
 */
const AnswerRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};

  span:first-child {
    font-weight: ${theme.fontWeights.semibold};
    color: ${theme.colors.textPrimary};
  }

  span:last-child {
    color: ${theme.colors.primary};
    font-weight: ${theme.fontWeights.bold};
  }
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
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $type: 'success' | 'error' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  background: ${(props) =>
    props.$type === 'success'
      ? `rgba(34, 197, 94, 0.1)`
      : `rgba(239, 68, 68, 0.1)`};
  color: ${(props) =>
    props.$type === 'success' ? theme.colors.success : theme.colors.error};
  border: 2px solid
    ${(props) =>
      props.$type === 'success' ? theme.colors.success : theme.colors.error};
`;

/**
 * Logic Chain Solver Challenge Component
 * Solve a 4x4 logic puzzle
 */
const LogicChainChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [puzzle] = useState<LogicPuzzle>(() =>
    LOGIC_PUZZLES[Math.floor(Math.random() * LOGIC_PUZZLES.length)]
  );

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [startTime] = useState(() => Date.now());

  /**
   * Handle cell click
   */
  const handleCellClick = useCallback((entity: string, attribute: string) => {
    if (isSuccess) return;

    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (newAnswers[entity] === attribute) {
        delete newAnswers[entity];
      } else {
        newAnswers[entity] = attribute;
      }
      return newAnswers;
    });
  }, [isSuccess]);

  /**
   * Check solution
   */
  const checkSolution = () => {
    if (Object.keys(answers).length !== puzzle.entities.length) {
      setFeedback('✗ Please answer for all entities');
      return;
    }

    let correct = true;
    for (const entity of puzzle.entities) {
      if (answers[entity] !== puzzle.solution[entity]) {
        correct = false;
        break;
      }
    }

    if (correct) {
      setFeedback('✓ Congratulations! You solved the puzzle!');
      setIsSuccess(true);
      setTimeout(() => {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, 300);
      }, 1500);
    } else {
      setFeedback('✗ Some answers are incorrect. Try again!');
    }
  };

  /**
   * Reset answers
   */
  const resetAnswers = () => {
    setAnswers({});
    setFeedback('');
  };

  return (
    <ChallengeBase
      title="Logic Chain Solver"
      description="Use the clues to solve the logic puzzle"
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
          Logic Puzzle
        </Title>

        <CluesContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ClueTitle>Clues:</ClueTitle>
          {puzzle.clues.map((clue, idx) => (
            <ClueItem
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              {idx + 1}. {clue}
            </ClueItem>
          ))}
        </CluesContainer>

        <GridContainer>
          <GridTable>
            <GridRow>
              <GridCell $isHeader>Entity</GridCell>
              {ATTRIBUTES.slice(0, 4).map((attr) => (
                <GridCell key={attr} $isHeader>
                  {attr}
                </GridCell>
              ))}
            </GridRow>
            {puzzle.entities.map((entity) => (
              <GridRow key={entity}>
                <GridCell $isHeader>{entity}</GridCell>
                {ATTRIBUTES.slice(0, 4).map((attr) => (
                  <GridCell
                    key={`${entity}-${attr}`}
                    $selected={answers[entity] === attr}
                    onClick={() => handleCellClick(entity, attr)}
                  >
                    {answers[entity] === attr ? '✓' : ''}
                  </GridCell>
                ))}
              </GridRow>
            ))}
          </GridTable>
        </GridContainer>

        <AnswerGrid>
          <AnswerTitle>Your Answers:</AnswerTitle>
          <AnswersDisplay>
            {puzzle.entities.map((entity) => (
              <AnswerRow key={entity}>
                <span>{entity}</span>
                <span>{answers[entity] || '?'}</span>
              </AnswerRow>
            ))}
          </AnswersDisplay>
        </AnswerGrid>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, width: '100%' }}>
          <SubmitButton
            onClick={checkSolution}
            disabled={isSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Check Solution
          </SubmitButton>
          <SubmitButton
            onClick={resetAnswers}
            disabled={isSuccess}
            style={{
              background: theme.colors.surface,
              color: theme.colors.textPrimary,
              border: `2px solid ${theme.colors.borderLight}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </SubmitButton>
        </div>

        {feedback && (
          <Feedback
            $type={isSuccess ? 'success' : 'error'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {feedback}
          </Feedback>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default LogicChainChallenge;
