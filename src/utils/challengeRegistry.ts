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
  {
    id: 11,
    name: 'Color Memory',
    description: 'Remember and click the sequence',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 300,
  },
  {
    id: 12,
    name: 'Pattern Recognition',
    description: 'Identify the pattern',
    component: (() => null) as any,
    timeLimit: 45,
    maxScore: 200,
  },
  {
    id: 13,
    name: 'Reaction Time',
    description: 'React as fast as you can',
    component: (() => null) as any,
    timeLimit: 10,
    maxScore: 100,
  },
  {
    id: 14,
    name: 'Sliding Puzzle',
    description: 'Solve the sliding puzzle',
    component: (() => null) as any,
    timeLimit: 120,
    maxScore: 500,
  },
  {
    id: 15,
    name: 'Tic Tac Toe',
    description: 'Beat the AI at Tic Tac Toe',
    component: (() => null) as any,
    timeLimit: 45,
    maxScore: 200,
  },
  {
    id: 16,
    name: 'Rhythm Challenge',
    description: 'Follow the rhythm pattern',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 250,
  },
  {
     id: 17,
     name: 'Click Precision',
     description: 'Click targets with precision',
     component: (() => null) as any,
     timeLimit: 30,
     maxScore: 200,
   },
   {
     id: 18,
     name: 'Tower Builder',
     description: 'Stack blocks perfectly to build the tallest tower',
     component: (() => null) as any,
     timeLimit: 60,
     maxScore: 300,
   },
   {
     id: 19,
     name: 'Odd One Out',
     description: 'Find the odd one out',
     component: (() => null) as any,
     timeLimit: 30,
     maxScore: 150,
   },
  {
    id: 20,
    name: 'Visual Memory',
    description: 'Remember the grid pattern',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 300,
  },
  {
    id: 21,
    name: 'Balance Game',
    description: 'Balance the scale',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 250,
  },
  {
    id: 22,
    name: 'Chess Puzzle',
    description: 'Find the checkmate in one move',
    component: (() => null) as any,
    timeLimit: 90,
    maxScore: 250,
  },
  {
    id: 23,
    name: 'Connect Dots',
    description: 'Connect all dots without crossing lines',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 200,
  },
  {
    id: 24,
    name: 'Mouse Maze',
    description: 'Navigate the maze without hitting walls',
    component: (() => null) as any,
    timeLimit: 90,
    maxScore: 300,
  },
  {
    id: 25,
    name: 'Pong Reflex',
    description: 'Beat the AI at Pong',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 200,
  },
  {
    id: 26,
    name: 'Juggling Clicks',
    description: 'Catch the falling balls',
    component: (() => null) as any,
    timeLimit: 25,
    maxScore: 200,
  },
  {
    id: 27,
    name: 'Lightning Round',
    description: 'Answer 15 yes/no questions quickly',
    component: (() => null) as any,
    timeLimit: 30,
    maxScore: 195,
  },
  {
    id: 28,
    name: 'Whack A Mole',
    description: 'Click on the moles before they hide',
    component: (() => null) as any,
    timeLimit: 30,
    maxScore: 250,
  },
  {
    id: 29,
    name: 'Target Practice',
    description: 'Click on the targets before time runs out',
    component: (() => null) as any,
    timeLimit: 35,
    maxScore: 300,
  },
  {
    id: 30,
    name: 'Keyboard Memory',
    description: 'Remember and type the letter sequences',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 300,
  },
  {
    id: 31,
    name: 'Color Blind Test',
    description: 'Identify the hidden numbers in the colored patterns',
    component: (() => null) as any,
    timeLimit: 50,
    maxScore: 250,
  },
  {
    id: 32,
    name: 'Dice Probability',
    description: 'Predict the sum of two dice',
    component: (() => null) as any,
    timeLimit: 45,
    maxScore: 300,
  },
  {
    id: 33,
    name: 'Car Driving',
    description: 'Avoid obstacles and stay on the road for 30 seconds',
    component: (() => null) as any,
    timeLimit: 35,
    maxScore: 300,
  },
  {
    id: 35,
    name: 'Fraction Fighter',
    description: 'Compare fractions and select the larger one',
    component: (() => null) as any,
    timeLimit: 40,
    maxScore: 240,
  },
  {
    id: 36,
    name: 'Flag Match',
    description: 'Match flags to their country names',
    component: (() => null) as any,
    timeLimit: 50,
    maxScore: 210,
  },
  {
    id: 37,
    name: 'Music Notes',
    description: 'Listen and repeat the musical sequence',
    component: (() => null) as any,
    timeLimit: 40,
    maxScore: 200,
  },
  {
    id: 38,
    name: 'Science Quiz',
    description: 'Answer 6 science questions correctly',
    component: (() => null) as any,
    timeLimit: 60,
    maxScore: 240,
  },
  {
    id: 40,
    name: 'Pixel Art Memory',
    description: 'Memorize and draw the pixel art pattern',
    component: (() => null) as any,
    timeLimit: 50,
    maxScore: 300,
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
