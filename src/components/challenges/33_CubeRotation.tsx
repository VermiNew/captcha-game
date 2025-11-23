import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

/**
 * Styled title
 */
const Title = styled(motion.h2)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
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
`;

/**
 * Styled cube wrapper
 */
const CubeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  perspective: 1000px;
`;

/**
 * Styled cube (3D CSS)
 */
const CubeElement = styled.div<{ $rotateX: number; $rotateY: number }>`
  width: 150px;
  height: 150px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(${(props) => props.$rotateX}deg) rotateY(${(props) => props.$rotateY}deg);
  transition: transform 0.6s ease;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

/**
 * Styled cube face
 */
const CubeFace = styled.div<{ $transform: string; $color: string }>`
  position: absolute;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
  background: ${(props) => props.$color};
  opacity: 0.9;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transform: ${(props) => props.$transform};
`;

/**
 * Styled label
 */
const CubeLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin: ${theme.spacing.md} 0 0 0;
`;

/**
 * Styled controls
 */
const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  margin: ${theme.spacing.lg} 0;
`;

/**
 * Styled button
 */
const ControlButton = styled(motion.button)`
  padding: ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: 2px solid ${theme.colors.primary};
  background: ${theme.colors.background};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary};
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * Styled submit button
 */
const SubmitButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};
  width: 100%;

  &:hover:not(:disabled) {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Styled feedback
 */
const Feedback = styled(motion.div)<{ $type: 'success' | 'error' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  background: ${(props) =>
    props.$type === 'success'
      ? `rgba(34, 197, 94, 0.1)`
      : `rgba(239, 68, 68, 0.1)`};
  color: ${(props) =>
    props.$type === 'success' ? theme.colors.success : theme.colors.error};
  border: 2px solid
    ${(props) =>
      props.$type === 'success' ? theme.colors.success : theme.colors.error};
`;

/**
 * Cube Rotation Challenge Component
 * Rotate a 3D cube to match target orientation
 */
const CubeRotationChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Target rotation angles
  const [targetRotateX] = useState(() => Math.random() * 360);
  const [targetRotateY] = useState(() => Math.random() * 360);

  // Player rotation angles
  const [playerRotateX, setPlayerRotateX] = useState(0);
  const [playerRotateY, setPlayerRotateY] = useState(0);

  const [feedback, setFeedback] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [startTime] = useState(() => Date.now());
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  /**
   * Handle mouse drag for rotation
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY };
  };

  /**
   * Handle mouse move
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setPlayerRotateX((prev) => prev - deltaY * 0.5);
      setPlayerRotateY((prev) => prev + deltaX * 0.5);

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
  const handleKeyRotation = (direction: string) => {
    const rotationStep = 15;
    switch (direction) {
      case 'up':
        setPlayerRotateX((prev) => prev - rotationStep);
        break;
      case 'down':
        setPlayerRotateX((prev) => prev + rotationStep);
        break;
      case 'left':
        setPlayerRotateY((prev) => prev - rotationStep);
        break;
      case 'right':
        setPlayerRotateY((prev) => prev + rotationStep);
        break;
    }
  };

  /**
   * Normalize angle to 0-360 range (handles negative modulo in JavaScript)
   */
  const normalizeAngle = (angle: number): number => {
    return ((angle % 360) + 360) % 360;
  };

  /**
   * Check if rotations match (within tolerance)
   */
  const checkMatch = () => {
    const tolerance = 15;
    
    // Normalize angles to 0-360 range
    const normalizedPlayerX = normalizeAngle(playerRotateX);
    const normalizedTargetX = normalizeAngle(targetRotateX);
    const normalizedPlayerY = normalizeAngle(playerRotateY);
    const normalizedTargetY = normalizeAngle(targetRotateY);
    
    // Calculate shortest angular distance (accounting for wraparound)
    const xDiff = Math.min(
      Math.abs(normalizedPlayerX - normalizedTargetX),
      360 - Math.abs(normalizedPlayerX - normalizedTargetX)
    );
    const yDiff = Math.min(
      Math.abs(normalizedPlayerY - normalizedTargetY),
      360 - Math.abs(normalizedPlayerY - normalizedTargetY)
    );

    const xMatch = xDiff < tolerance;
    const yMatch = yDiff < tolerance;

    if (xMatch && yMatch) {
      setFeedback('✓ Perfect match!');
      setIsSuccess(true);
      setTimeout(() => {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, 250);
      }, 1500);
    } else {
      setFeedback(`✗ Not quite. Try again! X: ${Math.round(xDiff)}° Y: ${Math.round(yDiff)}°`);
    }
  };

  /**
   * Reset cube
   */
  const resetCube = () => {
    setPlayerRotateX(0);
    setPlayerRotateY(0);
    setFeedback('');
  };

  return (
    <ChallengeBase
      title="3D Cube Rotation"
      description="Rotate the cube to match the target orientation"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Cube Rotation
        </Title>

        <Instruction>Drag the cube or use buttons to match the target orientation</Instruction>

        <CubesContainer>
          <div>
            <CubeLabel>Target</CubeLabel>
            <CubeWrapper>
              <CubeElement
                $rotateX={targetRotateX}
                $rotateY={targetRotateY}
              >
                <CubeFace $transform="rotateY(0deg) translateZ(75px)" $color="#e74c3c">
                  1
                </CubeFace>
                <CubeFace $transform="rotateY(180deg) translateZ(75px)" $color="#3498db">
                  6
                </CubeFace>
                <CubeFace $transform="rotateY(90deg) translateZ(75px)" $color="#2ecc71">
                  3
                </CubeFace>
                <CubeFace $transform="rotateY(-90deg) translateZ(75px)" $color="#f39c12">
                  4
                </CubeFace>
                <CubeFace $transform="rotateX(90deg) translateZ(75px)" $color="#9b59b6">
                  2
                </CubeFace>
                <CubeFace $transform="rotateX(-90deg) translateZ(75px)" $color="#1abc9c">
                  5
                </CubeFace>
              </CubeElement>
            </CubeWrapper>
          </div>

          <div>
            <CubeLabel>Your Cube</CubeLabel>
            <CubeWrapper>
              <CubeElement
                $rotateX={playerRotateX}
                $rotateY={playerRotateY}
                onMouseDown={handleMouseDown}
              >
                <CubeFace $transform="rotateY(0deg) translateZ(75px)" $color="#e74c3c">
                  1
                </CubeFace>
                <CubeFace $transform="rotateY(180deg) translateZ(75px)" $color="#3498db">
                  6
                </CubeFace>
                <CubeFace $transform="rotateY(90deg) translateZ(75px)" $color="#2ecc71">
                  3
                </CubeFace>
                <CubeFace $transform="rotateY(-90deg) translateZ(75px)" $color="#f39c12">
                  4
                </CubeFace>
                <CubeFace $transform="rotateX(90deg) translateZ(75px)" $color="#9b59b6">
                  2
                </CubeFace>
                <CubeFace $transform="rotateX(-90deg) translateZ(75px)" $color="#1abc9c">
                  5
                </CubeFace>
              </CubeElement>
            </CubeWrapper>
          </div>
        </CubesContainer>

        <Controls>
          <ControlButton
            onClick={() => handleKeyRotation('up')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ↑
          </ControlButton>
          <ControlButton
            onClick={() => handleKeyRotation('down')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ↓
          </ControlButton>
          <ControlButton
            onClick={() => handleKeyRotation('left')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ←
          </ControlButton>
          <ControlButton
            onClick={() => handleKeyRotation('right')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            →
          </ControlButton>
        </Controls>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, width: '100%' }}>
          <SubmitButton
            onClick={checkMatch}
            disabled={isSuccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Check Match
          </SubmitButton>
          <SubmitButton
            onClick={resetCube}
            disabled={isSuccess}
            $variant="secondary"
            style={{ background: theme.colors.surface, color: theme.colors.textPrimary, border: `2px solid ${theme.colors.borderLight}` }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </SubmitButton>
        </div>

        {feedback && (
          <Feedback
            $type={isSuccess ? 'success' : 'error'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {feedback}
          </Feedback>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default CubeRotationChallenge;
