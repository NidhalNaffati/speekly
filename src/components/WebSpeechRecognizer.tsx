import {useState, useEffect, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent} from "@/components/ui/card";
import {Mic, MicOff, Download, Copy, RotateCcw, Settings, Languages, WifiOff} from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

// Browser compatibility check for SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

type WebSpeechRecognizerProps = object

const WebSpeechRecognizer: React.FC<WebSpeechRecognizerProps> = () => {
  // Load settings from localStorage
  const loadSettings = () => {
    const settings = localStorage.getItem('webSpeechSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        interimResults: parsed.interimResults !== undefined ? parsed.interimResults : true,
        continuousMode: parsed.continuousMode !== undefined ? parsed.continuousMode : true,
        language: parsed.language || "en-US"
      };
    }
    return {interimResults: true, continuousMode: true, language: "en-US"};
  };

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [interimResults, setInterimResults] = useState(loadSettings().interimResults);
  const [continuousMode, setContinuousMode] = useState(loadSettings().continuousMode);
  const [language, setLanguage] = useState(loadSettings().language);
  const [confidence, setConfidence] = useState(0);
  const [, setActiveTab] = useState("live");
  const [networkError, setNetworkError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef("");
  const retryTimeoutRef = useRef<number | null>(null);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('webSpeechSettings', JSON.stringify({
      interimResults,
      continuousMode,
      language
    }));
  }, [interimResults, continuousMode, language]);

  // Check if speech recognition is supported
  useEffect(() => {
    if (SpeechRecognition) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API. Try using Chrome or Edge.",
      });
    }
  }, []);

  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if (!isSupported) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setNetworkError(false);
    setErrorDetails(null);

    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = continuousMode;
    recognition.lang = language;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening Started",
        description: "Speak now. Your speech is being transcribed.",
      });
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      interimTranscriptRef.current = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(Math.round(result[0].confidence * 100));
        } else {
          interimTranscriptRef.current += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + " " + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error, event);

      if (event.error === 'network') {
        setNetworkError(true);
        setErrorDetails("The speech recognition service cannot be reached. Check your internet connection.");

        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Cannot connect to speech recognition service. Check your internet connection.",
        });
      } else {
        setErrorDetails(`Error: ${event.error}. ${event.message || 'Please try again.'}`);

        toast({
          variant: "destructive",
          title: "Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
        });
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      // If it stopped due to a network error and we were supposed to be listening continuously,
      // try to restart after a delay
      if (networkError && continuousMode) {
        retryTimeoutRef.current = window.setTimeout(() => {
          if (!networkError) return; // User might have manually reset the error state

          toast({
            title: "Reconnecting",
            description: "Attempting to reconnect to speech recognition service...",
          });

          initSpeechRecognition();
          recognitionRef.current?.start();
        }, 5000); // Retry after 5 seconds
      }
    };

    recognitionRef.current = recognition;
  };

  useEffect(() => {
    initSpeechRecognition();
  }, [isSupported, continuousMode, language, interimResults]);

  const toggleListening = () => {
    // If we have a network error, reset it first
    if (networkError) {
      setNetworkError(false);
      setErrorDetails(null);

      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      initSpeechRecognition();
    }

    if (!isSupported) {
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API. Try using Chrome or Edge.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Request microphone permission
      navigator.mediaDevices.getUserMedia({audio: true})
        .then(() => {
          recognitionRef.current?.start();
        })
        .catch((error) => {
          console.error("Microphone access denied:", error);
          toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use speech recognition.",
          });
        });
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    toast({
      title: "Transcript Cleared",
      description: "The transcript has been cleared.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript)
      .then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "The transcript has been copied to your clipboard.",
        });
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Failed to copy the transcript. Please try again.",
        });
      });
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = `speech-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Transcript Downloaded",
      description: "Your transcript has been downloaded as a text file.",
    });
  };

  const availableLanguages = [
    {code: "en-US", name: "English (US)"},
    {code: "en-GB", name: "English (UK)"},
    {code: "es-ES", name: "Spanish"},
    {code: "fr-FR", name: "French"},
    {code: "de-DE", name: "German"},
    {code: "it-IT", name: "Italian"},
    {code: "ja-JP", name: "Japanese"},
    {code: "ko-KR", name: "Korean"},
    {code: "pt-BR", name: "Portuguese (Brazil)"},
    {code: "zh-CN", name: "Chinese (Simplified)"},
  ];

  // Added smooth transitioning for transcript updates
  const transcriptStyle = {
    transition: "all 0.3s ease-in-out",
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="live" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="live" className="text-center">Live Transcription</TabsTrigger>
          <TabsTrigger value="settings" className="text-center">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4 animate-fade-in">
          {isSupported ? (
            <>
              {networkError && (
                <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
                  <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400"/>
                  <AlertTitle className="text-orange-600 dark:text-orange-400">Network Connection Issue</AlertTitle>
                  <AlertDescription className="text-orange-600/90 dark:text-orange-400/90">
                    {errorDetails || "Cannot connect to speech recognition service. Check your internet connection."}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        onClick={() => toggleListening()}
                      >
                        Retry Connection
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your speech will appear here..."
                  className="min-h-[250px] text-lg p-4 font-medium resize-none"
                  style={transcriptStyle}
                />
                {isListening && interimTranscriptRef.current && (
                  <div className="absolute bottom-4 left-4 right-4 text-muted-foreground italic animate-fade-in"
                       style={transcriptStyle}>
                    {interimTranscriptRef.current}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-center">
                {confidence > 0 && (
                  <Badge variant="outline" className="animate-fade-in">
                    Confidence: {confidence}%
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleListening}
                        size="lg"
                        className={isListening ? "bg-destructive hover:bg-destructive/90" : "speekly-gradient"}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="mr-2 h-5 w-5"/> Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-5 w-5"/> Start Listening
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isListening ? "Stop recording" : "Start recording your speech"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={clearTranscript}
                        disabled={!transcript}
                      >
                        <RotateCcw className="h-5 w-5"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear transcript</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        disabled={!transcript}
                      >
                        <Copy className="h-5 w-5"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={downloadTranscript}
                        disabled={!transcript}
                      >
                        <Download className="h-5 w-5"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download transcript</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Card className="mt-8 border-t-4 border-t-amber-400">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 dark:bg-amber-950/30 rounded-full p-2">
                      <Languages className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Accuracy Notice</h3>
                      <p className="text-sm text-muted-foreground">
                        Web Speech API provides lower accuracy compared to the dedicated Electron app transcription.
                        For professional use and higher accuracy, we recommend using the Electron-based transcription
                        feature.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Browser Not Supported</h3>
                  <p>
                    Your browser does not support the Web Speech API. Please try using Google Chrome, Microsoft Edge, or
                    another compatible browser.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 animate-fade-in">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="continuous-mode" className="text-base">Continuous Mode</Label>
                    <p className="text-sm text-muted-foreground">Keep recording after pauses</p>
                  </div>
                  <Switch
                    id="continuous-mode"
                    checked={continuousMode}
                    onCheckedChange={setContinuousMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="interim-results" className="text-base">Show Interim Results</Label>
                    <p className="text-sm text-muted-foreground">Display partial results as you speak</p>
                  </div>
                  <Switch
                    id="interim-results"
                    checked={interimResults}
                    onCheckedChange={setInterimResults}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language-select" className="text-base">Recognition Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full" id="language-select">
                      <SelectValue placeholder="Select a language"/>
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4"/> Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Advanced Settings</DialogTitle>
                <DialogDescription>
                  Configure advanced speech recognition settings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="max-alternatives" className="col-span-2">
                    Max Alternatives
                  </Label>
                  <span className="col-span-2 text-muted-foreground">
                    1 (Fixed)
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="grammar" className="col-span-2">
                    Grammar Support
                  </Label>
                  <span className="col-span-2 text-muted-foreground">
                    {SpeechGrammarList ? "Supported" : "Not Supported"}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => {
                }}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebSpeechRecognizer;
