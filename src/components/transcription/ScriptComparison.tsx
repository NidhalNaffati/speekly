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

  return (
      <Card className="p-6 overflow-auto max-h-[400px]">
        {referenceWords.map((referenceWord, i) => {
          const userWord = recognizedWords[i];
          const isWordCorrect = isWordSimilar(userWord, referenceWord, 70);

          return (
              <span
                  key={i}
                  className={`text-lg font-mono transition-colors ${
                      isWordCorrect ? "text-primary" : "text-destructive"
                  } ${i === recognizedWords.length - 1 ? "border-b-2" : ""}`}
              >
            {referenceWord}{" "}
          </span>
          );
        })}
      </Card>
  );
};

export default ScriptComparison;
