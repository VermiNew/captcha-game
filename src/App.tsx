import React from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useGameStore } from './store/gameStore';
import StartScreen from './components/StartScreen';
import GameContainer from './components/GameContainer';
import ResultScreen from './components/ResultScreen';

/**
 * Main App Component
 * Orchestrates screen rendering based on game state
 * Provides theme and global styles
 */
const App: React.FC = () => {
  const { gameState } = useGameStore();

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
