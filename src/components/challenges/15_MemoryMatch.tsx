/**
 * Memory Match Challenge
 * 
 * Inspired by: https://codepen.io/eliortabeka/pen/WwzEEg
 * 16 cards matching game with star rating system
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChallengeProps } from '../../types';
import ChallengeBase from './ChallengeBase';
import { theme } from '../../styles/theme';

type Card = {
  id: number;
  icon: string;
  isOpen: boolean;
  isMatched: boolean;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.lg};
`;

const ScorePanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.borderLight};
`;

const StarContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.xl};
`;

const Star = styled(motion.span)<{ $filled: boolean }>`
  opacity: ${props => props.$filled ? 1 : 0.3};
  cursor: default;
`;

const MovesCounter = styled.div`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
`;

const Deck = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
`;

const CardButton = styled(motion.button)<{ $isOpen: boolean; $isMatched: boolean }>`
  aspect-ratio: 1;
  padding: 0;
  border: 2px solid ${theme.colors.borderLight};
  background: ${props =>
    props.$isMatched ? 'rgba(34, 197, 94, 0.2)' :
    props.$isOpen ? theme.colors.primary :
    theme.colors.background};
  border-color: ${props =>
    props.$isMatched ? theme.colors.success :
    props.$isOpen ? theme.colors.primary :
    theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  cursor: ${props => props.$isMatched ? 'default' : 'pointer'};
  font-size: ${theme.fontSizes['3xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.textPrimary};
  transition: all 0.3s ease;
  opacity: ${props => props.$isMatched ? 0.8 : 1};

  &:hover:not(:disabled) {
    transform: ${props => !props.$isMatched && !props.$isOpen ? 'scale(1.08)' : 'scale(1)'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ResultBox = styled(motion.div)<{ $type: 'win' | 'loss' }>`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${props => props.$type === 'win'
    ? 'rgba(34, 197, 94, 0.1)'
    : 'rgba(220, 104, 90, 0.1)'};
  border: 2px solid ${props => props.$type === 'win'
    ? theme.colors.success
    : '#dc685a'};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

const ResultTitle = styled.p`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.textPrimary};
`;

const ResultSubtext = styled.p`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const MemoryMatch: React.FC<ChallengeProps> = ({ onComplete, }) => {
  const ICONS = [
    '🚴', '🚴', '🍃', '🍃', '🎲', '🎲', '⚓', '⚓',
    '✈️', '✈️', '⚡', '⚡', '💣', '💣', '💎', '💎',
  ];

  const [cards, setCards] = useState<Card[]>([]);
  const [openedCards, setOpenedCards] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [canClick, setCanClick] = useState(true);

  const initializeGame = useCallback(() => {
    const shuffled = [...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({
        id: idx,
        icon,
        isOpen: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setOpenedCards([]);
    setMatchedCount(0);
    setMoves(0);
    setGameOver(false);
    setCanClick(true);
  }, []);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const getRating = (moves: number): number => {
    const gameCardsQTY = 8;
    const rank3stars = gameCardsQTY + 2; // 10
    const rank2stars = gameCardsQTY + 6; // 14
    const rank1stars = gameCardsQTY + 10; // 18

    if (moves <= rank3stars) return 3;
    if (moves <= rank2stars) return 2;
    if (moves <= rank1stars) return 1;
    return 0;
  };

  const handleCardClick = (id: number) => {
    if (!canClick || gameOver || openedCards.includes(id) || cards[id].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[id].isOpen = true;
    setCards(newCards);
    setOpenedCards([...openedCards, id]);

    if (openedCards.length === 1) {
      setCanClick(false);

      const firstCardId = openedCards[0];
      const firstCard = cards[firstCardId];
      const secondCard = newCards[id];

      setTimeout(() => {
        if (firstCard.icon === secondCard.icon) {
          // Match
          const matchedCards = [...newCards];
          matchedCards[firstCardId].isMatched = true;
          matchedCards[id].isMatched = true;
          setCards(matchedCards);
          setMatchedCount(matchedCount + 1);

          const newMoves = moves + 1;
          setMoves(newMoves);

          if (matchedCount + 1 === 8) {
            getRating(newMoves);
            const score = Math.max(150 - newMoves * 5, 50);
            setGameOver(true);
            setTimeout(() => {
              onComplete(true, newMoves, score);
            }, 1500);
          }
        } else {
          // No match
          const resetCards = [...newCards];
          resetCards[firstCardId].isOpen = false;
          resetCards[id].isOpen = false;
          setCards(resetCards);
          setMoves(moves + 1);
        }

        setOpenedCards([]);
        setCanClick(true);
      }, 1000);
    }
  };

  const rating = getRating(moves);

  return (
    <ChallengeBase
      title="Memory Match"
      description="Match all 8 pairs to win"
 
 

    >
      <Container>
        <ScorePanel>
          <StarContainer>
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                $filled={star <= rating}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                ⭐
              </Star>
            ))}
          </StarContainer>
          <MovesCounter>{moves} Moves</MovesCounter>
        </ScorePanel>

        <Deck>
          {cards.map((card) => (
            <CardButton
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || gameOver}
              $isOpen={card.isOpen}
              $isMatched={card.isMatched}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: card.isOpen ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 200 }}
              whileHover={
                !card.isMatched && !card.isOpen && !gameOver
                  ? { scale: 1.1 }
                  : {}
              }
              whileTap={
                !card.isMatched && !card.isOpen && !gameOver
                  ? { scale: 0.9 }
                  : {}
              }
            >
              <motion.span
                initial={card.isOpen ? { scale: 0 } : { scale: 1 }}
                animate={card.isOpen ? { scale: 1 } : { scale: 0 }}
                transition={{ type: 'spring', stiffness: 260 }}
              >
                {card.isOpen || card.isMatched ? card.icon : '?'}
              </motion.span>
            </CardButton>
          ))}
        </Deck>

        <AnimatePresence>
          {gameOver && (
            <ResultBox
              $type="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ResultTitle>🎉 Congratulations!</ResultTitle>
              <ResultSubtext>
                {moves} Moves • {rating} Star{rating !== 1 ? 's' : ''}
              </ResultSubtext>
            </ResultBox>
          )}
        </AnimatePresence>
      </Container>
    </ChallengeBase>
  );
};

export default MemoryMatch;
