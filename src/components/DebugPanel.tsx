import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/gameStore';
import { getTotalChallenges } from '../utils/challengeRegistry';
import { theme } from '../styles/theme';

/**
 * Styled debug panel container
 */
const PanelContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-top: 2px solid ${theme.colors.primary};
  padding: ${theme.spacing.md};
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
  z-index: 9999;
  font-family: ${theme.fonts.mono};
  color: #00ff00;
  font-size: ${theme.fontSizes.sm};
  overflow-x: auto;
`;

/**
 * Styled label
 */
const Label = styled.span`
  color: #888;
  margin-right: ${theme.spacing.sm};
`;

/**
 * Styled value
 */
const Value = styled.span`
  color: #00ff00;
  font-weight: bold;
`;

/**
 * Styled button
 */
const DebugButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xs};
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary};
    opacity: 0.8;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled input for level navigation
 */
const LevelInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${theme.colors.primary};
  color: #00ff00;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xs};
  width: 50px;

  &:focus {
    outline: none;
    border-color: #00ff00;
  }
`;

/**
 * Styled divider
 */
const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: #444;
`;

interface DebugPanelProps {
  isDebugMode: boolean;
}

/**
 * Debug Panel Component
 * Displays admin controls for testing and navigation
 */
const DebugPanel: React.FC<DebugPanelProps> = ({ isDebugMode }) => {
  const {
    currentChallengeIndex,
    setCurrentChallengeIndex,
    setGameState,
    resetGame,
    totalScore,
  } = useGameStore();

  const [jumpLevel, setJumpLevel] = useState<string>(
    String(currentChallengeIndex)
  );
  const totalChallenges = getTotalChallenges();

  useEffect(() => {
    setJumpLevel(String(currentChallengeIndex));
  }, [currentChallengeIndex]);

  if (!isDebugMode) {
    return null;
  }

  const handlePrevious = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(currentChallengeIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentChallengeIndex < totalChallenges - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    }
  };

  const handleJump = () => {
    const levelIndex = parseInt(jumpLevel, 10);
    if (!isNaN(levelIndex) && levelIndex >= 0 && levelIndex < totalChallenges) {
      setCurrentChallengeIndex(levelIndex);
    }
  };

  const handleReset = () => {
    resetGame();
    setGameState('idle');
  };

  return (
    <PanelContainer>
      <Label>DEBUG MODE:</Label>

      <Label>Level:</Label>
      <Value>{currentChallengeIndex + 1}</Value>
      <Label>/ {totalChallenges}</Label>

      <Divider />

      <Label>Score:</Label>
      <Value>{totalScore}</Value>

      <Divider />

      <DebugButton onClick={handlePrevious} disabled={currentChallengeIndex === 0}>
        ← PREV
      </DebugButton>

      <DebugButton onClick={handleNext} disabled={currentChallengeIndex === totalChallenges - 1}>
        NEXT →
      </DebugButton>

      <Divider />

      <Label>Jump to:</Label>
      <LevelInput
        type="number"
        value={jumpLevel}
        onChange={(e) => setJumpLevel(e.target.value)}
        min="0"
        max={totalChallenges - 1}
      />
      <DebugButton onClick={handleJump}>GO</DebugButton>

      <Divider />

      <DebugButton onClick={handleReset}>RESET</DebugButton>
    </PanelContainer>
  );
};

export default DebugPanel;
