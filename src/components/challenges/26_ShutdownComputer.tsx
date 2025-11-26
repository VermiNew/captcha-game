import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Game states
 */
type GameStep = 'desktop' | 'start' | 'power' | 'confirm' | 'complete' | 'bsod';

/**
 * Constants
 */
const MAX_ERRORS_BEFORE_BSOD = 3;
const ERROR_PENALTY = 10;
const COMPLETION_BONUS = 30;
const BUTTON_DODGE_CHANCE = 0.6;

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Styled OS window
 */
const OSWindow = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 700px;
  height: 550px;
  background: linear-gradient(135deg, #0078d4 0%, #107c10 100%);
  border: 4px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

/**
 * Styled taskbar
 */
const TaskBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  border-top: 1px solid #555;
  display: flex;
  align-items: center;
  padding: 0 ${theme.spacing.md};
  gap: ${theme.spacing.md};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
`;

/**
 * Styled start button
 */
const StartButton = styled(motion.button)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: 8px 16px;
  background: ${props => props.$active ? '#1a5fb4' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled clock
 */
const Clock = styled.div`
  margin-left: auto;
  color: white;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

/**
 * Styled desktop area
 */
const DesktopArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

/**
 * Desktop icon
 */
const DesktopIcon = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm};
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  max-width: 80px;
  text-align: center;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

/**
 * Styled menu
 */
const Menu = styled(motion.div)`
  position: absolute;
  bottom: 55px;
  left: 5px;
  min-width: 300px;
  background: rgba(45, 45, 45, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  overflow: hidden;
  z-index: 100;
`;

/**
 * Menu header
 */
const MenuHeader = styled.div`
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, #0078d4, #107c10);
  color: white;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * Styled menu item
 */
const MenuItem = styled(motion.button)<{ $fake?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: 12px ${theme.spacing.lg};
  background: ${props => props.$fake ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  border: none;
  text-align: left;
  color: ${props => props.$danger ? '#ef4444' : 'white'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover {
    background: ${props => props.$fake ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  }

  &:active {
    transform: scale(0.98);
  }

  &::before {
    content: '';
    width: 24px;
    height: 24px;
    background: ${props => 
      props.$danger ? '#ef4444' : 
      props.$fake ? '#f59e0b' : 
      '#6b7280'};
    border-radius: ${theme.borderRadius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

/**
 * Menu section
 */
const MenuSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${theme.spacing.sm} 0;
`;

/**
 * Styled dialog
 */
const Dialog = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(30, 30, 30, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  min-width: 400px;
  box-shadow: ${theme.shadows.lg};
  z-index: 200;
`;

/**
 * Styled dialog title bar
 */
const DialogTitleBar = styled.div`
  background: linear-gradient(90deg, #1a1a1a, #2d2d2d);
  color: white;
  padding: ${theme.spacing.md};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
`;

/**
 * Styled dialog content
 */
const DialogContent = styled.div`
  padding: ${theme.spacing.xl};
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
`;

/**
 * Styled dialog buttons
 */
const DialogButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  justify-content: flex-end;
  background: rgba(20, 20, 20, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
`;

/**
 * Styled button
 */
const DialogButton = styled(motion.button)<{ $primary?: boolean }>`
  padding: 10px 24px;
  background: ${props => props.$primary ? '#0078d4' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$primary ? '#0078d4' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  min-width: 90px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$primary ? '#106ebe' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled BSOD
 */
const BSOD = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0000aa;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${theme.spacing.md};
  font-size: 14px;
  line-height: 1.8;
  z-index: 500;
`;

/**
 * Styled notification
 */
const Notification = styled(motion.div)<{ $type: 'error' | 'info' }>`
  position: absolute;
  top: 80px;
  right: 20px;
  background: ${props => props.$type === 'error' ? 
    'linear-gradient(135deg, #ef4444, #dc2626)' : 
    'linear-gradient(135deg, #3b82f6, #2563eb)'};
  color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-size: 14px;
  font-weight: 600;
  max-width: 250px;
  z-index: 150;
  box-shadow: ${theme.shadows.lg};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

/**
 * Styled stats
 */
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 700px;
`;

/**
 * Styled stat card
 */
const StatCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.border};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Styled stat value
 */
const StatValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Fake menu options with icons
 */
const FAKE_OPTIONS = [
  { label: 'Programs', icon: '📁', fake: true },
  { label: 'Documents', icon: '📄', fake: true },
  { label: 'Settings', icon: '⚙️', fake: true },
  { label: 'Search', icon: '🔍', fake: true },
  { label: 'Run', icon: '▶️', fake: true },
];

/**
 * Power options
 */
const POWER_OPTIONS = [
  { label: 'Sleep', icon: '🌙', fake: true },
  { label: 'Restart', icon: '🔄', fake: true },
  { label: 'Update & Shut Down', icon: '⬇️', fake: true },
  { label: 'Shut Down', icon: '⏻', fake: false, danger: true },
];

/**
 * Shutdown Computer Challenge Component
 */
const ShutdownComputerChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [gameStep, setGameStep] = useState<GameStep>('desktop');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [score, setScore] = useState(100);
  const [notificationText, setNotificationText] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationType, setNotificationType] = useState<'error' | 'info'>('error');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime] = useState(() => Date.now());

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update clock
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Cleanup notification timeout
   */
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Show notification
   */
  const showNotification = useCallback((text: string, type: 'error' | 'info' = 'error') => {
    setNotificationText(text);
    setNotificationType(type);
    setNotificationVisible(true);
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      setNotificationVisible(false);
    }, 2500);
  }, []);

  /**
   * Handle fake option click
   */
  const handleFakeOptionClick = useCallback(() => {
    setErrorCount(prev => prev + 1);
    setScore(prev => Math.max(0, prev - ERROR_PENALTY));
    showNotification('❌ Wrong option! Try again.', 'error');

    if (errorCount + 1 >= MAX_ERRORS_BEFORE_BSOD) {
      setGameStep('bsod');
      return;
    }

    setStartMenuOpen(false);
    setPowerMenuOpen(false);
  }, [errorCount, showNotification]);

  /**
   * Handle Start button click
   */
  const handleStartClick = useCallback(() => {
    if (gameStep === 'desktop') {
      setGameStep('start');
      setStartMenuOpen(true);
      showNotification('💡 Find "Power" option', 'info');
    }
  }, [gameStep, showNotification]);

  /**
   * Handle Power button click
   */
  const handlePowerClick = useCallback(() => {
    setGameStep('power');
    setStartMenuOpen(false);
    setPowerMenuOpen(true);
    showNotification('✓ Good! Now find "Shut Down"', 'info');
  }, [showNotification]);

  /**
   * Handle Shutdown click
   */
  const handleShutdownClick = useCallback(() => {
    setGameStep('confirm');
    setPowerMenuOpen(false);
    showNotification('✓ Almost there!', 'info');
  }, [showNotification]);

  /**
   * Handle Confirm click
   */
  const handleConfirmClick = useCallback(() => {
    setGameStep('complete');
    setPowerMenuOpen(false);
    const bonus = Math.max(0, COMPLETION_BONUS - errorCount * 5);
    setScore(prev => prev + bonus);
    
    setTimeout(() => {
      const timeSpent = (Date.now() - startTime) / 1000;
      onComplete(true, timeSpent, score + bonus);
    }, 2000);
  }, [errorCount, score, startTime, onComplete]);

  /**
   * Reset game from BSOD
   */
  const handleReset = useCallback(() => {
    setGameStep('desktop');
    setStartMenuOpen(false);
    setPowerMenuOpen(false);
    setErrorCount(0);
    setScore(100);
  }, []);

  /**
   * Calculate step progress
   */
  const stepNumber = useMemo(() => {
    const steps = { desktop: 1, start: 2, power: 3, confirm: 4, complete: 4, bsod: 0 };
    return steps[gameStep];
  }, [gameStep]);

  /**
   * Format time
   */
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }, [currentTime]);

  if (gameStep === 'bsod') {
    return (
      <ChallengeBase
        title="Shutdown Computer Challenge"
        description="Navigate through the OS and shut down the computer"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <Container>
          <OSWindow>
            <BSOD
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ fontSize: '24px', marginBottom: '20px' }}>:(</div>
              <div>Your PC ran into a problem and needs to restart.</div>
              <div>We're just collecting some error info, and then we'll restart for you.</div>
              <div style={{ marginTop: '40px' }}>
                Error Code: TOO_MANY_MISTAKES
              </div>
              <div style={{ marginTop: '20px', opacity: 0.7 }}>
                You clicked the wrong options {errorCount} times!
              </div>
              <motion.button
                onClick={handleReset}
                style={{
                  marginTop: '40px',
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: '#0000aa',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Segoe UI',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Restart Challenge
              </motion.button>
            </BSOD>
          </OSWindow>
        </Container>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Shutdown Computer Challenge"
      description="Navigate through the OS and shut down the computer"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <OSWindow>
          <DesktopArea>
            <DesktopIcon
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div style={{ fontSize: '32px' }}>💻</div>
              <div>This PC</div>
            </DesktopIcon>
          </DesktopArea>

          <TaskBar>
            <StartButton 
              $active={startMenuOpen}
              onClick={handleStartClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={{ fontSize: '18px' }}>⊞</span>
              Start
            </StartButton>
            
            <Clock>
              <div style={{ fontWeight: 'bold' }}>{formattedTime}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{formattedDate}</div>
            </Clock>
          </TaskBar>

          <AnimatePresence>
            {startMenuOpen && (
              <Menu
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <MenuHeader>Windows Menu</MenuHeader>
                
                <div>
                  {FAKE_OPTIONS.map((option, idx) => (
                    <MenuItem
                      key={idx}
                      $fake={option.fake}
                      onClick={handleFakeOptionClick}
                      whileHover={{ x: 4 }}
                    >
                      <span style={{ fontSize: '18px' }}>{option.icon}</span>
                      {option.label}
                    </MenuItem>
                  ))}
                </div>

                <MenuSection>
                  <MenuItem
                    onClick={handlePowerClick}
                    $danger
                    whileHover={{ x: 4 }}
                  >
                    <span style={{ fontSize: '18px' }}>⏻</span>
                    Power
                  </MenuItem>
                </MenuSection>
              </Menu>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {powerMenuOpen && gameStep === 'power' && (
              <Dialog
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitleBar>
                  <span>⏻ Power Options</span>
                </DialogTitleBar>
                <DialogContent>
                  {POWER_OPTIONS.map((option, idx) => (
                    <MenuItem
                      key={idx}
                      $fake={option.fake}
                      $danger={option.danger}
                      onClick={() => {
                        if (option.fake) {
                          handleFakeOptionClick();
                        } else {
                          handleShutdownClick();
                        }
                      }}
                      whileHover={{ x: 4 }}
                      style={{ marginBottom: idx < POWER_OPTIONS.length - 1 ? '8px' : 0 }}
                    >
                      <span style={{ fontSize: '18px' }}>{option.icon}</span>
                      {option.label}
                    </MenuItem>
                  ))}
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gameStep === 'confirm' && (
              <Dialog
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitleBar>
                  <span>Confirm Shutdown</span>
                </DialogTitleBar>
                <DialogContent>
                  Are you sure you want to shut down your computer?
                  <br /><br />
                  Any unsaved work will be lost.
                </DialogContent>
                <DialogButtons>
                  <DialogButton
                    onClick={() => {
                      setGameStep('power');
                      setPowerMenuOpen(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </DialogButton>
                  <DialogButton
                    $primary
                    onClick={handleConfirmClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Shut Down
                  </DialogButton>
                </DialogButtons>
              </Dialog>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gameStep === 'complete' && (
              <Dialog
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitleBar>
                  <span>✓ Success</span>
                </DialogTitleBar>
                <DialogContent style={{ textAlign: 'center', padding: `${theme.spacing.xl}` }}>
                  <div style={{ fontSize: '48px', marginBottom: theme.spacing.lg }}>
                    ⏻
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    System shutting down...
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notificationVisible && (
              <Notification
                $type={notificationType}
                initial={{ opacity: 0, x: 100, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                {notificationText}
              </Notification>
            )}
          </AnimatePresence>
        </OSWindow>

        <StatsContainer>
          <StatCard whileHover={{ scale: 1.05 }}>
            <StatLabel>Progress</StatLabel>
            <StatValue
              key={stepNumber}
              animate={{ scale: [1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              {stepNumber}/4
            </StatValue>
          </StatCard>

          <StatCard whileHover={{ scale: 1.05 }}>
            <StatLabel>Mistakes</StatLabel>
            <StatValue
              key={errorCount}
              animate={{ 
                scale: errorCount > 0 ? [1.3, 1] : 1,
                color: errorCount >= 2 ? theme.colors.error : theme.colors.primary
              }}
            >
              {errorCount}/{MAX_ERRORS_BEFORE_BSOD}
            </StatValue>
          </StatCard>

          <StatCard whileHover={{ scale: 1.05 }}>
            <StatLabel>Score</StatLabel>
            <StatValue
              key={score}
              animate={{ scale: [1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              {score}
            </StatValue>
          </StatCard>
        </StatsContainer>
      </Container>
    </ChallengeBase>
  );
};

export default ShutdownComputerChallenge;