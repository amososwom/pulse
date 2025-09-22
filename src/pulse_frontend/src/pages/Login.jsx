import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/pulse_backend';
import { canisterId } from 'declarations/pulse_backend/index.js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // II 2.0 Mainnet
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState({
    actor: undefined,
    authClient: undefined,
    isAuthenticated: false,
    principal: null
  });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Initialize auth client on component mount
  useEffect(() => {
    initializeAuthClient();
  }, []);

  const initializeAuthClient = async () => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const actor = createActor(canisterId, {
        agentOptions: {
          identity
        }
      });
      const isAuthenticated = await authClient.isAuthenticated();

      setAuthState({
        actor,
        authClient,
        isAuthenticated,
        principal: identity.getPrincipal().toString()
      });

      // If already authenticated, auto-login
      if (isAuthenticated) {
        handleSuccessfulAuth(identity.getPrincipal().toString());
      }
    } catch (err) {
      console.error('Failed to initialize auth client:', err);
      setError('Failed to initialize authentication system');
    }
  };

  const handleSuccessfulAuth = async (principal) => {
    try {
      // Get additional user info from your backend if needed
      const whoami = await authState.actor?.whoami();
      
      // Determine user type based on your app logic
      // This is a placeholder - you should implement your own logic
      const userType = await determineUserType(principal);
      
      login({
        id: principal,
        principal: principal,
        type: userType,
        name: `User ${principal.slice(0, 8)}...`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${principal}`
      });
      
      // Navigate based on user type
      navigate(userType === 'creator' ? '/creator' : '/dashboard');
    } catch (err) {
      console.error('Error during successful auth handling:', err);
      setError('Failed to complete authentication');
    }
  };

  // Placeholder function - implement your own user type determination logic
  const determineUserType = async (principal) => {
    // You could check your backend for user roles, check for specific principals, etc.
    // For now, we'll use a simple random assignment as in the original
    return Math.random() > 0.5 ? 'creator' : 'user';
  };

  const handleInternetIdentityLogin = async () => {
    if (!authState.authClient) {
      setError('Authentication system not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await authState.authClient.login({
        identityProvider,
        onSuccess: async () => {
          // Update the auth state
          await initializeAuthClient();
          
          // Get the new principal
          const identity = authState.authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          await handleSuccessfulAuth(principal);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setError('Login failed. Please try again.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (authState.authClient) {
      await authState.authClient.logout();
      await initializeAuthClient();
      // You might also want to call your useAuth logout here
    }
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

        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

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
            {!authState.isAuthenticated ? (
              <Button 
                onClick={handleInternetIdentityLogin}
                disabled={isLoading || !authState.authClient}
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
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-success font-medium">
                    ✓ Authenticated with Internet Identity
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Principal: {authState.principal?.slice(0, 20)}...
                  </p>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  Logout from Internet Identity
                </Button>
              </div>
            )}

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