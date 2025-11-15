import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Quiz question interface
 */
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option (0-3)
}

/**
 * Geography questions database
 */
const geographyQuestions: QuizQuestion[] = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
  },
  {
    question: 'Which continent is Egypt in?',
    options: ['Asia', 'Africa', 'Europe', 'South America'],
    correctAnswer: 1,
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctAnswer: 3,
  },
  {
    question: 'Which country has the most population?',
    options: ['India', 'United States', 'China', 'Indonesia'],
    correctAnswer: 2,
  },
  {
    question: 'What is the capital of Japan?',
    options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
    correctAnswer: 2,
  },
  {
    question: 'Which river is the longest in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    correctAnswer: 1,
  },
  {
    question: 'Mount Everest is located in which mountain range?',
    options: ['Alps', 'Andes', 'Rockies', 'Himalayas'],
    correctAnswer: 3,
  },
  {
    question: 'Which country is known as the Land of the Rising Sun?',
    options: ['China', 'Japan', 'Thailand', 'South Korea'],
    correctAnswer: 1,
  },
  {
    question: 'What is the smallest country in the world?',
    options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
    correctAnswer: 1,
  },
  {
    question: 'Which desert is the largest in the world?',
    options: ['Sahara', 'Gobi', 'Arabian', 'Antarctic'],
    correctAnswer: 3,
  },
];

/**
 * Get color based on option state
 */
type OptionVariant = 'default' | 'selected' | 'correct' | 'wrong';

const getOptionColor = (variant: OptionVariant): { border: string; bg: string } => {
  switch (variant) {
    case 'selected':
      return {
        border: theme.colors.primary,
        bg: `rgba(99, 102, 241, 0.1)`,
      };
    case 'correct':
      return {
        border: theme.colors.success,
        bg: `rgba(34, 197, 94, 0.1)`,
      };
    case 'wrong':
      return {
        border: theme.colors.error,
        bg: `rgba(239, 68, 68, 0.1)`,
      };
    default:
      return {
        border: theme.colors.borderLight,
        bg: theme.colors.background,
      };
  }
};

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
 * Styled question progress
 */
const QuestionProgress = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled question card
 */
const QuestionCard = styled(motion.div)`
  background: ${theme.colors.background};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
  margin-bottom: ${theme.spacing.xl};
  width: 100%;
`;

/**
 * Styled question text
 */
const QuestionText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.xl} 0;
  text-align: center;
  line-height: 1.5;
`;

/**
 * Styled options container
 */
const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
`;

/**
 * Styled option button
 */
const OptionButton = styled(motion.button)<{ $variant: OptionVariant }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => getOptionColor(props.$variant).border};
  background: ${(props) => getOptionColor(props.$variant).bg};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textPrimary};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary};
    transform: translateX(4px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.9;
  }
`;

/**
 * Styled option letter badge
 */
const OptionLetter = styled.span`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 9999px;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.sm};
`;

/**
 * Styled option text
 */
const OptionText = styled.span`
  flex: 1;
`;

/**
 * Styled check icon
 */
const CheckIcon = styled(motion.span)`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.success};
`;

/**
 * Styled cross icon
 */
const CrossIcon = styled(motion.span)`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.error};
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
 * Styled score display
 */
const ScoreDisplay = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary};
  text-align: center;
  margin: 0;
`;

/**
 * Geography Quiz Challenge Component
 * 5 randomly selected geography questions with multiple choice
 */
const GeographyQuizChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Randomly select 5 questions from the bank
  const [questions] = useState<QuizQuestion[]>(() => {
    const shuffled = [...geographyQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  /**
   * Handle answer selection
   */
  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  /**
   * Handle submit answer
   */
  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setIsAnswered(true);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 40); // 40 points per question
    }

    setTimeout(() => {
      if (isLastQuestion) {
        // Quiz completed
        const timeSpent = (Date.now() - startTime) / 1000;
        const finalScore = score + (isCorrect ? 40 : 0);
        onComplete(true, timeSpent, finalScore);
      } else {
        // Next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 1500);
  };

  /**
   * Get option style variant based on state
   */
  const getOptionStyle = (index: number): OptionVariant => {
    if (!isAnswered) {
      return index === selectedAnswer ? 'selected' : 'default';
    }

    if (index === currentQuestion.correctAnswer) {
      return 'correct';
    }

    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'wrong';
    }

    return 'default';
  };

  return (
    <ChallengeBase
      title="Geography Quiz Challenge"
      description="Answer 5 geography questions"
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
          Geography Quiz
        </Title>

        <QuestionProgress>
          Question {currentQuestionIndex + 1} / {questions.length}
        </QuestionProgress>

        <QuestionCard
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionText>{currentQuestion.question}</QuestionText>

          <OptionsContainer>
            {currentQuestion.options.map((option, index) => {
              const variant = getOptionStyle(index);
              return (
                <OptionButton
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  $variant={variant}
                  disabled={isAnswered}
                  whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                  whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                >
                  <OptionLetter>{String.fromCharCode(65 + index)}</OptionLetter>
                  <OptionText>{option}</OptionText>
                  {isAnswered && index === currentQuestion.correctAnswer && (
                    <CheckIcon
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      ✓
                    </CheckIcon>
                  )}
                  {isAnswered &&
                    index === selectedAnswer &&
                    index !== currentQuestion.correctAnswer && (
                      <CrossIcon
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        ✗
                      </CrossIcon>
                    )}
                </OptionButton>
              );
            })}
          </OptionsContainer>
        </QuestionCard>

        <SubmitButton
          onClick={handleSubmit}
          disabled={selectedAnswer === null || isAnswered}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {isAnswered
            ? isLastQuestion
              ? 'Completing...'
              : 'Next Question →'
            : 'Submit Answer'}
        </SubmitButton>

        <ScoreDisplay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Score: {score} / 200
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default GeographyQuizChallenge;
