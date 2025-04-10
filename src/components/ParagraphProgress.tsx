import React from "react";
import {Progress} from "@/components/ui/progress";
import {isWordSimilar} from "@/utils/word-similarity";

interface ParagraphProgressProps {
  referenceParagraph: string;
  recognizedText: string;
}

const ParagraphProgress: React.FC<ParagraphProgressProps> = (
  {
    referenceParagraph,
    recognizedText
  }) => {
  // Calculate estimated progress percentage
  const calculateProgress = (): number => {
    if (!referenceParagraph) return 0;

    const refWords = referenceParagraph.split(' ');
    const recognizedWords = recognizedText.split(' ');

    // Find the furthest confirmed match
    let matchedCount = 0;
    let lastMatchedPos = -1;

    for (let i = 0; i < recognizedWords.length; i++) {
      // Try to find this word in the reference paragraph starting from the last match
      for (let j = Math.max(0, lastMatchedPos); j < refWords.length; j++) {
        if (isWordSimilar(recognizedWords[i], refWords[j], 70)) {
          matchedCount++;
          lastMatchedPos = j;
          break;
        }
      }
    }

    // Calculate percentage based on matched words vs total words
    return Math.min(100, Math.round((lastMatchedPos + 1) / refWords.length * 100));
  };

  const progress = calculateProgress();

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Paragraph Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2"/>
    </div>
  );
};

export default ParagraphProgress;
