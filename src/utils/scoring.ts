import { ChallengeResult } from '../types';

/**
 * Scoring System
 * Calculates points based on performance, time, and accuracy
 */

/**
 * Calculate time bonus points
 * Rewards faster completion
 *
 * @param timeSpent - Time spent on challenge (seconds)
 * @param timeLimit - Total time limit (seconds)
 * @returns Time bonus points (0-50)
 */
export const calculateTimeBonus = (
  timeSpent: number,
  timeLimit: number,
): number => {
  // Prevent division by zero
  if (timeLimit === 0) return 0;

  // Calculate ratio: 1.0 if instant, 0.0 if time ran out
  const timeRatio = Math.max(0, 1 - timeSpent / timeLimit);

  // Max 50 bonus points for time
  return Math.round(timeRatio * 50);
};

/**
 * Calculate accuracy bonus points
 * Rewards high accuracy percentage
 *
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Accuracy bonus points (0-50)
 */
export const calculateAccuracyBonus = (accuracy: number): number => {
  // Clamp accuracy to 0-100
  const clampedAccuracy = Math.max(0, Math.min(100, accuracy));

  // Max 50 bonus points for accuracy
  return Math.round((clampedAccuracy / 100) * 50);
};

/**
 * Calculate total score for a challenge
 * Combines base score, time bonus, and accuracy bonus
 *
 * @param baseScore - Base score for completing the challenge
 * @param timeSpent - Time spent on challenge (seconds)
 * @param timeLimit - Total time limit (seconds)
 * @param accuracy - Accuracy percentage (0-100, optional)
 * @returns Total challenge score
 */
export const calculateChallengeScore = (
  baseScore: number,
  timeSpent: number,
  timeLimit: number,
  accuracy?: number,
): number => {
  let score = baseScore;

  // Add time bonus
  score += calculateTimeBonus(timeSpent, timeLimit);

  // Add accuracy bonus if provided
  if (accuracy !== undefined) {
    score += calculateAccuracyBonus(accuracy);
  }

  return Math.round(score);
};

/**
 * Calculate total game score from all challenge results
 *
 * @param results - Array of challenge results
 * @returns Total score across all challenges
 */
export const calculateTotalScore = (results: ChallengeResult[]): number => {
  return results.reduce((sum, result) => sum + result.score, 0);
};

/**
 * Calculate average accuracy from all results
 *
 * @param results - Array of challenge results
 * @returns Average accuracy percentage (0-100)
 */
export const calculateAverageAccuracy = (results: ChallengeResult[]): number => {
  if (results.length === 0) return 0;

  const resultsWithAccuracy = results.filter((r) => r.accuracy !== undefined);

  if (resultsWithAccuracy.length === 0) return 0;

  const totalAccuracy = resultsWithAccuracy.reduce(
    (sum, result) => sum + (result.accuracy || 0),
    0,
  );

  return totalAccuracy / resultsWithAccuracy.length;
};

/**
 * Calculate success rate from results
 *
 * @param results - Array of challenge results
 * @returns Success rate as percentage (0-100)
 */
export const calculateSuccessRate = (results: ChallengeResult[]): number => {
  if (results.length === 0) return 0;

  const successCount = results.filter((r) => r.success).length;

  return (successCount / results.length) * 100;
};
