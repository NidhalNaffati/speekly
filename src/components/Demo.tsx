
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

export function Demo() {
  const [isRecording, setIsRecording] = useState(false);
  const [script] = useState(
    "Hello and welcome to this demonstration of Speekly, our smart teleprompter application with AI-powered transcription. This tool helps presenters stay on message while speaking."
  );
  
  const [transcription, setTranscription] = useState("");
  const [scriptIndex, setScriptIndex] = useState(0);
  const [demoComplete, setDemoComplete] = useState(false);

  // Simulated transcription effect when recording is active
  useEffect(() => {
    if (!isRecording || demoComplete) return;
    
    const words = script.split(' ');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(interval);
        setDemoComplete(true);
        setIsRecording(false);
        return;
      }
      
      setTranscription(prev => 
        prev + (prev ? ' ' : '') + words[currentIndex]
      );
      setScriptIndex(Math.min(currentIndex + 1, words.length));
      currentIndex++;
    }, 400);
    
    return () => clearInterval(interval);
  }, [isRecording, script, demoComplete]);
  
  const toggleRecording = () => {
    if (demoComplete) {
      // Reset demo for another run
      setTranscription("");
      setScriptIndex(0);
      setDemoComplete(false);
    }
    setIsRecording(!isRecording);
  };
  
  return (
    <section id="demo" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute top-0 inset-0 opacity-30 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-20 w-64 h-64 bg-speekly-green/10 rounded-full blur-3xl" />
        <div className="absolute left-10 bottom-20 w-96 h-96 bg-speekly-blue/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            See Speekly in Action
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Try our interactive demo to experience how Speekly helps you stay on script while presenting
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-lg overflow-hidden">
          {/* Demo Header */}
          <div className="bg-muted p-5 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium">Speekly Teleprompter Demo</h3>
            <Button 
              onClick={toggleRecording} 
              variant={isRecording ? "destructive" : "default"}
              className={isRecording ? "" : "speekly-gradient"}
            >
              {isRecording ? (
                <><MicOff className="mr-2 h-4 w-4" /> Stop Recording</>
              ) : (
                <><Mic className="mr-2 h-4 w-4" /> Start Recording</>
              )}
            </Button>
          </div>
          
          {/* Demo Content */}
          <div className="p-6 flex flex-col gap-6">
            {/* Script Section */}
            <div className="bg-background rounded-lg p-5 border">
              <div className="text-sm font-medium mb-2 text-muted-foreground">Your Script:</div>
              <div className="text-base leading-relaxed">
                {script.split(' ').map((word, index) => (
                  <span 
                    key={index} 
                    className={`${
                      index < scriptIndex ? 'text-primary font-medium' : ''
                    } transition-colors duration-300`}
                  >
                    {word}{' '}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Transcription Section */}
            <div className="bg-muted/30 rounded-lg p-5 border min-h-[120px]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-muted-foreground">Real-time Transcription:</div>
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-speekly-green rounded animate-wave-1"></div>
                      <div className="w-1 h-4 bg-speekly-teal rounded animate-wave-2"></div>
                      <div className="w-1 h-4 bg-speekly-blue rounded animate-wave-3"></div>
                    </div>
                    <span className="text-xs font-medium text-speekly-teal">Listening...</span>
                  </div>
                )}
              </div>
              {transcription ? (
                <div className="text-base leading-relaxed animate-pulse-slow">
                  {transcription}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  {isRecording ? "Listening..." : "Click 'Start Recording' to begin the demo"}
                </div>
              )}
            </div>
            
            {/* Status Area */}
            <div className="text-sm text-center p-2">
              {demoComplete && (
                <div className="text-speekly-green animate-fade-in">
                  Demo completed! Click "Start Recording" to try again.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
