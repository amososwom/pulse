import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInternetIdentityLogin = async () => {
    setIsLoading(true);
    
    // Simulate Internet Identity authentication
    setTimeout(() => {
      const userType = Math.random() > 0.5 ? 'creator' : 'user';
      login({
        id: `${Date.now()}`,
        principal: `bkyz2-fmaaa-aaaaa-qaaaq-cai-${Math.random().toString(36).substr(2, 9)}`,
        type: userType,
        name: userType === 'creator' ? 'Creator User' : 'Fan User',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      });
      
      setIsLoading(false);
      navigate(userType === 'creator' ? '/creator' : '/dashboard');
    }, 2000);
  };

  const handleAdminLogin = () => {
    login({
      id: 'admin-1',
      principal: 'admin-principal-12345',
      type: 'admin',
      name: 'Admin User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`
    });
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 pulse-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Pulse</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to your creator economy platform
          </p>
        </div>

        <Card className="pulse-card-gradient pulse-shadow border-border">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 pulse-gradient rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle>Internet Identity</CardTitle>
              <CardDescription>
                Secure, passwordless authentication powered by ICP
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleInternetIdentityLogin}
              disabled={isLoading}
              className="w-full pulse-gradient hover:opacity-90 pulse-transition"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting to Internet Identity...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Access</span>
              </div>
            </div>

            <Button 
              onClick={handleAdminLogin}
              variant="secondary"
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Admin Demo Login
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs text-muted-foreground">Secure</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Fast</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="w-4 h-4 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground">Profitable</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            Powered by Internet Computer Protocol
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Login;