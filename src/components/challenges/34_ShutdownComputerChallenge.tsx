import React, { useState, useRef, useEffect, useCallback } from 'react';
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
 * Styled container
 */
const Container = styled.div`
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
  max-width: 600px;
  height: 500px;
  background: linear-gradient(135deg, #0078d4 0%, #107c10 100%);
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
  font-family: ${theme.fonts.primary};
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
  background: linear-gradient(180deg, #343434 0%, #1e1e1e 100%);
  border-top: 1px solid #555;
  display: flex;
  align-items: center;
  padding: 0 ${theme.spacing.md};
  gap: ${theme.spacing.md};
`;

/**
 * Styled start button
 */
const StartButton = styled(motion.button)<{ $fake?: boolean }>`
  padding: 6px 12px;
  background: ${(props) => (props.$fake ? '#c0c0c0' : '#0078d4')};
  border: 2px outset ${(props) => (props.$fake ? '#dfdfdf' : '#0078d4')};
  color: white;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;

  &:active {
    border-style: inset;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
 * Styled menu
 */
const Menu = styled(motion.div)`
  position: absolute;
  bottom: 50px;
  left: 0;
  min-width: 200px;
  background: #c0c0c0;
  border: 2px outset #dfdfdf;
  border-right-color: #808080;
  border-bottom-color: #808080;
  box-shadow: 1px 1px 0 #dfdfdf;
  z-index: 100;
`;

/**
 * Styled menu item
 */
const MenuItem = styled(motion.button)<{ $fake?: boolean; $moving?: boolean }>`
  display: block;
  width: 100%;
  padding: 6px 12px;
  background: ${(props) => (props.$fake ? '#ffcccc' : '#c0c0c0')};
  border: none;
  text-align: left;
  font-family: MS Sans Serif, sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.1s;
  position: ${(props) => (props.$moving ? 'relative' : 'static')};

  &:hover {
    background: #000080;
    color: white;
  }

  &:active {
    background: #dfdfdf;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Styled dialog
 */
const Dialog = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #c0c0c0;
  border: 2px outset #dfdfdf;
  border-right-color: #808080;
  border-bottom-color: #808080;
  box-shadow: 1px 1px 0 #000000;
  min-width: 300px;
  z-index: 200;
`;

/**
 * Styled dialog title bar
 */
const DialogTitleBar = styled.div`
  background: linear-gradient(90deg, #000080, #1084d7);
  color: white;
  padding: 2px 2px;
  font-weight: bold;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/**
 * Styled dialog content
 */
const DialogContent = styled.div`
  padding: ${theme.spacing.md};
  font-size: 12px;
  font-family: MS Sans Serif, sans-serif;
`;

/**
 * Styled dialog buttons
 */
const DialogButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  justify-content: flex-end;
  background: #dfdfdf;
  border-top: 1px solid #dfdfdf;
`;

/**
 * Styled button
 */
const DialogButton = styled(motion.button)<{ $correct?: boolean }>`
  padding: 4px 12px;
  background: ${(props) => (props.$correct ? '#c0c0c0' : '#c0c0c0')};
  border: 2px outset #dfdfdf;
  border-right-color: #808080;
  border-bottom-color: #808080;
  font-family: MS Sans Serif, sans-serif;
  font-size: 11px;
  cursor: pointer;
  min-width: 75px;

  &:active {
    border-style: inset;
  }

  &:hover:not(:disabled) {
    background: #dfdfdf;
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
  color: #ffff55;
  font-family: 'Courier New', monospace;
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${theme.spacing.lg};
  font-size: 14px;
  line-height: 1.6;
  z-index: 500;
`;

/**
 * Styled notification
 */
const Notification = styled(motion.div)`
  position: absolute;
  top: 100px;
  right: 20px;
  background: #fffacd;
  border: 2px solid #808080;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: 12px;
  max-width: 200px;
  z-index: 150;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled stats
 */
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  gap: ${theme.spacing.lg};
`;

/**
 * Styled stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled stat value
 */
const StatValue = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Fake menu options
 */
const FAKE_OPTIONS = [
    'Programs',
    'Documents',
    'Settings',
    'Search',
    'Run',
    'Restart',
    'Sleep',
    'Hibernate',
    'Update & Shut Down',
    'Switch User',
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
    const [movingButtonId, setMovingButtonId] = useState<string | null>(null);
    const [movingButtonPos, setMovingButtonPos] = useState({ x: 0, y: 0 });
    const startButtonRef = useRef<HTMLButtonElement>(null);
    const osWindowRef = useRef<HTMLDivElement>(null);
    const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Cleanup notification timeout on unmount
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
    const showNotification = useCallback((text: string) => {
        setNotificationText(text);
        setNotificationVisible(true);
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        notificationTimeoutRef.current = setTimeout(() => {
            setNotificationVisible(false);
        }, 2000);
    }, []);

    /**
     * Handle fake button hover - move away
     */
    const handleFakeButtonHover = (buttonId: string) => {
        setMovingButtonId(buttonId);
        const newX = Math.random() * 100 - 50;
        const newY = Math.random() * 100 - 50;
        setMovingButtonPos({ x: newX, y: newY });
    };

    /**
     * Handle fake option click
     */
    const handleFakeOptionClick = () => {
        setErrorCount((prev) => prev + 1);
        setScore((prev) => Math.max(0, prev - 10));
        showNotification('Wrong option!');

        if (errorCount >= 2) {
            // BSOD on 3rd error
            setGameStep('bsod');
            return;
        }

        setStartMenuOpen(false);
        setPowerMenuOpen(false);
    };

    /**
     * Handle Start button click
     */
    const handleStartClick = () => {
        if (gameStep === 'desktop') {
            setGameStep('start');
            setStartMenuOpen(true);
        }
    };

    /**
     * Handle Power button click
     */
    const handlePowerClick = () => {
        setGameStep('power');
        setStartMenuOpen(false);
        setPowerMenuOpen(true);
    };

    /**
     * Handle Shutdown click
     */
    const handleShutdownClick = () => {
        setGameStep('confirm');
        setPowerMenuOpen(false);
    };

    /**
     * Handle Confirm click
     */
    const handleConfirmClick = () => {
        setGameStep('complete');
        setPowerMenuOpen(false);
        setScore((prev) => prev + Math.max(0, 30 - errorCount * 5));
        setTimeout(() => {
            onComplete(true, 0, score);
        }, 1500);
    };

    /**
     * Render desktop state
     */
    const renderDesktop = () => (
        <DesktopArea>
            <div style={{ color: 'white', fontSize: '12px' }}>
                Welcome to the Desktop
            </div>
        </DesktopArea>
    );

    /**
     * Render start menu
     */
    const renderStartMenu = () => (
        <Menu
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            {FAKE_OPTIONS.map((option, idx) => {
                const isFake = idx < FAKE_OPTIONS.length - 1;
                const isMoving = movingButtonId === `fake-${idx}`;

                return (
                    <MenuItem
                        key={idx}
                        $fake={isFake}
                        $moving={isMoving}
                        onClick={() => {
                            if (isFake) {
                                handleFakeOptionClick();
                            } else {
                                handlePowerClick();
                            }
                        }}
                        onMouseEnter={() => {
                            if (isFake && Math.random() > 0.6) {
                                handleFakeButtonHover(`fake-${idx}`);
                            }
                        }}
                        onMouseLeave={() => setMovingButtonId(null)}
                        animate={
                            isMoving
                                ? {
                                    x: movingButtonPos.x,
                                    y: movingButtonPos.y,
                                }
                                : { x: 0, y: 0 }
                        }
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        {option}
                    </MenuItem>
                );
            })}
        </Menu>
    );

    /**
     * Render power menu
     */
    const renderPowerMenu = () => (
        <Dialog
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
        >
            <DialogTitleBar>
                <span>Windows Power</span>
                <span>×</span>
            </DialogTitleBar>
            <DialogContent>What do you want to do?</DialogContent>
            <DialogButtons>
                {[
                    { label: 'Update and Shut Down', correct: false },
                    { label: 'Sleep', correct: false },
                    { label: 'Restart', correct: false },
                    { label: 'Shut Down', correct: true },
                ].map((btn, idx) => (
                    <DialogButton
                        key={idx}
                        $correct={btn.correct}
                        onClick={() => {
                            if (btn.correct) {
                                handleShutdownClick();
                            } else {
                                handleFakeOptionClick();
                            }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {btn.label}
                    </DialogButton>
                ))}
            </DialogButtons>
        </Dialog>
    );

    /**
     * Render confirm dialog
     */
    const renderConfirmDialog = () => (
        <Dialog
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
        >
            <DialogTitleBar>
                <span>Shut down Windows</span>
                <span>×</span>
            </DialogTitleBar>
            <DialogContent>
                Are you sure you want to shut down your computer?
            </DialogContent>
            <DialogButtons>
                <DialogButton onClick={handleConfirmClick} whileHover={{ scale: 1.05 }}>
                    Yes
                </DialogButton>
                <DialogButton
                    onClick={() => {
                        setGameStep('power');
                        setPowerMenuOpen(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                >
                    No
                </DialogButton>
            </DialogButtons>
        </Dialog>
    );

    /**
     * Render BSOD
     */
    const renderBSOD = () => (
        <BSOD
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div>A FATAL EXCEPTION 0E HAS OCCURRED AT 0028:C074B8A9</div>
            <div>The current application will be terminated.</div>
            <div>
                * Press any key to terminate the current application.
            </div>
            <div>* Press CTRL+ALT+DEL again to restart your computer.</div>
            <div style={{ marginTop: '20px' }}>
                You made too many mistakes! Try again.
            </div>
            <button
                onClick={() => {
                    setGameStep('desktop');
                    setStartMenuOpen(false);
                    setPowerMenuOpen(false);
                    setErrorCount(0);
                }}
                style={{
                    marginTop: '20px',
                    padding: '8px 16px',
                    background: '#00aa00',
                    color: '#ffff55',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Courier New',
                    fontSize: '14px',
                }}
            >
                Reset
            </button>
        </BSOD>
    );

    const stepNumber =
        gameStep === 'desktop'
            ? 0
            : gameStep === 'start'
                ? 1
                : gameStep === 'power'
                    ? 2
                    : gameStep === 'confirm'
                        ? 3
                        : 0;

    return (
        <ChallengeBase
            title="Shutdown Computer Challenge"
            description="Navigate through the OS and shut down the computer"
            timeLimit={timeLimit}
            challengeId={challengeId}
            onComplete={onComplete}
        >
            <Container>
                <OSWindow
                    ref={osWindowRef}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {gameStep === 'bsod' ? (
                        renderBSOD()
                    ) : (
                        <>
                            {renderDesktop()}

                            <TaskBar>
                                <StartButton ref={startButtonRef} onClick={handleStartClick}>
                                    Start
                                </StartButton>
                            </TaskBar>

                            <AnimatePresence>
                                {startMenuOpen && renderStartMenu()}
                            </AnimatePresence>

                            <AnimatePresence>
                                {powerMenuOpen &&
                                    (gameStep === 'power'
                                        ? renderPowerMenu()
                                        : renderConfirmDialog())}
                            </AnimatePresence>

                            <AnimatePresence>
                                {notificationVisible && (
                                    <Notification
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 100 }}
                                    >
                                        {notificationText}
                                    </Notification>
                                )}
                            </AnimatePresence>

                            {gameStep === 'complete' && (
                                <Dialog
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <DialogTitleBar>
                                        <span>Success</span>
                                    </DialogTitleBar>
                                    <DialogContent style={{ textAlign: 'center' }}>
                                        ✓ System shutting down...
                                    </DialogContent>
                                </Dialog>
                            )}
                        </>
                    )}
                </OSWindow>

                <StatsContainer>
                    <StatItem>
                        <StatLabel>Step</StatLabel>
                        <StatValue>
                            {stepNumber}/4
                        </StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Mistakes</StatLabel>
                        <StatValue>{errorCount}</StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Score</StatLabel>
                        <StatValue>{score}</StatValue>
                    </StatItem>
                </StatsContainer>
            </Container>
        </ChallengeBase>
    );
};

export default ShutdownComputerChallenge;
