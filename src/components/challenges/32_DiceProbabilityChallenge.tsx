import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Probability data for dice sum
 */
const DICE_PROBABILITIES = [
  { sum: 2, probability: 2.78, chance: '1/36' },
  { sum: 3, probability: 5.56, chance: '2/36' },
  { sum: 4, probability: 8.33, chance: '3/36' },
  { sum: 5, probability: 11.11, chance: '4/36' },
  { sum: 6, probability: 13.89, chance: '5/36' },
  { sum: 7, probability: 16.67, chance: '6/36' },
  { sum: 8, probability: 13.89, chance: '5/36' },
  { sum: 9, probability: 11.11, chance: '4/36' },
  { sum: 10, probability: 8.33, chance: '3/36' },
  { sum: 11, probability: 5.56, chance: '2/36' },
  { sum: 12, probability: 2.78, chance: '1/36' },
];

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
 * Styled dice container
 */
const DiceContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xl};
  margin: ${theme.spacing.lg} 0;
`;

/**
 * Styled single die
 */
const Die = styled(motion.div)<{ $isRolling?: boolean }>`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes['4xl']};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  box-shadow: ${theme.shadows.lg};
  cursor: ${(props) => (props.$isRolling ? 'not-allowed' : 'default')};
`;

/**
 * Styled result display
 */
const ResultDisplay = styled(motion.div)`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  text-align: center;
  min-height: 60px;
`;

/**
 * Styled prediction section
 */
const PredictionSection = styled.div`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

/**
 * Styled prediction label
 */
const PredictionLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled buttons grid
 */
const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${theme.spacing.sm};
  width: 100%;
`;

/**
 * Styled prediction button
 */
const PredictionButton = styled(motion.button)<{ $selected?: boolean; $isCorrect?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: 2px solid
    ${(props) => {
      if (props.$isCorrect) return theme.colors.success;
      if (props.$selected) return theme.colors.primary;
      return theme.colors.textTertiary;
    }};
  background: ${(props) => {
    if (props.$isCorrect) return 'rgba(16, 185, 129, 0.1)';
    if (props.$selected) return 'rgba(99, 102, 241, 0.1)';
    return 'transparent';
  }};
  color: ${theme.colors.textPrimary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled probability table
 */
const ProbabilityTable = styled.div`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
`;

/**
 * Styled probability row
 */
const ProbabilityRow = styled.div<{ $highlight?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSizes.sm};
  background: ${(props) =>
    props.$highlight ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  border-radius: ${(props) => (props.$highlight ? theme.borderRadius.md : '0')};

  &:last-child {
    border-bottom: none;
  }
`;

/**
 * Styled history
 */
const History = styled.div`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
`;

/**
 * Styled history label
 */
const HistoryLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md} 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled history items
 */
const HistoryItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

/**
 * Styled history item
 */
const HistoryItem = styled.div<{ $correct?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.sm};
  background: ${(props) =>
    props.$correct
      ? 'rgba(16, 185, 129, 0.2)'
      : 'rgba(239, 68, 68, 0.2)'};
  color: ${(props) =>
    props.$correct ? theme.colors.success : theme.colors.error};
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled stats
 */
const Stats = styled.div`
  width: 100%;
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textPrimary};
`;

/**
 * Styled action container
 */
const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Interface for roll history
 */
interface RollEntry {
  predicted: number;
  actual: number;
  correct: boolean;
}

/**
 * Dice Probability Challenge Component
 */
const DiceProbabilityChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [dice1, setDice1] = useState(0);
  const [dice2, setDice2] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [history, setHistory] = useState<RollEntry[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const maxRolls = 5;
  const successThreshold = 2;

  /**
   * Handle dice roll
   */
  const handleRoll = () => {
    if (!prediction || isRolling) return;

    setIsRolling(true);
    setShowResult(false);

    // Simulate rolling animation
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
    }, 50);

    setTimeout(() => {
      clearInterval(rollInterval);

      const finalDice1 = Math.floor(Math.random() * 6) + 1;
      const finalDice2 = Math.floor(Math.random() * 6) + 1;
      const sum = finalDice1 + finalDice2;

      setDice1(finalDice1);
      setDice2(finalDice2);
      setIsRolling(false);

      const correct = sum === prediction;
      const newEntry: RollEntry = {
        predicted: prediction,
        actual: sum,
        correct,
      };

      setHistory([newEntry, ...history]);
      setShowResult(true);
      setResultMessage(
        correct
          ? `✓ Correct! You predicted ${prediction} and rolled ${sum}`
          : `✗ Wrong. You predicted ${prediction} but rolled ${sum}`
      );

      const newRollCount = rollCount + 1;
      const newCorrectCount = correctCount + (correct ? 1 : 0);

      setRollCount(newRollCount);
      if (correct) setCorrectCount(newCorrectCount);

      // Check if challenge is complete
      if (newRollCount >= maxRolls) {
        setTimeout(() => {
          const success = newCorrectCount >= successThreshold;
          const score = newCorrectCount * 60;
          onComplete(success, newRollCount * 10, score);
        }, 1000);
      } else {
        setPrediction(null);
      }
    }, 1500);
  };

  return (
    <ChallengeBase
      title="Dice Probability Challenge"
      description="Predict the sum of two dice before each roll"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Stats>
          Roll {rollCount} / {maxRolls} | Correct {correctCount} / {successThreshold}
        </Stats>

        <DiceContainer>
          <Die
            key={`dice1-${dice1}`}
            $isRolling={isRolling}
            animate={{
              rotateX: isRolling ? 360 : 0,
              rotateY: isRolling ? 360 : 0,
            }}
            transition={{ duration: isRolling ? 0.1 : 0.3 }}
          >
            {dice1 === 0 ? '?' : dice1}
          </Die>
          <Die
            key={`dice2-${dice2}`}
            $isRolling={isRolling}
            animate={{
              rotateX: isRolling ? 360 : 0,
              rotateZ: isRolling ? 360 : 0,
            }}
            transition={{ duration: isRolling ? 0.1 : 0.3 }}
          >
            {dice2 === 0 ? '?' : dice2}
          </Die>
        </DiceContainer>

        {showResult && (
          <ResultDisplay
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {resultMessage}
          </ResultDisplay>
        )}

        {rollCount < maxRolls && (
          <PredictionSection>
            <PredictionLabel>Predict the sum (2-12):</PredictionLabel>
            <ButtonGrid>
              {Array.from({ length: 11 }, (_, i) => i + 2).map((sum) => (
                <PredictionButton
                  key={sum}
                  $selected={prediction === sum}
                  onClick={() => setPrediction(sum)}
                  disabled={isRolling}
                >
                  {sum}
                </PredictionButton>
              ))}
            </ButtonGrid>
          </PredictionSection>
        )}

        <ProbabilityTable>
          <ProbabilityLabel>Probability Reference:</ProbabilityLabel>
          {DICE_PROBABILITIES.map((prob) => (
            <ProbabilityRow key={prob.sum} $highlight={prob.sum === 7}>
              <div>Sum: {prob.sum}</div>
              <div>{prob.probability.toFixed(2)}%</div>
              <div>{prob.chance}</div>
            </ProbabilityRow>
          ))}
        </ProbabilityTable>

        {history.length > 0 && (
          <History>
            <HistoryLabel>Roll History:</HistoryLabel>
            <HistoryItems>
              {history.map((entry, idx) => (
                <HistoryItem key={idx} $correct={entry.correct}>
                  {entry.predicted}→{entry.actual}
                </HistoryItem>
              ))}
            </HistoryItems>
          </History>
        )}

        {rollCount < maxRolls && (
          <ActionContainer>
            <Button
              onClick={handleRoll}
              disabled={!prediction || isRolling}
              size="md"
              variant="primary"
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </Button>
          </ActionContainer>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default DiceProbabilityChallenge;
