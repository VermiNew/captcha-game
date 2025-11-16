import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Question type
 */
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'physics' | 'chemistry' | 'biology' | 'astronomy';
}

/**
 * Science question database
 */
const SCIENCE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'What is H2O?',
    options: ['Water', 'Hydrogen', 'Oxygen', 'Salt'],
    correctAnswer: 0,
    category: 'chemistry',
  },
  {
    id: 'q2',
    question: 'Which planet is fastest?',
    options: ['Mercury', 'Venus', 'Earth', 'Mars'],
    correctAnswer: 0,
    category: 'astronomy',
  },
  {
    id: 'q3',
    question: 'What is the boiling point of water?',
    options: ['100°C', '90°C', '110°C', '80°C'],
    correctAnswer: 0,
    category: 'chemistry',
  },
  {
    id: 'q4',
    question: 'What is the largest organ in the human body?',
    options: ['Skin', 'Heart', 'Liver', 'Brain'],
    correctAnswer: 0,
    category: 'biology',
  },
  {
    id: 'q5',
    question: 'What is the speed of light?',
    options: [
      '300,000 km/s',
      '150,000 km/s',
      '500,000 km/s',
      '1,000,000 km/s',
    ],
    correctAnswer: 0,
    category: 'physics',
  },
  {
    id: 'q6',
    question: 'How many bones are in the human body?',
    options: ['206', '256', '186', '226'],
    correctAnswer: 0,
    category: 'biology',
  },
  {
    id: 'q7',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    category: 'chemistry',
  },
  {
    id: 'q8',
    question: 'How many planets are in our solar system?',
    options: ['8', '9', '7', '10'],
    correctAnswer: 0,
    category: 'astronomy',
  },
  {
    id: 'q9',
    question: 'What is the smallest unit of life?',
    options: ['Cell', 'Atom', 'Molecule', 'Protein'],
    correctAnswer: 0,
    category: 'biology',
  },
  {
    id: 'q10',
    question: 'What does DNA stand for?',
    options: [
      'Deoxyribonucleic Acid',
      'Digital Neural Algorithm',
      'Deoxyribose Nucleotide Arrangement',
      'Diribose Nucleic Acid',
    ],
    correctAnswer: 0,
    category: 'biology',
  },
  {
    id: 'q11',
    question: 'How many sides does a benzene ring have?',
    options: ['6', '4', '8', '5'],
    correctAnswer: 0,
    category: 'chemistry',
  },
  {
    id: 'q12',
    question: 'What is the closest star to Earth?',
    options: ['Proxima Centauri', 'Sirius', 'Alpha Centauri', 'Sun'],
    correctAnswer: 3,
    category: 'astronomy',
  },
  {
    id: 'q13',
    question: 'What is the SI unit of force?',
    options: ['Newton', 'Joule', 'Watt', 'Pascal'],
    correctAnswer: 0,
    category: 'physics',
  },
  {
    id: 'q14',
    question: 'How many electrons does oxygen have?',
    options: ['8', '6', '10', '4'],
    correctAnswer: 0,
    category: 'chemistry',
  },
  {
    id: 'q15',
    question: 'What is photosynthesis?',
    options: [
      'Process of converting light to chemical energy',
      'Process of breaking down glucose',
      'Process of producing oxygen',
      'Process of absorbing water',
    ],
    correctAnswer: 0,
    category: 'biology',
  },
  {
    id: 'q16',
    question: 'How far is the Moon from Earth?',
    options: [
      '384,400 km',
      '150,000 km',
      '57,900 km',
      '227,900 km',
    ],
    correctAnswer: 0,
    category: 'astronomy',
  },
  {
    id: 'q17',
    question: 'What is the speed of sound?',
    options: [
      '343 m/s',
      '500 m/s',
      '200 m/s',
      '100 m/s',
    ],
    correctAnswer: 0,
    category: 'physics',
  },
  {
    id: 'q18',
    question: 'What is the process called when water becomes ice?',
    options: ['Freezing', 'Condensation', 'Solidification', 'Deposition'],
    correctAnswer: 0,
    category: 'chemistry',
  },
  {
    id: 'q19',
    question: 'How many chambers does the heart have?',
    options: ['4', '3', '5', '6'],
    correctAnswer: 0,
    category: 'biology',
  },
  {
    id: 'q20',
    question: 'What is the temperature on the surface of the Sun?',
    options: [
      '5,500°C',
      '3,000°C',
      '10,000°C',
      '1,500°C',
    ],
    correctAnswer: 0,
    category: 'astronomy',
  },
];

/**
 * Category colors
 */
const CATEGORY_COLORS: Record<string, string> = {
  physics: '#FF6B6B',
  chemistry: '#4ECDC4',
  biology: '#FFE66D',
  astronomy: '#A8E6CF',
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
`;

/**
 * Styled progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

/**
 * Styled progress fill
 */
const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #FF6B6B, #4ECDC4);
  border-radius: ${theme.borderRadius.full};
`;

/**
 * Styled progress text
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

/**
 * Styled category badge
 */
const CategoryBadge = styled.span<{ category: string }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${(props) => CATEGORY_COLORS[props.category]};
  color: white;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.md};
`;

/**
 * Styled question
 */
const Question = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.4;
`;

/**
 * Styled options container
 */
const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled option button
 */
const OptionButton = styled(motion.button)<{
  $selected?: boolean;
  $isCorrect?: boolean;
  $isWrong?: boolean;
}>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  text-align: left;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: 2px solid
    ${(props) => {
      if (props.$isCorrect) return theme.colors.success;
      if (props.$isWrong) return theme.colors.error;
      if (props.$selected) return theme.colors.primary;
      return theme.colors.border;
    }};
  background: ${(props) => {
    if (props.$isCorrect) return 'rgba(16, 185, 129, 0.1)';
    if (props.$isWrong) return 'rgba(239, 68, 68, 0.1)';
    if (props.$selected) return 'rgba(99, 102, 241, 0.1)';
    return 'white';
  }};
  color: ${theme.colors.textPrimary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary};
    transform: translateX(5px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Styled score display
 */
const ScoreDisplay = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary};
  text-align: center;
`;

/**
 * Science Quiz Challenge Component
 * 6 random science questions with multiple choice answers
 */
const ScienceQuizChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const totalQuestions = 6;
  const successThreshold = 4;
  const pointsPerQuestion = 40;

  /**
   * Initialize with random questions
   */
  useEffect(() => {
    const shuffled = [...SCIENCE_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);
    setQuestions(shuffled);
  }, []);

  /**
   * Handle answer selection
   */
  const handleSelectAnswer = (index: number) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = index === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + pointsPerQuestion);
    }

    const nextIndex = currentIndex + 1;

    setTimeout(() => {
      if (nextIndex < totalQuestions) {
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        // Quiz complete
        const finalScore =
          score + (isCorrect ? pointsPerQuestion : 0);
        const correctAnswers = Math.ceil(
          (finalScore / pointsPerQuestion)
        );
        const success = correctAnswers >= successThreshold;
        onComplete(success, 0, finalScore);
      }
    }, 1000);
  };

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const correctAnswers = Math.floor(score / pointsPerQuestion);
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <ChallengeBase
      title="Science Quiz Challenge"
      description="Answer 6 science questions correctly"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <div style={{ width: '100%' }}>
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </ProgressBar>
          <ProgressText>
            Question {currentIndex + 1} / {totalQuestions}
          </ProgressText>
        </div>

        <CategoryBadge category={currentQuestion.category}>
          {currentQuestion.category.toUpperCase()}
        </CategoryBadge>

        <Question
          key={`q-${currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.question}
        </Question>

        <OptionsContainer>
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={index}
              $selected={selectedAnswer === index && !answered}
              $isCorrect={
                answered &&
                index === currentQuestion.correctAnswer
              }
              $isWrong={
                answered &&
                selectedAnswer === index &&
                index !== currentQuestion.correctAnswer
              }
              onClick={() => handleSelectAnswer(index)}
              disabled={answered}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {option}
            </OptionButton>
          ))}
        </OptionsContainer>

        <ScoreDisplay>
          Correct: {correctAnswers} / {successThreshold}
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default ScienceQuizChallenge;
