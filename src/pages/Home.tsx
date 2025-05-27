import {Link} from 'react-router-dom';
import {ArrowRight, Music} from 'lucide-react'; // Replaced Waveform with Music

function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="container pt-24 px-4 sm:px-8 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Content Section */}
                    <div className="flex flex-col justify-center items-start text-center md:text-left">
                        <div
                            className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <Music className="w-4 h-4 mr-2"/> {/* Replaced Waveform with Music */}
                            AI-Powered Transcription
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight gradient-text">
                            Smart Transcription for Your Audio
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8">
                            Transform your audio files into accurate text with our cutting-edge AI models.
                            Perfect for podcasts, meetings, and content creation.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <Link
                                to="/transcription"
                                className="speekly-gradient px-6 py-3 rounded-lg text-white font-medium inline-flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>

                            <Link
                                to="/models"
                                className="px-6 py-3 rounded-lg bg-muted border border-border hover:bg-accent/50 transition-all duration-300 inline-flex items-center justify-center"
                            >
                                View Models
                            </Link>
                        </div>

                        <div className="mt-8 flex items-center text-sm text-muted-foreground">
                            <div className="flex -space-x-2 mr-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i}
                                         className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center border-2 border-background">
                                        {i}
                                    </div>
                                ))}
                            </div>
                            <span>Join thousands of users already using our app</span>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative flex justify-center">
                        <div className="absolute -z-10 w-full h-full bg-primary/5 blur-3xl rounded-full"></div>
                        <div className="bg-card border rounded-2xl shadow-xl p-4 w-full max-w-md animate-float">
                            <img
                                src="/src/assets/logo.jpeg"
                                alt="Transcription App"
                                className="w-full h-auto rounded-xl"
                            />

                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-1">
                                    <div className="w-1 h-4 bg-speekly-green rounded animate-wave-1"></div>
                                    <div className="w-1 h-4 bg-speekly-teal rounded animate-wave-2"></div>
                                    <div className="w-1 h-4 bg-speekly-blue rounded animate-wave-3"></div>
                                    <span
                                        className="ml-2 text-xs font-medium text-muted-foreground">Processing audio...</span>
                                </div>
                                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-2/3 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {title: "High Accuracy", desc: "Up to 92% transcription accuracy with our advanced models"},
                        {
                            title: "Multiple Languages",
                            desc: "Support for over 20 languages with specialized language models"
                        },
                        {title: "Fast Processing", desc: "Convert audio to text in a fraction of the time"}
                    ].map((feature, i) => (
                        <div key={i}
                             className="bg-card border rounded-xl p-6 hover:shadow-md transition-all duration-300">
                            <div
                                className="w-10 h-10 rounded-full speekly-gradient flex items-center justify-center mb-4">
                                <span className="text-white font-bold">{i + 1}</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
