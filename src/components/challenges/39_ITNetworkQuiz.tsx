import React, { useState, useCallback, useRef } from 'react';
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
 * IT & Network Knowledge Questions Database
 */
const itNetworkQuestions: QuizQuestion[] = [
  {
    question: 'What does DNS stand for?',
    options: ['Domain Name System', 'Digital Network Service', 'Data Network Socket', 'Domain Navigation Service'],
    correctAnswer: 0,
  },
  {
    question: 'Which layer of the OSI model is responsible for routing?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
    correctAnswer: 1,
  },
  {
    question: 'What is the default port for HTTPS?',
    options: ['80', '443', '8080', '3306'],
    correctAnswer: 1,
  },
  {
    question: 'Which protocol is used to send emails?',
    options: ['HTTP', 'FTP', 'SMTP', 'SNMP'],
    correctAnswer: 2,
  },
  {
    question: 'What does TCP stand for?',
    options: ['Transfer Control Protocol', 'Transmission Control Protocol', 'Transport Communication Protocol', 'Transfer Communication Process'],
    correctAnswer: 1,
  },
  {
    question: 'Which of these is a private IP address range?',
    options: ['192.0.2.0', '10.0.0.0', '8.8.8.8', '172.217.0.0'],
    correctAnswer: 1,
  },
  {
    question: 'What does VPN stand for?',
    options: ['Virtual Private Network', 'Very Private Network', 'Virtual Protocol Network', 'Virtual Proxy Network'],
    correctAnswer: 0,
  },
  {
    question: 'Which layer handles encryption in the OSI model?',
    options: ['Data Link Layer', 'Transport Layer', 'Session Layer', 'Application Layer'],
    correctAnswer: 3,
  },
  {
    question: 'What is the maximum size of an IPv4 address?',
    options: ['8 bits', '16 bits', '32 bits', '64 bits'],
    correctAnswer: 2,
  },
  {
    question: 'Which protocol is used for secure shell access?',
    options: ['Telnet', 'SSH', 'RDP', 'SFTP'],
    correctAnswer: 1,
  },
  {
    question: 'What does API stand for?',
    options: ['Application Programming Interface', 'Advanced Programming Integration', 'Application Process Interface', 'Automated Programming Interface'],
    correctAnswer: 0,
  },
  {
    question: 'Which device operates at the Network Layer?',
    options: ['Switch', 'Router', 'Hub', 'Bridge'],
    correctAnswer: 1,
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
 * IT & Network Knowledge Quiz Challenge Component
 * 12 IT and Network related questions with multiple choice
 */
const ITNetworkQuizChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  // Randomly select 12 questions from the bank
  const [questions] = useState<QuizQuestion[]>(() => {
    const shuffled = [...itNetworkQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 12);
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(() => Date.now());
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || isAnswered) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newScore = score + (isCorrect ? 25 : 0);
    const newCorrectCount = correctCount + (isCorrect ? 1 : 0);

    setIsAnswered(true);
    if (isCorrect) {
      setScore(newScore);
      setCorrectCount(newCorrectCount);
    }

    const timer = setTimeout(() => {
      if (isLastQuestion) {
        // Quiz completed
        const timeSpent = (Date.now() - startTime) / 1000;
        
        // Success if 9/12 or more correct
        const success = newCorrectCount >= 9;
        onComplete(success, timeSpent, success ? newScore : 0);
      } else {
        // Next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 1500);

    pendingTimeoutRef.current = timer;
  }, [selectedAnswer, isAnswered, currentQuestion, score, correctCount, isLastQuestion, startTime, onComplete]);

  /**
   * Cleanup pending timeout on unmount
   */
  React.useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

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
      title="IT & Network Knowledge Quiz"
      description="Answer 12 IT and Network questions (need 9/12 correct)"
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
          IT & Network Quiz
        </Title>

        <QuestionProgress>
          Question {currentQuestionIndex + 1} / {questions.length} | Correct: {correctCount}
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
          Score: {score} / 300
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default ITNetworkQuizChallenge;
