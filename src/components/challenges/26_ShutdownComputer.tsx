import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

interface OSStep {
  id: number;
  description: string;
  hint: string;
  options: { text: string; correct: boolean }[];
}

const OS_STEPS: OSStep[] = [
  {
    id: 1,
    description: 'Your computer is acting strange. Find the Settings to shut it down.',
    hint: '🔍 Look for something that looks like a gear or settings icon',
    options: [
      { text: 'Click on the red X button', correct: false },
      { text: 'Right-click on the desktop', correct: true },
      { text: 'Press spacebar', correct: false },
      { text: 'Close the browser', correct: false },
    ],
  },
  {
    id: 2,
    description: 'Great! A menu appeared. What do you do next?',
    hint: '💡 You need to find something that leads to settings or system options',
    options: [
      { text: 'Click "Open Terminal"', correct: true },
      { text: 'Click "New Folder"', correct: false },
      { text: 'Click "Refresh"', correct: false },
      { text: 'Click "Open Browser"', correct: false },
    ],
  },
  {
    id: 3,
    description: 'A terminal window opened. Now you need the shutdown command.',
    hint: '⚡ The command usually starts with "shut..." or contains "power"',
    options: [
      { text: 'shutdown -s -t 0', correct: true },
      { text: 'delete everything', correct: false },
      { text: 'restart now', correct: false },
      { text: 'turn on lights', correct: false },
    ],
  },
  {
    id: 4,
    description: 'Confirm the shutdown. You see a dialog asking to confirm.',
    hint: '✅ Choose the affirmative option',
    options: [
      { text: 'Click "No"', correct: false },
      { text: 'Click "Cancel"', correct: false },
      { text: 'Click "Yes" or "Confirm"', correct: true },
      { text: 'Click "Later"', correct: false },
    ],
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

const OSScreen = styled(motion.div)`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 3px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.lg}, 0 0 30px rgba(99, 102, 241, 0.3);
  overflow: hidden;
`;

const WindowBar = styled.div`
  height: 32px;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border-radius: ${theme.borderRadius.md};
  padding: 0 ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: ${theme.fonts.mono};
  font-size: ${theme.fontSizes.sm};
  color: white;
  font-weight: ${theme.fontWeights.bold};
  letter-spacing: 0.5px;
`;

const WindowContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.md};
`;

const StepDescription = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textPrimary};
  margin: 0;
  line-height: 1.6;
`;

const HintBox = styled(motion.div)`
  padding: ${theme.spacing.md};
  background: rgba(59, 130, 246, 0.15);
  border-left: 4px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.info};
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const OptionButton = styled(motion.button)<{ $selected: boolean }>`
  padding: ${theme.spacing.md};
  background: ${props => props.$selected
    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
    : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.$selected
    ? theme.colors.primary
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: ${theme.borderRadius.md};
  color: white;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${theme.colors.primary};
    background: rgba(99, 102, 241, 0.2);
    transform: translateX(4px);
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

const ShutdownComputerChallenge: React.FC<ChallengeProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());

  const currentStep = useMemo(
    () => OS_STEPS[currentStepIndex],
    [currentStepIndex]
  );

  const progressPercentage = useMemo(
    () => ((currentStepIndex + 1) / OS_STEPS.length) * 100,
    [currentStepIndex]
  );

  const handleSubmit = useCallback(() => {
    if (submitted || selectedOption === null) return;

    setSubmitted(true);
    const correct = currentStep.options[selectedOption].correct;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 250);
    }

    setTimeout(() => {
      if (currentStepIndex < OS_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setSelectedOption(null);
        setSubmitted(false);
        setIsCorrect(undefined);
      } else {
        const timeSpent = (Date.now() - startTime) / 1000;
        onComplete(true, timeSpent, score + (correct ? 250 : 0));
      }
    }, 2000);
  }, [submitted, selectedOption, currentStep, currentStepIndex, score, startTime, onComplete]);

  return (
    <ChallengeBase
      title="💻 Shutdown the Computer"
      description="Navigate the mysterious OS and shut it down!"
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

        <OSScreen
          key={`step-${currentStepIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <WindowBar>
            <span>≡ System Control Panel</span>
            <span style={{ fontSize: '20px' }}>✕</span>
          </WindowBar>

          <WindowContent>
            <StepDescription>{currentStep.description}</StepDescription>

            <HintBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentStep.hint}
            </HintBox>

            <OptionsContainer>
              {currentStep.options.map((option, idx) => (
                <OptionButton
                  key={idx}
                  $selected={selectedOption === idx}
                  onClick={() => !submitted && setSelectedOption(idx)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.text}
                </OptionButton>
              ))}
            </OptionsContainer>
          </WindowContent>
        </OSScreen>

        <Button
          onClick={handleSubmit}
          disabled={selectedOption === null || submitted}
          size="lg"
          variant="primary"
        >
          {submitted ? (isCorrect ? '✓ Next Step' : '✗ Try Again') : 'Execute'}
        </Button>

        <AnimatePresence>
          {submitted && isCorrect !== undefined && (
            <FeedbackMessage
              $success={isCorrect}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {isCorrect ? '✅ Good choice!' : '❌ Wrong option. Try again!'}
            </FeedbackMessage>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default ShutdownComputerChallenge;
