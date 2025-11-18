/**
 * Dataset of English sentences for drag and drop challenges
 * Diverse difficulty levels and lengths - now includes short sentences
 */
export const sentenceDataset = [
  // Very short sentences (3-5 words) - Easy level
  'I like pizza',
  'The cat sleeps',
  'She is happy',
  'Birds can fly',
  'We love music',
  'Time flies fast',
  'Dogs are loyal',
  'The sky is blue',
  'He runs quickly',
  'Flowers are beautiful',
  'I feel great',
  'The book is good',
  'Water is essential',
  'She speaks softly',
  'They work together',

  // Short sentences (6-8 words) - Medium level
  'I love to read books daily',
  'The sun shines bright and warm',
  'Coffee tastes best in the morning',
  'She walks through the garden quietly',
  'Birds sing beautifully every single morning',
  'Learning new things is always exciting',
  'Music makes me feel very happy',
  'The ocean looks calm and peaceful',
  'Children play games in the park',
  'Stars shine brightly in the sky',

];

/**
 * Get a random sentence from the dataset
 */
export const getRandomSentence = (): string => {
  return sentenceDataset[Math.floor(Math.random() * sentenceDataset.length)];
};

/**
 * Get multiple random sentences without repetition
 */
export const getRandomSentences = (count: number): string[] => {
  const shuffled = [...sentenceDataset].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};