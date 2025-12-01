import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

interface ScienceQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  answers: string[];
  explanation: string;
  emoji: string;
}

const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  {
    id: 1,
    emoji: '⚛️',
    question: 'What is the SI unit of force?',
    correctAnswer: 'Newton (N)',
    answers: ['Joule (J)', 'Newton (N)', 'Pascal (Pa)', 'Watt (W)'],
    explanation: 'The Newton (N) is the SI unit of force, named after Isaac Newton.',
  },
  {
    id: 2,
    emoji: '🌍',
    question: 'What is the speed of light in vacuum?',
    correctAnswer: '300,000 km/s',
    answers: ['150,000 km/s', '300,000 km/s', '500,000 km/s', '1,000,000 km/s'],
    explanation: 'The speed of light is approximately 3 × 10⁸ m/s or 300,000 km/s.',
  },
  {
    id: 3,
    emoji: '🔬',
    question: 'What is the chemical symbol for Gold?',
    correctAnswer: 'Au',
    answers: ['Go', 'Au', 'Gd', 'Ag'],
    explanation: 'Gold is represented by the symbol Au, derived from its Latin name "aurum".',
  },
  {
    id: 4,
    emoji: '🌡️',
    question: 'At what temperature does water boil at standard pressure?',
    correctAnswer: '100°C',
    answers: ['90°C', '100°C', '110°C', '120°C'],
    explanation: 'Water boils at 100°C (or 212°F) at 1 atmosphere of pressure.',
  },
  {
    id: 5,
    emoji: '⚡',
    question: 'What does DNA stand for?',
    correctAnswer: 'Deoxyribonucleic Acid',
    answers: ['Deoxyribonucleic Acid', 'Diribonucleic Acid', 'Dynucleic Acid', 'Diatomic Nitrogen Acid'],
    explanation: 'DNA stands for Deoxyribonucleic Acid, the molecule that carries genetic instructions.',
  },
];

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

const QuestionCard = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const EmojiDisplay = styled(motion.div)`
  font-size: 56px;
  margin-bottom: ${theme.spacing.lg};
`;

const QuestionText = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
  line-height: 1.6;
`;

const QuestionMeta = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const AnswersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

const AnswerButton = styled(motion.button)<{ $selected: boolean }>`
  padding: ${theme.spacing.md};
  background: ${props => props.$selected
    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
    : theme.colors.surface};
  border: 2px solid ${props => props.$selected
    ? theme.colors.primary
    : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${props => props.$selected ? 'white' : theme.colors.textPrimary};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateX(4px);
    box-shadow: ${theme.shadows.md};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.2);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  box-shadow: 0 0 10px ${theme.colors.primary}40;
`;

const ExplanationBox = styled(motion.div)<{ $correct: boolean }>`
  padding: ${theme.spacing.lg};
  background: ${props => props.$correct
    ? 'rgba(16, 185, 129, 0.1)'
    : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$correct
    ? theme.colors.success
    : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${props => props.$correct
    ? theme.colors.success
    : theme.colors.error};
  text-align: center;
`;

const ScoreDisplay = styled.p`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

const ScienceQuizChallenge: React.FC<ChallengeProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentQuestion = useMemo(
    () => SCIENCE_QUESTIONS[currentQuestionIndex],
    [currentQuestionIndex]
  );

  const progressPercentage = useMemo(
    () => ((currentQuestionIndex + 1) / SCIENCE_QUESTIONS.length) * 100,
    [currentQuestionIndex]
  );

  const handleSubmit = useCallback(() => {
    if (submitted || !selectedAnswer) return;

    setSubmitted(true);
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 200);
    }

    setTimeout(() => {
      if (currentQuestionIndex < SCIENCE_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setSubmitted(false);
        setIsCorrect(undefined);
      } else {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, score + (correct ? 200 : 0));
      }
    }, 2500);
  }, [submitted, selectedAnswer, currentQuestion, currentQuestionIndex, score, startTime, onComplete]);

  return (
    <ChallengeBase
      title="🔬 Science Quiz Challenge"
      description="Test your knowledge of physics, chemistry, and biology"
    >
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressBar>
          <ProgressFill
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </ProgressBar>

        <QuestionCard
          key={`question-${currentQuestionIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <EmojiDisplay
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            {currentQuestion.emoji}
          </EmojiDisplay>
          <QuestionText>{currentQuestion.question}</QuestionText>
          <QuestionMeta>
            Question {currentQuestionIndex + 1} of {SCIENCE_QUESTIONS.length}
          </QuestionMeta>
        </QuestionCard>

        <AnswersContainer>
          {currentQuestion.answers.map((answer) => (
            <AnswerButton
              key={answer}
              $selected={selectedAnswer === answer}
              onClick={() => !submitted && setSelectedAnswer(answer)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {answer}
            </AnswerButton>
          ))}
        </AnswersContainer>

        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || submitted}
          size="lg"
          variant="primary"
        >
          {submitted ? (isCorrect ? '✓ Correct!' : '✗ Incorrect') : 'Check Answer'}
        </Button>

        <AnimatePresence>
          {submitted && isCorrect !== undefined && (
            <ExplanationBox
              $correct={isCorrect}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontSize: theme.fontSizes.lg }}>
                {isCorrect ? '🎉' : '📚'}
              </p>
              <p style={{ margin: 0 }}>{currentQuestion.explanation}</p>
              <ScoreDisplay style={{ marginTop: theme.spacing.md }}>
                +{isCorrect ? 200 : 0} points
              </ScoreDisplay>
            </ExplanationBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default ScienceQuizChallenge;
