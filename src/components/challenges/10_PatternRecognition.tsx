import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';

/**
 * Question type definition
 */
interface Question {
  id: number;
  type: 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'prime';
  sequence: number[];
  correctAnswer: number;
  description: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generate arithmetic progression question
 */
const generateArithmeticQuestion = (): Question => {
  const start = Math.floor(Math.random() * 5) + 1;
  const diff = Math.floor(Math.random() * 4) + 2;
  const count = 5;

  const sequence = Array.from({ length: count }, (_, i) => start + i * diff);
  const correctAnswer = start + count * diff;

  return {
    id: 1,
    type: 'arithmetic',
    sequence,
    correctAnswer,
    description: 'Arithmetic Progression',
    hint: `Each number increases by ${diff}`,
    difficulty: 'easy',
  };
};

/**
 * Generate geometric progression question
 */
const generateGeometricQuestion = (): Question => {
  const start = Math.floor(Math.random() * 3) + 2;
  const ratio = Math.floor(Math.random() * 2) + 2;
  const count = 4;

  const sequence = Array.from({ length: count }, (_, i) => start * Math.pow(ratio, i));
  const correctAnswer = start * Math.pow(ratio, count);

  return {
    id: 2,
    type: 'geometric',
    sequence,
    correctAnswer,
    description: 'Geometric Progression',
    hint: `Each number is multiplied by ${ratio}`,
    difficulty: 'medium',
  };
};

/**
 * Generate Fibonacci question
 */
const generateFibonacciQuestion = (): Question => {
  const sequence = [1, 1];

  for (let i = 2; i < 5; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }

  const correctAnswer = sequence[sequence.length - 1] + sequence[sequence.length - 2];

  return {
    id: 3,
    type: 'fibonacci',
    sequence,
    correctAnswer,
    description: 'Fibonacci Sequence',
    hint: 'Each number is the sum of the previous two',
    difficulty: 'medium',
  };
};

/**
 * Generate square numbers question
 */
const generateSquareQuestion = (): Question => {
  const start = 1;
  const count = 5;
  
  const sequence = Array.from({ length: count }, (_, i) => Math.pow(start + i, 2));
  const correctAnswer = Math.pow(start + count, 2);

  return {
    id: 4,
    type: 'square',
    sequence,
    correctAnswer,
    description: 'Square Numbers',
    hint: 'These are perfect squares: 1², 2², 3²...',
    difficulty: 'hard',
  };
};

/**
 * Generate prime numbers question
 */
const generatePrimeQuestion = (): Question => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const sequence = primes.slice(0, 5);
  const correctAnswer = primes[5];

  return {
    id: 5,
    type: 'prime',
    sequence,
    correctAnswer,
    description: 'Prime Numbers',
    hint: 'Numbers divisible only by 1 and themselves',
    difficulty: 'hard',
  };
};

/**
 * Pattern Recognition Challenge Component
 * Enhanced with better UX, accessibility, and performance
 */
const PatternRecognitionChallenge: React.FC<ChallengeProps> = ({
  onComplete,
}) => {
  // Generate questions once on mount
  const [questions] = useState<Question[]>(() => {
    const allQuestions = [
      generateArithmeticQuestion(),
      generateGeometricQuestion(),
      generateFibonacciQuestion(),
      generateSquareQuestion(),
      generatePrimeQuestion(),
    ];
    return allQuestions;
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [feedback, setFeedback] = useState<(boolean | null)[]>([null, null, null, null, null]);
  const [inputValue, setInputValue] = useState('');
  const [startTime] = useState(() => Date.now());
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState<boolean[]>([false, false, false, false, false]);
  const [attempts, setAttempts] = useState<number[]>([0, 0, 0, 0, 0]);
  const [hasInputError, setHasInputError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * Calculate final score based on performance
   */
  const calculateScore = useCallback(() => {
    let totalScore = 0;
    
    feedback.forEach((isCorrect, idx) => {
      if (isCorrect) {
        let questionScore = 100;
        
        // Deduct points for hints
        if (hintUsed[idx]) {
          questionScore -= 30;
        }
        
        // Deduct points for multiple attempts (more lenient)
        const extraAttempts = Math.max(0, attempts[idx] - 1);
        questionScore -= extraAttempts * 10;
        
        // Bonus for difficulty
        const difficulty = questions[idx].difficulty;
        if (difficulty === 'medium') questionScore += 20;
        if (difficulty === 'hard') questionScore += 40;
        
        totalScore += Math.max(30, questionScore);
      }
    });
    
    return totalScore;
  }, [feedback, hintUsed, attempts, questions]);

  /**
   * Handle answer submission
   */
  const handleSubmitAnswer = useCallback(() => {
    if (!inputValue.trim() || isSubmitting) return;

    const userAnswer = parseInt(inputValue, 10);

    if (isNaN(userAnswer)) {
      setHasInputError(true);
      return;
    }

    setIsSubmitting(true);

    // Track attempts
    const newAttempts = [...attempts];
    newAttempts[currentQuestionIndex]++;
    setAttempts(newAttempts);

    // Check if answer is correct
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    // Update state
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = userAnswer;
    setAnswers(newAnswers);

    const newFeedback = [...feedback];
    newFeedback[currentQuestionIndex] = isCorrect;
    setFeedback(newFeedback);

    // Reset input
    setInputValue('');
    setShowHint(false);

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsSubmitting(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 1800);
    } else {
      // Challenge complete
      setTimeout(() => {
      const correctCount = newFeedback.filter((f) => f === true).length;
      const success = correctCount >= 3;
        const score = calculateScore();
        const timeSpent = (Date.now() - startTime) / 1000;

        onComplete(success, timeSpent, score);
      }, 2000);
    }
  }, [inputValue, isSubmitting, currentQuestionIndex, currentQuestion, answers, feedback, attempts, questions, startTime, calculateScore, onComplete]);

  /**
   * Handle hint toggle
   */
  const handleToggleHint = useCallback(() => {
    if (!showHint) {
      const newHintUsed = [...hintUsed];
      newHintUsed[currentQuestionIndex] = true;
      setHintUsed(newHintUsed);
    }
    setShowHint(!showHint);
  }, [showHint, hintUsed, currentQuestionIndex]);

  /**
   * Handle Enter key press
   */
  useEffect(() => {
    const isAnswered = feedback[currentQuestionIndex] !== null;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && inputValue.trim() && !isAnswered && !isSubmitting) {
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [inputValue, handleSubmitAnswer, isSubmitting, feedback, currentQuestionIndex]);

  /**
   * Focus input when question changes
   */
  useEffect(() => {
    if (feedback[currentQuestionIndex] === null && !isSubmitting) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, feedback, isSubmitting]);

  /**
   * Clear input error after animation
   */
  useEffect(() => {
    if (hasInputError) {
      const timer = setTimeout(() => setHasInputError(false), 600);
      return () => clearTimeout(timer);
    }
  }, [hasInputError]);

  const isAnswered = feedback[currentQuestionIndex] !== null;
  const isCorrect = feedback[currentQuestionIndex] === true;
  const correctCount = useMemo(() => feedback.filter(f => f === true).length, [feedback]);
  const answeredCount = useMemo(() => feedback.filter(f => f !== null).length, [feedback]);
  const accuracy = useMemo(() => {
    return answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  }, [answeredCount, correctCount]);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6366f1';
    }
  };

  return (
    <ChallengeBase
      title="Pattern Recognition"
      description="Identify the pattern and find the next number"
    >
 
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
      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        width: '100%',
        flexWrap: 'wrap',
      }}>
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.1 }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              color: 'white',
              cursor: 'default',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: feedback[idx] === null 
                ? (idx === currentQuestionIndex ? '#6366f1' : '#e5e7eb')
                : (feedback[idx] ? '#10b981' : '#ef4444'),
              border: `3px solid ${
                feedback[idx] === null 
                  ? (idx === currentQuestionIndex ? '#6366f1' : '#d1d5db')
                  : (feedback[idx] ? '#10b981' : '#ef4444')
              }`,
            }}
          >
            {feedback[idx] === null ? idx + 1 : feedback[idx] ? '✓' : '✗'}
          </motion.div>
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        borderRadius: '1rem',
        gap: '1rem',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>Progress</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#6366f1',
            }}>{currentQuestionIndex + 1}/5</span>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>Correct</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#10b981',
          }}>{correctCount}</span>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>Accuracy</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#6366f1',
          }}>{accuracy}%</span>
        </div>
      </div>

      {/* Question Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Question Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '600',
            }}>{currentQuestion.description}</p>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: `${getDifficultyColor(currentQuestion.difficulty)}15`,
              color: getDifficultyColor(currentQuestion.difficulty),
              border: `2px solid ${getDifficultyColor(currentQuestion.difficulty)}`,
            }}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Find the Next Number
          </motion.h3>

          {/* Sequence Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
              borderRadius: '1rem',
              width: '100%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '2px solid #e5e7eb',
            }}
          >
            {currentQuestion.sequence.map((num, idx) => (
              <React.Fragment key={idx}>
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.08, type: 'spring', stiffness: 200 }}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#6366f1',
                    padding: '0.5rem 1rem',
                    background: '#ffffff',
                    borderRadius: '0.5rem',
                    border: '2px solid #6366f1',
                    minWidth: '60px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {num}
                </motion.span>
                {idx < currentQuestion.sequence.length - 1 && (
                  <span style={{ fontSize: '1.5rem', color: '#9ca3af', fontWeight: 'bold' }}>,</span>
                )}
              </React.Fragment>
            ))}
            <span style={{ fontSize: '1.5rem', color: '#9ca3af', fontWeight: 'bold' }}>,</span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              style={{
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#a855f7',
                padding: '0.5rem 1rem',
                background: '#ffffff',
                borderRadius: '0.5rem',
                border: '2px solid #a855f7',
                minWidth: '60px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              ?
            </motion.span>
          </motion.div>

          {/* Input Section */}
          {!isAnswered ? (
            <>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                width: '100%',
                alignItems: 'stretch',
              }}>
                <motion.input
                  ref={inputRef}
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Your answer..."
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    x: hasInputError ? [-5, 5, -5, 5, 0] : 0
                  }}
                  transition={{ delay: 0.3, duration: hasInputError ? 0.3 : 0.2 }}
                  style={{
                    flex: 1,
                    height: '60px',
                    fontFamily: 'monospace',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    padding: '0.75rem 1rem',
                    border: `3px solid ${hasInputError ? '#ef4444' : '#6366f1'}`,
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    color: '#1f2937',
                    background: isSubmitting ? '#f9fafb' : '#ffffff',
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  aria-label="Answer input"
                />
                <motion.button
                  onClick={handleSubmitAnswer}
                  disabled={!inputValue.trim() || isSubmitting}
                  whileHover={{ scale: inputValue.trim() && !isSubmitting ? 1.05 : 1 }}
                  whileTap={{ scale: inputValue.trim() && !isSubmitting ? 0.95 : 1 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    height: '60px',
                    padding: '0 2rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: inputValue.trim() && !isSubmitting ? '#6366f1' : '#e5e7eb',
                    color: inputValue.trim() && !isSubmitting ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: inputValue.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {isSubmitting ? 'Checking...' : 'Submit'}
                </motion.button>
              </div>

              {/* Hint Button - shows after 1 attempt */}
              {attempts[currentQuestionIndex] >= 1 && !showHint && (
                <motion.button
                  onClick={handleToggleHint}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    alignSelf: 'center',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: 'transparent',
                    color: '#6366f1',
                    border: '2px solid #6366f1',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  💡 Show Hint (-30 points)
                </motion.button>
              )}

              {/* Hint Display */}
              <AnimatePresence>
                {showHint && currentQuestion.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      padding: '1rem 1.5rem',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '2px solid #6366f1',
                      borderRadius: '0.75rem',
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      fontWeight: '500',
                    }}
                  >
                    💡 {currentQuestion.hint}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isCorrect ? '#10b981' : '#ef4444',
                border: `3px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                width: '100%',
                boxShadow: isCorrect 
                  ? '0 4px 16px rgba(16, 185, 129, 0.2)' 
                  : '0 4px 16px rgba(239, 68, 68, 0.2)',
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                {isCorrect ? '✓' : '✗'}
              </span>
              <span>
                {isCorrect
                  ? `Correct! The answer is ${currentQuestion.correctAnswer}`
                  : `Not quite. The correct answer is ${currentQuestion.correctAnswer}`}
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Attempt Counter */}
      {!isAnswered && attempts[currentQuestionIndex] > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            textAlign: 'center',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          Attempt {attempts[currentQuestionIndex]} {attempts[currentQuestionIndex] >= 1 && '• Hint available after 1 attempt'}
        </motion.p>
      )}
      </div>
    </ChallengeBase>
  );
};

export default PatternRecognitionChallenge;