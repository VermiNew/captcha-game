import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Weight item type
 */
interface WeightItem {
  id: string;
  value: number;
}

/**
 * All available weights
 */
const AVAILABLE_WEIGHTS = [
  { id: 'w10-1', value: 10 },
  { id: 'w10-2', value: 10 },
  { id: 'w20-1', value: 20 },
  { id: 'w20-2', value: 20 },
  { id: 'w30-1', value: 30 },
  { id: 'w50-1', value: 50 },
  { id: 'w50-2', value: 50 },
  { id: 'w100-1', value: 100 },
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
  max-width: 700px;
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
 * Styled game area
 */
const GameArea = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
`;

/**
 * Styled available weights section
 */
const AvailableWeightsSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  flex: 1;
`;

/**
 * Styled section label
 */
const SectionLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled weights container
 */
const WeightsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  min-height: 200px;
`;

/**
 * Styled draggable weight
 */
const DraggableWeight = styled(motion.div)<{ $isDragging: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  color: white;
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  cursor: ${(props) => (props.$isDragging ? 'grabbing' : 'grab')};
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  touch-action: none;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transform: ${(props) => (props.$isDragging ? 'scale(1.05)' : 'scale(1)')};
  transition: all 0.2s ease;
`;

/**
 * Styled weight item (in drop zone)
 */
const WeightItem = styled(motion.div)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.info} 100%);
  color: white;
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.bold};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

/**
 * Styled balance section
 */
const BalanceSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  flex: 1;
`;

/**
 * Styled scale container
 */
const ScaleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Styled weight info
 */
const WeightInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  width: 100%;
`;

/**
 * Styled weight display
 */
const WeightDisplay = styled.div<{ $label: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
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
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Styled balance beam (the scale itself)
 */
const BalanceBeam = styled(motion.div)<{ $rotation: number }>`
  width: 300px;
  height: 20px;
  background: linear-gradient(90deg, #8B7355 0%, #A0826D 50%, #8B7355 100%);
  border-radius: ${theme.borderRadius.full};
  position: relative;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform-origin: center;
  transform: rotateZ(${(props) => props.$rotation}deg);

  &::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 40px;
    background: #654321;
    border-radius: 50% 50% 0 0;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
  }
`;

/**
 * Styled pan container
 */
const PanContainer = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: -80px;
  ${(props) => (props.$side === 'left' ? 'left: 10px;' : 'right: 10px;')}
  width: 100px;
  height: 60px;
  background: linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #DAA520 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid #B8860B;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Styled right pan (drop zone)
 */
const RightPan = styled(motion.div)`
  position: absolute;
  top: -80px;
  right: 10px;
  width: 100px;
  height: 60px;
  background: linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #DAA520 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid #B8860B;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm};
`;

/**
 * Styled right pan label
 */
const RightPanLabel = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xs};
  color: #654321;
  margin: 0;
  font-weight: ${theme.fontWeights.bold};
`;

/**
 * Styled feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
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
 * Styled stats section
 */
const StatsSection = styled(motion.div)`
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
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Sortable Weight Component
 */
interface SortableWeightProps {
  id: string;
  value: number;
  isDragging: boolean;
}

const SortableWeight: React.FC<SortableWeightProps> = ({ id, value, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    width: '100%',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DraggableWeight
        $isDragging={isDragging}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {value} units
      </DraggableWeight>
    </div>
  );
};

/**
 * Balance Game Challenge Component
 * User must balance the scale by adding weights to the right pan
 */
const BalanceGameChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [leftWeight] = useState(() => Math.floor(Math.random() * 100) + 50); // 50-150
  const [availableWeights, setAvailableWeights] = useState<WeightItem[]>(AVAILABLE_WEIGHTS);
  const [rightWeights, setRightWeights] = useState<WeightItem[]>([]);
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

  const rightWeight = rightWeights.reduce((sum, w) => sum + w.value, 0);
  const difference = Math.abs(leftWeight - rightWeight);
  const isBalanced = difference <= 5;
  const rotation = ((rightWeight - leftWeight) / 100) * 15; // Max 15 degrees

  /**
   * Handle drag end
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Moving from available to right pan
    if (over.id === 'rightpan') {
      const weightToMove = availableWeights.find((w) => w.id === active.id);
      if (weightToMove) {
        setAvailableWeights(availableWeights.filter((w) => w.id !== active.id));
        setRightWeights([...rightWeights, weightToMove]);

        // Check if balanced
        const newRightWeight = rightWeight + weightToMove.value;
        const newDifference = Math.abs(leftWeight - newRightWeight);

        if (newDifference <= 5) {
          setCompleted(true);
          const timeSpent = (Date.now() - startTime) / 1000;
          const weightCount = rightWeights.length + 1;
          const accuracyBonus = Math.max(0, 50 - (newDifference * 10));
          const efficiencyBonus = Math.max(0, 50 - weightCount * 5);
          const score = 200 + accuracyBonus + efficiencyBonus;

          setTimeout(() => {
            onComplete(true, timeSpent, Math.round(score));
          }, 1500);
        }
      }
    }

    // Moving back from right pan to available
    if (over.id === 'available') {
      const indexInRight = rightWeights.findIndex((w) => w.id === active.id);
      if (indexInRight >= 0) {
        const weightToMove = rightWeights[indexInRight];
        setRightWeights(rightWeights.filter((_, i) => i !== indexInRight));
        setAvailableWeights([...availableWeights, weightToMove]);
      }
    }
  };

  return (
    <ChallengeBase
      title="Balance Game Challenge"
      description="Balance the scale by adding weights to the right pan"
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
          Balance the Scale!
        </Title>

        <Instruction>
          {completed
            ? 'Perfect balance achieved!'
            : `Drag weights to the right pan. Current difference: ${difference} units`}
        </Instruction>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <GameArea>
            {/* Left Section - Available Weights */}
            <AvailableWeightsSection
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SectionLabel>Available Weights</SectionLabel>
              <WeightsContainer>
                <SortableContext
                  items={availableWeights.map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                  id="available"
                >
                  {availableWeights.map((weight) => (
                    <SortableWeight
                      key={weight.id}
                      id={weight.id}
                      value={weight.value}
                      isDragging={false}
                    />
                  ))}
                </SortableContext>
              </WeightsContainer>
            </AvailableWeightsSection>

            {/* Middle Section - Balance */}
            <BalanceSection
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <SectionLabel>Scale</SectionLabel>

              <WeightInfo>
                <WeightDisplay>
                  <WeightLabel>Left Pan</WeightLabel>
                  <WeightValue>{leftWeight}</WeightValue>
                </WeightDisplay>
                <WeightDisplay>
                  <WeightLabel>Right Pan</WeightLabel>
                  <WeightValue
                    key={rightWeight}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {rightWeight}
                  </WeightValue>
                </WeightDisplay>
              </WeightInfo>

              <ScaleContainer>
                <BalanceBeam
                  $rotation={rotation}
                  initial={{ rotation: 0 }}
                  animate={{ rotation }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                >
                  <PanContainer $side="left" />
                  <RightPan id="rightpan">
                    <RightPanLabel>Right Pan</RightPanLabel>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {rightWeights.map((w, idx) => (
                        <WeightItem
                          key={w.id}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          {w.value}
                        </WeightItem>
                      ))}
                    </div>
                  </RightPan>
                </BalanceBeam>
              </ScaleContainer>

              {isBalanced && !completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <FeedbackMessage $success={true}>
                    <Emoji>⚖️</Emoji>
                    <span>Perfectly balanced!</span>
                  </FeedbackMessage>
                </motion.div>
              )}
            </BalanceSection>
          </GameArea>
        </DndContext>

        {completed && (
          <StatsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
          >
            <StatCard
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <StatLabel>Weights Used</StatLabel>
              <StatValue>{rightWeights.length}</StatValue>
            </StatCard>

            <StatCard
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <StatLabel>Total Weight</StatLabel>
              <StatValue>{rightWeight}</StatValue>
            </StatCard>

            <StatCard
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <StatLabel>Difference</StatLabel>
              <StatValue>±{difference}</StatValue>
            </StatCard>
          </StatsSection>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default BalanceGameChallenge;
