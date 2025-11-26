import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import Button from './ui/Button';
import { theme } from '../styles/theme';
import { getTotalChallenges } from '../utils/challengeRegistry';
import logoImg from '../assets/logo.png';

/**
 * Styled main container
 */
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, #1e5a96 0%, #2d7ab8 25%, #3d9fd3 50%, #5bb3dd 75%, #7fc8e9 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
    pointer-events: none;
  }

  @keyframes float {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }
`;

/**
 * Styled content wrapper
 */
const Content = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 650px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

/**
 * Styled title
 */
const Title = styled(motion.h1)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['5xl']};
  font-weight: ${theme.fontWeights.bold};
  color: white;
  margin: 0 0 ${theme.spacing.md} 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: ${theme.fontSizes['4xl']};
  }
`;

/**
 * Styled subtitle
 */
const Subtitle = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  line-height: 1.8;
  max-width: 500px;
  font-weight: ${theme.fontWeights.medium};
  position: relative;
  display: inline-block;

  /* Glitch effect layers */
  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }

  &::before {
    animation: glitch 1.5s infinite;
    color: #ff00ff;
    z-index: -1;
    text-shadow: -2px 0 #ff00ff;
  }

  &::after {
    animation: glitch 1.5s infinite reverse;
    color: #00ffff;
    z-index: -2;
    text-shadow: 2px 0 #00ffff;
  }

  @keyframes glitch {
    0% {
      clip-path: inset(40% 0 61% 0);
      transform: translate(-2px, -2px);
    }
    20% {
      clip-path: inset(92% 0 1% 0);
      transform: translate(2px, 2px);
    }
    40% {
      clip-path: inset(43% 0 1% 0);
      transform: translate(-2px, 1px);
    }
    60% {
      clip-path: inset(25% 0 58% 0);
      transform: translate(2px, -2px);
    }
    80% {
      clip-path: inset(54% 0 7% 0);
      transform: translate(-1px, 2px);
    }
    100% {
      clip-path: inset(58% 0 43% 0);
      transform: translate(0, 0);
    }
  }

  @media (max-width: 768px) {
    font-size: ${theme.fontSizes.lg};
  }
`;

/**
 * Styled start button container
 */
const StartButtonContainer = styled.div`
  margin: ${theme.spacing.lg} auto;
  display: flex;
  justify-content: center;
  width: 100%;
`;

/**
 * Styled instructions toggle button
 */
const InstructionsToggle = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  opacity: 0.9;
  font-size: ${theme.fontSizes.md};
  font-family: ${theme.fonts.primary};
  cursor: pointer;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  margin-top: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
  font-weight: ${theme.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-left: auto;
  margin-right: auto;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * Styled instructions card
 */
const InstructionsCard = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  overflow: hidden;
  backdrop-filter: blur(10px);
  max-height: 190px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-height: 175px;
    padding: ${theme.spacing.xs};
  }
`;

/**
 * Styled instructions list
 */
const InstructionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;

  li {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.md};
    color: ${theme.colors.textPrimary};
    padding: ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.borderLight};
    display: flex;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    &::before {
      content: '✓';
      color: ${theme.colors.success};
      font-weight: bold;
      margin-right: ${theme.spacing.md};
    }
  }
`;

/**
 * StartScreen Component
 * Main entry point - displays game intro and lets player start
 */
const StartScreen: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const { startGame } = useGameStore();
  const totalChallenges = getTotalChallenges();

  /**
   * Handle start button click
   */
  const handleStart = () => {
    startGame();
  };

  return (
    <Container>
      <Content
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Title */}
        <Title
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 160 }}>
            <img
              src={logoImg}
              alt="Robot Icon"
              loading="lazy"
              style={{ maxWidth: 160, height: 'auto', display: 'block', marginBottom: '16px', borderRadius: '20%', boxShadow: '0 12px 16px rgba(0, 0, 0, 0.2)' }}
            />
            <span style={{ display: 'block' }}>NOT A ROBOT</span>
          </div>
        </Title>
        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Subtitle
            as={motion.p}
            data-text={`Prove you're human in ${totalChallenges} fun challenges!`}
            style={{
              letterSpacing: '2px',
            }}
          >
            Prove you're human in {totalChallenges} fun challenges!
          </Subtitle>
        </motion.div>

        {/* Start Button */}
        <StartButtonContainer>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Button
              onClick={handleStart}
              variant="primary"
              size="lg"
              fullWidth={false}
            >
              Start Game
            </Button>
          </motion.div>
        </StartButtonContainer>

        {/* Instructions Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <InstructionsToggle onClick={() => setShowInstructions(!showInstructions)}>
            <span>{showInstructions ? '▼' : '▶'}</span>
            <span>How to Play</span>
          </InstructionsToggle>
        </motion.div>

        {/* Instructions Card */}
        <AnimatePresence>
          {showInstructions && (
            <InstructionsCard
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InstructionsList>
                <li>Complete all challenges to prove you're human</li>
                <li>Each challenge has a time limit - complete before it runs out</li>
                <li>Different challenges test different skills</li>
                <li>Earn points for speed and accuracy</li>
                <li>Your score depends on completion time and bonus points</li>
                <li>You can quit anytime, but progress won't be saved</li>
                <li>Try to get the highest score and beat your record!</li>
              </InstructionsList>
            </InstructionsCard>
          )}
        </AnimatePresence>
      </Content>
    </Container>
  );
};

export default StartScreen;
