import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Question type
 */
interface Question {
  text: string;
  correct: boolean;
}

/**
 * All available questions
 */
const ALL_QUESTIONS: Question[] = [
  { text: 'Is 2+2=4?', correct: true },
  { text: 'Is the sky green?', correct: false },
  { text: 'Do cats bark?', correct: false },
  { text: 'Is water wet?', correct: true },
  { text: 'Is 10 > 5?', correct: true },
  { text: 'Is fire cold?', correct: false },
  { text: 'Do birds fly?', correct: true },
  { text: 'Is the sun hot?', correct: true },
  { text: 'Do fish live in water?', correct: true },
  { text: 'Is snow warm?', correct: false },
  { text: 'Is 3 × 3 = 9?', correct: true },
  { text: 'Are penguins tropical birds?', correct: false },
  { text: 'Does a triangle have 4 sides?', correct: false },
  { text: 'Is honey made by bees?', correct: true },
  { text: 'Is darkness the absence of light?', correct: true },
  { text: 'Can dogs speak English?', correct: false },
  { text: 'Is 100 < 50?', correct: false },
  { text: 'Do wheels have corners?', correct: false },
  { text: 'Is oxygen a gas?', correct: true },
  { text: 'Can you breathe underwater?', correct: false },
  { text: 'Is a tomato a fruit?', correct: true },
  { text: 'Do snakes have legs?', correct: false },
  { text: 'Is sugar sweet?', correct: true },
  { text: 'Are clouds made of water?', correct: true },
  { text: 'Is ice colder than water?', correct: true },
  { text: 'Do computers think?', correct: false },
  { text: 'Is the moon a star?', correct: false },
  { text: 'Are ants insects?', correct: true },
  { text: 'Is music a form of art?', correct: true },
  { text: 'Can sound travel in a vacuum?', correct: false },
];

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
 * Question display
 */
const QuestionDisplay = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.primary};
  width: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

/**
 * Progress fill
 */
const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  transition: width 0.3s ease;
`;

/**
 * Controls
 */
const Controls = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  width: 100%;
  justify-content: center;
`;

/**
 * Button
 */
const Button = styled(motion.button)<{ $correct?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${(props) => {
    if (props.$correct === true) return theme.colors.success;
    if (props.$correct === false) return theme.colors.error;
    return theme.colors.primary;
  }};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Stats
 */
const Stats = styled.div`
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

/**
 * Lightning Round Challenge Component
 */
const LightningRoundChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [startTime] = useState(Date.now());

  // Randomly select 15 questions from all 30
  const questions = useMemo(
    () => {
      const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 15);
    },
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);

  const currentQuestion = questions[currentIndex];

  /**
   * Handle answer
   */
  const handleAnswer = (answer: boolean) => {
    if (answered) return;

    setUserAnswer(answer);
    setAnswered(true);

    if (answer === currentQuestion.correct) {
      setCorrectAnswers((prev) => prev + 1);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setAnswered(false);
        setUserAnswer(null);
      } else {
        setCompleted(true);
        const timeSpent = (Date.now() - startTime) / 1000;
        const score = (correctAnswers + (answer === currentQuestion.correct ? 1 : 0)) * 13;
        const success = correctAnswers + (answer === currentQuestion.correct ? 1 : 0) >= 12;

        setTimeout(() => {
          onComplete(success, timeSpent, Math.round(score));
        }, 1500);
      }
    }, 1000);
  };

  if (completed) {
    return (
      <ChallengeBase
        title="Lightning Round Challenge"
        description="Answer 15 yes/no questions quickly"
        timeLimit={timeLimit}
        challengeId={challengeId}
        onComplete={onComplete}
      >
        <FeedbackMessage
          $success={correctAnswers >= 12}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Emoji>{correctAnswers >= 12 ? '⚡' : '💫'}</Emoji>
          <span>{correctAnswers >= 12 ? 'Lightning fast!' : 'Good effort!'}</span>
          <span>
            Score: {correctAnswers}/15
          </span>
        </FeedbackMessage>
      </ChallengeBase>
    );
  }

  const isCorrect = answered && userAnswer === currentQuestion.correct;

  return (
    <ChallengeBase
      title="Lightning Round Challenge"
      description="Answer 15 yes/no questions quickly"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ProgressBar>
          <ProgressFill style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </ProgressBar>

        <QuestionDisplay
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.text}
        </QuestionDisplay>

        <Controls>
          <Button
            onClick={() => handleAnswer(true)}
            disabled={answered}
            $correct={answered ? (userAnswer === true ? isCorrect : !isCorrect) : undefined}
            whileHover={{ scale: answered ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            YES (Space)
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            disabled={answered}
            $correct={answered ? (userAnswer === false ? isCorrect : !isCorrect) : undefined}
            whileHover={{ scale: answered ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            NO (ESC)
          </Button>
        </Controls>

        <Stats>
          <StatItem>
            <Label>Correct</Label>
            <span>{correctAnswers}</span>
          </StatItem>
          <StatItem>
            <Label>Question</Label>
            <span>
              {currentIndex + 1}/{questions.length}
            </span>
          </StatItem>
        </Stats>
      </Container>
    </ChallengeBase>
  );
};

export default LightningRoundChallenge;
