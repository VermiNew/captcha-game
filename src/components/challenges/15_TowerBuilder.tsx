import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Block colors from gradient theme
 */
const BLOCK_COLORS = [
    '#667EEA', // primary blue
    '#764BA2', // primary purple
    '#F093FB', // sunset pink
    '#F5576C', // sunset red
    '#4FACFE', // ocean blue
    '#00F2FE', // ocean cyan
    '#FFD1FF', // candy light
    '#FFA8E1', // candy dark
];

/**
 * Game constants
 */
const BLOCK_WIDTH = 80;
const BLOCK_HEIGHT = 40;
const CONTAINER_WIDTH = 300;
const TARGET_BLOCKS = 8;
const MIN_OVERLAP_PERCENTAGE = 30; // minimum 30% overlap to avoid falling
const BASE_SCORE_PER_BLOCK = 30;
const PRECISION_BONUS = 10;

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
 * Styled game area
 */
const GameArea = styled.div`
  position: relative;
  width: ${CONTAINER_WIDTH}px;
  height: 500px;
  background: linear-gradient(
    180deg,
    ${theme.colors.surface} 0%,
    ${theme.colors.cardBg} 100%
  );
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

/**
 * Styled base platform
 */
const BasePlatform = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 10px;
  background: ${theme.colors.textSecondary};
  border-top: 2px solid ${theme.colors.textPrimary};
`;

/**
 * Styled block
 */
const Block = styled(motion.div)<{ $color: string; $isMoving?: boolean }>`
  position: absolute;
  width: ${BLOCK_WIDTH}px;
  height: ${BLOCK_HEIGHT}px;
  background: ${(props) => props.$color};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  cursor: ${(props) => (props.$isMoving ? 'crosshair' : 'default')};
  user-select: none;
`;

/**
 * Styled stats container
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
 * Styled message
 */
const Message = styled(motion.div)<{ $type: 'success' | 'error' | 'info' }>`
  padding: ${theme.spacing.lg};
  background: ${(props) => {
        switch (props.$type) {
            case 'success':
                return 'rgba(16, 185, 129, 0.1)';
            case 'error':
                return 'rgba(239, 68, 68, 0.1)';
            default:
                return 'rgba(59, 130, 246, 0.1)';
        }
    }};
  border: 2px solid ${(props) => {
        switch (props.$type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            default:
                return theme.colors.info;
        }
    }};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${(props) => {
        switch (props.$type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            default:
                return theme.colors.info;
        }
    }};
`;

/**
 * Interface for a block in the tower
 */
interface TowerBlock {
    id: number;
    x: number; // position in tower
    y: number; // height from bottom
    color: string;
    overlapPercentage: number;
}

/**
 * Tower Builder Challenge Component
 */
const TowerBuilderChallenge: React.FC<ChallengeProps> = ({
    onComplete,
    timeLimit,
    challengeId,
}) => {
    const [blocks, setBlocks] = useState<TowerBlock[]>([]);
    const [currentBlockId, setCurrentBlockId] = useState(0);
    const [currentBlockX, setCurrentBlockX] = useState(
        CONTAINER_WIDTH / 2 - BLOCK_WIDTH / 2
    );
    const [isMovingLeft, setIsMovingLeft] = useState(true);
    const [message, setMessage] = useState<{
        text: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [lastOverlapPercentage, setLastOverlapPercentage] = useState(0);
    const blockMovementRef = useRef<number | null>(null);

    /**
     * Calculate block position based on tower height
     */
    const getBlockYPosition = () => {
        if (blocks.length === 0) {
            return CONTAINER_WIDTH - BLOCK_HEIGHT - 10;
        }
        const topBlock = blocks[blocks.length - 1];
        return topBlock.y - BLOCK_HEIGHT - 2;
    };

    /**
     * Animate block movement left and right
     */
    useEffect(() => {
        if (gameOver || blocks.length >= TARGET_BLOCKS) {
            return;
        }

        let direction = isMovingLeft ? -1 : 1;
        let nextX = currentBlockX;

        const moveBlock = () => {
            nextX += direction * 2;

            // Bounce at edges
            if (nextX <= 0) {
                nextX = 0;
                direction = 1;
                setIsMovingLeft(false);
            } else if (nextX + BLOCK_WIDTH >= CONTAINER_WIDTH) {
                nextX = CONTAINER_WIDTH - BLOCK_WIDTH;
                direction = -1;
                setIsMovingLeft(true);
            }

            setCurrentBlockX(nextX);
            blockMovementRef.current = requestAnimationFrame(moveBlock);
        };

        blockMovementRef.current = requestAnimationFrame(moveBlock);

        return () => {
            if (blockMovementRef.current) {
                cancelAnimationFrame(blockMovementRef.current);
            }
        };
    }, [gameOver, blocks.length, currentBlockX, isMovingLeft]);

    /**
     * Calculate overlap percentage between current block and top block
     */
    const calculateOverlapPercentage = (): number => {
        if (blocks.length === 0) {
            return 100; // Perfect placement on base
        }

        const topBlock = blocks[blocks.length - 1];
        const topBlockLeft = topBlock.x;
        const topBlockRight = topBlock.x + BLOCK_WIDTH;
        const currentBlockLeft = currentBlockX;
        const currentBlockRight = currentBlockX + BLOCK_WIDTH;

        const overlapLeft = Math.max(topBlockLeft, currentBlockLeft);
        const overlapRight = Math.min(topBlockRight, currentBlockRight);
        const overlapWidth = Math.max(0, overlapRight - overlapLeft);

        const overlapPercentage = (overlapWidth / BLOCK_WIDTH) * 100;
        return Math.round(overlapPercentage);
    };

    /**
     * Handle block placement
     */
    const handleBlockClick = () => {
        if (gameOver || blocks.length >= TARGET_BLOCKS) {
            return;
        }

        const overlapPercentage = calculateOverlapPercentage();
        setLastOverlapPercentage(overlapPercentage);

        // Check if placement is valid
        if (overlapPercentage < MIN_OVERLAP_PERCENTAGE) {
            // Tower falls
            setMessage({
                text: `✗ Block fell! Only ${overlapPercentage}% overlap. Need at least ${MIN_OVERLAP_PERCENTAGE}%`,
                type: 'error',
            });
            setGameOver(true);
            setTimeout(() => {
                onComplete(false, 0, score);
            }, 1500);
            return;
        }

        // Add block to tower
        const newBlock: TowerBlock = {
            id: currentBlockId,
            x: currentBlockX,
            y: getBlockYPosition(),
            color: BLOCK_COLORS[currentBlockId % BLOCK_COLORS.length],
            overlapPercentage,
        };

        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);

        // Calculate score
        const blockScore = BASE_SCORE_PER_BLOCK;
        const bonusScore =
            overlapPercentage === 100
                ? PRECISION_BONUS
                : overlapPercentage >= 80
                    ? Math.floor(PRECISION_BONUS * 0.7)
                    : 0;
        const newScore = score + blockScore + bonusScore;
        setScore(newScore);

        // Show success message
        const precisionText =
            overlapPercentage === 100
                ? '✓ Perfect placement! (+10 bonus)'
                : overlapPercentage >= 80
                    ? `✓ Great! ${overlapPercentage}% overlap (+7 bonus)`
                    : `✓ Placed! ${overlapPercentage}% overlap`;

        setMessage({
            text: precisionText,
            type: 'success',
        });

        // Clear message and prepare for next block
        setTimeout(() => {
            setMessage(null);
        }, 1500);

        // Check if tower is complete
        if (newBlocks.length >= TARGET_BLOCKS) {
            setGameOver(true);
            setTimeout(() => {
                const bonusScore = 50; // Completion bonus
                onComplete(true, 0, newScore + bonusScore);
            }, 1500);
            return;
        }

        setCurrentBlockId(currentBlockId + 1);
        setCurrentBlockX(CONTAINER_WIDTH / 2 - BLOCK_WIDTH / 2);
    };

    /**
     * Handle game with keyboard
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleBlockClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, blocks.length, currentBlockX, currentBlockId, score]);

    const towerHeight =
        blocks.length > 0
            ? Math.round(
                (CONTAINER_WIDTH - (blocks[blocks.length - 1]?.y || CONTAINER_WIDTH)) / 10
            )
            : 0;

    return (
        <ChallengeBase
            title="Tower Builder Challenge"
            description="Stack blocks perfectly to build the tallest tower"
            timeLimit={timeLimit}
            challengeId={challengeId}
            onComplete={onComplete}
        >
            <Container>
                <GameArea onClick={handleBlockClick}>
                    {/* Blocks in tower */}
                    <AnimatePresence>
                        {blocks.map((block) => (
                            <Block
                                key={block.id}
                                $color={block.color}
                                style={{
                                    left: block.x,
                                    bottom: CONTAINER_WIDTH - block.y,
                                }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Current falling block */}
                    {!gameOver && blocks.length < TARGET_BLOCKS && (
                        <Block
                            $color={BLOCK_COLORS[currentBlockId % BLOCK_COLORS.length]}
                            $isMoving={true}
                            style={{
                                left: currentBlockX,
                                top: 20,
                            }}
                            animate={{
                                y: getBlockYPosition() - 20,
                            }}
                            transition={{
                                opacity: { duration: 0.1 },
                            }}
                            whileHover={{ scale: 1.05 }}
                        />
                    )}

                    <BasePlatform />
                </GameArea>

                <StatsContainer>
                    <StatItem>
                        <StatLabel>Blocks Placed</StatLabel>
                        <StatValue>
                            {blocks.length}/{TARGET_BLOCKS}
                        </StatValue>
                    </StatItem>
                    <StatItem>
                        <StatLabel>Tower Height</StatLabel>
                        <StatValue>{towerHeight}px</StatValue>
                    </StatItem>
                    {lastOverlapPercentage > 0 && (
                        <StatItem>
                            <StatLabel>Last Overlap</StatLabel>
                            <StatValue>{lastOverlapPercentage}%</StatValue>
                        </StatItem>
                    )}
                    <StatItem>
                        <StatLabel>Score</StatLabel>
                        <StatValue>{score}</StatValue>
                    </StatItem>
                </StatsContainer>

                {message && (
                    <Message
                        $type={message.type}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {message.text}
                    </Message>
                )}

                {!gameOver && blocks.length < TARGET_BLOCKS && (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                        <p style={{ marginTop: 0, fontSize: theme.fontSizes.sm }}>
                            Click the game area or press SPACE to place the block
                        </p>
                    </div>
                )}

                {gameOver && blocks.length >= TARGET_BLOCKS && (
                    <Message $type="success">
                        ✓ Congratulations! Tower complete with {blocks.length} blocks!
                    </Message>
                )}
            </Container>
        </ChallengeBase>
    );
};

export default TowerBuilderChallenge;
