import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Mic, Laptop, ChevronDown, ChevronUp} from "lucide-react";
import {useNavigate} from "react-router-dom";

interface WebSpeechFeatureProps {
  className?: string;
}

const WebSpeechFeature: React.FC<WebSpeechFeatureProps> = ({className}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  // Browser compatibility check for SpeechRecognition
  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-speekly-green/10 to-speekly-blue/10 pb-4">
        <CardTitle className="flex items-center">
          <Mic className="mr-2 h-5 w-5 text-speekly-blue"/>
          Web Speech Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p>
            Try our browser-based speech recognition that works instantly without downloads.
            {isSpeechRecognitionSupported
              ? " Your browser supports this feature!"
              : " Switch to Chrome or Edge for this feature."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/webspeech")}
              className="speekly-gradient"
              size="sm"
            >
              Try Web Speech
            </Button>

            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center">
                  Compare with Electron App
                  {isOpen ?
                    <ChevronUp className="ml-2 h-4 w-4"/> :
                    <ChevronDown className="ml-2 h-4 w-4"/>
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 animate-accordion-down">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium flex items-center">
                      <Mic className="mr-2 h-4 w-4 text-speekly-blue"/>
                      Web Speech
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• No installation required</li>
                      <li>• ~68% accuracy</li>
                      <li>• Requires internet</li>
                      <li>• Limited language support</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium flex items-center">
                      <Laptop className="mr-2 h-4 w-4 text-speekly-green"/>
                      Electron App
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• One-time installation</li>
                      <li>• ~92% accuracy</li>
                      <li>• Works offline</li>
                      <li>• 30+ languages</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/transcription")}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Try Electron Transcription
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WebSpeechFeature;
