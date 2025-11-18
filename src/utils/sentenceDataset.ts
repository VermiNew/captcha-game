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
  'The quick brown fox\njumps over the lazy dog',
  'I love to read\nbooks on sunny afternoons',
  'Coffee is the best\nway to start a morning',
  'She walks through the\ngarden every evening',
  'The sun rises in\nthe east and sets in the west',
  'Learning new languages\nis very challenging work',
  'Music can heal the\nsoul and lift the spirit',
  'Technology is changing\nthe way we live today',
  'Birds sing beautifully\nin the early morning',
  'The mountains are\ncovered with fresh snow',
  'I enjoy playing chess\nwith my best friend',
  'Cooking healthy food\nrequires time and effort',
  'The ocean waves crash\nagainst the rocky shore',
  'She dreams of traveling\naround the whole world',
  'Reading books helps\nexpand your knowledge base',
  'The stars shine brightly\nin the night sky',
  'Exercise regularly to\nmaintain good health',
  'Artists create beautiful\npaintings from nature',
  'The rain falls gently\non the green meadows',
  'Children play happily\nin the public park',
  'Flowers bloom in spring\nand brighten gardens',
  'Writing stories is a\nwonderful creative outlet',
  'The cake smells delicious\nand tastes amazing',
  'Friends laugh together\nand share many memories',
  'The old bridge connects\ntwo beautiful towns',
  'Traveling broadens your\nperspective on life',
  'The sunset paints the\nsky with orange and pink',
  'Musicians practice daily\nto improve their skills',
  'The library contains\nthousands of interesting books',
  'Summer vacations bring\njoy to all students',
  'The river flows peacefully\nthrough the valley',
  'Winter brings snow and\ncreates magical landscapes',
  'She studies hard to\nachieve her ambitious goals',
  'The concert was loud\nand exciting and fun',
  'Gardening is a relaxing\nand rewarding hobby',
  'The butterfly lands gently\non the colorful flower',
  'Learning something new\nkeeps your mind sharp',
  'The film was entertaining\nand truly inspiring',
  'People gather to celebrate\nimportant special days',
  'The forest smells fresh\nafter the afternoon rain',
  'Dancing is a fun\nway to exercise and enjoy',
  'The puzzle was difficult\nbut I finally solved',
  'Nature provides beauty\nand peace and tranquility',
  'The astronomer studies\nstars and distant planets',
  'Writing emails should\nbe clear and professional',
  'The bakery makes fresh\nbread every single morning',
  'Languages connect people\nfrom different cultures',
  'The photograph captures\na beautiful perfect moment',
  'Success requires dedication,\nhard work, and patience',
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