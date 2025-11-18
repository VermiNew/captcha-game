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
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
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
  max-width: 600px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 ${theme.spacing['2xl']} 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: ${theme.fontSizes.lg};
  }
`;

/**
 * Styled start button container
 */
const StartButtonContainer = styled.div`
  margin: ${theme.spacing['2xl']} auto;
  display: flex;
  justify-content: center;
  width: 100%;
`;

/**
 * Styled instructions toggle button
 */
const InstructionsToggle = styled.button`
  background: transparent;
  border: none;
  color: white;
  opacity: 0.8;
  font-size: ${theme.fontSizes.sm};
  font-family: ${theme.fonts.primary};
  cursor: pointer;
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

/**
 * Styled instructions card
 */
const InstructionsCard = styled(motion.div)`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  overflow: hidden;
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
  gap: ${theme.spacing['2xl']};
  margin-top: ${theme.spacing['3xl']};
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
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(10px);
  min-width: 120px;
`;

/**
 * Styled feature icon
 */
const FeatureIcon = styled.div`
  font-size: ${theme.fontSizes['3xl']};
  line-height: 1;
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
        <InstructionsToggle onClick={() => setShowInstructions(!showInstructions)}>
          {showInstructions ? '▼' : '▶'} How to Play
        </InstructionsToggle>

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
                <li>Complete 10 different challenges</li>
                <li>Each challenge has a time limit</li>
                <li>Earn points for speed and accuracy</li>
                <li>Try to get the highest score!</li>
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
