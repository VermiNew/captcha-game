import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

interface CodeChallenge {
  id: number;
  title: string;
  description: string;
  instruction: string;
  testCases: { input: number[]; expected: number }[];
  starterCode: string;
}

const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: 1,
    title: 'Add Two Numbers',
    description: 'Create a function that adds two numbers',
    instruction: 'Write a function called "add" that takes two parameters and returns their sum.',
    testCases: [
      { input: [5, 3], expected: 8 },
      { input: [10, 20], expected: 30 },
      { input: [-5, 5], expected: 0 },
    ],
    starterCode: 'function add(a, b) {\n  // Write your code here\n  return 0;\n}',
  },
  {
    id: 2,
    title: 'Multiply Numbers',
    description: 'Create a function that multiplies two numbers',
    instruction: 'Write a function called "multiply" that takes two parameters and returns their product.',
    testCases: [
      { input: [4, 5], expected: 20 },
      { input: [7, 3], expected: 21 },
      { input: [0, 100], expected: 0 },
    ],
    starterCode: 'function multiply(a, b) {\n  // Write your code here\n  return 0;\n}',
  },
  {
    id: 3,
    title: 'Calculate Square',
    description: 'Create a function that returns the square of a number',
    instruction: 'Write a function called "square" that takes one parameter and returns its square.',
    testCases: [
      { input: [5], expected: 25 },
      { input: [10], expected: 100 },
      { input: [3], expected: 9 },
    ],
    starterCode: 'function square(n) {\n  // Write your code here\n  return 0;\n}',
  },
];

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const ChallengeCard = styled(motion.div)`
  width: 100%;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
`;

const Title = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md} 0;
`;

const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textPrimary};
  margin: 0;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${theme.borderRadius.md};
  line-height: 1.6;
`;

const CodeEditor = styled(motion.textarea)`
  width: 100%;
  min-height: 200px;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  resize: vertical;
  line-height: 1.5;
  letter-spacing: 0.5px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  &::selection {
    background: ${theme.colors.primary}40;
  }
`;

const TestCasesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
`;

const TestCase = styled(motion.div)<{ $passed?: boolean }>`
  padding: ${theme.spacing.md};
  background: ${props => props.$passed === undefined
    ? 'rgba(59, 130, 246, 0.1)'
    : props.$passed
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
  border-left: 4px solid ${props => props.$passed === undefined
    ? theme.colors.info
    : props.$passed
      ? theme.colors.success
      : theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
`;

const TestLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.semibold};
  margin-bottom: 4px;
`;

const TestCode = styled.code`
  color: ${theme.colors.textPrimary};
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

const FeedbackMessage = styled(motion.div)<{ $success: boolean }>`
  width: 100%;
  padding: ${theme.spacing.lg};
  background: ${props => props.$success
    ? 'rgba(16, 185, 129, 0.1)'
    : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$success
    ? theme.colors.success
    : theme.colors.error};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-weight: ${theme.fontWeights.bold};
  color: ${props => props.$success
    ? theme.colors.success
    : theme.colors.error};
`;

const JavaScriptCodeChallenge: React.FC<ChallengeProps> = ({ onComplete }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [code, setCode] = useState(CODE_CHALLENGES[0].starterCode);
  const [testResults, setTestResults] = useState<(boolean | undefined)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());

  const currentChallenge = useMemo(
    () => CODE_CHALLENGES[currentChallengeIndex],
    [currentChallengeIndex]
  );

  const progressPercentage = useMemo(
    () => ((currentChallengeIndex + 1) / CODE_CHALLENGES.length) * 100,
    [currentChallengeIndex]
  );

  const runTests = useCallback(() => {
    try {
      // eslint-disable-next-line no-eval
      eval(code);
      const results: (boolean | undefined)[] = [];

      currentChallenge.testCases.forEach((testCase) => {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(`${code.split('function')[1].split('(')[0]}(${testCase.input.join(',')})`);
          results.push(result === testCase.expected);
        } catch {
          results.push(false);
        }
      });

      setTestResults(results);
      setSubmitted(true);

      const allPassed = results.every(r => r === true);
      if (allPassed) {
        setTimeout(() => {
          if (currentChallengeIndex < CODE_CHALLENGES.length - 1) {
            setCurrentChallengeIndex(prev => prev + 1);
            setCode(CODE_CHALLENGES[currentChallengeIndex + 1].starterCode);
            setTestResults([]);
            setSubmitted(false);
          } else {
            const timeSpent = (Date.now() - startTime) / 1000;
            onComplete(true, timeSpent, 300 * CODE_CHALLENGES.length);
          }
        }, 2500);
      }
    } catch {
      setTestResults(currentChallenge.testCases.map(() => false));
      setSubmitted(true);
    }
  }, [code, currentChallenge, currentChallengeIndex, startTime, onComplete]);

  return (
    <ChallengeBase
      title="💻 JavaScript Code Challenge"
      description="Write JavaScript functions to solve the challenges"
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

        <ChallengeCard
          key={`challenge-${currentChallengeIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Title>{currentChallenge.title}</Title>
          <Description>{currentChallenge.description}</Description>
          <Instruction>{currentChallenge.instruction}</Instruction>
        </ChallengeCard>

        <CodeEditor
          value={code}
          onChange={(e) => !submitted && setCode(e.target.value)}
          spellCheck="false"
          disabled={submitted}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />

        <TestCasesContainer>
          {currentChallenge.testCases.map((testCase, idx) => (
            <TestCase
              key={idx}
              $passed={testResults[idx]}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <TestLabel>
                Test Case {idx + 1}:
                {testResults[idx] === undefined && ' Pending'}
                {testResults[idx] === true && ' ✓ Passed'}
                {testResults[idx] === false && ' ✗ Failed'}
              </TestLabel>
              <TestCode>
                {`Input: [${testCase.input.join(', ')}] → Expected: ${testCase.expected}`}
              </TestCode>
            </TestCase>
          ))}
        </TestCasesContainer>

        <Button
          onClick={runTests}
          disabled={submitted && testResults.every(r => r === true)}
          size="lg"
          variant="primary"
        >
          {testResults.every(r => r === true) ? '✓ All Tests Passed!' : 'Run Tests'}
        </Button>

        <AnimatePresence>
          {submitted && (
            <FeedbackMessage
              $success={testResults.every(r => r === true)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {testResults.every(r => r === true)
                ? '🎉 All tests passed! Great job!'
                : '❌ Some tests failed. Try again!'}
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default JavaScriptCodeChallenge;
