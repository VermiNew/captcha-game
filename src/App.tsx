import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useGameStore } from './store/gameStore';
import StartScreen from './components/StartScreen';
import GameContainer from './components/GameContainer';
import ResultScreen from './components/ResultScreen';
import { getTotalChallenges } from './utils/challengeRegistry';

/**
 * Main App Component
 * Orchestrates screen rendering based on game state
 * Provides theme and global styles
 */
const App: React.FC = () => {
  const { gameState, setCurrentChallengeIndex, setGameState } = useGameStore();

  /**
   * Handle debug mode - check for ?level=X query parameter
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const level = searchParams.get('level');

    if (level !== null) {
      const levelIndex = parseInt(level, 10);
      const totalChallenges = getTotalChallenges();

      // Validate level index
      if (!isNaN(levelIndex) && levelIndex >= 0 && levelIndex < totalChallenges) {
        // Set to playing state and jump to specific level
        setGameState('playing');
        setCurrentChallengeIndex(levelIndex);
        console.debug(`Debug: Jumped to level ${levelIndex}`);
      } else {
        console.warn(
          `Debug: Invalid level ${levelIndex}. Valid range: 0-${totalChallenges - 1}`
        );
      }

      // Remove query param from URL (clean history)
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setCurrentChallengeIndex, setGameState]);

  /**
   * Render appropriate screen based on game state
   */
  const renderScreen = () => {
    switch (gameState) {
      case 'idle':
        return <StartScreen />;
      case 'playing':
        return <GameContainer />;
      case 'completed':
        return <ResultScreen />;
      default:
        return <StartScreen />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {renderScreen()}
    </ThemeProvider>
  );
};

export default App;
