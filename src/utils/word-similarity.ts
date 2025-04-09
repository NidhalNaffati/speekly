/**
 * Calculates the Levenshtein distance between two input strings.
 *
 * The Levenshtein distance represents the minimum number of single-character
 * edits (insertions, deletions, or substitutions) required to transform one
 * string into another.
 *
 * @param {string} firstWord - The first input string.
 * @param {string} secondWord - The second input string.
 * @returns {number} Returns the Levenshtein distance between `firstWord` and `secondWord`.
 */
export const calculateLevenshteinDistance = (
  firstWord: string,
  secondWord: string
): number => {
  // Handle empty strings
  if (!firstWord.length) return secondWord.length;
  if (!secondWord.length) return firstWord.length;

  const arr: number[][] = [];

  for (let i = 0; i <= secondWord.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= firstWord.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
            arr[i - 1][j] + 1,
            arr[i][j - 1] + 1,
            arr[i - 1][j - 1] +
            (firstWord[j - 1].toLowerCase() === secondWord[i - 1].toLowerCase() ? 0 : 1)
          );
    }
  }

  return arr[secondWord.length][firstWord.length];
};

/**
 * Calculates phonetic similarity between words.
 * @param {string} word1 - First word
 * @param {string} word2 - Second word
 * @returns {boolean} - True if words are phonetically similar
 */
export const areWordsPhoneticallySimilar = (word1: string, word2: string): boolean => {
  if (!word1 || !word2) return false;

  // Simple phonetic transformations for comparison
  const normalizeForPhonetic = (word: string): string => {
    return word.toLowerCase()
      .replace(/[aeiou]+/g, 'a') // Convert all vowels to 'a'
      .replace(/[^a-z]/g, '')    // Remove non-alphabetic chars
      .replace(/(.)\1+/g, '$1');  // Remove repeated letters
  };

  const phonetic1 = normalizeForPhonetic(word1);
  const phonetic2 = normalizeForPhonetic(word2);

  // Check if first and last characters match and length difference is small
  return (
    (phonetic1[0] === phonetic2[0] || phonetic1[phonetic1.length - 1] === phonetic2[phonetic2.length - 1]) &&
    Math.abs(phonetic1.length - phonetic2.length) <= 2
  ) || calculateLevenshteinDistance(phonetic1, phonetic2) <= 2;
};

/**
 * Determines whether two words are similar based on multiple similarity measures.
 *
 * @param {string | undefined} userWord - The user-provided word for comparison.
 * @param {string} referenceWord - The reference word to compare against.
 * @param {number} percentage - The minimum required similarity percentage.
 * @returns {boolean} Returns true if the words are considered similar.
 */
export const isWordSimilar = (
  userWord: string | undefined,
  referenceWord: string,
  percentage: number = 70
): boolean => {
  // Handle undefined or empty cases
  if (!userWord || !referenceWord) {
    return false;
  }

  // Normalize both words for comparison
  const normalizedUserWord = userWord.toLowerCase().replace(/[^\w\s]/g, '');
  const normalizedRefWord = referenceWord.toLowerCase().replace(/[^\w\s]/g, '');

  // Exact match
  if (normalizedUserWord === normalizedRefWord) {
    return true;
  }

  // Very short words - require more precision
  if (referenceWord.length <= 2) {
    return normalizedUserWord === normalizedRefWord;
  }

  // Check if they're phonetically similar (for speech recognition errors)
  const phoneticMatch = areWordsPhoneticallySimilar(normalizedUserWord, normalizedRefWord);

  // Calculate Levenshtein similarity
  const maxPossibleDistance: number = Math.max(
    normalizedUserWord.length,
    normalizedRefWord.length
  );

  const levenshteinDistance: number = calculateLevenshteinDistance(
    normalizedUserWord,
    normalizedRefWord
  );

  const similarityPercentage: number =
    ((maxPossibleDistance - levenshteinDistance) / maxPossibleDistance) * 100;

  // Return true if either phonetic or Levenshtein is good enough
  return phoneticMatch || similarityPercentage >= percentage;
};

/**
 * Check if a phrase contains all important words from a reference phrase.
 * @param {string} phrase - User's phrase
 * @param {string} reference - Reference phrase
 * @returns {boolean} - True if the phrase contains all important words
 */
export const containsImportantWords = (phrase: string, reference: string): boolean => {
  if (!phrase || !reference) return false;

  // Normalize both texts
  const normalizedPhrase = phrase.toLowerCase();
  const normalizedRef = reference.toLowerCase();

  // Extract important words (longer than 3 chars, not stop words)
  const stopWords = new Set(['the', 'and', 'but', 'for', 'nor', 'yet', 'so', 'with', 'that', 'this']);
  const importantWords = normalizedRef.split(/\s+/).filter(word =>
    word.length > 3 && !stopWords.has(word)
  );

  // Require at least 70% of important words to be present
  const threshold = Math.max(1, Math.floor(importantWords.length * 0.7));
  let matchCount = 0;

  for (const word of importantWords) {
    if (normalizedPhrase.includes(word) ||
      importantWords.some(w => isWordSimilar(w, word, 80))) {
      matchCount++;
    }

    if (matchCount >= threshold) return true;
  }

  return false;
};
