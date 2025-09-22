import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  ArrowLeft, 
  Zap, 
  TrendingUp, 
  Coins,
  Search,
  AlertTriangle
} from "lucide-react";

const NotFound = () => {
  const location = { pathname: "/non-existent-route" }; // Mock for demo
  const [glitchText, setGlitchText] = useState("404");
  const [floatingCoins, setFloatingCoins] = useState([]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Glitch effect for the 404 text
    const glitchInterval = setInterval(() => {
      const glitchChars = ["4", "0", "4", "∞", "⧓", "◊", "§"];
      const randomText = Array.from({length: 3}, () => 
        glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join("");
      
      setGlitchText(randomText);
      
      setTimeout(() => setGlitchText("404"), 100);
    }, 2000);

    // Generate floating coins
    const coins = Array.from({length: 8}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    }));
    setFloatingCoins(coins);

    return () => clearInterval(glitchInterval);
  }, [location.pathname]);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-float 20s ease-in-out infinite'
        }} />
      </div>

      {/* Floating coins */}
      {floatingCoins.map(coin => (
        <div
          key={coin.id}
          className="absolute opacity-20"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            animation: `float ${coin.duration}s ease-in-out infinite`,
            animationDelay: `${coin.delay}s`
          }}
        >
          <Coins className="w-6 h-6 text-primary" />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Glitchy 404 */}
          <div className="mb-8">
            <h1 
              className="text-9xl font-bold pulse-gradient bg-clip-text text-transparent mb-4"
              style={{
                fontFamily: 'monospace',
                textShadow: '0 0 30px rgba(147, 51, 234, 0.5)',
                animation: 'pulse-glow 2s ease-in-out infinite alternate'
              }}
            >
              {glitchText}
            </h1>
            <div className="w-32 h-1 pulse-gradient mx-auto mb-6 rounded-full" />
          </div>

          {/* Error message card */}
          <Card className="pulse-card-gradient pulse-shadow border-border mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-warning/20">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-3">Token Not Found</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Looks like you've ventured into uncharted blockchain territory! 
                The page you're looking for seems to have been sent to a different wallet address.
              </p>
              
              {/* Crypto-themed error details */}
              <div className="bg-muted/20 rounded-lg p-4 mb-6 text-left">
                <div className="font-mono text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route:</span>
                    <span className="text-destructive">{location.pathname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-destructive">TRANSACTION_FAILED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Code:</span>
                    <span className="text-warning">0x404</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas Used:</span>
                    <span className="text-success">0 ICP</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGoHome}
                  className="pulse-gradient hover:opacity-90 pulse-transition"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
                
                <Button 
                  onClick={handleGoBack}
                  variant="outline"
                  className="border-border hover:bg-muted/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional helpful links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <Button
              variant="ghost"
              className="flex flex-col items-center p-4 h-auto hover:bg-muted/20 pulse-transition"
              onClick={() => window.location.href = "/explore"}
            >
              <Search className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm">Explore Tokens</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex flex-col items-center p-4 h-auto hover:bg-muted/20 pulse-transition"
              onClick={() => window.location.href = "/creator"}
            >
              <Zap className="w-6 h-6 mb-2 text-success" />
              <span className="text-sm">Create Token</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex flex-col items-center p-4 h-auto hover:bg-muted/20 pulse-transition"
              onClick={() => window.location.href = "/trending"}
            >
              <TrendingUp className="w-6 h-6 mb-2 text-accent" />
              <span className="text-sm">Trending</span>
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default NotFound;