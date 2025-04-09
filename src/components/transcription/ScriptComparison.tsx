import React from "react";
import {Card} from "@/components/ui/card";
import {isWordSimilar} from "@/utils/word-similarity";

interface ComparisonProps {
  currentParagraphIndex: number;
  referenceParagraphs: string[];
  recognizedText: string;
}

const ScriptComparison: React.FC<ComparisonProps> = (
  {
    currentParagraphIndex,
    referenceParagraphs,
    recognizedText,
  }) => {
  const referenceParagraph = referenceParagraphs[currentParagraphIndex] || "";
  const referenceWords = referenceParagraph.split(" ");
  const recognizedWords = recognizedText.split(" ");

  // Compute alignment using dynamic programming
  const alignedWords = computeAlignment(referenceWords, recognizedWords);

  return (
    <Card className="p-6 overflow-auto max-h-[400px]">
      {referenceWords.map((referenceWord, i) => {
        // Find best matching word from the aligned results
        const matchInfo = alignedWords.find(match => match.refIndex === i);
        const isWordCorrect = matchInfo?.isCorrect || false;
        const isCurrentWord = matchInfo?.recIndex === recognizedWords.length - 1;

        return (
          <span
            key={i}
            className={`text-lg font-mono transition-colors ${
              isWordCorrect ? "text-primary" : "text-destructive"
            } ${isCurrentWord ? "border-b-2" : ""}`}
          >
            {referenceWord}{" "}
          </span>
        );
      })}
    </Card>
  );
};

// Compute alignment between reference and recognized words
function computeAlignment(referenceWords: string[], recognizedWords: string[]) {
  const alignedWords: { refIndex: number; recIndex: number; isCorrect: boolean }[] = [];

  // Use a sliding window approach to find the best alignment
  const windowSize = 3; // Consider context of surrounding words
  let bestMatchIndex = 0;

  for (let i = 0; i < referenceWords.length; i++) {
    let bestMatchScore = 0;
    let bestMatchIdx = -1;

    // Look in a window around where we expect the matching word to be
    const startIdx = Math.max(0, bestMatchIndex - windowSize);
    const endIdx = Math.min(recognizedWords.length, bestMatchIndex + windowSize + 1);

    for (let j = startIdx; j < endIdx; j++) {
      // Skip words that are already matched
      if (alignedWords.some(match => match.recIndex === j)) continue;

      const similarity = getSimilarityScore(referenceWords[i], recognizedWords[j]);
      if (similarity > bestMatchScore) {
        bestMatchScore = similarity;
        bestMatchIdx = j;
      }
    }

    // If we found a good match
    if (bestMatchIdx !== -1 && bestMatchScore >= 0.7) { // 70% similarity threshold
      alignedWords.push({
        refIndex: i,
        recIndex: bestMatchIdx,
        isCorrect: true
      });
      bestMatchIndex = bestMatchIdx + 1; // Update expected position for next word
    } else {
      // No good match found
      alignedWords.push({
        refIndex: i,
        recIndex: -1,
        isCorrect: false
      });
    }
  }

  return alignedWords;
}

// Calculate similarity score between two words (0 to 1)
function getSimilarityScore(word1: string, word2: string): number {
  if (!word1 || !word2) return 0;

  // Normalize words for comparison
  word1 = word1.toLowerCase().replace(/[^\w\s]/g, '');
  word2 = word2.toLowerCase().replace(/[^\w\s]/g, '');

  // Use your existing isWordSimilar function but convert to a score
  return isWordSimilar(word2, word1, 0) ?
    Math.max(0, Math.min(1, (100 - calculateLevenshteinDistance(word1, word2) * 100 / Math.max(word1.length, word2.length)) / 100)) : 0;
}

// You'll need to add this or move from your word-similarity.ts
function calculateLevenshteinDistance(firstWord: string, secondWord: string): number {
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
            (firstWord[j - 1] === secondWord[i - 1] ? 0 : 1)
          );
    }
  }

  return arr[secondWord.length][firstWord.length];
}

export default ScriptComparison;
