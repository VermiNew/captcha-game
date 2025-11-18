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

  // Medium sentences (9-11 words) - Original difficulty
  'The quick brown fox\n jumps over the lazy dog',
  'I love to read\n books on sunny afternoons',
  'Coffee is the best\n way to start a morning',
  'She walks through the\n garden every evening',
  'The sun rises in\n the east and sets in the west',
  'Learning new languages\n is very challenging work',
  'Music can heal the\n soul and lift the spirit',
  'Technology is changing\n the way we live today',
  'Birds sing beautifully\n in the early morning',
  'The mountains are\n covered with fresh snow',
  'I enjoy playing chess\n with my best friend',
  'Cooking healthy food\n requires time and effort',
  'The ocean waves crash\n against the rocky shore',
  'She dreams of traveling\n around the whole world',
  'Reading books helps\n expand your knowledge base',
  'The stars shine brightly\n in the night sky',
  'Exercise regularly to\n maintain good health',
  'Artists create beautiful\n paintings from nature',
  'The rain falls gently\n on the green meadows',
  'Children play happily\n in the public park',
  'Flowers bloom in spring\n and brighten gardens',
  'Writing stories is a\n wonderful creative outlet',
  'The cake smells delicious\n and tastes amazing',
  'Friends laugh together\n and share many memories',
  'The old bridge connects\n two beautiful towns',
  'Traveling broadens your\n perspective on life',
  'The sunset paints the\n sky with orange and pink',
  'Musicians practice daily\n to improve their skills',
  'The library contains\n thousands of interesting books',
  'Summer vacations bring\n joy to all students',
  'The river flows peacefully\n through the valley',
  'Winter brings snow and\n creates magical landscapes',
  'She studies hard to\n achieve her ambitious goals',
  'The concert was loud\n and exciting and fun',
  'Gardening is a relaxing\n and rewarding hobby',
  'The butterfly lands gently\n on the colorful flower',
  'Learning something new\n keeps your mind sharp',
  'The film was entertaining\n and truly inspiring',
  'People gather to celebrate\n important special days',
  'The forest smells fresh\n after the afternoon rain',
  'Dancing is a fun\n way to exercise and enjoy',
  'The puzzle was difficult\n but I finally solved',
  'Nature provides beauty\n and peace and tranquility',
  'The astronomer studies\n stars and distant planets',
  'Writing emails should\n be clear and professional',
  'The bakery makes fresh\n bread every single morning',
  'Languages connect people\n from different cultures',
  'The photograph captures\n a beautiful perfect moment',
  'Success requires dedication,\n hard work, and patience',
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