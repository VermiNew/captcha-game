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
import CaptchaChallenge from './challenges/01_CaptchaChallenge';
import SimpleMathChallenge from './challenges/02_SimpleMathChallenge';
import TypeTextChallenge from './challenges/03_TypeTextChallenge';
import ReverseTextChallenge from './challenges/04_ReverseTextChallenge';
import DragDropSentenceChallenge from './challenges/05_DragDropSentenceChallenge';
import MathQuizChallenge from './challenges/06_MathQuizChallenge';
import DrawShapeChallenge from './challenges/07_DrawShapeChallenge';
import DrawCircleChallenge from './challenges/08_DrawCircleChallenge';
import GeographyQuizChallenge from './challenges/09_GeographyQuizChallenge';
import FindEmojiChallenge from './challenges/10_FindEmojiChallenge';
import ColorMemoryChallenge from './challenges/11_ColorMemoryChallenge';
import PatternRecognitionChallenge from './challenges/12_PatternRecognitionChallenge';
import ReactionTimeChallenge from './challenges/13_ReactionTimeChallenge';
import SlidingPuzzleChallenge from './challenges/14_SlidingPuzzleChallenge';
import TicTacToeChallenge from './challenges/15_TicTacToeChallenge';
import RhythmChallenge from './challenges/16_RhythmChallenge';
import ClickPrecisionChallenge from './challenges/17_ClickPrecisionChallenge';
import TowerBuilderChallenge from './challenges/18_TowerBuilderChallenge';
import OddOneOutChallenge from './challenges/19_OddOneOutChallenge';
import VisualMemoryChallenge from './challenges/20_VisualMemoryChallenge';
import BalanceGameChallenge from './challenges/21_BalanceGameChallenge';
import ChessPuzzleChallenge from './challenges/22_ChessPuzzleChallenge';
import ConnectDotsChallenge from './challenges/23_ConnectDotsChallenge';
import MouseMazeChallenge from './challenges/24_MouseMazeChallenge';
import PongReflexChallenge from './challenges/25_PongReflexChallenge';
import JugglingClicksChallenge from './challenges/26_JugglingClicksChallenge';
import LightningRoundChallenge from './challenges/27_LightningRoundChallenge';
import WhackAMoleChallenge from './challenges/28_WhackAMoleChallenge';
import TargetPracticeChallenge from './challenges/29_TargetPracticeChallenge';
import KeyboardMemoryChallenge from './challenges/30_KeyboardMemoryChallenge';
import DiceProbabilityChallenge from './challenges/32_DiceProbabilityChallenge';
import FractionFighterChallenge from './challenges/35_FractionFighterChallenge';
import FlagMatchChallenge from './challenges/36_FlagMatchChallenge';
import MusicNotesChallenge from './challenges/37_MusicNotesChallenge';
import ScienceQuizChallenge from './challenges/38_ScienceQuizChallenge';
import PixelArtMemoryChallenge from './challenges/40_PixelArtMemoryChallenge';

/**
 * Styled main container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding: ${theme.spacing['2xl']};
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
  max-width: 900px;
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
  max-width: 900px;
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

  /**
   * Check if game is completed
   */
  useEffect(() => {
    if (currentChallengeIndex >= totalChallenges) {
      setGameState('completed' as GameState);
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

  const currentChallenge = challenges[currentChallengeIndex];

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
      timeLimit: currentChallenge.timeLimit,
      challengeId: currentChallenge.id,
    };

    switch (currentChallenge.id) {
      case 1:
        return <CaptchaChallenge {...challengeProps} />;
      case 2:
        return <SimpleMathChallenge {...challengeProps} />;
      case 3:
        return <TypeTextChallenge {...challengeProps} />;
      case 4:
        return <ReverseTextChallenge {...challengeProps} />;
      case 5:
        return <DragDropSentenceChallenge {...challengeProps} />;
      case 6:
        return <MathQuizChallenge {...challengeProps} />;
      case 7:
        return <DrawShapeChallenge {...challengeProps} />;
      case 8:
        return <DrawCircleChallenge {...challengeProps} />;
      case 9:
        return <GeographyQuizChallenge {...challengeProps} />;
      case 10:
        return <FindEmojiChallenge {...challengeProps} />;
      case 11:
        return <ColorMemoryChallenge {...challengeProps} />;
      case 12:
        return <PatternRecognitionChallenge {...challengeProps} />;
      case 13:
        return <ReactionTimeChallenge {...challengeProps} />;
      case 14:
        return <SlidingPuzzleChallenge {...challengeProps} />;
      case 15:
        return <TicTacToeChallenge {...challengeProps} />;
      case 16:
        return <RhythmChallenge {...challengeProps} />;
      case 17:
        return <ClickPrecisionChallenge {...challengeProps} />;
      case 18:
        return <TowerBuilderChallenge {...challengeProps} />;
      case 19:
        return <OddOneOutChallenge {...challengeProps} />;
      case 20:
        return <VisualMemoryChallenge {...challengeProps} />;
      case 21:
        return <BalanceGameChallenge {...challengeProps} />;
      case 22:
        return <ChessPuzzleChallenge {...challengeProps} />;
      case 23:
        return <ConnectDotsChallenge {...challengeProps} />;
      case 24:
        return <MouseMazeChallenge {...challengeProps} />;
      case 25:
        return <PongReflexChallenge {...challengeProps} />;
      case 26:
        return <JugglingClicksChallenge {...challengeProps} />;
      case 27:
        return <LightningRoundChallenge {...challengeProps} />;
      case 28:
        return <WhackAMoleChallenge {...challengeProps} />;
      case 29:
        return <TargetPracticeChallenge {...challengeProps} />;
      case 30:
        return <KeyboardMemoryChallenge {...challengeProps} />;
      case 32:
        return <DiceProbabilityChallenge {...challengeProps} />;
      case 35:
        return <FractionFighterChallenge {...challengeProps} />;
      case 36:
        return <FlagMatchChallenge {...challengeProps} />;
      case 37:
        return <MusicNotesChallenge {...challengeProps} />;
      case 38:
        return <ScienceQuizChallenge {...challengeProps} />;
      case 40:
        return <PixelArtMemoryChallenge {...challengeProps} />;
      default:
        return (
          <PlaceholderChallenge>
            <h2>Challenge Not Found</h2>
            <p>This challenge has not been implemented yet.</p>
          </PlaceholderChallenge>
        );
    }
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
