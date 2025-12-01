import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getChallenges, getTotalChallenges } from '../utils/challengeRegistry';
import { GameState } from '../types';
import ProgressBar from './ui/ProgressBar';
import ScoreDisplay from './ui/ScoreDisplay';
import { theme } from '../styles/theme';

// Import challenges
import { getChallenge } from '../utils/challengeRegistry';

/**
 * Styled main container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding: ${theme.spacing['2xl']};
  padding-bottom: 120px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  gap: ${theme.spacing['2xl']};
`;

/**
 * Styled header with progress and score
 */
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

/**
 * Styled progress section
 */
const ProgressSection = styled.div`
  flex: 1;
  min-width: 300px;
`;

/**
 * Styled score section
 */
const ScoreSection = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
`;

/**
 * Styled challenge area
 */
const ChallengeArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 400px;
`;



/**
 * Placeholder component for unimplemented challenges
 */
const PlaceholderChallenge = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  background-color: ${theme.colors.cardBg};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};

  h2 {
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.md};
  }

  p {
    color: ${theme.colors.textSecondary};
  }
`;

/**
 * GameContainer Component
 * Main orchestrator for the game flow and challenge progression
 */
const GameContainer: React.FC = () => {
  const {
    currentChallengeIndex,
    totalScore,
    gameState,
    completeChallenge,
    setGameState,
  } = useGameStore();

  const challenges = getChallenges();
  const totalChallenges = getTotalChallenges();
  const currentChallenge = challenges[currentChallengeIndex];

  /**
   * Check if game is completed
   */
  useEffect(() => {
    if (currentChallengeIndex >= totalChallenges) {
      const timer = setTimeout(() => {
        setGameState('completed' as GameState);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentChallengeIndex, totalChallenges, setGameState]);



  /**
   * Only render during playing state
   */
  if (gameState !== 'playing') {
    return null;
  }

  /**
   * Game is completed, but this check above should prevent reaching here
   */
  if (currentChallengeIndex >= totalChallenges) {
    return null;
  }

  /**
   * Handle challenge completion
   */
  const handleChallengeComplete = (
    success: boolean,
    timeSpent: number,
    score: number,
  ) => {
    completeChallenge({
      challengeId: currentChallenge.id,
      success,
      timeSpent,
      score,
      accuracy: success ? 100 : 0,
    });
  };

  /**
   * Render the appropriate challenge component
   */
   const renderChallenge = () => {
       const challengeProps = {
         onComplete: handleChallengeComplete,
         challengeId: String(currentChallenge.id),
       };

    const challenge = getChallenge(currentChallenge.id);
    if (!challenge) {
      return (
        <PlaceholderChallenge>
          <h2>Challenge Not Found</h2>
          <p>Something went wrong.</p>
        </PlaceholderChallenge>
      );
    }

    const ChallengeComponent = challenge.component;
    return <ChallengeComponent {...challengeProps} />;
  };

  return (
    <Container>
      <Header>
        <ProgressSection>
          <ProgressBar
            current={currentChallengeIndex + 1}
            total={totalChallenges}
            animated
          />
        </ProgressSection>
        <ScoreSection>
          <ScoreDisplay score={totalScore} animated />
        </ScoreSection>
      </Header>



      <ChallengeArea>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChallengeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            style={{ width: '100%' }}
          >
            {renderChallenge()}
          </motion.div>
        </AnimatePresence>
      </ChallengeArea>
    </Container>
  );
};

export default GameContainer;

