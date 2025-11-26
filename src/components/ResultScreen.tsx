import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useGameStore } from '../store/gameStore';
import Button from './ui/Button';
import { theme } from '../styles/theme';
import { getTotalChallenges } from '../utils/challengeRegistry';

/**
 * Rating type
 */
interface Rating {
  text: string;
  emoji: string;
  color: string;
}

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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
`;

/**
 * Styled content card
 */
const Content = styled(motion.div)`
  max-width: 700px;
  width: 100%;
  background-color: ${theme.colors.cardBg};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.xl};
`;

/**
 * Styled rating section
 */
const Rating = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['2xl']};
  text-align: center;
`;

/**
 * Styled rating emoji
 */
const RatingEmoji = styled.div`
  font-size: ${theme.fontSizes['5xl']};
  line-height: 1;
  animation: bounce 0.6s ease-in-out;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

/**
 * Styled rating text
 */
const RatingText = styled.h1<{ $color: string }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  margin: 0;
  color: ${(props) => {
    switch (props.$color) {
      case 'gold':
        return '#FFB800';
      case 'success':
        return theme.colors.success;
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      default:
        return theme.colors.textPrimary;
    }
  }};
`;

/**
 * Styled score section
 */
const ScoreSection = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
`;

/**
 * Styled score label
 */
const ScoreLabel = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/**
 * Styled total score display
 */
const TotalScore = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['5xl']};
  font-weight: ${theme.fontWeights.bold};
  margin: ${theme.spacing.md} 0;
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

/**
 * Styled score subtext
 */
const ScoreSubtext = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textTertiary};
`;

/**
 * Styled stats grid
 */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Styled stat card
 */
const StatCard = styled(motion.div)`
  background-color: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  border: 1px solid ${theme.colors.border};
`;

/**
 * Styled stat value
 */
const StatValue = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.sm};
`;

/**
 * Styled stat label
 */
const StatLabel = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled challenges breakdown section
 */
const ChallengesBreakdown = styled.div`
  margin-bottom: ${theme.spacing['2xl']};
  border-top: 2px solid ${theme.colors.borderLight};
  padding-top: ${theme.spacing.lg};
`;

/**
 * Styled breakdown title
 */
const BreakdownTitle = styled.h2`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
`;

/**
 * Styled challenge result item
 */
const ChallengeResult = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.borderLight};
  gap: ${theme.spacing.md};

  &:last-child {
    border-bottom: none;
  }
`;

/**
 * Styled challenge name
 */
const ChallengeName = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.fontWeights.medium};
`;

/**
 * Styled challenge score
 */
const ChallengeScore = styled.span<{ success: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${(props) =>
    props.success ? theme.colors.success : theme.colors.error};
  min-width: 80px;
  text-align: right;
`;

/**
 * Styled button group
 */
const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

/**
 * ResultScreen Component
 * Displays game results, statistics, and confetti celebration
 */
const ResultScreen: React.FC = () => {
  const {
    challengeResults,
    totalScore,
    resetGame,
    playerStats,
  } = useGameStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate max score based on challenges
  const totalChallengesCount = getTotalChallenges();
  const maxScore = totalChallengesCount * 100; // Dynamic based on number of challenges
  const scorePercentage = (totalScore / maxScore) * 100;

  /**
   * Get rating based on score percentage
   */
  const getRating = (): Rating => {
    if (scorePercentage >= 90)
      return { text: 'EXCELLENT!', emoji: '🏆', color: 'gold' };
    if (scorePercentage >= 70)
      return { text: 'GREAT JOB!', emoji: '🎉', color: 'success' };
    if (scorePercentage >= 50)
      return { text: 'GOOD EFFORT!', emoji: '👍', color: 'primary' };
    return { text: 'TRY AGAIN!', emoji: '💪', color: 'secondary' };
  };

  /**
   * Handle confetti on mount if score is high enough
   */
  useEffect(() => {
    if (scorePercentage >= 80) {
      setShowConfetti(true);
    }
  }, [scorePercentage]);

  /**
   * Set dimensions on mount
   */
  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const rating = getRating();

  return (
    <Container>
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={true}
          numberOfPieces={200}
          tweenDuration={8000}
          gravity={0.15}
        />
      )}

      <Content
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Rating Section */}
        <Rating $color={rating.color}>
          <RatingEmoji>{rating.emoji}</RatingEmoji>
          <RatingText $color={rating.color}>{rating.text}</RatingText>
        </Rating>

        {/* Score Section */}
        <ScoreSection>
          <ScoreLabel>Final Score</ScoreLabel>
          <TotalScore
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            {totalScore}
          </TotalScore>
          <ScoreSubtext>out of {maxScore} points</ScoreSubtext>
        </ScoreSection>

        {/* Statistics Grid */}
        <StatsGrid>
          <StatCard
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 0.3 }}
           >
             <StatValue>{playerStats.challengesCompleted}/{totalChallengesCount}</StatValue>
             <StatLabel>Completed</StatLabel>
           </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <StatValue>{Math.round(playerStats.averageTime)}s</StatValue>
            <StatLabel>Avg Time</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <StatValue>{Math.round(playerStats.accuracy)}%</StatValue>
            <StatLabel>Accuracy</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Challenges Breakdown */}
        {challengeResults.length > 0 && (
          <ChallengesBreakdown>
            <BreakdownTitle>Challenge Breakdown</BreakdownTitle>
            {challengeResults.map((result, index) => (
              <ChallengeResult
                key={result.challengeId}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05, duration: 0.3 }}
              >
                <ChallengeName>
                  {result.success ? '✓' : '✗'} Challenge #{result.challengeId}
                </ChallengeName>
                <ChallengeScore success={result.success}>
                  {result.score} pts
                </ChallengeScore>
              </ChallengeResult>
            ))}
          </ChallengesBreakdown>
        )}

        {/* Play Again Button */}
        <ButtonGroup>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Button
              onClick={resetGame}
              variant="primary"
              size="lg"
              fullWidth={false}
            >
              🔄 Play Again
            </Button>
          </motion.div>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

export default ResultScreen;
