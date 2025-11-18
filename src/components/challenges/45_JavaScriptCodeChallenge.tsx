import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

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
 * Styled instruction
 */
const Instruction = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled editor container
 */
const EditorContainer = styled.div`
  width: 100%;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
  overflow: hidden;
  border: 2px solid ${theme.colors.borderLight};
`;

/**
 * Styled editor header
 */
const EditorHeader = styled.div`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled textarea for code
 */
const CodeEditor = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.lg};
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: ${theme.fontSizes.sm};
  line-height: 1.6;
  border: none;
  background: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  resize: vertical;
  min-height: 250px;
  max-height: 400px;

  &:focus {
    outline: none;
  }

  &:disabled {
    background: ${theme.colors.surface};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

/**
 * Styled button container
 */
const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled button
 */
const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) =>
    props.$variant === 'secondary' ? theme.colors.surface : theme.colors.primary};
  color: ${(props) =>
    props.$variant === 'secondary' ? theme.colors.textPrimary : 'white'};
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
 * Styled output container
 */
const OutputContainer = styled(motion.div)`
  width: 100%;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
  overflow: hidden;
  border: 2px solid ${theme.colors.borderLight};
`;

/**
 * Styled output header
 */
const OutputHeader = styled.div`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.fontWeights.semibold};
`;

/**
 * Styled output content
 */
const OutputContent = styled.div<{ $type?: 'success' | 'error' }>`
  padding: ${theme.spacing.lg};
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: ${theme.fontSizes.sm};
  line-height: 1.6;
  color: ${(props) =>
    props.$type === 'error' ? theme.colors.error : theme.colors.success};
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 80px;
`;

/**
 * Styled result message
 */
const ResultMessage = styled(motion.div)<{ $type: 'success' | 'error' }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  background: ${(props) =>
    props.$type === 'success'
      ? `rgba(34, 197, 94, 0.1)`
      : `rgba(239, 68, 68, 0.1)`};
  color: ${(props) =>
    props.$type === 'success' ? theme.colors.success : theme.colors.error};
  border: 2px solid
    ${(props) =>
      props.$type === 'success' ? theme.colors.success : theme.colors.error};
`;

/**
 * JavaScript Code Challenge Component
 * Write JavaScript code that outputs "Hello World!"
 */
const JavaScriptCodeChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [code, setCode] = useState('// Write your code here\n');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [startTime] = useState(Date.now());

  /**
   * Execute the code
   */
  const runCode = () => {
    setError('');
    setOutput('');
    setIsRunning(true);

    try {
      // Create a custom console to capture output
      const outputs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          outputs.push(args.map((arg) => String(arg)).join(' '));
        },
      };

      // Execute code in a sandboxed function
      const func = new Function('console', code);
      func(customConsole);

      const result = outputs.join('\n');
      setOutput(result);

      // Check if output is "Hello World!"
      if (result.trim() === 'Hello World!') {
        setIsSuccess(true);
        setTimeout(() => {
          const timeSpent = (Date.now() - startTime) / 1000;
          onComplete(true, timeSpent, 200);
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    }

    setIsRunning(false);
  };

  /**
   * Reset code
   */
  const resetCode = () => {
    setCode('// Write your code here\n');
    setOutput('');
    setError('');
    setIsSuccess(false);
  };

  return (
    <ChallengeBase
      title="JavaScript Code Challenge"
      description="Write code that outputs exactly 'Hello World!'"
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
          JavaScript Code Editor
        </Title>

        <Instruction>
          Write JavaScript code that outputs exactly "Hello World!" using console.log()
        </Instruction>

        <EditorContainer>
          <EditorHeader>JavaScript Code</EditorHeader>
          <CodeEditor
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isSuccess}
            placeholder="// Write your code here"
          />
        </EditorContainer>

        <ButtonContainer>
          <Button
            onClick={runCode}
            disabled={isSuccess || isRunning}
            $variant="primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button
            onClick={resetCode}
            disabled={isSuccess}
            $variant="secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </Button>
        </ButtonContainer>

        {(output || error) && (
          <OutputContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OutputHeader>Output</OutputHeader>
            <OutputContent $type={error ? 'error' : 'success'}>
              {error || output}
            </OutputContent>
          </OutputContainer>
        )}

        {isSuccess && (
          <ResultMessage
            $type="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ✓ Success! You output "Hello World!" correctly!
          </ResultMessage>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default JavaScriptCodeChallenge;
