import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import WebSpeechRecognizer from "@/components/WebSpeechRecognizer";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WebSpeech = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center gradient-text animate-fade-in">
            Web Speech Recognition
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Use your browser's built-in speech recognition to transcribe your voice in real-time.
          </p>
          <div className="bg-card rounded-lg shadow-lg mb-12 p-6 border border-l-4 border-l-speekly-blue animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Web Speech vs Electron App</h2>
                <p className="text-muted-foreground mb-4">
                  The Web Speech API provides convenient speech recognition but has limitations in accuracy and language support.
                  For professional transcription with up to 25% higher accuracy and offline capabilities, try our dedicated Electron app.
                </p>
                <Button onClick={() => navigate("/transcription")} className="group">
                  Try Electron Transcription
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-5xl font-bold">
                <div className="text-speekly-green">92%</div>
                <div className="text-muted-foreground">vs</div>
                <div className="text-muted-foreground">68%</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <WebSpeechRecognizer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSpeech;
