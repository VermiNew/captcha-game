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
import logger from './utils/logger';

/**
 * Main App Component
 * Orchestrates screen rendering based on game state
 * Provides theme and global styles
 */
const App: React.FC = () => {
  const { gameState, setCurrentChallengeIndex, setGameState } = useGameStore();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [cheatDetected, setCheatDetected] = useState(false);
  const [cheatAttemptCount, setCheatAttemptCount] = useState(0);
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  /**
   * Initialize debug mode from localStorage
   */
  useEffect(() => {
    const storedDebugMode = localStorage.getItem('debugMode') === 'true';
    if (storedDebugMode) {
      setIsDebugMode(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__DEBUG__ = true;
      logger.debug('Debug mode restored from localStorage');
    }
  }, []);

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
      localStorage.setItem('debugMode', 'true');
      // set a global flag so other components can detect debug mode
      // even after App removes the query param from the URL
      (window as any).__DEBUG__ = true;
      logger.debug('Debug mode enabled');
    }

    // Handle level jumping
    if (level !== null) {
      const levelIndex = parseInt(level, 10);
      const totalChallenges = getTotalChallenges();

      // Validate level index
      if (!isNaN(levelIndex) && levelIndex >= 0 && levelIndex < totalChallenges) {
        // Jump to specific level
        setCurrentChallengeIndex(levelIndex);
        logger.debug(`Debug: Jumped to level ${levelIndex}`);
      } else {
        logger.warn(
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
   * Block page refresh and detect cheating attempts (DevTools, localStorage manipulation)
   */
  useEffect(() => {
    // Allow DevTools and localStorage modification in debug mode
    if (isDebugMode) return;
    if (cheatDetected) return; // Don't set up listeners if already caught cheating

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
      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        triggerCheatDetection();
        return;
      }
      // Block Ctrl+Shift+I / Cmd+Option+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        triggerCheatDetection();
        return;
      }
      // Block Ctrl+Shift+C / Cmd+Option+U (DevTools Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        triggerCheatDetection();
        return;
      }
      // Block Ctrl+Shift+J / Cmd+Option+J (DevTools Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        triggerCheatDetection();
        return;
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        '⚠️ Refreshing the page will lose your progress! Are you sure you want to leave?';
    };

    // Detect DevTools opening by checking console timing
    const devToolsCheckInterval = setInterval(() => {
      const start = performance.now();
      debugger; // eslint-disable-line no-debugger
      const end = performance.now();

      // If debugger statement takes more than 100ms, DevTools are likely open
      if (end - start > 100) {
        if (!devToolsOpen) {
          setDevToolsOpen(true);
        }
        triggerCheatDetection();
      } else {
        // DevTools are closed
        if (devToolsOpen) {
          setDevToolsOpen(false);
        }
      }
    }, 500);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(devToolsCheckInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDebugMode, cheatDetected, devToolsOpen]);

  /**
   * Trigger cheat detection
   */
  const triggerCheatDetection = () => {
    const newAttemptCount = cheatAttemptCount + 1;
    setCheatAttemptCount(newAttemptCount);

    if (newAttemptCount === 1) {
      // First attempt - clear localStorage but allow to continue if DevTools closed
      localStorage.removeItem('game-store');
      setCheatDetected(true);
    } else {
      // Second attempt - permanently disable and clear all data
      localStorage.clear();
      setCheatDetected(true);
    }
  };

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
      {cheatDetected && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '3px solid #ff4444',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '500px',
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️✋</div>
            <h1 style={{ color: '#ff4444', marginBottom: '20px', fontSize: '28px' }}>
              CHEATING DETECTED
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
              {cheatAttemptCount === 1
                ? "Your progress has been cleared. Close DevTools to continue playing.\n\nIf you try to cheat again, the game will be permanently disabled."
                : 'You have been permanently banned from playing. All game data has been deleted.\n\nPlay fairly next time.'}
            </p>
            {cheatAttemptCount === 1 && (
              <p style={{ fontSize: '14px', color: '#ffaa00', fontStyle: 'italic' }}>
                ⏱️ Close DevTools now and you can still continue...
              </p>
            )}
            {cheatAttemptCount > 1 && (
              <p style={{ fontSize: '14px', color: '#ff6666' }}>
                This game session is permanently disabled.
              </p>
            )}
          </div>
        </div>
      )}
      <DebugPanel isDebugMode={isDebugMode} />
    </ThemeProvider>
  );
};

export default App;
