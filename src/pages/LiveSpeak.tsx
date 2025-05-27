import {useState, useEffect, useRef} from "react";
import useTextAnalyzerHooks from "../hooks/useVoskHooks";
import VoskControl from "../components/transcription/VoskControl";
import {Mic, Copy, CheckCircle2} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useToast} from "@/hooks/use-toast";

const LiveSpeak: React.FC = () => {
    const {recognizedText} = useTextAnalyzerHooks();
    const [copied, setCopied] = useState<boolean>(false);
    const {toast} = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Monitor recognizedText changes to auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [recognizedText]);

    const handleCopyText = () => {
        if (!recognizedText) return;

        navigator.clipboard.writeText(recognizedText)
            .then(() => {
                setCopied(true);
                toast({
                    title: "Text copied to clipboard",
                    description: "The transcription has been copied to your clipboard.",
                });
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                toast({
                    title: "Failed to copy",
                    description: "Please try again or copy manually.",
                    variant: "destructive",
                });
            });
    };

    // Format recognized text with paragraph breaks
    const formattedText = recognizedText
        .split(/(?<=[.!?])\s+/)
        .filter(sentence => sentence.trim().length > 0)
        .map((sentence, index) => (
            <p key={index} className="mb-2 leading-relaxed">
                {sentence}
            </p>
        ));

    return (
        <div className="container mx-auto min-h-screen p-4 max-w-3xl">
            <Card className="mb-6 border-none shadow-lg">
                <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mic className="h-5 w-5"/>
                            <span>Live Transcription</span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex justify-center mb-6">
                        <VoskControl/>
                    </div>

                    <div className="text-sm text-muted-foreground mb-2 flex justify-between items-center">
                        <span>Transcription</span>
                        {recognizedText && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={handleCopyText}
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500"/> :
                                    <Copy className="h-4 w-4"/>}
                            </Button>
                        )}
                    </div>

                    <Card className="border border-muted bg-muted/5">
                        <ScrollArea className="h-80 w-full rounded-md p-4" ref={scrollRef}>
                            <div className="whitespace-pre-wrap">
                                {formattedText.length > 0 ? (
                                    formattedText
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">
                                        Speak to see your words appear here...
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
};

export default LiveSpeak;
