import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import Button from './ui/Button';
import { theme } from '../styles/theme';
import { getTotalChallenges } from '../utils/challengeRegistry';

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
  background: ${theme.gradients.primary};
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
  font-size: ${theme.fontSizes.base};
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
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  overflow: hidden;
  backdrop-filter: blur(10px);
  max-height: 180px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-height: 140px;
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
    font-size: ${theme.fontSizes.base};
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
 * Styled features container
 */
const Features = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing['2xl']};
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    gap: ${theme.spacing.lg};
  }
`;

/**
 * Styled feature item
 */
const Feature = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: rgba(255, 255, 255, 0.12);
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 140px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-4px);
  }
`;

/**
 * Styled feature icon
 */
const FeatureIcon = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
`;

/**
 * Styled feature text
 */
const FeatureText = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: white;
  opacity: 0.9;
  font-weight: ${theme.fontWeights.medium};
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
          🤖 NOT A ROBOT
        </Title>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Subtitle>Prove you're human in {totalChallenges} fun challenges!</Subtitle>
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

        {/* Features */}
        <Features>
          <Feature
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureText>Fast-paced</FeatureText>
          </Feature>

          <Feature
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureText>Challenging</FeatureText>
          </Feature>

          <Feature
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <FeatureIcon>🎉</FeatureIcon>
            <FeatureText>Fun</FeatureText>
          </Feature>
        </Features>
      </Content>
    </Container>
  );
};

export default StartScreen;
