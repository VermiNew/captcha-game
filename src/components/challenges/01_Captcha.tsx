import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

/**
 * Main container with centered layout and smooth spacing
 */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  width: 100%;
  padding: ${theme.spacing.lg};
`;

/**
 * Interactive verification card with hover effects
 */
const VerificationCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
  background: linear-gradient(135deg, ${theme.colors.background} 0%, rgba(99, 102, 241, 0.03) 100%);
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
    transform: translateY(-2px);
  }
`;

/**
 * Animated checkbox with state-based styling
 */
const Checkbox = styled(motion.div)<{ $isSuccess: boolean; $isLoading: boolean }>`
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  border: 3px solid ${props => 
    props.$isSuccess ? theme.colors.success : 
    props.$isLoading ? theme.colors.primary : 
    theme.colors.borderLight};
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => 
    props.$isSuccess ? 'rgba(34, 197, 94, 0.1)' : 
    theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: ${props => props.$isSuccess || props.$isLoading ? 0 : 1};
  }
`;

/**
 * Label with dynamic color based on verification state
 */
const Label = styled(motion.span)<{ $isSuccess: boolean }>`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.medium};
  color: ${props => 
    props.$isSuccess ? theme.colors.success : theme.colors.textPrimary};
  transition: color 0.3s ease;
`;

/**
 * Spinning loader animation
 */
const LoadingSpinner = styled(motion.div)`
  width: 28px;
  height: 28px;
  border: 3px solid ${theme.colors.borderLight};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
`;

/**
 * Success checkmark icon
 */
const Checkmark = styled(motion.svg)`
  width: 32px;
  height: 32px;
  color: ${theme.colors.success};
`;

/**
 * Success message with fade-in animation
 */
const SuccessMessage = styled(motion.div)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.success};
  text-align: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: rgba(34, 197, 94, 0.1);
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(34, 197, 94, 0.2);
`;

/**
 * Informational hint text below the verification card
 */
const HintText = styled(motion.p)`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &::before {
    content: '🔒';
    font-size: ${theme.fontSizes.md};
  }
`;

/**
 * Captcha Challenge Component
 * 
 * An elegant verification challenge that simulates a CAPTCHA verification.
 * Features smooth animations, visual feedback, and accessible interactions.
 * 
 * User flow:
 * 1. User sees unchecked verification card
 * 2. Clicks to initiate verification
 * 3. Loading spinner shows verification in progress (1s)
 * 4. Success state displays with checkmark animation
 * 5. Challenge completes automatically after brief delay
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
   * Handles the verification click interaction
   * Prevents multiple clicks and manages the verification flow
   */
  const handleVerification = () => {
    // Prevent interaction during loading or after success
    if (isChecked || isLoading || isSuccess) return;

    setIsChecked(true);
    setIsLoading(true);

    // Simulate server-side verification process
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      // Auto-complete after showing success animation
      setTimeout(() => {
        onComplete(true, 2, 100);
      }, 800);
    }, 1200);
  };

  /**
   * Determines the appropriate cursor style based on state
   */
  const getCursorStyle = () => {
    if (isLoading || isSuccess) return 'not-allowed';
    return 'pointer';
  };

  return (
    <ChallengeBase
      title="Verification Required"
      description="Complete this quick verification to prove you're human"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        {/* Success message with enter/exit animation */}
        <AnimatePresence>
          {isSuccess && (
            <SuccessMessage
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              ✓ Verification successful! You're all set.
            </SuccessMessage>
          )}
        </AnimatePresence>

        {/* Main verification card */}
        <VerificationCard
          onClick={handleVerification}
          whileHover={!isLoading && !isSuccess ? { scale: 1.02 } : {}}
          whileTap={!isLoading && !isSuccess ? { scale: 0.98 } : {}}
          style={{ cursor: getCursorStyle() }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Interactive checkbox */}
          <Checkbox
            $isSuccess={isSuccess}
            $isLoading={isLoading}
            animate={
              isSuccess
                ? { scale: [1, 1.1, 1] }
                : {}
            }
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            {/* Loading state */}
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

            {/* Success state with animated checkmark */}
            {isSuccess && (
              <Checkmark
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
              </Checkmark>
            )}
          </Checkbox>

          {/* Label text with state-based styling */}
          <Label
            $isSuccess={isSuccess}
            animate={
              isSuccess
                ? { x: [0, -5, 0] }
                : {}
            }
            transition={{ duration: 0.4 }}
          >
            {isSuccess ? 'Verified Human ✓' : 
             isLoading ? 'Verifying...' : 
             "I'm not a robot"}
          </Label>
        </VerificationCard>

        {/* Security hint text */}
        {!isSuccess && (
          <HintText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Your security and privacy are protected
          </HintText>
        )}
      </Container>
    </ChallengeBase>
  );
};

export default CaptchaChallenge;
