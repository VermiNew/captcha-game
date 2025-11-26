import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Quiz question interface
 */
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

/**
 * Challenge props interface
 */
interface ChallengeProps {
  onComplete: (success: boolean, timeSpent: number, score: number) => void;
  timeLimit?: number;
  challengeId: string;
}

/**
 * Geography questions database
 */
const geographyQuestions: QuizQuestion[] = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    difficulty: 'easy',
    category: 'Capitals',
  },
  {
    question: 'Which continent is Egypt in?',
    options: ['Asia', 'Africa', 'Europe', 'South America'],
    correctAnswer: 1,
    difficulty: 'easy',
    category: 'Continents',
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Oceans',
  },
  {
    question: 'Which country has the most population?',
    options: ['India', 'United States', 'China', 'Indonesia'],
    correctAnswer: 2,
    difficulty: 'medium',
    category: 'Demographics',
  },
  {
    question: 'What is the capital of Japan?',
    options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
    correctAnswer: 2,
    difficulty: 'easy',
    category: 'Capitals',
  },
  {
    question: 'Which river is the longest in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    correctAnswer: 1,
    difficulty: 'medium',
    category: 'Rivers',
  },
  {
    question: 'Mount Everest is located in which mountain range?',
    options: ['Alps', 'Andes', 'Rockies', 'Himalayas'],
    correctAnswer: 3,
    difficulty: 'easy',
    category: 'Mountains',
  },
  {
    question: 'Which country is known as the Land of the Rising Sun?',
    options: ['China', 'Japan', 'Thailand', 'South Korea'],
    correctAnswer: 1,
    difficulty: 'medium',
    category: 'Culture',
  },
  {
    question: 'What is the smallest country in the world?',
    options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
    correctAnswer: 1,
    difficulty: 'hard',
    category: 'Countries',
  },
  {
    question: 'Which desert is the largest in the world?',
    options: ['Sahara', 'Gobi', 'Arabian', 'Antarctic'],
    correctAnswer: 3,
    difficulty: 'hard',
    category: 'Deserts',
  },
];

/**
 * Get color based on option state
 */
type OptionVariant = 'default' | 'selected' | 'correct' | 'wrong';

const getOptionColors = (variant: OptionVariant) => {
  switch (variant) {
    case 'selected':
      return { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', text: '#1f2937' };
    case 'correct':
      return { border: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '#1f2937' };
    case 'wrong':
      return { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#1f2937' };
    default:
      return { border: '#e5e7eb', bg: '#ffffff', text: '#1f2937' };
  }
};

/**
 * Get difficulty color
 */
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'hard': return '#ef4444';
    default: return '#6366f1';
  }
};

/**
 * Geography Quiz Challenge Component
 */
const GeographyQuizChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit = 120,
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
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const correctAnswers = answeredQuestions.filter(Boolean).length;

  /**
   * Handle answer selection
   */
  const handleSelectAnswer = useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  }, [isAnswered]);

  /**
   * Handle submit answer
   */
  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null) return;

    setIsAnswered(true);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnsweredQuestions = [...answeredQuestions, isCorrect];
    setAnsweredQuestions(newAnsweredQuestions);

    if (isCorrect) {
      // Scoring based on difficulty
      const points = currentQuestion.difficulty === 'easy' ? 30 : 
                    currentQuestion.difficulty === 'medium' ? 40 : 50;
      setScore(prev => prev + points);
    }

    setTimeout(() => {
      if (isLastQuestion) {
        // Quiz completed
        const timeSpent = (Date.now() - startTime) / 1000;
        const finalScore = score + (isCorrect ? 
          (currentQuestion.difficulty === 'easy' ? 30 : 
           currentQuestion.difficulty === 'medium' ? 40 : 50) : 0);
        const success = newAnsweredQuestions.filter(Boolean).length >= 3; // Need 3/5 to pass
        onComplete(success, timeSpent, finalScore);
      } else {
        // Next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 2000);
  }, [selectedAnswer, currentQuestion, isAnswered, isLastQuestion, score, startTime, answeredQuestions, onComplete]);

  /**
   * Get option style variant based on state
   */
  const getOptionStyle = useCallback((index: number): OptionVariant => {
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
  }, [isAnswered, selectedAnswer, currentQuestion.correctAnswer]);

  /**
   * Calculate progress percentage
   */
  const progressPercentage = useMemo(() => {
    return ((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100;
  }, [currentQuestionIndex, isAnswered, questions.length]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '1rem',
    }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          margin: 0,
        }}
      >
        🌍 Geography Quiz
      </motion.h2>

      {/* Progress Bar */}
      <div style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
          }}>
            Question {currentQuestionIndex + 1} / {questions.length}
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
          }}>
            {correctAnswers} correct
          </p>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              borderRadius: '9999px',
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          style={{
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            width: '100%',
          }}
        >
          {/* Category & Difficulty Badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500',
            }}>
              📍 {currentQuestion.category}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              background: `${getDifficultyColor(currentQuestion.difficulty)}15`,
              color: getDifficultyColor(currentQuestion.difficulty),
              border: `2px solid ${getDifficultyColor(currentQuestion.difficulty)}`,
            }}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <p style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 2rem 0',
            textAlign: 'center',
            lineHeight: '1.6',
          }}>
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0.75rem',
          }}>
            {currentQuestion.options.map((option, index) => {
              const variant = getOptionStyle(index);
              const colors = getOptionColors(variant);
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${colors.border}`,
                    background: colors.bg,
                    cursor: isAnswered ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: '1rem',
                    color: colors.text,
                    fontWeight: variant === 'selected' || variant === 'correct' ? '600' : '400',
                  }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    borderRadius: '50%',
                    background: variant === 'correct' ? '#10b981' :
                               variant === 'wrong' ? '#ef4444' :
                               variant === 'selected' ? '#6366f1' : '#e5e7eb',
                    color: variant === 'default' ? '#6b7280' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  
                  <span style={{ flex: 1 }}>{option}</span>
                  
                  {isAnswered && index === currentQuestion.correctAnswer && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#10b981',
                      }}
                    >
                      ✓
                    </motion.span>
                  )}
                  
                  {isAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                    <motion.span
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#ef4444',
                      }}
                    >
                      ✗
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback Message */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: selectedAnswer === currentQuestion.correctAnswer 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `2px solid ${selectedAnswer === currentQuestion.correctAnswer ? '#10b981' : '#ef4444'}`,
                  color: selectedAnswer === currentQuestion.correctAnswer ? '#10b981' : '#ef4444',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {selectedAnswer === currentQuestion.correctAnswer 
                  ? `✅ Correct! +${currentQuestion.difficulty === 'easy' ? 30 : currentQuestion.difficulty === 'medium' ? 40 : 50} points`
                  : '❌ Incorrect. The correct answer is highlighted.'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={selectedAnswer === null || isAnswered}
        whileHover={selectedAnswer !== null && !isAnswered ? { scale: 1.05, y: -2 } : {}}
        whileTap={selectedAnswer !== null && !isAnswered ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          padding: '0.875rem 2rem',
          fontSize: '1rem',
          fontWeight: '600',
          border: 'none',
          borderRadius: '0.75rem',
          background: selectedAnswer !== null && !isAnswered 
            ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' 
            : '#e5e7eb',
          color: selectedAnswer !== null && !isAnswered ? 'white' : '#9ca3af',
          cursor: selectedAnswer !== null && !isAnswered ? 'pointer' : 'not-allowed',
          boxShadow: selectedAnswer !== null && !isAnswered 
            ? '0 4px 6px rgba(0, 0, 0, 0.1)' 
            : 'none',
          minWidth: '180px',
        }}
      >
        {isAnswered
          ? isLastQuestion
            ? '⏳ Completing...'
            : '➡️ Next Question'
          : '✓ Submit Answer'}
      </motion.button>

      {/* Score Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.75rem',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
            Score
          </p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#6366f1',
            margin: 0,
          }}>
            {score}
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
            Accuracy
          </p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: answeredQuestions.length > 0 
              ? (correctAnswers / answeredQuestions.length >= 0.6 ? '#10b981' : '#ef4444')
              : '#6366f1',
            margin: 0,
          }}>
            {answeredQuestions.length > 0 
              ? Math.round((correctAnswers / answeredQuestions.length) * 100)
              : 0}%
          </p>
        </div>
      </motion.div>

      {/* Help Text */}
      {!isAnswered && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            textAlign: 'center',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          💡 Tip: You need 3 correct answers out of 5 to pass!
        </motion.p>
      )}
    </div>
  );
};

export default GeographyQuizChallenge;