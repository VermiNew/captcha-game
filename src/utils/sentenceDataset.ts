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
  'Cats are very independent animals',
  'Dogs love to play fetch',
  'The weather is nice today',
  'I enjoy eating fresh fruit',
  'Trees grow tall and strong',
  'Rain makes the grass green',
  'Summer is my favorite season',
  'Winter brings cold and snow',
  'Apples are healthy and tasty',
  'Chocolate is delicious and sweet',
  'I like swimming in summer',
  'Cooking is fun and rewarding',
  'Books teach us new things',
  'Movies are great entertainment',
  'Games make people happy',
  'Dancing is excellent exercise',
  'Beaches have beautiful sand',
  'Mountains are tall and majestic',
  'Sunsets are gorgeous every evening',
  'Mornings are bright and fresh',
  'Sleep is important for health',
  'Exercise keeps you fit strong',
  'Friends are valuable and true',
  'Family is very important',
  'Laughter makes us feel good',
  'Kindness spreads joy everywhere',
  'Honesty is always the best',
  'Patience is a good virtue',
  'Dreams can come very true',
  'Success takes hard work',
  'Teamwork makes the dream work',
  'Hope is always in sight',
  'Love conquers all things',
  'Adventure awaits brave people',
  'Knowledge is true power',
  'Progress brings personal growth',
  'Happiness comes from inside',
  'Peace is precious and rare',
  'Nature provides us comfort',
  'Stars light up night',

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