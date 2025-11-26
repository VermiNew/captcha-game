import React from 'react';

/**
 * Game state enum - describes current state of the game
 */
export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  COMPLETED = 'completed',
}

/**
 * Challenge result - stores the outcome of a single challenge
 */
export interface ChallengeResult {
  challengeId: number;
  success: boolean;
  timeSpent: number; // in seconds
  score: number; // points earned
  accuracy?: number; // 0-100%
}

/**
 * Challenge definition - describes a challenge
 */
export interface Challenge {
  id: number;
  name: string;
  description: string;
  component: React.ComponentType<ChallengeProps>;
  timeLimit: number; // in seconds
  maxScore: number;
}

/**
 * Props passed to challenge components
 */
export interface ChallengeProps {
  onComplete: (success: boolean, timeSpent: number, score: number, accuracy?: number) => void;
  timeLimit: number; // in seconds
  challengeId: string;
}

/**
 * Player statistics
 */
export interface PlayerStats {
  totalScore: number;
  averageTime: number; // in seconds
  accuracy: number; // 0-100%
  challengesCompleted: number;
}

/**
 * Game store state
 */
export interface GameStoreState {
  gameState: GameState;
  currentChallengeIndex: number;
  challengeResults: ChallengeResult[];
  totalScore: number;
  startTime: number | null;
  playerStats: PlayerStats;
}
