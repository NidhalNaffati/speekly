
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Languages, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-speekly-green/10 to-transparent dark:from-speekly-teal/5" />
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto pt-16 pb-24 md:pt-28 md:pb-32 flex flex-col md:flex-row items-center">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left md:pr-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Speekly</span> <br />
            <span className="mt-2 block">
              Smart AI Teleprompter
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
            Real-time transcription with 92% accuracy, supporting multiple languages for seamless presentations.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button size="lg" className="speekly-gradient group">
              Try Demo <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
            <Button size="lg" variant="outline" className="border-2">
              Download App
            </Button>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-x-6 mt-8">
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-5 w-5 text-speekly-green" />
              <p className="text-sm">Real-time transcription</p>
            </div>
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-5 w-5 text-speekly-teal" />
              <p className="text-sm">92% accuracy</p>
            </div>
            <div className="flex items-center gap-x-2">
              <CheckCircle className="h-5 w-5 text-speekly-blue" />
              <p className="text-sm">Multiple languages</p>
            </div>
          </div>
        </div>
        
        {/* Right Content - App Preview */}
        <div className="flex-1 mt-12 md:mt-0 relative">
          <div className="relative w-full max-w-md mx-auto animate-float">
            {/* App Window Mockup */}
            <div className="bg-card border rounded-lg shadow-xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-muted p-3 border-b flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto text-sm font-medium">Speekly Teleprompter</div>
              </div>
              
              {/* App Content */}
              <div className="p-6 bg-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-speekly-green" />
                    <span className="text-sm font-medium">Recording Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-speekly-blue" />
                    <span className="text-sm font-medium">English</span>
                  </div>
                </div>
                
                {/* Script Area */}
                <div className="bg-background rounded-md p-4 border mb-4">
                  <p className="text-sm opacity-70 mb-1">Script:</p>
                  <p className="text-sm">
                    Welcome to our presentation about artificial intelligence and its impact on modern society.
                    Today we'll explore how AI is transforming various industries...
                  </p>
                </div>
                
                {/* Transcription Area */}
                <div className="bg-muted/50 rounded-md p-4 border">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm opacity-70">Transcription:</p>
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-speekly-green rounded animate-wave-1"></div>
                      <div className="w-1 h-4 bg-speekly-teal rounded animate-wave-2"></div>
                      <div className="w-1 h-4 bg-speekly-blue rounded animate-wave-3"></div>
                    </div>
                  </div>
                  <p className="text-sm">
                    Welcome to our presentation about artificial intelligence and its impact on modern society.
                    Today we'll explore how AI is...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
