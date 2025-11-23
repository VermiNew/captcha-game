import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getChallenges, getTotalChallenges } from '../utils/challengeRegistry';
import { GameState } from '../types';
import ProgressBar from './ui/ProgressBar';
import ScoreDisplay from './ui/ScoreDisplay';
import Timer from './ui/Timer';
import { theme } from '../styles/theme';

// Import challenges
import Captcha from './challenges/01_Captcha';
import SimpleMath from './challenges/02_SimpleMath';
import TypeText from './challenges/03_TypeText';
import ReverseText from './challenges/04_ReverseText';
import DragDropSentence from './challenges/05_DragDropSentence';
import MathQuiz from './challenges/06_MathQuiz';
import DrawCircle from './challenges/07_DrawCircle';
import GeographyQuiz from './challenges/08_GeographyQuiz';
import FindEmoji from './challenges/09_FindEmoji';
import PatternRecognition from './challenges/10_PatternRecognition';
import ReactionTime from './challenges/11_ReactionTime';
import SlidingPuzzle from './challenges/12_SlidingPuzzle';
import TicTacToe from './challenges/13_TicTacToe';
import ClickPrecision from './challenges/14_ClickPrecision';
import TowerBuilder from './challenges/15_TowerBuilder';
import OddOneOut from './challenges/16_OddOneOut';
import SimonSays from './challenges/17_SimonSays';
import BalanceGame from './challenges/18_BalanceGame';
import ChessPuzzle from './challenges/19_ChessPuzzle';
import ConnectDots from './challenges/20_ConnectDots';
import MouseMaze from './challenges/21_MouseMaze';
import WhackAMole from './challenges/22_WhackAMole';
import TargetPractice from './challenges/23_TargetPractice';
import KeyboardMemory from './challenges/24_KeyboardMemory';
import ColorBlindTest from './challenges/25_ColorBlindTest';
import ShutdownComputer from './challenges/26_ShutdownComputer';
import FractionFighter from './challenges/27_FractionFighter';
import FlagMatch from './challenges/28_FlagMatch';
import ScienceQuiz from './challenges/29_ScienceQuiz';
import SpaceShooter from './challenges/30_SpaceShooter';
import PixelArtMemory from './challenges/31_PixelArtMemory';
import MathSorting from './challenges/32_MathSorting';
import CubeRotation from './challenges/33_CubeRotation';
import LogicChain from './challenges/34_LogicChain';
import JavaScriptCode from './challenges/35_JavaScriptCode';
import BinaryCalculator from './challenges/36_BinaryCalculator';
import PongArcade from './challenges/37_PongArcade';
import TetrisSprint from './challenges/38_TetrisSprint';
import ITNetworkQuiz from './challenges/39_ITNetworkQuiz';
import MazeKeyQuest from './challenges/40_MazeKeyQuest';
import CarDriving from './challenges/41_CarDriving';

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
 * Styled timer container - fixed position outside challenge flow
 */
const TimerContainer = styled(motion.div)`
  position: fixed;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.xl};
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  @media (max-width: 768px) {
    top: ${theme.spacing.md};
    right: ${theme.spacing.md};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
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

  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  const challenges = getChallenges();
  const totalChallenges = getTotalChallenges();
  const currentChallenge = challenges[currentChallengeIndex];

  /**
   * Check if game is completed
   */
  useEffect(() => {
    if (currentChallengeIndex >= totalChallenges) {
      setGameState('completed' as GameState);
      setShowTimer(false);
    }
  }, [currentChallengeIndex, totalChallenges, setGameState]);

  /**
   * Reset timer when challenge changes
   */
  useEffect(() => {
    setShowTimer(true);
    setTimeLeft(currentChallenge.timeLimit);
    setTimerActive(true);
  }, [currentChallengeIndex, currentChallenge.timeLimit]);

  /**
   * Timer countdown effect
   */
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

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
    setShowTimer(false);
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
        return <Captcha {...challengeProps} />;
      case 2:
        return <SimpleMath {...challengeProps} />;
      case 3:
        return <TypeText {...challengeProps} />;
      case 4:
        return <ReverseText {...challengeProps} />;
      case 5:
        return <DragDropSentence {...challengeProps} />;
      case 6:
         return <MathQuiz {...challengeProps} />;
       case 8:
        return <DrawCircle {...challengeProps} />;
      case 9:
        return <GeographyQuiz {...challengeProps} />;
      case 09:
         return <FindEmoji {...challengeProps} />;
       case 10:
        return <PatternRecognition {...challengeProps} />;
      case 11:
        return <ReactionTime {...challengeProps} />;
      case 10:
        return <SlidingPuzzle {...challengeProps} />;
      case 13:
         return <TicTacToe {...challengeProps} />;
       case 14:
        return <ClickPrecision {...challengeProps} />;
      case 13:
        return <TowerBuilder {...challengeProps} />;
      case 16:
        return <OddOneOut {...challengeProps} />;
      case 14:
        return <SimonSays {...challengeProps} />;
      case 18:
        return <BalanceGame {...challengeProps} />;
      case 19:
        return <ChessPuzzle {...challengeProps} />;
      case 20:
        return <ConnectDots {...challengeProps} />;
      case 18:
         return <MouseMaze {...challengeProps} />;
       case 22:
        return <WhackAMole {...challengeProps} />;
      case 23:
        return <TargetPractice {...challengeProps} />;
      case 18:
        return <KeyboardMemory {...challengeProps} />;
      case 25:
         return <ColorBlindTest {...challengeProps} />;
       case 26:
        return <ShutdownComputer {...challengeProps} />;
      case 27:
        return <FractionFighter {...challengeProps} />;
      case 22:
         return <FlagMatch {...challengeProps} />;
       case 23:
        return <ScienceQuiz {...challengeProps} />;
      case 30:
        return <SpaceShooter {...challengeProps} />;
      case 31:
        return <PixelArtMemory {...challengeProps} />;
      case 32:
        return <MathSorting {...challengeProps} />;
      case 33:
         return <CubeRotation {...challengeProps} />;
       case 26:
        return <LogicChain {...challengeProps} />;
      case 35:
        return <JavaScriptCode {...challengeProps} />;
      case 22:
        return <BinaryCalculator {...challengeProps} />;
      case 37:
        return <PongArcade {...challengeProps} />;
      case 38:
        return <TetrisSprint {...challengeProps} />;
      case 30:
        return <ITNetworkQuiz {...challengeProps} />;
      case 40:
        return <MazeKeyQuest {...challengeProps} />;
      case 41:
        return <CarDriving {...challengeProps} />;
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

      <AnimatePresence>
        {showTimer && (
          <TimerContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
          >
            <Timer
              timeLeft={timeLeft}
              totalTime={currentChallenge.timeLimit}
              onTimeUp={() => setShowTimer(false)}
            />
          </TimerContainer>
        )}
      </AnimatePresence>

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

