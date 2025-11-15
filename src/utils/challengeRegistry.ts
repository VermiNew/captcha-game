import { Challenge } from '../types';

/**
 * Challenge Registry
 * Centralized registry of all challenges in the game
 * Makes it easy to add, remove, or modify challenges
 */

// Placeholder for challenge components (will be imported as they are created)
// import CaptchaChallenge from '../components/challenges/01_CaptchaChallenge';
// import SimpleMathChallenge from '../components/challenges/02_SimpleMathChallenge';
// ... etc

/**
 * Array of all challenges in the game
 */
export const challengeRegistry: Challenge[] = [
  {
    id: 1,
    name: 'Captcha',
    description: 'Prove you are not a robot',
    component: (() => null) as any, // Placeholder - will be replaced
    timeLimit: 10,
    maxScore: 100,
  },
  {
    id: 2,
    name: 'Simple Math',
    description: 'Solve a simple math problem',
    component: (() => null) as any,
    timeLimit: 15,
    maxScore: 100,
  },
  {
    id: 3,
    name: 'Type Text',
    description: 'Type the text correctly',
    component: (() => null) as any,
    timeLimit: 30,
    maxScore: 150,
  },
  {
    id: 4,
    name: 'Reverse Text',
    description: 'Read backwards and type normally',
    component: (() => null) as any,
    timeLimit: 45,
    maxScore: 200,
  },
  {
    id: 5,
    name: 'Build Sentence',
    description: 'Drag words to build a sentence',
    component: (() => null) as any,
    timeLimit: 30,
    maxScore: 150,
  },
  {
    id: 6,
    name: 'Math Quiz',
    description: 'Answer 3 math questions',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 300,
  },
  {
    id: 7,
    name: 'Draw Shape',
    description: 'Draw the requested shape',
    component: (() => null) as any,
    timeLimit: 45,
    maxScore: 200,
  },
  {
    id: 8,
    name: 'Draw Circle',
    description: 'Draw a perfect circle (90% accuracy)',
    component: (() => null) as any,
    timeLimit: 30,
    maxScore: 250,
  },
  {
    id: 9,
    name: 'Geography Quiz',
    description: 'Answer geography questions',
    component: (() => null) as any,
    timeLimit: 45,
    maxScore: 200,
  },
  {
    id: 10,
    name: 'Find Emoji',
    description: 'Find the requested emoji',
    component: (() => null) as any,
    timeLimit: 20,
    maxScore: 100,
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
