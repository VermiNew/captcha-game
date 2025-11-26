import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/gameStore';
import { getTotalChallenges } from '../utils/challengeRegistry';
import { theme } from '../styles/theme';

const PanelWrap = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  font-family: ${theme.fonts.mono};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

/* Collapsed toggle button */
const ToggleButton = styled.button<{ $isCollapsed?: boolean }>`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.7));
  color: #ffffff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
  cursor: pointer;
  font-weight: 700;
  font-size: ${theme.fontSizes.xs};
  display: flex;
  gap: 8px;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(168, 85, 247, 0.8));
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/* Panel container with glass effect */
const PanelContainer = styled.div`
  width: 320px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* Info section */
const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
`;

/* Info row */
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.fontSizes.xs};
  color: rgba(255, 255, 255, 0.8);
`;

const InfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 11px;
`;

const InfoValue = styled.span`
  color: #00ff9f;
  font-weight: 700;
  font-size: ${theme.fontSizes.sm};
`;

/* Controls section */
const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

/* Navigation group */
const NavGroup = styled.div`
  display: flex;
  gap: 8px;
`;

/* Jump group */
const JumpGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

/* Primary button */
const PrimaryButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.6));
  color: #ffffff;
  border: none;
  padding: 9px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: ${theme.fontSizes.xs};
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-family: ${theme.fonts.mono};
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(168, 85, 247, 0.8));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* Secondary button */
const SecondaryButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 9px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: ${theme.fontSizes.xs};
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-family: ${theme.fonts.mono};
  
  &:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/* Danger button */
const DangerButton = styled(SecondaryButton)`
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(239, 68, 68, 1);
  }
`;

/* Jump input */
const JumpInput = styled.input`
  width: 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #00ff9f;
  padding: 8px;
  border-radius: 6px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xs};
  font-weight: 700;
  text-align: center;
  outline: none;
  
  &:focus {
    border-color: rgba(99, 102, 241, 0.6);
    background: rgba(99, 102, 241, 0.1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

/* Icon wrapper */
const Icon = ({ children }: { children: React.ReactNode }) => (
  <span style={{ display: 'inline-flex', width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </span>
);

interface DebugPanelProps {
  isDebugMode: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isDebugMode }) => {
  const { currentChallengeIndex, setCurrentChallengeIndex, resetGame, totalScore } = useGameStore();
  const [jumpLevel, setJumpLevel] = useState<string>(String(currentChallengeIndex + 1));
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [hidden, setHidden] = useState<boolean>(false);
  const totalChallenges = getTotalChallenges();

  useEffect(() => setJumpLevel(String(currentChallengeIndex + 1)), [currentChallengeIndex]);

  if (!isDebugMode || hidden) return null;

  const handlePrevious = () => {
    if (currentChallengeIndex > 0) setCurrentChallengeIndex(currentChallengeIndex - 1);
  };

  const handleNext = () => {
    if (currentChallengeIndex < totalChallenges - 1) setCurrentChallengeIndex(currentChallengeIndex + 1);
  };

  const handleJump = () => {
    const levelNumber = parseInt(jumpLevel, 10);
    const levelIndex = levelNumber - 1;
    if (!isNaN(levelNumber) && levelIndex >= 0 && levelIndex < totalChallenges) {
      setCurrentChallengeIndex(levelIndex);
    }
  };

  const handleReset = () => resetGame();

  const handleDisableDebug = () => {
    if (confirm('Disable debug mode?')) {
      localStorage.removeItem('debugMode');
      window.location.reload();
    }
  };

  const handleHidePanel = () => {
    setHidden(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  return (
    <PanelWrap>
      <ToggleButton
        onClick={() => setCollapsed((c) => !c)}
        aria-pressed={collapsed}
        $isCollapsed={collapsed}
        title={collapsed ? 'Expand debug panel' : 'Collapse debug panel'}
      >
        <Icon>
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6h12v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Icon>
        DEBUG
      </ToggleButton>

      {!collapsed && (
        <PanelContainer role="region" aria-label="Debug panel">
          {/* Info Section */}
          <InfoSection>
            <InfoRow>
              <InfoLabel>Level</InfoLabel>
              <InfoValue>
                {currentChallengeIndex + 1} / {totalChallenges}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Score</InfoLabel>
              <InfoValue>{totalScore}</InfoValue>
            </InfoRow>
          </InfoSection>

          {/* Controls Section */}
          <ControlsSection>
            {/* Navigation */}
            <NavGroup>
              <PrimaryButton onClick={handlePrevious} disabled={currentChallengeIndex === 0} title="Go to previous challenge">
                <Icon>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Icon>
                Prev
              </PrimaryButton>

              <PrimaryButton onClick={handleNext} disabled={currentChallengeIndex === totalChallenges - 1} title="Go to next challenge">
                Next
                <Icon>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Icon>
              </PrimaryButton>
            </NavGroup>

            {/* Jump to level */}
            <JumpGroup>
              <JumpInput
                type="number"
                value={jumpLevel}
                onChange={(e) => setJumpLevel(e.target.value)}
                onKeyPress={handleKeyPress}
                min={1}
                max={totalChallenges}
                placeholder="1"
                aria-label="Jump to level"
              />
              <PrimaryButton onClick={handleJump} title="Jump to level (Enter)">
                Go
              </PrimaryButton>
            </JumpGroup>

            {/* Reset */}
            <SecondaryButton onClick={handleReset} title="Reset game progress">
              <Icon>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12a9 9 0 10-3 6.7L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Icon>
              Reset
            </SecondaryButton>

            {/* Actions */}
            <NavGroup>
              <DangerButton onClick={handleDisableDebug} title="Exit debug mode">
                <Icon>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9m4 0V7a2 2 0 012-2h6a2 2 0 012 2v2m0 0H3m18 0h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Icon>
                Exit
              </DangerButton>

              <SecondaryButton onClick={handleHidePanel} title="Temporarily hide panel">
                <Icon>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856A10.034 10.034 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.969 9.969 0 01-1.564 4.803m3.102-7.803a.75.75 0 11-1.06-1.06m-6.708 6.708a.75.75 0 11-1.06-1.06" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Icon>
                Hide
              </SecondaryButton>
            </NavGroup>
          </ControlsSection>
        </PanelContainer>
      )}
    </PanelWrap>
  );
};

export default DebugPanel;
