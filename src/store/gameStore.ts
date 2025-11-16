import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  GameStoreState,
  ChallengeResult,
  PlayerStats,
} from '../types/index';
import { GameState as GameStateEnum } from '../types/index';
import { getTotalChallenges } from '../utils/challengeRegistry';

/**
 * Initial player stats
 */
const initialPlayerStats: PlayerStats = {
  totalScore: 0,
  averageTime: 0,
  accuracy: 0,
  challengesCompleted: 0,
};

/**
 * Initial game store state
 */
const initialState: GameStoreState = {
  gameState: GameStateEnum.IDLE,
  currentChallengeIndex: 0,
  challengeResults: [],
  totalScore: 0,
  startTime: null,
  playerStats: initialPlayerStats,
};

interface GameStoreActions {
  /**
   * Start a new game - resets all state and sets gameState to 'playing'
   */
  startGame: () => void;

  /**
   * Complete a challenge - saves result and moves to next challenge
   * If all challenges are completed, sets gameState to 'completed'
   */
  completeChallenge: (result: ChallengeResult) => void;

  /**
   * Reset the entire game to initial state
   */
  resetGame: () => void;

  /**
   * Calculate and update player statistics based on challenge results
   */
  calculateStats: () => PlayerStats;

  /**
   * Set current challenge index
   */
  setCurrentChallengeIndex: (index: number) => void;

  /**
   * Set game state
   */
  setGameState: (state: GameState) => void;
}

/**
 * Game store - manages all game state using Zustand
 */
export const useGameStore = create<GameStoreState & GameStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Start a new game
       */
      startGame: () => {
        set({
          gameState: GameStateEnum.PLAYING,
          currentChallengeIndex: 0,
          challengeResults: [],
          totalScore: 0,
          startTime: Date.now(),
          playerStats: initialPlayerStats,
        });
      },

      /**
       * Complete a challenge and move to the next one
       */
      completeChallenge: (result: ChallengeResult) => {
        const state = get();
        const updatedResults = [...state.challengeResults, result];
        const updatedTotalScore = state.totalScore + result.score;

        // Check if this was the last challenge
        const totalChallenges = getTotalChallenges();
        const isLastChallenge = state.currentChallengeIndex >= totalChallenges - 1;

        set({
          challengeResults: updatedResults,
          totalScore: updatedTotalScore,
          currentChallengeIndex: state.currentChallengeIndex + 1,
          gameState: isLastChallenge
            ? GameStateEnum.COMPLETED
            : GameStateEnum.PLAYING,
        });

        // Recalculate stats after completing a challenge
        get().calculateStats();
      },

      /**
       * Reset the game to initial state
       */
      resetGame: () => {
        set(initialState);
      },

      /**
       * Calculate player statistics from challenge results
       */
      calculateStats: () => {
        const state = get();
        const results = state.challengeResults;

        if (results.length === 0) {
          return initialPlayerStats;
        }

        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const averageTime =
          results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length;
        const successCount = results.filter((r) => r.success).length;
        const accuracy = (successCount / results.length) * 100;

        const stats: PlayerStats = {
          totalScore,
          averageTime: Math.round(averageTime * 10) / 10,
          accuracy: Math.round(accuracy * 10) / 10,
          challengesCompleted: results.length,
        };

        set({ playerStats: stats });
        return stats;
      },

      /**
       * Set current challenge index
       */
      setCurrentChallengeIndex: (index: number) => {
        set({ currentChallengeIndex: index });
      },

      /**
       * Set game state
       */
      setGameState: (state: GameState) => {
        set({ gameState: state });
      },
    }),
    {
      name: 'game-store', // localStorage key
      partialize: (state) => ({
        challengeResults: state.challengeResults,
        playerStats: state.playerStats,
        totalScore: state.totalScore,
      }),
    },
  ),
);
