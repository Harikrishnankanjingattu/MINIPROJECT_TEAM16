import { Bot } from 'lucide-react';
import { useEffect } from 'react';

const GammaHelp = () => {
  useEffect(() => {
    // Load the ElevenLabs script if not already loaded
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Bot size={40} className="text-primary animate-pulse" />
      </div>
      
      <h2 className="text-3xl font-display font-bold text-foreground mb-4">
        AI Voice Assistant
      </h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Our conversational AI is ready to help you navigate the system, manage your leads, and answer any questions. 
      </p>

      <div className="glass-card p-6 border border-primary/20 bg-primary/5 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50 animate-pulse-glow" />
        <p className="text-sm font-semibold text-foreground relative z-10 mb-2">
          Click the widget in the bottom right corner to start talking!
        </p>
        <p className="text-xs text-muted-foreground relative z-10">
          Make sure your microphone is enabled.
        </p>
      </div>

      {/* The ElevenLabs Widget */}
      {/* @ts-ignore - Custom Web Component */}
      <elevenlabs-convai agent-id="agent_2601kkewjkdfe91rx16t6camg0qb"></elevenlabs-convai>
    </div>
  );
};

export default GammaHelp;
