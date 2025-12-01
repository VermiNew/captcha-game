import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
 
import { theme } from '../../styles/theme';

/**
 * Ad window state
 */
interface AdWindow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  title: string;
}

/**
 * Container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Game area
 */
const GameArea = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: ${theme.borderRadius.lg};
  border: 3px solid ${theme.colors.primary};
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
`;

/**
 * Single ad window
 */
const AdWindowContainer = styled(motion.div)<{ $closed?: boolean }>`
  position: absolute;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  border-radius: ${theme.borderRadius.md};
  border: 3px solid #ff5252;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
  overflow: hidden;
  cursor: grab;
  opacity: ${(props) => (props.$closed ? 0 : 1)};

  &:active {
    cursor: grabbing;
  }
`;

/**
 * Window title bar
 */
const TitleBar = styled.div`
  background: linear-gradient(90deg, #ff5252, #ff6b6b);
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-weight: bold;
  font-size: ${theme.fontSizes.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
`;

/**
 * Close button
 */
const CloseButton = styled.button`
  background: #ff1744;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  font-size: ${theme.fontSizes.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: #f50057;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

/**
 * Window content
 */
const WindowContent = styled.div`
  padding: ${theme.spacing.md};
  color: white;
  font-size: ${theme.fontSizes.sm};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: bold;
  pointer-events: none;
`;

/**
 * Instructions
 */
const Instructions = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Stats display
 */
const StatsDisplay = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
`;

/**
 * Stat item
 */
const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

/**
 * Label
 */
const Label = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Feedback message
 */
const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  background: ${(props) =>
    props.$success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  text-align: center;
  width: 100%;
`;

/**
 * Emoji
 */
const Emoji = styled.span`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
`;

// Ad titles to display
const AD_TITLES = [
  'FREE DOWNLOAD',
  'CLICK HERE NOW!',
  '⚡ LIMITED TIME',
  '🎁 PRIZE ALERT',
  'SPECIAL OFFER',
  'UNLOCK NOW',
  '💰 EARN MONEY',
];

/**
 * Close Ad Windows Challenge Component
 */
const CloseAdWindowsChallenge: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const [startTime] = useState(() => Date.now());
  const [adWindows, setAdWindows] = useState<AdWindow[]>([]);
  const [closed, setClosed] = useState(0);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const [completed, setCompleted] = useState(false);

  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const adCountRef = useRef(0);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Generate random position within game area
   */
  const getRandomPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 0, y: 0 };
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const maxWidth = 280;
    const maxHeight = 140;
    
    const x = Math.random() * (rect.width - maxWidth);
    const y = Math.random() * (rect.height - maxHeight);
    
    return { x, y };
  }, []);

  /**
   * Spawn a new ad window
   */
  const spawnAdWindow = useCallback(() => {
    if (completed || totalSpawned >= 15) return;

    const { x, y } = getRandomPosition();
    const adId = `ad-${adCountRef.current++}`;
    const title = AD_TITLES[Math.floor(Math.random() * AD_TITLES.length)];

    setAdWindows((prev) => [
      ...prev,
      {
        id: adId,
        x,
        y,
        width: 280,
        height: 140,
        active: true,
        title,
      },
    ]);

    setTotalSpawned((prev) => prev + 1);
  }, [completed, totalSpawned, getRandomPosition]);

  /**
   * Close an ad window
   */
  const handleCloseAd = (adId: string) => {
    setAdWindows((prev) =>
      prev.map((ad) => (ad.id === adId ? { ...ad, active: false } : ad))
    );
    setClosed((prev) => prev + 1);
  };

  /**
   * Spawn ads at intervals
   */
  useEffect(() => {
    if (completed) return;

    spawnIntervalRef.current = setInterval(() => {
      spawnAdWindow();
    }, 700);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [completed, totalSpawned, spawnAdWindow]);

  /**
   * Check game completion
   */
  useEffect(() => {
    if (totalSpawned >= 15) {
      completionTimeoutRef.current = setTimeout(() => {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const score = Math.max(0, closed * 15);
        const success = closed >= 12;

        finalTimeoutRef.current = setTimeout(() => {
          onComplete(success, timeSpent, score);
        }, 1000);
      }, 1100);

      return () => {
        if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
        if (finalTimeoutRef.current) clearTimeout(finalTimeoutRef.current);
      };
    }
  }, [totalSpawned, closed, startTime, onComplete]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
      if (finalTimeoutRef.current) clearTimeout(finalTimeoutRef.current);
    };
  }, []);

  if (completed) {
    const success = closed >= 12;

    return (
      <ChallengeBase
        title="Close Ad Windows Challenge"
        description="Close all annoying advertisement windows"
   
  
      >
        <FeedbackMessage
          $success={success}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>{success ? '✅' : '😅'}</Emoji>
          <span>{success ? 'All ads closed!' : 'Good effort!'}</span>
          <span>
            Closed: {closed}/15
          </span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  return (
    <ChallengeBase
      title="Close Ad Windows Challenge"
      description="Close all annoying advertisement windows"
 

    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Instructions>Close the ad windows by clicking the X button in the top-right corner!</Instructions>

        <GameArea
          ref={gameAreaRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AnimatePresence>
            {adWindows.map((ad) => (
              ad.active && (
                <AdWindowContainer
                  key={ad.id}
                  style={{
                    left: ad.x,
                    top: ad.y,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  drag
                  dragMomentum={false}
                  dragElastic={0.2}
                >
                  <TitleBar>
                    <span>{ad.title}</span>
                    <CloseButton onClick={() => handleCloseAd(ad.id)}>×</CloseButton>
                  </TitleBar>
                  <WindowContent>
                    <span>💰 Click here to claim your prize! 💰</span>
                  </WindowContent>
                </AdWindowContainer>
              )
            ))}
          </AnimatePresence>
        </GameArea>

        <StatsDisplay>
          <StatItem>
            <Label>Closed</Label>
            <span>{closed}</span>
          </StatItem>
          <StatItem>
            <Label>Total</Label>
            <span>
              {totalSpawned}/15
            </span>
          </StatItem>
        </StatsDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default CloseAdWindowsChallenge;
