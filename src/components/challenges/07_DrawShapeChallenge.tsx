import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Shapes to draw
 */
const shapes = ['star', 'heart', 'square', 'triangle', 'circle'];

/**
 * Shape to emoji mapping
 */
const shapeEmojis: Record<string, string> = {
  star: '⭐',
  heart: '❤️',
  square: '⬛',
  triangle: '🔺',
  circle: '⭕',
};

/**
 * Styled container
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  height: 100%;
  justify-content: space-between;
`;

/**
 * Styled title
 */
const Title = styled(motion.h2)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin: 0;
  flex-shrink: 0;
`;

/**
 * Styled shape to draw container
 */
const ShapeToDrawContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%);
  border-radius: ${theme.borderRadius.xl};
  width: 100%;
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;
`;

/**
 * Styled shape emoji
 */
const ShapeEmoji = styled(motion.div)`
  font-size: 4rem;
  line-height: 1;
`;

/**
 * Styled shape name
 */
const ShapeName = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  letter-spacing: 2px;
  margin: 0;
  text-transform: uppercase;
`;

/**
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  flex-shrink: 0;
`;

/**
 * Styled canvas container
 */
const CanvasContainer = styled(motion.div)`
  width: 100%;
  flex: 1;
  min-height: 0;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
`;

/**
 * Styled button group
 */
const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  flex-shrink: 0;
`;

/**
 * Styled action button
 */
const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  box-shadow: ${theme.shadows.md};
  white-space: nowrap;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }

    &:active {
      transform: translateY(0);
    }
  `
      : `
    background: ${theme.colors.background};
    border: 2px solid ${theme.colors.primary};
    color: ${theme.colors.primary};

    &:hover {
      background: ${theme.colors.surface};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }

    &:active {
      transform: translateY(0);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Draw Shape Challenge Component
 * User must draw a specified shape on canvas
 */
const DrawShapeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [shape] = useState(() =>
    shapes[Math.floor(Math.random() * shapes.length)],
  );
  const [startTime] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Get canvas paths to check if something was drawn
      const paths = await canvasRef.current?.exportPaths();

      if (!paths || paths.length === 0) {
        alert('Please draw something first!');
        setIsSubmitting(false);
        return;
      }

      // Simple validation: if user drew something, it's a success
      const timeSpent = (Date.now() - startTime) / 1000;
      const score = Math.max(100, 200 - Math.floor(timeSpent));

      setTimeout(() => {
        onComplete(true, timeSpent, score);
      }, 500);
    } catch (error) {
      console.error('Error submitting drawing:', error);
      alert('Error submitting drawing. Please try again.');
      setIsSubmitting(false);
    }
  };

  const shapeEmoji = shapeEmojis[shape] || '✨';

  return (
    <ChallengeBase
      title="Draw Shape Challenge"
      description={`Draw the ${shape} on the canvas`}
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
          Draw This Shape
        </Title>

        <ShapeToDrawContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ShapeEmoji
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
          >
            {shapeEmoji}
          </ShapeEmoji>
          <ShapeName>{shape}</ShapeName>
        </ShapeToDrawContainer>

        <Instruction>
          Use your mouse or finger to draw the shape above
        </Instruction>

        <CanvasContainer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={4}
            strokeColor={theme.colors.primary}
            canvasColor={theme.colors.background}
            style={{
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: `${theme.borderRadius.lg}`,
            }}
            width="100%"
            height="400px"
            onStroke={(stroke) => {
              // Optional: handle stroke events
              console.log('Stroke:', stroke);
            }}
          />
        </CanvasContainer>

        <ButtonGroup
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ActionButton
            $variant="secondary"
            onClick={handleUndo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ↶ Undo
          </ActionButton>
          <ActionButton
            $variant="secondary"
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️ Clear
          </ActionButton>
          <ActionButton
            $variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.05 } : {}}
            whileTap={!isSubmitting ? { scale: 0.95 } : {}}
          >
            {isSubmitting ? 'Submitting...' : '✓ Submit'}
          </ActionButton>
        </ButtonGroup>
      </Container>
    </ChallengeBase>
  );
};

export default DrawShapeChallenge;
