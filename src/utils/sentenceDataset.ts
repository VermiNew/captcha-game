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
  'The quick brown fox jumps\nover the lazy dog',
  'I love to read books\non sunny afternoons',
  'Coffee is the best way\nto start a morning',
  'She walks through the garden\nevery evening',
  'The sun rises in the\neast and sets in the west',
  'Learning new languages is very\nchallenging work',
  'Music can heal the soul\nand lift the spirit',
  'Technology is changing the way\nwe live today',
  'Birds sing beautifully in the\nearly morning',
  'The mountains are covered with\nfresh snow',
  'I enjoy playing chess with\nmy best friend',
  'Cooking healthy food requires\ntime and effort',
  'The ocean waves crash against\nthe rocky shore',
  'She dreams of traveling around\nthe whole world',
  'Reading books helps expand your\nknowledge base',
  'The stars shine brightly in\nthe night sky',
  'Exercise regularly to maintain\ngood health',
  'Artists create beautiful paintings\nfrom nature',
  'The rain falls gently on\nthe green meadows',
  'Children play happily in the\npublic park',
  'Flowers bloom in spring and\nbrighten gardens',
  'Writing stories is a wonderful\ncreative outlet',
  'The cake smells delicious and\ntastes amazing',
  'Friends laugh together and share\nmany memories',
  'The old bridge connects two\nbeautiful towns',
  'Traveling broadens your perspective\non life',
  'The sunset paints the sky\nwith orange and pink',
  'Musicians practice daily to improve\ntheir skills',
  'The library contains thousands of\ninteresting books',
  'Summer vacations bring joy to\nall students',
  'The river flows peacefully through\nthe valley',
  'Winter brings snow and creates\nmagical landscapes',
  'She studies hard to achieve\nher ambitious goals',
  'The concert was loud and\nexciting and fun',
  'Gardening is a relaxing and\nrewarding hobby',
  'The butterfly lands gently on\nthe colorful flower',
  'Learning something new keeps your\nmind sharp',
  'The film was entertaining and\ntruly inspiring',
  'People gather to celebrate important\nspecial days',
  'The forest smells fresh after\nthe afternoon rain',
  'Dancing is a fun way\nto exercise and enjoy',
  'The puzzle was difficult but\nI finally solved',
  'Nature provides beauty and peace\nand tranquility',
  'The astronomer studies stars and\ndistant planets',
  'Writing emails should be clear\nand professional',
  'The bakery makes fresh bread\nevery single morning',
  'Languages connect people from different\ncultures',
  'The photograph captures a beautiful\nperfect moment',
  'Success requires dedication hard work\nand patience',
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