import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ChallengeProps } from '../../types';
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
`;

/**
 * Styled checkbox container
 */
const CheckboxContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  cursor: pointer;
  user-select: none;
`;

/**
 * Styled checkbox square
 */
const Checkbox = styled(motion.div)<{ $isSuccess: boolean }>`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) =>
      props.$isSuccess ? theme.colors.success : theme.colors.secondary};
    box-shadow: 0 0 0 3px
      rgba(
        99,
        102,
        241,
        0.1
      );
  }
`;

/**
 * Styled label
 */
const Label = styled.span`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.textPrimary};
`;

/**
 * Styled loading spinner
 */
const LoadingSpinner = styled(motion.div)`
  width: 24px;
  height: 24px;
  border: 3px solid ${theme.colors.borderLight};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
`;

/**
 * Styled checkmark
 */
const Checkmark = styled(motion.div)`
  font-size: 28px;
  color: ${theme.colors.success};
  font-weight: ${theme.fontWeights.bold};
  line-height: 1;
`;

/**
 * Captcha Challenge Component
 * Click the checkbox to prove you're not a robot
 */
const CaptchaChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Handle checkbox click
   */
  const handleCheck = () => {
    if (isChecked || isLoading || isSuccess) return;

    setIsChecked(true);
    setIsLoading(true);

    // Simulate server verification (1 second)
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      // Complete challenge after success animation
      setTimeout(() => {
        onComplete(true, 2, 100); // success, 2 seconds spent, 100 points
      }, 600);
    }, 1000);
  };

  return (
    <ChallengeBase
      title="Captcha Challenge"
      description="Prove you are not a robot by clicking the checkbox"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isSuccess ? (
            <SuccessMessage>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
              >
                You passed the verification!
              </motion.div>
            </SuccessMessage>
          ) : null}
        </motion.div>

        <CheckboxContainer
          onClick={handleCheck}
          whileHover={!isLoading && !isSuccess ? { scale: 1.05 } : {}}
          whileTap={!isLoading && !isSuccess ? { scale: 0.95 } : {}}
          animate={
            isLoading
              ? { opacity: 0.8 }
              : isSuccess
                ? { opacity: 1 }
                : { opacity: 1 }
          }
          style={{
            cursor:
              isLoading || isSuccess ? 'not-allowed' : 'pointer',
          }}
        >
          <Checkbox
            $isSuccess={isSuccess}
            animate={
              isLoading
                ? { rotate: 360 }
                : isSuccess
                  ? { scale: [1, 1.15, 1] }
                  : {}
            }
            transition={{
              duration: isLoading ? 1 : 0.5,
              repeat: isLoading ? Infinity : 0,
              ease: 'linear',
            }}
          >
            {isLoading && (
              <LoadingSpinner
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
            {isSuccess && (
              <Checkmark
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
              >
                ✓
              </Checkmark>
            )}
          </Checkbox>

          <Label>{isSuccess ? 'Verified!' : "I'm not a robot"}</Label>
        </CheckboxContainer>
      </Container>
    </ChallengeBase>
  );
};

/**
 * Success message styled component
 */
const SuccessMessage = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.success};
  text-align: center;
  margin-top: ${theme.spacing.md};
`;

export default CaptchaChallenge;
