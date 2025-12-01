import { Challenge } from '../types';

const challengeModules: Record<number, () => Promise<{ default: Challenge['component'] }>> = {
  1: () => import('../components/challenges/01_Captcha'),
  2: () => import('../components/challenges/02_SimpleMath'),
  3: () => import('../components/challenges/03_TypeText'),
  4: () => import('../components/challenges/04_ReverseText'),
  5: () => import('../components/challenges/05_DragDropSentence'),
  6: () => import('../components/challenges/06_MathQuiz'),
  7: () => import('../components/challenges/07_DrawCircle'),
  8: () => import('../components/challenges/08_GeographyQuiz'),
  9: () => import('../components/challenges/09_FindEmoji'),
  10: () => import('../components/challenges/10_PatternRecognition'),
  11: () => import('../components/challenges/11_ReactionTime'),
  // 12: () => import('../components/challenges/12_MazeGame'), // Skipped
  13: () => import('../components/challenges/13_TicTacToe'),
  // 14: () => import('../components/challenges/14_ClickPrecision'), // Skipped
  15: () => import('../components/challenges/15_MemoryMatch'),
  16: () => import('../components/challenges/16_OddOneOut'),
  17: () => import('../components/challenges/17_SimonSays'),
  // 18: () => import('../components/challenges/18_BalanceGame'), // Skipped
  19: () => import('../components/challenges/19_ChessPuzzle'),
  20: () => import('../components/challenges/20_ConnectDots'),
  // 21: () => import('../components/challenges/21_RacingGame'), // Skipped
  22: () => import('../components/challenges/22_WhackAMole'),
  23: () => import('../components/challenges/23_TargetPractice'),
  24: () => import('../components/challenges/24_KeyboardMemory'),
  25: () => import('../components/challenges/25_ColorBlindTest'),
  // 26: () => import('../components/challenges/26_ShutdownComputer'), // Skipped
  27: () => import('../components/challenges/27_FractionFighter'),
  28: () => import('../components/challenges/28_FlagMatch'),
  29: () => import('../components/challenges/29_ScienceQuiz'),
  30: () => import('../components/challenges/30_SpaceShooter'),
  31: () => import('../components/challenges/31_PixelArtMemory'),
  32: () => import('../components/challenges/32_MathSorting'),
  33: () => import('../components/challenges/33_CubeRotation'),
  34: () => import('../components/challenges/34_Minesweeper'),
  35: () => import('../components/challenges/35_JavaScriptCode'),
  36: () => import('../components/challenges/36_BinaryCalculator'),
  37: () => import('../components/challenges/37_StackGame'),
  38: () => import('../components/challenges/38_CloseAdWindows'),
  39: () => import('../components/challenges/39_ITNetworkQuiz'),
  40: () => import('../components/challenges/40_Torches'),
  // 41: () => import('../components/challenges/41_ImagePuzzle'), // Skipped
  };

// Cache for loaded components
const componentCache: Record<number, Challenge['component'] | null> = {};

/**
 * Preload all challenges into memory with progress tracking
 * @param onProgress - Callback function to track loading progress
 * @returns Promise that resolves when all challenges are loaded
 */
export async function preloadChallenges(
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const total = Object.keys(challengeModules).length;
  let loaded = 0;

  for (const [key, loader] of Object.entries(challengeModules)) {
    try {
      const module = await loader();
      const id = parseInt(key, 10);
      componentCache[id] = module.default;
      loaded++;
      onProgress?.(loaded, total);
    } catch (error) {
      console.error(`Failed to load challenge ${key}:`, error);
    }
  }
}

/**
 * Challenge Registry
 * Centralized registry of all challenges in the game
 * Makes it easy to add, remove, or modify challenges
 */

/**
 * Array of all challenges in the game
 * Components are loaded lazily for better performance
 */
export const challengeRegistry: Challenge[] = [
  { id: 1, name: 'Captcha', description: 'Prove you are not a robot', component: null as unknown as Challenge['component'], maxScore: 50 },
  { id: 2, name: 'Simple Math', description: 'Solve a simple math problem', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 3, name: 'Type Text', description: 'Type the text correctly', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 4, name: 'Reverse Text', description: 'Read backwards and type normally', component: null as unknown as Challenge['component'], maxScore: 500 },
  { id: 5, name: 'Drag & Drop Sentence', description: 'Drag words to build a sentence', component: null as unknown as Challenge['component'], maxScore: 450 },
  { id: 6, name: 'Math Quiz', description: 'Answer 3 math questions', component: null as unknown as Challenge['component'], maxScore: 500 },
  { id: 7, name: 'Draw Circle', description: 'Draw a perfect circle (90% accuracy)', component: null as unknown as Challenge['component'], maxScore: 1500 },
  { id: 8, name: 'Geography Quiz', description: 'Answer geography questions', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 9, name: 'Find Emoji', description: 'Find the requested emoji', component: null as unknown as Challenge['component'], maxScore: 250 },
  { id: 10, name: 'Pattern Recognition', description: 'Identify the pattern', component: null as unknown as Challenge['component'], maxScore: 250 },
  { id: 11, name: 'Reaction Time', description: 'React as fast as you can', component: null as unknown as Challenge['component'], maxScore: 100 },
  // { id: 12, name: 'Sliding Puzzle', description: 'Solve the sliding puzzle', component: null as unknown as Challenge['component'], maxScore: 500 }, // Skipped
  { id: 13, name: 'Tic Tac Toe', description: 'Beat the AI at Tic Tac Toe', component: null as unknown as Challenge['component'], maxScore: 400 },
  // { id: 14, name: 'Click Precision', description: 'Click targets with precision', component: null as unknown as Challenge['component'], maxScore: 250 }, // Skipped
  { id: 15, name: 'Tower Builder', description: 'Stack blocks perfectly to build the tallest tower', component: null as unknown as Challenge['component'], maxScore: 450 },
  { id: 16, name: 'Odd One Out', description: 'Find the odd one out', component: null as unknown as Challenge['component'], maxScore: 150 },
  { id: 17, name: 'Simon Says', description: 'Repeat the color sequences', component: null as unknown as Challenge['component'], maxScore: 750 },
  // { id: 18, name: 'Balance Game', description: 'Balance the scale', component: null as unknown as Challenge['component'], maxScore: 175 }, // Skipped
  { id: 19, name: 'Chess Figure Challenge', description: 'Identify chess figures by their moves', component: null as unknown as Challenge['component'], maxScore: 500 },
  { id: 20, name: 'Connect Dots', description: 'Connect all dots without crossing lines', component: null as unknown as Challenge['component'], maxScore: 500 },
  // { id: 21, name: 'Mouse Maze', description: 'Navigate the maze without hitting walls', component: null as unknown as Challenge['component'], maxScore: 500 }, // Skipped
  { id: 22, name: 'Whack A Mole', description: 'Click on the moles before they hide', component: null as unknown as Challenge['component'], maxScore: 275 },
  { id: 23, name: 'Target Practice', description: 'Click on the targets before time runs out', component: null as unknown as Challenge['component'], maxScore: 275 },
  { id: 24, name: 'Keyboard Memory', description: 'Remember and type the letter sequences', component: null as unknown as Challenge['component'], maxScore: 250 },
  { id: 25, name: 'Color Blind Test', description: 'Identify the hidden numbers in the colored patterns', component: null as unknown as Challenge['component'], maxScore: 250 },
  // { id: 26, name: 'Shutdown Computer', description: 'Navigate the mysterious OS and shut it down!', component: null as unknown as Challenge['component'], maxScore: 150 }, // Skipped
  { id: 27, name: 'Fraction Fighter', description: 'Compare fractions and select the larger one', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 28, name: 'Flag Match', description: 'Match flags to their country names', component: null as unknown as Challenge['component'], maxScore: 750 },
  { id: 29, name: 'Science Quiz', description: 'Test your knowledge of physics, chemistry, and biology', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 30, name: 'Space Shooter', description: 'Destroy asteroids and survive for 60 seconds', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 31, name: 'Pixel Art Memory', description: 'Memorize and draw the pixel art pattern', component: null as unknown as Challenge['component'], maxScore: 800 },
  { id: 32, name: 'Math Sorting', description: 'Sort numbers by different rules', component: null as unknown as Challenge['component'], maxScore: 5000 },
  { id: 33, name: '3D Cube Rotation', description: 'Rotate the cube to match the target orientation', component: null as unknown as Challenge['component'], maxScore: 250 },
  { id: 34, name: 'Logic Chain Solver', description: 'Use clues to solve a 4x4 logic puzzle', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 35, name: 'JavaScript Code', description: 'Write JavaScript functions to solve challenges', component: null as unknown as Challenge['component'], maxScore: 300 },
  { id: 36, name: 'Binary Calculator', description: 'Convert 4 decimal numbers to binary', component: null as unknown as Challenge['component'], maxScore: 500 },
  { id: 37, name: 'Pong Arcade', description: 'Win 3 rounds of Pong against AI (first to 11 points)', component: null as unknown as Challenge['component'], maxScore: 750 },
  { id: 38, name: 'Close Ad Windows', description: 'Close all annoying advertisement windows', component: null as unknown as Challenge['component'], maxScore: 225 },
  { id: 39, name: 'IT & Network Knowledge Quiz', description: 'Answer 12 IT and Network questions (need 9/12 correct)', component: null as unknown as Challenge['component'], maxScore: 250 },
  { id: 40, name: 'Torches of Wisdom', description: 'Solve the ancient torch riddles', component: null as unknown as Challenge['component'], maxScore: 500 },
  // { id: 41, name: 'Image Puzzle', description: 'Solve the 3x3 image puzzle', component: null as unknown as Challenge['component'], maxScore: 300 }, // Skipped
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
  const challenge = challengeRegistry.find((c) => c.id === id);
  if (challenge && !challenge.component && componentCache[id]) {
    challenge.component = componentCache[id];
  }
  return challenge;
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
