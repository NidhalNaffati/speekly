
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section 
      id="download" 
      className="relative py-20 overflow-hidden speekly-gradient"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-[800px] h-[800px] rounded-full border-[40px] border-white/20"></div>
      </div>
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Presentations?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/80">
            Download Speekly now and experience the power of AI-assisted presentations 
            with real-time transcription and 92% accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-speekly-blue-dark hover:bg-white/90 font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download for Windows
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-speekly-blue-dark hover:bg-white/90 font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download for Mac
            </Button>
          </div>
          
          <div className="mt-8">
            <a 
              href="#" 
              className="inline-flex items-center text-sm text-white/90 hover:text-white underline underline-offset-4"
            >
              View System Requirements
              <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
