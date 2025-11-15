/**
 * Dataset of English sentences for drag and drop challenges
 * Diverse difficulty levels and lengths
 */
export const sentenceDataset = [
  'The quick brown fox jumps over the lazy dog',
  'I love to read books on sunny afternoons',
  'Coffee is the best way to start a morning',
  'She walks through the garden every evening',
  'The sun rises in the east and sets in the west',
  'Learning new languages is very challenging work',
  'Music can heal the soul and lift the spirit',
  'Technology is changing the way we live today',
  'Birds sing beautifully in the early morning',
  'The mountains are covered with fresh snow',
  'I enjoy playing chess with my best friend',
  'Cooking healthy food requires time and effort',
  'The ocean waves crash against the rocky shore',
  'She dreams of traveling around the whole world',
  'Reading books helps expand your knowledge base',
  'The stars shine brightly in the night sky',
  'Exercise regularly to maintain good health',
  'Artists create beautiful paintings from nature',
  'The rain falls gently on the green meadows',
  'Children play happily in the public park',
  'Flowers bloom in spring and brighten gardens',
  'Writing stories is a wonderful creative outlet',
  'The cake smells delicious and tastes amazing',
  'Friends laugh together and share many memories',
  'The old bridge connects two beautiful towns',
  'Traveling broadens your perspective on life',
  'The sunset paints the sky with orange and pink',
  'Musicians practice daily to improve their skills',
  'The library contains thousands of interesting books',
  'Summer vacations bring joy to all students',
  'The river flows peacefully through the valley',
  'Winter brings snow and creates magical landscapes',
  'She studies hard to achieve her ambitious goals',
  'The concert was loud and exciting and fun',
  'Gardening is a relaxing and rewarding hobby',
  'The butterfly lands gently on the colorful flower',
  'Learning something new keeps your mind sharp',
  'The film was entertaining and truly inspiring',
  'People gather to celebrate important special days',
  'The forest smells fresh after the afternoon rain',
  'Dancing is a fun way to exercise and enjoy',
  'The puzzle was difficult but I finally solved',
  'Nature provides beauty and peace and tranquility',
  'The astronomer studies stars and distant planets',
  'Writing emails should be clear and professional',
  'The bakery makes fresh bread every single morning',
  'Languages connect people from different cultures',
  'The photograph captures a beautiful perfect moment',
  'Success requires dedication hard work and patience',
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
