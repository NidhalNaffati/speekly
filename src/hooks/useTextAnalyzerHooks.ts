import {useState, useEffect, useCallback} from 'react';
import {toast} from "@/hooks/use-toast";

// Access the ipcRenderer from the window object without explicit import
const ipcRenderer = window.ipcRenderer;

interface TextAnalyzerState {
  recognizedText: string;
  lastRecognizedText: string;
  startingWord: string;
  currentParagraphIndex: number;
  recognitionBuffer: string[]; // Store recent recognition results
}

const useTextAnalyzerHooks = (referenceParagraphs: string[]) => {
  // State variables
  const [state, setState] = useState<TextAnalyzerState>({
    recognizedText: '',
    lastRecognizedText: '',
    startingWord: '',
    currentParagraphIndex: 0,
    recognitionBuffer: []
  });

  // Extract state for easier access
  const {
    recognizedText,
    lastRecognizedText,
    startingWord,
    currentParagraphIndex,
    recognitionBuffer
  } = state;

  // Update specific state properties while preserving others
  const updateState = useCallback((updates: Partial<TextAnalyzerState>) => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  // Reset text state variables
  useCallback(() => {
    updateState({
      recognizedText: '',
      lastRecognizedText: '',
      startingWord: '',
      recognitionBuffer: []
    });

    // Also tell the backend to reset recognition
    ipcRenderer.send('reset-recognition');
  }, [updateState]);
  // Find best match position for new text in the reference paragraph
  const findBestMatchPosition = useCallback((text: string, referenceParagraph: string) => {
    // Skip if no reference or no text
    if (!referenceParagraph || !text) return -1;

    const words = text.toLowerCase().split(' ');
    const refWords = referenceParagraph.toLowerCase().split(' ');

    let bestMatchPos = -1;
    let bestMatchScore = -1;

    // Try to match sequences of 3-5 words if possible
    for (let windowSize = Math.min(5, words.length); windowSize >= 2; windowSize--) {
      if (words.length < windowSize) continue;

      // Try each possible window of words
      for (let i = 0; i <= words.length - windowSize; i++) {
        const phrase = words.slice(i, i + windowSize).join(' ');

        // Look for this phrase in the reference paragraph
        const refText = refWords.join(' ');
        const phrasePos = refText.indexOf(phrase);

        if (phrasePos >= 0) {
          // Count how many words we are from the start
          const precedingText = refText.substring(0, phrasePos);
          const wordCount = precedingText.split(' ').length - 1;

          // Score based on length of matching phrase and position in paragraph
          const score = windowSize * 10 + (refWords.length - wordCount);

          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatchPos = wordCount;
          }
        }
      }

      // If we found a good match, stop looking
      if (bestMatchScore > 0) break;
    }

    return bestMatchPos;
  }, []);

  // Check if current paragraph is completed and handle navigation
  const checkParagraphCompletion = useCallback((text: string) => {
    if (!referenceParagraphs[currentParagraphIndex]) return;

    const currentParagraph = referenceParagraphs[currentParagraphIndex];
    const words = currentParagraph.split(' ');
    const lastNWords = words.slice(-3); // Consider last 3 words

    // Look for the last few words in any order and with fuzzy matching
    let matchedCount = 0;
    const textLower = text.toLowerCase();

    for (const word of lastNWords) {
      // Skip short words which might be common
      if (word.length < 4) continue;

      const normalizedWord = word.toLowerCase().replace(/[.,!?;:'"]/g, '');
      if (textLower.includes(normalizedWord)) {
        matchedCount++;
      }
    }

    // If we matched enough of the ending words
    if (matchedCount >= 2 || (lastNWords.length <= 2 && matchedCount >= 1)) {
      // Give slight delay before navigating to next paragraph
      setTimeout(() => {
        goToNextParagraph();
      }, 1000);
    }
  }, [currentParagraphIndex, referenceParagraphs]);

  // Handles recognized text from IPC renderer and updates state accordingly
  const handleRecognizedText = useCallback((_event: any, text: string) => {
    // Don't process empty text
    if (!text.trim()) return;

    // Add to buffer for context
    const newBuffer = [...recognitionBuffer, text].slice(-5);

    // Current reference paragraph
    const currentParagraph = referenceParagraphs[currentParagraphIndex] || "";

    // Try to find where this text might belong in the paragraph
    const bestPos = findBestMatchPosition(text, currentParagraph);

    // Create new recognized text based on analysis
    let newText: string;

    if (bestPos >= 0) {
      // We found a good match position in the reference text
      // This helps recover from misalignments
      const refWords = currentParagraph.split(' ');
      const precedingWords = refWords.slice(0, bestPos).join(' ');
      const recognizedWords = text.split(' ');

      // Keep subsequent words from recognition
      newText = precedingWords + ' ' + recognizedWords.join(' ');
    } else if (text.startsWith(startingWord) && startingWord) {
      // Traditional continuation based on starting word
      newText = lastRecognizedText
        ? recognizedText.replace(lastRecognizedText, text)
        : text;
    } else {
      // Fallback approach - append to existing text
      newText = recognizedText + (recognizedText ? ' ' : '') + text;
    }

    // Update recognized text and last recognized text states
    updateState({
      recognizedText: newText,
      lastRecognizedText: text,
      recognitionBuffer: newBuffer
    });

    // Check for paragraph completion
    checkParagraphCompletion(newText);
  }, [
    recognitionBuffer,
    referenceParagraphs,
    currentParagraphIndex,
    findBestMatchPosition,
    startingWord,
    lastRecognizedText,
    recognizedText,
    checkParagraphCompletion,
    updateState
  ]);

  useEffect(() => {
    // Update the starting word based on the last recognized text
    if (lastRecognizedText) {
      const firstWord = lastRecognizedText.split(' ')[0];
      updateState({startingWord: firstWord});
    }
  }, [lastRecognizedText, updateState]);

  useEffect(() => {
    // Listen for recognized text events from IPC renderer
    ipcRenderer.on('recognized-text', handleRecognizedText);

    // Cleanup function to remove event listener
    return () => {
      ipcRenderer.removeAllListeners('recognized-text');
    };
  }, [handleRecognizedText]);

  const goToNextParagraph = useCallback(() => {
    // Check if all paragraphs have been read
    if (currentParagraphIndex === referenceParagraphs.length - 1) {
      console.log('All paragraphs have been read.');
      toast({
        title: "Practice Complete",
        description: "All paragraphs have been read successfully.",
        variant: "default"
      });
      return;
    }

    // Move to the next paragraph if available
    if (currentParagraphIndex < referenceParagraphs.length - 1) {
      updateState({
        currentParagraphIndex: currentParagraphIndex + 1,
        recognizedText: '',
        lastRecognizedText: '',
        startingWord: '',
        recognitionBuffer: []
      });

      toast({
        title: "Next Paragraph",
        description: `Moving to paragraph ${currentParagraphIndex + 2}`,
        variant: "default"
      });
    }
  }, [currentParagraphIndex, referenceParagraphs.length, updateState]);

  const goToPreviousParagraph = useCallback(() => {
    // Move to the previous paragraph if available
    if (currentParagraphIndex > 0) {
      updateState({
        currentParagraphIndex: currentParagraphIndex - 1,
        recognizedText: '',
        lastRecognizedText: '',
        startingWord: '',
        recognitionBuffer: []
      });

      toast({
        title: "Previous Paragraph",
        description: `Moving to paragraph ${currentParagraphIndex}`,
        variant: "default"
      });
    }
  }, [currentParagraphIndex, updateState]);

  // Reset the text state variables
  const handleResetClick = useCallback(() => {
    updateState({
      currentParagraphIndex: 0,
      recognizedText: '',
      lastRecognizedText: '',
      startingWord: '',
      recognitionBuffer: []
    });

    toast({
      title: "Reset Complete",
      description: "Practice session has been reset.",
      variant: "default"
    });
  }, [updateState]);

  // Return the state variables and functions for external usage
  return {
    recognizedText,
    currentParagraphIndex,
    handleResetClick,
    goToNextParagraph,
    goToPreviousParagraph,
  };
};

export default useTextAnalyzerHooks;
