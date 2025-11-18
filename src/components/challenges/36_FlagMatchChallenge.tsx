import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import Button from '../ui/Button';
import { theme } from '../../styles/theme';

/**
 * Flag data type
 */
interface FlagData {
  flag: string;
  name: string;
  id: string;
}

/**
 * Available flags
 */
const FLAG_DATABASE: FlagData[] = [
  { flag: '🇵🇱', name: 'Poland', id: 'poland' },
  { flag: '🇺🇸', name: 'USA', id: 'usa' },
  { flag: '🇬🇧', name: 'UK', id: 'uk' },
  { flag: '🇫🇷', name: 'France', id: 'france' },
  { flag: '🇩🇪', name: 'Germany', id: 'germany' },
  { flag: '🇯🇵', name: 'Japan', id: 'japan' },
  { flag: '🇮🇹', name: 'Italy', id: 'italy' },
  { flag: '🇪🇸', name: 'Spain', id: 'spain' },
  { flag: '🇨🇦', name: 'Canada', id: 'canada' },
  { flag: '🇧🇷', name: 'Brazil', id: 'brazil' },
  { flag: '🇦🇺', name: 'Australia', id: 'australia' },
  { flag: '🇰🇷', name: 'Korea', id: 'korea' },
];

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
 * Styled instructions
 */
const Instructions = styled.p`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled matching container
 */
const MatchingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

/**
 * Styled column
 */
const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

/**
 * Styled column title
 */
const ColumnTitle = styled.h3`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin: 0;
`;

/**
 * Styled flag button
 */
const FlagButton = styled(motion.button)<{ $matched?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.fontSizes['3xl']};
  border: 2px solid
    ${(props) =>
      props.$matched ? theme.colors.success : theme.colors.primary};
  background: ${(props) =>
    props.$matched ? 'rgba(16, 185, 129, 0.1)' : 'white'};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
  font-weight: ${theme.fontWeights.bold};

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Styled country button
 */
const CountryButton = styled(motion.button)<{ $matched?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  border: 2px solid
    ${(props) =>
      props.$matched ? theme.colors.success : theme.colors.primary};
  background: ${(props) =>
    props.$matched ? 'rgba(16, 185, 129, 0.1)' : 'white'};
  color: ${theme.colors.textPrimary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover:not(:disabled) {
    transform: translateX(5px);
    box-shadow: ${theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Styled action buttons
 */
const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  width: 100%;
`;

/**
 * Styled progress
 */
const Progress = styled.div`
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.textSecondary};
`;

/**
 * Shuffle array
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Flag Match Challenge Component
 * Match flags to country names using click-based matching
 */
const FlagMatchChallenge: React.FC<ChallengeProps> = ({
  onComplete,
  timeLimit,
  challengeId,
}) => {
  const totalPairs = 6;
  const successThreshold = 5;
  const pointsPerMatch = 35;

  const [flags, setFlags] = useState<FlagData[]>(() => {
    const selected = shuffleArray(FLAG_DATABASE).slice(0, totalPairs);
    return shuffleArray([...selected]);
  });
  const [countries, setCountries] = useState<FlagData[]>(() => {
    const selected = shuffleArray(FLAG_DATABASE).slice(0, totalPairs);
    return shuffleArray([...selected]);
  });
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /**
   * Handle flag selection and country matching
   */
  const handleCountryClick = (countryId: string) => {
    if (!selectedFlag || submitted) return;

    // Check if flag is already matched
    if (Object.values(matches).includes(selectedFlag)) return;

    // Check if country is already matched
    if (Object.keys(matches).includes(countryId)) return;

    setMatches((prev) => ({
      ...prev,
      [countryId]: selectedFlag,
    }));
    setSelectedFlag(null);
  };

  /**
   * Handle reset match
   */
  const handleReset = () => {
    setMatches({});
    setSelectedFlag(null);
  };

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (Object.keys(matches).length !== totalPairs) return;

    setSubmitted(true);

    // Check correct matches
    const correctMatches = Object.entries(matches).filter(
      ([countryId, flagId]) => {
        const country = countries.find((c) => c.id === countryId);
        const flag = flags.find((f) => f.id === flagId);
        return country && flag && country.id === flag.id;
      }
    ).length;

    setTimeout(() => {
      const success = correctMatches >= successThreshold;
      const score = correctMatches * pointsPerMatch;
      onComplete(success, 0, score);
    }, 500);
  };

  if (flags.length === 0 || countries.length === 0) return null;

  const correctMatches = Object.entries(matches).filter(
    ([countryId, flagId]) => {
      const country = countries.find((c) => c.id === countryId);
      const flag = flags.find((f) => f.id === flagId);
      return country && flag && country.id === flag.id;
    }
  ).length;

  return (
    <ChallengeBase
      title="Flag Match Challenge"
      description="Match flags to their country names"
      timeLimit={timeLimit}
      challengeId={challengeId}
      onComplete={onComplete}
    >
      <Container>
        <Instructions>
          Click a flag, then click the country name to match them
        </Instructions>

        <Progress>
          Matched: {Object.keys(matches).length} / {totalPairs}
        </Progress>

        <MatchingContainer>
          <Column>
            <ColumnTitle>Flags</ColumnTitle>
            {flags.map((flag) => (
              <FlagButton
                key={flag.id}
                $matched={
                  Object.values(matches).includes(flag.id) ||
                  selectedFlag === flag.id
                }
                onClick={() => setSelectedFlag(flag.id)}
                disabled={
                  submitted ||
                  (selectedFlag !== flag.id &&
                    Object.values(matches).includes(flag.id))
                }
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  backgroundColor:
                    selectedFlag === flag.id ? 'rgba(99, 102, 241, 0.2)' : '',
                }}
              >
                {flag.flag}
              </FlagButton>
            ))}
          </Column>

          <Column>
            <ColumnTitle>Countries</ColumnTitle>
            {countries.map((country) => {
              const matchedFlagId = matches[country.id];
              const matchedFlag = flags.find((f) => f.id === matchedFlagId);
              const isCorrect =
                matchedFlag && matchedFlag.id === country.id;

              return (
                <CountryButton
                  key={country.id}
                  $matched={!!matchedFlagId && isCorrect}
                  onClick={() => handleCountryClick(country.id)}
                  disabled={
                    submitted ||
                    (!selectedFlag && !Object.keys(matches).includes(country.id))
                  }
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundColor:
                      matchedFlagId && !isCorrect
                        ? 'rgba(239, 68, 68, 0.1)'
                        : '',
                  }}
                >
                  {matchedFlagId && (
                    <span style={{ marginRight: '8px' }}>
                      {matchedFlag?.flag}
                    </span>
                  )}
                  {country.name}
                </CountryButton>
              );
            })}
          </Column>
        </MatchingContainer>

        <ActionButtons>
          <Button
            onClick={handleReset}
            disabled={Object.keys(matches).length === 0 || submitted}
            size="md"
            variant="secondary"
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              Object.keys(matches).length !== totalPairs || submitted
            }
            size="md"
            variant="primary"
          >
            Check ({correctMatches}/{successThreshold})
          </Button>
        </ActionButtons>
      </Container>
    </ChallengeBase>
  );
};

export default FlagMatchChallenge;
