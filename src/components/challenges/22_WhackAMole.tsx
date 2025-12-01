import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
 
import { theme } from '../../styles/theme';

/**
 * Hole state
 */
interface Hole {
  id: number;
  active: boolean;
  moleId: string | null;
}

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Game grid
 */
const GameGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, #8b5a2b 0%, #a0826d 100%);
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
`;

/**
 * Single hole
 */
const HoleContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 30% 30%, #5c3d2e, #3a2a1f);
  border-radius: 50%;
  border: 4px solid #2a1a10;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  overflow: hidden;
`;

/**
 * Mole (emoji)
 */
const Mole = styled(motion.div)`
  position: absolute;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

/**
 * Stats display
 */
const StatsDisplay = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Label
 */
const Label = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Instructions
 */
const Instructions = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Feedback message
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
 * Emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

/**
 * Whack A Mole Challenge Component
 */
const WhackAMoleChallenge: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const [startTime] = useState(() => Date.now());

  // Initialize 9 holes
  const [holes, setHoles] = useState<Hole[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      active: false,
      moleId: null,
    }))
  );
  const [hits, setHits] = useState(0);
  const [totalMoles, setTotalMoles] = useState(0);
  const [completed, setCompleted] = useState(false);

  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const moleCountRef = useRef(0);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Spawn a mole
   */
  const spawnMole = useCallback(() => {
    if (completed || totalMoles >= 25) return;

    const randomHoleId = Math.floor(Math.random() * 9);
    const moleId = `mole-${moleCountRef.current++}`;

    setHoles((prev) =>
      prev.map((hole) =>
        hole.id === randomHoleId ? { ...hole, active: true, moleId } : hole
      )
    );

    setTotalMoles((prev) => prev + 1);

    // Hide mole after 1 second
    const timeout = setTimeout(() => {
      setHoles((prev) =>
        prev.map((hole) =>
          hole.moleId === moleId ? { ...hole, active: false, moleId: null } : hole
        )
      );
      moleTimeoutsRef.current.delete(moleId);
    }, 1000);

    moleTimeoutsRef.current.set(moleId, timeout);
  }, [completed, totalMoles]);

  /**
   * Handle hole click
   */
  const handleHoleClick = (holeId: number) => {
    const hole = holes[holeId];

    if (hole.active && hole.moleId) {
      setHits((prev) => prev + 1);
      setHoles((prev) =>
        prev.map((h) => (h.id === holeId ? { ...h, active: false, moleId: null } : h))
      );

      // Clear timeout for this mole
      if (moleTimeoutsRef.current.has(hole.moleId)) {
        clearTimeout(moleTimeoutsRef.current.get(hole.moleId)!);
        moleTimeoutsRef.current.delete(hole.moleId);
      }
    }
  };

  /**
   * Spawn moles at intervals
   */
  useEffect(() => {
    if (completed) return;

    spawnIntervalRef.current = setInterval(() => {
      spawnMole();
    }, 600);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [completed, totalMoles]);

  /**
   * Check game completion
   */
  useEffect(() => {
    if (totalMoles >= 25) {
      // Wait for last mole to hide
      completionTimeoutRef.current = setTimeout(() => {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const score = hits * 10;
        const success = hits >= 18;

        finalTimeoutRef.current = setTimeout(() => {
          onComplete(success, timeSpent, score);
        }, 1000);
      }, 1100);

      return () => {
        if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
        if (finalTimeoutRef.current) clearTimeout(finalTimeoutRef.current);
      };
    }
  }, [totalMoles, hits, startTime, onComplete]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
      moleTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
      if (finalTimeoutRef.current) clearTimeout(finalTimeoutRef.current);
    };
  }, []);

  if (completed) {
    const success = hits >= 18;

    return (
      <ChallengeBase
        title="Whack A Mole Challenge"
        description="Click on the moles before they hide"
   
  
      >
        <FeedbackMessage
          $success={success}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>{success ? '🎯' : '😅'}</Emoji>
          <span>{success ? 'Great reflexes!' : 'Not bad!'}</span>
          <span>
            Hits: {hits}/25
          </span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Whack A Mole Challenge"
      description="Click on the moles before they hide"
 

    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Instructions>Click on the moles before they disappear!</Instructions>

        <GameGrid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {holes.map((hole) => (
            <HoleContainer
              key={hole.id}
              onClick={() => handleHoleClick(hole.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {hole.active && hole.moleId && (
                <Mole
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  🦫
                </Mole>
              )}
            </HoleContainer>
          ))}
        </GameGrid>

        <StatsDisplay>
          <StatItem>
            <Label>Hits</Label>
            <span>{hits}</span>
          </StatItem>
          <StatItem>
            <Label>Moles</Label>
            <span>
              {totalMoles}/25
            </span>
          </StatItem>
        </StatsDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default WhackAMoleChallenge;
