import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useGameStore } from './store/gameStore';
import StartScreen from './components/StartScreen';
import GameContainer from './components/GameContainer';
import ResultScreen from './components/ResultScreen';
import DebugPanel from './components/DebugPanel';
import { getTotalChallenges } from './utils/challengeRegistry';

/**
 * Main App Component
 * Orchestrates screen rendering based on game state
 * Provides theme and global styles
 */
const App: React.FC = () => {
  const { gameState, setCurrentChallengeIndex, setGameState } = useGameStore();
  const [isDebugMode, setIsDebugMode] = useState(false);

  /**
   * Handle debug mode - check for ?debug query parameter
   * Also handle ?level=X for jumping to specific level
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const debug = searchParams.get('debug');
    const level = searchParams.get('level');

    // Enable debug mode if ?debug is present
    if (debug !== null) {
      setIsDebugMode(true);
      // set a global flag so other components can detect debug mode
      // even after App removes the query param from the URL
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__VIBE_DEBUG__ = true;
      console.debug('Debug mode enabled');
    }

    // Handle level jumping
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
    }

    // Remove query params from URL (clean history)
    if (debug !== null || level !== null) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setCurrentChallengeIndex, setGameState]);

  /**
   * Block page refresh
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F5
      if (e.key === 'F5') {
        e.preventDefault();
        const confirmed = confirm(
          '⚠️ Refreshing the page will lose your progress!\n\nAre you sure you want to refresh the page?'
        );
        if (!confirmed) {
          return;
        }
        window.location.reload();
        return;
      }
      // Block Ctrl+R / Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        const confirmed = confirm(
          '⚠️ Refreshing the page will lose your progress!\n\nAre you sure you want to refresh the page?'
        );
        if (!confirmed) {
          return;
        }
        window.location.reload();
        return;
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        '⚠️ Refreshing the page will lose your progress! Are you sure you want to leave?';
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
      <DebugPanel isDebugMode={isDebugMode} />
    </ThemeProvider>
  );
};

export default App;
