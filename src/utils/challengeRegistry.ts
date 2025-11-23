import { Challenge, ChallengeProps } from '../types';
import React from 'react';

/**
 * Challenge Registry
 * Centralized registry of all challenges in the game
 * Makes it easy to add, remove, or modify challenges
 */

// Placeholder component for challenges that haven't been loaded yet
const PlaceholderChallenge: React.ComponentType<ChallengeProps> = () => null;

/**
 * Array of all challenges in the game
 */
export const challengeRegistry: Challenge[] = [
  {
    id: 1,
    name: 'Captcha',
    description: 'Prove you are not a robot',
    component: PlaceholderChallenge,
    timeLimit: 20,
    maxScore: 100,
  },
  {
    id: 2,
    name: 'Simple Math',
    description: 'Solve a simple math problem',
    component: PlaceholderChallenge,
    timeLimit: 25,
    maxScore: 100,
  },
  {
    id: 3,
    name: 'Type Text',
    description: 'Type the text correctly',
    component: PlaceholderChallenge,
    timeLimit: 40,
    maxScore: 150,
  },
  {
    id: 4,
    name: 'Reverse Text',
    description: 'Read backwards and type normally',
    component: PlaceholderChallenge,
    timeLimit: 60,
    maxScore: 200,
  },
  {
    id: 5,
    name: 'Drag & Drop Sentence',
    description: 'Drag words to build a sentence',
    component: PlaceholderChallenge,
    timeLimit: 40,
    maxScore: 150,
  },
  {
    id: 6,
    name: 'Math Quiz',
    description: 'Answer 3 math questions',
    component: PlaceholderChallenge,
    timeLimit: 70,
    maxScore: 300,
  },
  {
    id: 7,
    name: 'Draw Circle',
    description: 'Draw a perfect circle (90% accuracy)',
    component: PlaceholderChallenge,
    timeLimit: 50,
    maxScore: 250,
  },
  {
    id: 8,
    name: 'Geography Quiz',
    description: 'Answer geography questions',
    component: PlaceholderChallenge,
    timeLimit: 55,
    maxScore: 200,
  },
  {
    id: 9,
    name: 'Find Emoji',
    description: 'Find the requested emoji',
    component: PlaceholderChallenge,
    timeLimit: 25,
    maxScore: 100,
  },
  {
    id: 10,
    name: 'Pattern Recognition',
    description: 'Identify the pattern',
    component: PlaceholderChallenge,
    timeLimit: 55,
    maxScore: 200,
  },
  {
    id: 11,
    name: 'Reaction Time',
    description: 'React as fast as you can',
    component: PlaceholderChallenge,
    timeLimit: 15,
    maxScore: 100,
  },
  {
    id: 12,
    name: 'Sliding Puzzle',
    description: 'Solve the sliding puzzle',
    component: PlaceholderChallenge,
    timeLimit: 150,
    maxScore: 500,
  },
  {
    id: 13,
    name: 'Tic Tac Toe',
    description: 'Beat the AI at Tic Tac Toe',
    component: PlaceholderChallenge,
    timeLimit: 55,
    maxScore: 200,
  },
  {
    id: 14,
    name: 'Click Precision',
    description: 'Click targets with precision',
    component: PlaceholderChallenge,
    timeLimit: 35,
    maxScore: 200,
  },
  {
    id: 15,
    name: 'Tower Builder',
    description: 'Stack blocks perfectly to build the tallest tower',
    component: PlaceholderChallenge,
    timeLimit: 80,
    maxScore: 300,
  },
  {
    id: 16,
    name: 'Odd One Out',
    description: 'Find the odd one out',
    component: PlaceholderChallenge,
    timeLimit: 40,
    maxScore: 150,
  },
  {
    id: 14,
    name: 'Visual Memory',
    description: 'Remember the grid pattern',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 300,
  },
  {
    id: 18,
    name: 'Balance Game',
    description: 'Balance the scale',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 250,
  },
  {
    id: 19,
    name: 'Chess Puzzle',
    description: 'Find the checkmate in one move',
    component: PlaceholderChallenge,
    timeLimit: 120,
    maxScore: 250,
  },
  {
    id: 20,
    name: 'Connect Dots',
    description: 'Connect all dots without crossing lines',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 200,
  },
  {
    id: 18,
    name: 'Mouse Maze',
    description: 'Navigate the maze without hitting walls',
    component: PlaceholderChallenge,
    timeLimit: 110,
    maxScore: 300,
  },
  {
    id: 22,
    name: 'Whack A Mole',
    description: 'Click on the moles before they hide',
    component: PlaceholderChallenge,
    timeLimit: 40,
    maxScore: 250,
  },
  {
    id: 23,
    name: 'Target Practice',
    description: 'Click on the targets before time runs out',
    component: PlaceholderChallenge,
    timeLimit: 40,
    maxScore: 300,
  },
  {
    id: 18,
    name: 'Keyboard Memory',
    description: 'Remember and type the letter sequences',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 300,
  },
  {
    id: 25,
    name: 'Color Blind Test',
    description: 'Identify the hidden numbers in the colored patterns',
    component: PlaceholderChallenge,
    timeLimit: 65,
    maxScore: 250,
  },
  {
    id: 26,
    name: 'Shutdown Computer',
    description: 'Navigate through the OS and shut down the computer',
    component: PlaceholderChallenge,
    timeLimit: 55,
    maxScore: 130,
  },
  {
    id: 27,
    name: 'Fraction Fighter',
    description: 'Compare fractions and select the larger one',
    component: PlaceholderChallenge,
    timeLimit: 50,
    maxScore: 240,
  },
  {
    id: 22,
    name: 'Flag Match',
    description: 'Match flags to their country names',
    component: PlaceholderChallenge,
    timeLimit: 60,
    maxScore: 210,
  },
  {
    id: 23,
    name: 'Science Quiz',
    description: 'Answer 6 science questions correctly',
    component: PlaceholderChallenge,
    timeLimit: 70,
    maxScore: 240,
  },
  {
    id: 30,
    name: 'Space Shooter',
    description: 'Destroy asteroids and survive for 60 seconds',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 400,
  },
  {
    id: 31,
    name: 'Pixel Art Memory',
    description: 'Memorize and draw the pixel art pattern',
    component: PlaceholderChallenge,
    timeLimit: 65,
    maxScore: 300,
  },
  {
    id: 32,
    name: 'Math Sorting',
    description: 'Sort numbers by different rules',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 300,
  },
  {
    id: 33,
    name: '3D Cube Rotation',
    description: 'Rotate the cube to match the target orientation',
    component: PlaceholderChallenge,
    timeLimit: 120,
    maxScore: 250,
  },
  {
    id: 26,
    name: 'Logic Chain Solver',
    description: 'Use clues to solve a 4x4 logic puzzle',
    component: PlaceholderChallenge,
    timeLimit: 150,
    maxScore: 300,
  },
  {
    id: 35,
    name: 'JavaScript Code',
    description: 'Write code that outputs "Hello World!"',
    component: PlaceholderChallenge,
    timeLimit: 90,
    maxScore: 200,
  },
  {
    id: 22,
    name: 'Binary Calculator',
    description: 'Convert 4 decimal numbers to binary',
    component: PlaceholderChallenge,
    timeLimit: 75,
    maxScore: 300,
  },
  {
    id: 37,
    name: 'Pong Arcade',
    description: 'Win 3 rounds of Pong against AI (first to 11 points)',
    component: PlaceholderChallenge,
    timeLimit: 150,
    maxScore: 300,
  },
  {
    id: 38,
    name: 'Tetris Sprint',
    description: 'Clear lines and score 5000 points or clear 10 lines',
    component: PlaceholderChallenge,
    timeLimit: 180,
    maxScore: 500,
  },
  {
    id: 30,
    name: 'IT & Network Knowledge Quiz',
    description: 'Answer 12 IT and Network questions (need 9/12 correct)',
    component: PlaceholderChallenge,
    timeLimit: 110,
    maxScore: 300,
  },
  {
    id: 40,
    name: 'Maze Key Quest',
    description: 'Navigate the maze, find the key, and reach the exit',
    component: PlaceholderChallenge,
    timeLimit: 150,
    maxScore: 250,
  },
  {
    id: 41,
    name: 'Highway Racer',
    description: 'Navigate through traffic for 30 seconds',
    component: PlaceholderChallenge,
    timeLimit: 35,
    maxScore: 400,
  },
];

/**
 * Get all challenges
 */
export const getChallenges = (): Challenge[] => {
  return challengeRegistry;
};

/**
 * Get a specific challenge by ID
 */
export const getChallenge = (id: number): Challenge | undefined => {
  return challengeRegistry.find((c) => c.id === id);
};

/**
 * Get total number of challenges
 */
export const getTotalChallenges = (): number => {
  return challengeRegistry.length;
};

/**
 * Register a challenge component
 * @param id - Challenge ID
 * @param component - React component for the challenge
 */
export const registerChallenge = (
  id: number,
  component: Challenge['component'],
): void => {
  const challenge = challengeRegistry.find((c) => c.id === id);
  if (challenge) {
    challenge.component = component;
  }
};

