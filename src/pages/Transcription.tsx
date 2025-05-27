import {ChangeEvent, useState} from "react";
import ScriptComparison from "@/components/transcription/ScriptComparison";
import Navigation from "@/components/transcription/Navigation";
import useTextAnalyzerHooks from "@/hooks/useTextAnalyzerHooks";
import VoskControl from "@/components/transcription/VoskControl";
import {Button} from "@/components/ui/button";
import ParagraphProgress from "@/components/ParagraphProgress.tsx";

function Transcription() {
    const [referenceText, setReferenceText] = useState<string>("");
    const referenceParagraphs: string[] = referenceText.split("\n");
    const [isReferenceTextReady, setIsReferenceTextReady] = useState<boolean>(false);

    const {
        recognizedText,
        currentParagraphIndex,
        handleResetClick,
        goToNextParagraph,
        goToPreviousParagraph,
    } = useTextAnalyzerHooks(referenceParagraphs);

    const isNextDisabled = currentParagraphIndex === referenceParagraphs.length - 1;
    const isPreviousDisabled = currentParagraphIndex === 0;

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setReferenceText(event.target.value);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full pt-20">
                {!isReferenceTextReady ? (
                    <div className="flex flex-col items-center justify-center space-y-6 max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold text-center">Enter Your Reference Text</h1>
                        <textarea
                            value={referenceText}
                            onChange={handleInputChange}
                            rows={10}
                            placeholder="Paste your script or text here..."
                            className="w-full outline-none text-lg px-6 py-4 bg-card text-card-foreground rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 resize-none"
                        />
                        <Button
                            className="speekly-gradient mt-2 text-white font-medium px-8 py-6 text-lg"
                            onClick={() => setIsReferenceTextReady(true)}
                            disabled={!referenceText.trim()}
                        >
                            Start Transcription
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <h1 className="text-2xl font-bold">Script Comparison</h1>
                            <div className="flex items-center gap-4">
                                <VoskControl/>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl shadow-sm p-6 space-y-6">
                            <ScriptComparison
                                recognizedText={recognizedText}
                                currentParagraphIndex={currentParagraphIndex}
                                referenceParagraphs={referenceParagraphs}
                            />

                            <Navigation
                                goToPreviousParagraph={goToPreviousParagraph}
                                goToNextParagraph={goToNextParagraph}
                                reset={handleResetClick}
                                isPreviousDisabled={isPreviousDisabled}
                                isNextDisabled={isNextDisabled}
                            />
                        </div>
                        <div className="bg-card rounded-xl shadow-sm p-6 space-y-6">
                            <ParagraphProgress
                                referenceParagraph={referenceParagraphs[currentParagraphIndex] || ""}
                                recognizedText={recognizedText}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Transcription;
