import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface ChallengeBaseProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Main challenge container
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing['2xl']};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

/**
 * Header section
 */
const Header = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
`;

/**
 * Challenge title
 */
const Title = styled.h1`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.primary};
  margin: 0;
  text-align: center;
`;

/**
 * Challenge description
 */
const Description = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0;
  text-align: center;
`;

/**
 * Content wrapper
 */
const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
`;

/**
 * ChallengeBase Component
 * Wrapper component for all challenges with consistent header/structure
 */
const ChallengeBase: React.FC<ChallengeBaseProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Header>

      <Content>
        {children}
      </Content>
    </Container>
  );
};

export default ChallengeBase;
