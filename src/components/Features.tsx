
import { Mic, Languages, Clock, BarChart, Target, PenTool } from "lucide-react";

const features = [
  {
    icon: <Mic className="h-6 w-6 text-speekly-green" />,
    title: "Real-time Transcription",
    description: "Get instant transcription while you speak with our advanced Vosk AI models",
  },
  {
    icon: <Languages className="h-6 w-6 text-speekly-teal" />,
    title: "Multiple Languages",
    description: "Support for various languages to accommodate international presentations",
  },
  {
    icon: <BarChart className="h-6 w-6 text-speekly-teal-dark" />,
    title: "92% Accuracy",
    description: "Industry-leading transcription accuracy even in noisy environments",
  },
  {
    icon: <Clock className="h-6 w-6 text-speekly-blue-light" />,
    title: "Time-saving",
    description: "Streamline your workflow with automatic transcription and script comparison",
  },
  {
    icon: <Target className="h-6 w-6 text-speekly-blue" />,
    title: "Script Tracking",
    description: "Compare your speech against your script in real-time to stay on message",
  },
  {
    icon: <PenTool className="h-6 w-6 text-speekly-blue-dark" />,
    title: "Custom Scripts",
    description: "Create and edit your own scripts directly within the application",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Speekly combines cutting-edge AI with an intuitive interface to make your presentations flawless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 hover:border-primary/30 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-lg inline-flex group-hover:bg-primary/20 transition-colors duration-300 animate-slide-up">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
