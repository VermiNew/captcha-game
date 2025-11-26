import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Weight item type
 */
interface Weight {
  id: string;
  value: number;
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
`;

/**
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled game area
 */
const GameArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
`;

/**
 * Styled section
 */
const Section = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

/**
 * Styled section title
 */
const SectionTitle = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/**
 * Styled weights list
 */
const WeightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  min-height: 300px;
`;

/**
 * Styled weight button
 */
const WeightButton = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.lg};
  cursor: pointer;
  transition: all 0.16s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus {
    outline: 3px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

/**
 * Styled balance display
 */
const BalanceDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  align-items: center;
`;

/**
 * Styled weight info
 */
const WeightInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled weight box
 */
const WeightBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled weight label
 */
const WeightLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled weight value
 */
const WeightValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled scale visual
 */
const ScaleVisual = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
`;

/**
 * Styled balance beam
 */
const BalanceBeam = styled(motion.div)<{ $rotation: number }>`
  width: 200px;
  height: 16px;
  background: linear-gradient(90deg, #8b7355 0%, #a0826d 50%, #8b7355 100%);
  border-radius: 8px;
  box-shadow: ${theme.shadows.md};
  transform-origin: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 30px;
    background: #654321;
    border-radius: 50% 50% 0 0;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

/**
 * Styled difference indicator
 */
const DifferenceIndicator = styled(motion.div)<{ $balanced: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${(props) =>
    props.$balanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${(props) => (props.$balanced ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$balanced ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  width: 100%;
`;

/**
 * Styled pan display
 */
const PanDisplay = styled(motion.div)`
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, #daa520 0%, #ffd700 100%);
  border: 3px solid #b8860b;
  border-radius: ${theme.borderRadius.md};
  min-height: 80px;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  align-items: flex-start;
  justify-content: center;
  align-content: flex-start;
`;

/**
 * Styled weight item in pan
 */
const WeightItemInPan = styled(motion.div)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.info} 100%);
  color: white;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.sm};
  box-shadow: ${theme.shadows.sm};
`;

/**
 * Styled remove button
 */
const RemoveButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.error};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: scale(0.95);
  }
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  width: 100%;
`;

/**
 * Styled completion message
 */
const CompletionMessage = styled(motion.div)<{ $success: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-weight: ${theme.fontWeights.bold};
  width: 100%;
`;

/**
 * Styled stats
 */
const Stats = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled stat card
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled stat value
 */
const StatValue = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Available weights pool
 */
const WEIGHT_POOL = [
  { id: 'w5-1', value: 5 },
  { id: 'w5-2', value: 5 },
  { id: 'w10-1', value: 10 },
  { id: 'w10-2', value: 10 },
  { id: 'w15-1', value: 15 },
  { id: 'w20-1', value: 20 },
  { id: 'w20-2', value: 20 },
  { id: 'w30', value: 30 },
  { id: 'w50-1', value: 50 },
  { id: 'w50-2', value: 50 },
  { id: 'w100', value: 100 },
];

/**
 * Generate target weight achievable with available weights
 */
function generateTargetWeight(): number {
  // Build all subset sums and track minimal number of items needed for each sum
  const weights = WEIGHT_POOL.map((w) => w.value);
  const map = new Map<number, number>(); // sum -> min count

  const totalComb = 1 << weights.length;
  for (let mask = 1; mask < totalComb; mask++) {
    let sum = 0;
    let count = 0;
    for (let j = 0; j < weights.length; j++) {
      if (mask & (1 << j)) {
        sum += weights[j];
        count++;
      }
    }
    if (sum > 0 && sum < 300) {
      const prev = map.get(sum);
      if (prev === undefined || count < prev) map.set(sum, count);
    }
  }

  // Prefer sums achievable with few weights (easier puzzles)
  const easy: number[] = [];
  const medium: number[] = [];
  const hard: number[] = [];

  for (const [s, cnt] of map.entries()) {
    if (cnt <= 3) easy.push(s);
    else if (cnt <= 5) medium.push(s);
    else hard.push(s);
  }

  const pickFrom = easy.length ? easy : medium.length ? medium : hard;
  if (pickFrom.length === 0) return 75;

  // bias towards smaller sums within the chosen difficulty
  pickFrom.sort((a, b) => a - b);
  const cutoff = Math.max(1, Math.floor(pickFrom.length * 0.6));
  const candidate = pickFrom.slice(0, cutoff);
  return candidate[Math.floor(Math.random() * candidate.length)];
}

/**
 * Balance Game Challenge Component
 */
const BalanceGameChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [leftWeight] = useState(() => generateTargetWeight());
  const [available, setAvailable] = useState<Weight[]>(WEIGHT_POOL);
  const [rightWeights, setRightWeights] = useState<Weight[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());

  const rightTotal = rightWeights.reduce((sum, w) => sum + w.value, 0);
  const difference = Math.abs(leftWeight - rightTotal);
  const BALANCE_TOLERANCE = 3; // tighten tolerance for greater challenge
  const balanced = difference <= BALANCE_TOLERANCE && rightWeights.length > 0;
  const rotation = Math.max(-20, Math.min(20, ((rightTotal - leftWeight) / Math.max(1, leftWeight)) * 20));

  /**
   * Add weight to right pan
   */
  const addWeight = (weight: Weight) => {
    // use functional updates to avoid stale closures
    setAvailable((prev) => prev.filter((w) => w.id !== weight.id));
    setRightWeights((prev) => [...prev, weight]);
  };

  /**
   * Remove weight from right pan
   */
  const removeWeight = (weightId: string) => {
    const weight = rightWeights.find((w) => w.id === weightId);
    if (weight) {
      setRightWeights((prev) => prev.filter((w) => w.id !== weightId));
      // Re-insert into available and keep original WEIGHT_POOL order
      setAvailable((prev) => {
        const next = [...prev, weight];
        return next.sort((a, b) => {
          const ia = WEIGHT_POOL.findIndex((x) => x.id === a.id);
          const ib = WEIGHT_POOL.findIndex((x) => x.id === b.id);
          return ia - ib;
        });
      });
    }
  };

  /**
   * Check balance and complete
   */
  useEffect(() => {
    if (balanced && rightWeights.length > 0 && !completed) {
      const timer = setTimeout(() => {
        const timeSpent = (Date.now() - startTime) / 1000;

        // Scoring: base points with penalties for more weights and time
        const base = 200;
        const weightPenalty = rightWeights.length * 10; // each weight reduces score
        const timePenalty = Math.floor(timeSpent * 0.5); // half point per second
        let score = Math.max(0, Math.round(base - weightPenalty - timePenalty));

        // Bonus for very precise balancing
        if (difference <= 1) score += 30;
        else if (difference <= BALANCE_TOLERANCE) score += 10;

        setCompleted(true);
        onComplete(true, timeSpent, score);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [balanced, rightWeights.length, completed, startTime, onComplete, difference]);

  /**
   * Reset game
   */
  const handleReset = () => {
    setAvailable(WEIGHT_POOL);
    setRightWeights([]);
    setCompleted(false);
  };

  return (
    <ChallengeBase
      title="Balance Game Challenge"
      description="Add weights to the right pan to balance the scale"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      hideTimer
    >
      <Timer timeLimit={timeLimit} />
      <Container>
        <Instruction>
          {completed
            ? 'Perfect balance achieved!'
            : `Left: ${leftWeight} | Right: ${rightTotal} | Difference: ${difference}`}
        </Instruction>

        <GameArea>
          {/* Available Weights */}
          <Section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>Available Weights</SectionTitle>
            <WeightsList>
              <AnimatePresence>
                {available.map((weight) => (
                  <WeightButton
                    key={weight.id}
                    onClick={() => addWeight(weight)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {weight.value} units
                  </WeightButton>
                ))}
              </AnimatePresence>
              {available.length === 0 && (
                <p style={{ textAlign: 'center', color: theme.colors.textSecondary, margin: 0 }}>
                  No weights available
                </p>
              )}
            </WeightsList>
          </Section>

          {/* Balance Display */}
          <Section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>Scale</SectionTitle>

            <BalanceDisplay>
              <WeightInfo>
                <WeightBox>
                  <WeightLabel>Left Pan</WeightLabel>
                  <WeightValue>{leftWeight}</WeightValue>
                </WeightBox>
                <WeightBox>
                  <WeightLabel>Right Pan</WeightLabel>
                  <WeightValue
                    key={rightTotal}
                    animate={{ scale: 1 }}
                    initial={{ scale: 1.2 }}
                  >
                    {rightTotal}
                  </WeightValue>
                </WeightBox>
              </WeightInfo>

              <ScaleVisual>
                <BalanceBeam
                  $rotation={rotation}
                  animate={{ rotateZ: rotation }}
                  transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                />
              </ScaleVisual>

              <DifferenceIndicator $balanced={balanced}>
                {balanced ? 'BALANCED!' : `Difference: ±${difference} units`}
              </DifferenceIndicator>

              <PanDisplay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence>
                  {rightWeights.map((weight, idx) => (
                    <WeightItemInPan
                      key={weight.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {weight.value}
                    </WeightItemInPan>
                  ))}
                </AnimatePresence>
              </PanDisplay>

              {rightWeights.length > 0 && (
                <RemoveButton
                  onClick={() => removeWeight(rightWeights[rightWeights.length - 1].id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Remove Last Weight
                </RemoveButton>
              )}
            </BalanceDisplay>
          </Section>
        </GameArea>

        {completed && (
          <Stats
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <StatCard>
              <StatLabel>Weights Used</StatLabel>
              <StatValue>{rightWeights.length}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Total Weight</StatLabel>
              <StatValue>{rightTotal}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Difference</StatLabel>
              <StatValue>±{difference}</StatValue>
            </StatCard>
            <CompletionMessage
              $success={true}
              style={{ gridColumn: '1 / -1' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              Perfect Balance Achieved!
            </CompletionMessage>
          </Stats>
        )}

        {!completed && (
          <ButtonContainer>
            <Button
              onClick={handleReset}
              disabled={false}
              size="md"
              variant="secondary"
            >
              Reset
            </Button>
          </ButtonContainer>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default BalanceGameChallenge;
