import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

interface Question {
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Constants
 */
const POINTS_PER_QUESTION = 100;
const TIME_BONUS_PER_SECOND = 5;
const TRANSITION_DELAY = 1500;

/**
 * Generate questions
 */
const generateEasyQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const op = Math.random() > 0.5 ? '+' : '-';
  const question = `${num1} ${op} ${num2}`;
  const answer = op === '+' ? num1 + num2 : Math.max(num1 - num2, 0);
  return { question, answer, difficulty: 'easy' };
};

const generateMediumQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 12) + 3;
  const num2 = Math.floor(Math.random() * 9) + 2;
  const question = `${num1} × ${num2}`;
  const answer = num1 * num2;
  return { question, answer, difficulty: 'medium' };
};

const generateHardQuestion = (): Question => {
  const num1 = Math.floor(Math.random() * 15) + 10;
  const num2 = Math.floor(Math.random() * 15) + 5;
  const num3 = Math.floor(Math.random() * 4) + 2;
  const question = `(${num1} + ${num2}) × ${num3}`;
  const answer = (num1 + num2) * num3;
  return { question, answer, difficulty: 'hard' };
};

/**
 * Styled container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

/**
 * Progress section
 */
const ProgressSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

/**
 * Progress header
 */
const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/**
 * Progress text
 */
const ProgressText = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0;
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Difficulty badge
 */
const DifficultyBadge = styled(motion.span)<{ $difficulty: 'easy' | 'medium' | 'hard' }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$difficulty) {
      case 'easy': return 'rgba(16, 185, 129, 0.15)';
      case 'medium': return 'rgba(245, 158, 11, 0.15)';
      case 'hard': return 'rgba(239, 68, 68, 0.15)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.$difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return '#f59e0b';
      case 'hard': return theme.colors.error;
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return '#f59e0b';
      case 'hard': return theme.colors.error;
    }
  }};
`;

/**
 * Progress bar
 */
const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  border: 2px solid rgba(99, 102, 241, 0.2);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.full};
  box-shadow: 0 0 10px ${theme.colors.primary}40;
`;

/**
 * Question box
 */
const QuestionBox = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  box-shadow: ${theme.shadows.lg};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  }
`;

const QuestionDisplay = styled(motion.div)`
  font-family: ${theme.fonts.mono};
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  line-height: 1.2;
  margin: 0;
  text-shadow: 0 2px 10px ${theme.colors.primary}20;
`;

/**
 * Input field
 */
const Input = styled(motion.input)<{ $isError: boolean; $isSuccess: boolean }>`
  width: 100%;
  height: 70px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  padding: ${theme.spacing.lg};
  border: 3px solid ${props => 
    props.$isSuccess ? theme.colors.success :
    props.$isError ? theme.colors.error :
    'rgba(99, 102, 241, 0.3)'};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.textPrimary};
  background: ${props =>
    props.$isSuccess ? 'rgba(16, 185, 129, 0.05)' :
    props.$isError ? 'rgba(239, 68, 68, 0.05)' :
    theme.colors.surface};
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};

  ${props => props.$isError && `
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  `}

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
    opacity: 0.5;
  }

  @keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
  }

  /* Remove spinner */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

/**
 * Submit button
 */
const SubmitButton = styled(motion.button)<{ $isCorrect?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => {
    if (props.$isCorrect === true) return `linear-gradient(135deg, ${theme.colors.success}, #059669)`;
    if (props.$isCorrect === false) return `linear-gradient(135deg, ${theme.colors.error}, #dc2626)`;
    return `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
  }};
  color: white;
  box-shadow: ${theme.shadows.md};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Answer feedback
 */
const AnswerFeedback = styled(motion.div)<{ $isCorrect: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-weight: ${theme.fontWeights.bold};
  background: ${props => props.$isCorrect ? 
    'rgba(16, 185, 129, 0.1)' : 
    'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$isCorrect ? theme.colors.success : theme.colors.error};
  color: ${props => props.$isCorrect ? theme.colors.success : theme.colors.error};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const FeedbackIcon = styled.div`
  font-size: ${theme.fontSizes['3xl']};
`;

const FeedbackText = styled.div`
  font-size: ${theme.fontSizes.md};
`;

const CorrectAnswer = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  margin-top: ${theme.spacing.xs};
`;

/**
 * Score display
 */
const ScoreDisplay = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  width: 100%;
`;

const ScoreCard = styled(motion.div)`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const ScoreLabel = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScoreValue = styled(motion.p)`
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
`;

/**
 * Math Quiz Challenge Component
 */
const MathQuizChallenge: React.FC<ChallengeProps> = ({
  onComplete,
}) => {
  const [questions] = useState<Question[]>(() => [
    generateEasyQuestion(),
    generateEasyQuestion(),
    generateMediumQuestion(),
    generateMediumQuestion(),
    generateHardQuestion(),
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [startTime] = useState(() => Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());
  
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = useMemo(() => 
    questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  const progressPercentage = useMemo(() => 
    ((currentQuestionIndex + 1) / questions.length) * 100,
    [currentQuestionIndex, questions.length]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    if (isSubmitted || !userAnswer) return;

    setIsSubmitted(true);
    const correct = parseInt(userAnswer, 10) === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      const questionTime = (Date.now() - questionStartTime) / 1000;
      const timeBonus = Math.max(0, Math.floor((30 - questionTime) * TIME_BONUS_PER_SECOND));
      const questionScore = POINTS_PER_QUESTION + timeBonus;
      
      setScore(prev => prev + questionScore);
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
        setIsSubmitted(false);
        setIsCorrect(undefined);
        setQuestionStartTime(Date.now());
      } else {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, score + (correct ? POINTS_PER_QUESTION : 0));
      }
    }, TRANSITION_DELAY);
  }, [isSubmitted, userAnswer, currentQuestion, currentQuestionIndex, questions.length, questionStartTime, score, startTime, onComplete]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitted && userAnswer) {
      handleSubmit();
    }
  }, [isSubmitted, userAnswer, handleSubmit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and minus sign
    const value = e.target.value;
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setUserAnswer(value);
    }
  }, []);

  return (
    <ChallengeBase
      title="Math Quiz Challenge"
      description="Solve 5 math problems as fast as you can!"
    >
 
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressSection>
          <ProgressHeader>
            <ProgressText>
              Question <strong>{currentQuestionIndex + 1}</strong> of {questions.length}
            </ProgressText>
            <DifficultyBadge
              $difficulty={currentQuestion.difficulty}
              key={currentQuestionIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {currentQuestion.difficulty}
            </DifficultyBadge>
          </ProgressHeader>
          <ProgressBar>
            <ProgressFill
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </ProgressBar>
        </ProgressSection>

        <QuestionBox
          key={`question-${currentQuestionIndex}`}
          initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <QuestionDisplay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {currentQuestion.question} = ?
          </QuestionDisplay>
        </QuestionBox>

        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={userAnswer}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Your answer"
          disabled={isSubmitted}
          $isError={isSubmitted && !isCorrect}
          $isSuccess={isCorrect === true}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        />

        <SubmitButton
          onClick={handleSubmit}
          disabled={!userAnswer || isSubmitted}
          $isCorrect={isCorrect}
          whileHover={{ scale: !userAnswer || isSubmitted ? 1 : 1.02 }}
          whileTap={{ scale: !userAnswer || isSubmitted ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isSubmitted ? (isCorrect ? '✓ Correct!' : '✗ Incorrect') : 'Submit Answer'}
        </SubmitButton>

        <AnimatePresence>
          {isSubmitted && (
            <AnswerFeedback
              $isCorrect={isCorrect === true}
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FeedbackIcon>
                {isCorrect ? '🎉' : '📚'}
              </FeedbackIcon>
              <FeedbackText>
                {isCorrect ? 'Perfect!' : 'Not quite right'}
              </FeedbackText>
              {!isCorrect && (
                <>
                  <FeedbackText style={{ opacity: 0.8, fontSize: theme.fontSizes.sm }}>
                    Correct answer:
                  </FeedbackText>
                  <CorrectAnswer>{currentQuestion.answer}</CorrectAnswer>
                </>
              )}
            </AnswerFeedback>
          )}
        </AnimatePresence>

        <ScoreDisplay>
          <ScoreCard>
            <ScoreLabel>Score</ScoreLabel>
            <ScoreValue
              key={score}
              animate={{ scale: [1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              {score}
            </ScoreValue>
          </ScoreCard>
          <ScoreCard>
            <ScoreLabel>Correct</ScoreLabel>
            <ScoreValue
              key={correctAnswers}
              animate={{ scale: [1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              {correctAnswers}/{questions.length}
            </ScoreValue>
          </ScoreCard>
        </ScoreDisplay>
      </Container>
    </ChallengeBase>
  );
};

export default MathQuizChallenge;