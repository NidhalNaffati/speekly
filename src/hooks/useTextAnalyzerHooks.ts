import {useState, useEffect, useCallback} from 'react';
import {toast} from "@/hooks/use-toast";

// Access the ipcRenderer from the window object without explicit import
const ipcRenderer = window.ipcRenderer;

interface TextAnalyzerState {
  recognizedText: string;
  lastRecognizedText: string;
  startingWord: string;
  currentParagraphIndex: number;
}

const useTextAnalyzerHooks = (referenceParagraphs: string[]) => {
  // State variables
  const [state, setState] = useState<TextAnalyzerState>({
    recognizedText: '',
    lastRecognizedText: '',
    startingWord: '',
    currentParagraphIndex: 0
  });

  // Extract state for easier access
  const {recognizedText, lastRecognizedText, startingWord, currentParagraphIndex} = state;

  // Update specific state properties while preserving others
  const updateState = useCallback((updates: Partial<TextAnalyzerState>) => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  // Reset text state variables
  const resetTextStateVariables = useCallback(() => {
    updateState({
      recognizedText: '',
      lastRecognizedText: '',
      startingWord: ''
    });

    // Also tell the backend to reset recognition
    ipcRenderer.send('reset-recognition');
  }, [updateState]);

  // Check if current paragraph is completed and handle navigation
  const checkParagraphCompletion = useCallback((text: string) => {
    if (!referenceParagraphs[currentParagraphIndex]) return;

    const currentParagraph = referenceParagraphs[currentParagraphIndex];
    const words = currentParagraph.split(' ');
    const lastWord = words[words.length - 1];

    // Check if the text contains the last word of the current paragraph
    if (text.toLowerCase().includes(lastWord.toLowerCase())) {
      // Give slight delay before navigating to next paragraph
      setTimeout(() => {
        goToNextParagraph();
      }, 1000);
    }
  }, [currentParagraphIndex, referenceParagraphs]);

  // Handles recognized text from IPC renderer and updates state accordingly
  const handleRecognizedText = useCallback((_event: any, text: string) => {
    let newText: string;

    // Check if the recognized text starts with the same word as the previous one
    if (text.startsWith(startingWord) && startingWord) {
      // If yes, replace the last recognized text with the new one
      newText = lastRecognizedText
        ? recognizedText.replace(lastRecognizedText, text)
        : text;
    } else {
      // If not, append the new text to the existing recognized text
      newText = recognizedText + (recognizedText ? ' ' : '') + text;
    }

    // Update recognized text and last recognized text states
    updateState({
      recognizedText: newText,
      lastRecognizedText: text
    });

    // Check for paragraph completion
    checkParagraphCompletion(text);
  }, [lastRecognizedText, recognizedText, startingWord, checkParagraphCompletion, updateState]);

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
      updateState({currentParagraphIndex: currentParagraphIndex + 1});
      resetTextStateVariables();

      toast({
        title: "Next Paragraph",
        description: `Moving to paragraph ${currentParagraphIndex + 2}`,
        variant: "default"
      });
    }
  }, [currentParagraphIndex, referenceParagraphs.length, resetTextStateVariables, updateState]);

  const goToPreviousParagraph = useCallback(() => {
    // Move to the previous paragraph if available
    if (currentParagraphIndex > 0) {
      updateState({currentParagraphIndex: currentParagraphIndex - 1});
      resetTextStateVariables();

      toast({
        title: "Previous Paragraph",
        description: `Moving to paragraph ${currentParagraphIndex}`,
        variant: "default"
      });
    }
  }, [currentParagraphIndex, resetTextStateVariables, updateState]);

  // Reset the text state variables
  const handleResetClick = useCallback(() => {
    updateState({currentParagraphIndex: 0});
    resetTextStateVariables();

    toast({
      title: "Reset Complete",
      description: "Practice session has been reset.",
      variant: "default"
    });
  }, [resetTextStateVariables, updateState]);

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
