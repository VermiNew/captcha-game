import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Timer from './Timer';
import { theme } from '../../styles/theme';

/**
 * Constants
 */
const CUBE_SIZE = 180;
const ROTATION_STEP = 15;
const MATCH_TOLERANCE = 20;
const ROTATION_SENSITIVITY = 0.6;

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

/**
 * Styled instruction
 */
const Instruction = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.md};
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.md};
`;

/**
 * Styled cubes container
 */
const CubesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};
  width: 100%;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Styled cube section
 */
const CubeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

/**
 * Styled cube wrapper
 */
const CubeWrapper = styled.div<{ $interactive?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 350px;
  perspective: 1200px;
  user-select: none;
  cursor: ${props => props.$interactive ? 'grab' : 'default'};
  
  &:active {
    cursor: ${props => props.$interactive ? 'grabbing' : 'default'};
  }
`;

/**
 * Styled cube (3D CSS)
 */
const CubeElement = styled(motion.div)<{ $rotateX: number; $rotateY: number }>`
  width: ${CUBE_SIZE}px;
  height: ${CUBE_SIZE}px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(${props => props.$rotateX}deg) rotateY(${props => props.$rotateY}deg);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

/**
 * Styled cube face
 */
const CubeFace = styled.div<{ $transform: string; $color: string }>`
  position: absolute;
  width: ${CUBE_SIZE}px;
  height: ${CUBE_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: bold;
  color: white;
  background: ${props => props.$color};
  opacity: 0.95;
  border: 3px solid rgba(255, 255, 255, 0.4);
  transform: ${props => props.$transform};
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.2);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
`;

/**
 * Styled label
 */
const CubeLabel = styled.p<{ $highlight?: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$highlight ? theme.colors.primary : theme.colors.textPrimary};
  text-align: center;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/**
 * Styled controls
 */
const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 400px;
`;

/**
 * Control row
 */
const ControlRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
`;

/**
 * Styled button
 */
const ControlButton = styled(motion.button)`
  padding: ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  border: 2px solid ${theme.colors.primary};
  background: ${theme.colors.surface};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${theme.colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

/**
 * Action buttons
 */
const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled submit button
 */
const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  font-weight: ${theme.fontWeights.bold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.$variant === 'secondary' ? 
    theme.colors.surface : 
    `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  color: ${props => props.$variant === 'secondary' ? theme.colors.textPrimary : 'white'};
  border: ${props => props.$variant === 'secondary' ? `2px solid ${theme.colors.border}` : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};

  &:hover:not(:disabled) {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $type: 'success' | 'error' | 'info' }>`
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  background: ${props =>
    props.$type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
    props.$type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(59, 130, 246, 0.1)'};
  color: ${props =>
    props.$type === 'success' ? theme.colors.success :
    props.$type === 'error' ? theme.colors.error :
    theme.colors.info};
  border: 2px solid ${props =>
    props.$type === 'success' ? theme.colors.success :
    props.$type === 'error' ? theme.colors.error :
    theme.colors.info};
  width: 100%;
`;

/**
 * Angle display
 */
const AngleDisplay = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.border};
`;

const AngleItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const AngleLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AngleValue = styled(motion.span)<{ $close?: boolean }>`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$close ? theme.colors.success : theme.colors.primary};
`;

/**
 * Normalize angle to 0-360 range
 */
const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};

/**
 * Calculate angular difference
 */
const getAngularDiff = (angle1: number, angle2: number): number => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  return Math.min(diff, 360 - diff);
};

/**
 * Cube Rotation Challenge Component
 */
const CubeRotationChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [targetRotateX] = useState(() => Math.floor(Math.random() * 4) * 90);
  const [targetRotateY] = useState(() => Math.floor(Math.random() * 4) * 90);

  const [playerRotateX, setPlayerRotateX] = useState(0);
  const [playerRotateY, setPlayerRotateY] = useState(0);

  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [isSuccess, setIsSuccess] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [attempts, setAttempts] = useState(0);
  
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  /**
   * Calculate differences
   */
  const xDiff = useMemo(() => 
    getAngularDiff(playerRotateX, targetRotateX),
    [playerRotateX, targetRotateX]
  );

  const yDiff = useMemo(() => 
    getAngularDiff(playerRotateY, targetRotateY),
    [playerRotateY, targetRotateY]
  );

  const isCloseX = xDiff < MATCH_TOLERANCE * 1.5;
  const isCloseY = yDiff < MATCH_TOLERANCE * 1.5;

  /**
   * Handle mouse drag for rotation
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isSuccess) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY };
  }, [isSuccess]);

  /**
   * Handle mouse move
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setPlayerRotateX(prev => prev - deltaY * ROTATION_SENSITIVITY);
      setPlayerRotateY(prev => prev + deltaX * ROTATION_SENSITIVITY);

      dragRef.current = { startX: e.clientX, startY: e.clientY };
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  /**
   * Handle keyboard controls
   */
  const handleKeyRotation = useCallback((direction: string) => {
    if (isSuccess) return;
    
    switch (direction) {
      case 'up':
        setPlayerRotateX(prev => prev - ROTATION_STEP);
        break;
      case 'down':
        setPlayerRotateX(prev => prev + ROTATION_STEP);
        break;
      case 'left':
        setPlayerRotateY(prev => prev - ROTATION_STEP);
        break;
      case 'right':
        setPlayerRotateY(prev => prev + ROTATION_STEP);
        break;
    }
  }, [isSuccess]);

  /**
   * Check if rotations match
   */
  const checkMatch = useCallback(() => {
    if (isSuccess) return;

    setAttempts(prev => prev + 1);

    const xMatch = xDiff < MATCH_TOLERANCE;
    const yMatch = yDiff < MATCH_TOLERANCE;

    if (xMatch && yMatch) {
      setFeedback('🎉 Perfect match!');
      setFeedbackType('success');
      setIsSuccess(true);
      
      const timeSpent = (Date.now() - startTime) / 1000;
      const bonus = Math.max(0, 50 - attempts * 10);
      
      setTimeout(() => {
        onComplete(true, timeSpent, 250 + bonus);
      }, 2000);
    } else if (isCloseX && isCloseY) {
      setFeedback(`🔄 Very close! Keep adjusting... (X: ${Math.round(xDiff)}° Y: ${Math.round(yDiff)}°)`);
      setFeedbackType('info');
    } else {
      setFeedback(`❌ Not quite there yet. (X off by ${Math.round(xDiff)}°, Y off by ${Math.round(yDiff)}°)`);
      setFeedbackType('error');
    }
  }, [xDiff, yDiff, isCloseX, isCloseY, isSuccess, startTime, attempts, onComplete]);

  /**
   * Reset cube
   */
  const resetCube = useCallback(() => {
    setPlayerRotateX(0);
    setPlayerRotateY(0);
    setFeedback('');
  }, []);

  /**
   * Snap to nearest 90 degrees
   */
  const snapToGrid = useCallback(() => {
    setPlayerRotateX(prev => Math.round(prev / 90) * 90);
    setPlayerRotateY(prev => Math.round(prev / 90) * 90);
  }, []);

  return (
    <ChallengeBase
      title="3D Cube Rotation"
      description="Rotate the cube to match the target orientation"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
      hideTimer
    >
      <Timer timeLimit={timeLimit} />
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Instruction
          animate={{ 
            boxShadow: !isSuccess && (isCloseX || isCloseY) ? [
              '0 0 0 0 rgba(59, 130, 246, 0.4)',
              '0 0 0 8px rgba(59, 130, 246, 0)',
            ] : undefined
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isSuccess ? 
            '✓ Perfect! You matched the target orientation!' :
            '🎯 Drag the cube or use arrow buttons to rotate it'}
        </Instruction>

        <CubesContainer>
          <CubeSection>
            <CubeLabel>🎯 Target</CubeLabel>
            <CubeWrapper>
              <CubeElement
                $rotateX={targetRotateX}
                $rotateY={targetRotateY}
              >
                <CubeFace $transform={`rotateY(0deg) translateZ(${CUBE_SIZE/2}px)`} $color="#e74c3c">1</CubeFace>
                <CubeFace $transform={`rotateY(180deg) translateZ(${CUBE_SIZE/2}px)`} $color="#3498db">6</CubeFace>
                <CubeFace $transform={`rotateY(90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#2ecc71">3</CubeFace>
                <CubeFace $transform={`rotateY(-90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#f39c12">4</CubeFace>
                <CubeFace $transform={`rotateX(90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#9b59b6">2</CubeFace>
                <CubeFace $transform={`rotateX(-90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#1abc9c">5</CubeFace>
              </CubeElement>
            </CubeWrapper>
          </CubeSection>

          <CubeSection>
            <CubeLabel $highlight>🎮 Your Cube</CubeLabel>
            <CubeWrapper $interactive onMouseDown={handleMouseDown}>
              <CubeElement
                $rotateX={playerRotateX}
                $rotateY={playerRotateY}
              >
                <CubeFace $transform={`rotateY(0deg) translateZ(${CUBE_SIZE/2}px)`} $color="#e74c3c">1</CubeFace>
                <CubeFace $transform={`rotateY(180deg) translateZ(${CUBE_SIZE/2}px)`} $color="#3498db">6</CubeFace>
                <CubeFace $transform={`rotateY(90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#2ecc71">3</CubeFace>
                <CubeFace $transform={`rotateY(-90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#f39c12">4</CubeFace>
                <CubeFace $transform={`rotateX(90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#9b59b6">2</CubeFace>
                <CubeFace $transform={`rotateX(-90deg) translateZ(${CUBE_SIZE/2}px)`} $color="#1abc9c">5</CubeFace>
              </CubeElement>
            </CubeWrapper>
          </CubeSection>
        </CubesContainer>

        <AngleDisplay>
          <AngleItem>
            <AngleLabel>X Rotation</AngleLabel>
            <AngleValue $close={isCloseX}>
              {Math.round(normalizeAngle(playerRotateX))}°
            </AngleValue>
            <AngleLabel style={{ fontSize: theme.fontSizes.xs, opacity: 0.7 }}>
              Off by {Math.round(xDiff)}°
            </AngleLabel>
          </AngleItem>
          <AngleItem>
            <AngleLabel>Y Rotation</AngleLabel>
            <AngleValue $close={isCloseY}>
              {Math.round(normalizeAngle(playerRotateY))}°
            </AngleValue>
            <AngleLabel style={{ fontSize: theme.fontSizes.xs, opacity: 0.7 }}>
              Off by {Math.round(yDiff)}°
            </AngleLabel>
          </AngleItem>
        </AngleDisplay>

        <Controls>
          <ControlRow>
            <div />
            <ControlButton
              onClick={() => handleKeyRotation('up')}
              disabled={isSuccess}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↑
            </ControlButton>
            <div />
          </ControlRow>
          <ControlRow>
            <ControlButton
              onClick={() => handleKeyRotation('left')}
              disabled={isSuccess}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ←
            </ControlButton>
            <ControlButton
              onClick={snapToGrid}
              disabled={isSuccess}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontSize: theme.fontSizes.sm }}
            >
              Snap
            </ControlButton>
            <ControlButton
              onClick={() => handleKeyRotation('right')}
              disabled={isSuccess}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              →
            </ControlButton>
          </ControlRow>
          <ControlRow>
            <div />
            <ControlButton
              onClick={() => handleKeyRotation('down')}
              disabled={isSuccess}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↓
            </ControlButton>
            <div />
          </ControlRow>
        </Controls>

        <ActionButtons>
          <ActionButton
            $variant="primary"
            onClick={checkMatch}
            disabled={isSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✓ Check Match
          </ActionButton>
          <ActionButton
            $variant="secondary"
            onClick={resetCube}
            disabled={isSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔄 Reset
          </ActionButton>
        </ActionButtons>

        <AnimatePresence>
          {feedback && (
            <Feedback
              $type={feedbackType}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default CubeRotationChallenge;