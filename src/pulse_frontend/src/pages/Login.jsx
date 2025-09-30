import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Backend canister interface - Updated to match your Motoko backend
const idlFactory = ({ IDL }) => {
  const TokenId = IDL.Nat;
  const Account = IDL.Principal;
  const Tokens = IDL.Nat;

  const CreateTokenError = IDL.Variant({
    'AnonymousNotAllowed': IDL.Null,
    'InvalidSymbol': IDL.Null,
    'InvalidName': IDL.Null,
    'RateLimitExceeded': IDL.Null,
    'InsufficientPermissions': IDL.Null,
    'InternalError': IDL.Text,
    'InvalidSupply': IDL.Null,
  });

  const Result_1 = IDL.Variant({ 'ok': TokenId, 'err': CreateTokenError });

  const UserRole = IDL.Variant({
    'User': IDL.Null,
    'Admin': IDL.Null,
    'Creator': IDL.Null,
  });

  const UserProfile = IDL.Record({
    'tokensCreated': IDL.Nat,
    'principal': Account,
    'createdAt': IDL.Nat64,
    'role': UserRole,
    'isVerified': IDL.Bool,
    'lastActive': IDL.Nat64,
  });

  return IDL.Service({
    'all_tokens': IDL.Func([], [IDL.Vec(TokenId)], ['query']),
    'balance_of': IDL.Func([TokenId, Account], [Tokens], ['query']),
    'create_token': IDL.Func(
      [IDL.Text, IDL.Text, Tokens, IDL.Nat8, IDL.Opt(IDL.Text)],
      [Result_1],
      [],
    ),
    'get_or_create_profile': IDL.Func([], [UserProfile], []),
    'get_stats': IDL.Func(
      [],
      [IDL.Record({
        'creator_count': IDL.Nat,
        'total_users': IDL.Nat,
        'admin_count': IDL.Nat,
        'total_tokens': IDL.Nat,
      })],
      ['query'],
    ),
    'get_user_profile': IDL.Func([Account], [IDL.Opt(UserProfile)], ['query']),
    'get_user_tokens': IDL.Func([Account], [IDL.Vec(IDL.Tuple(TokenId, Tokens))], ['query']),
    'initialize_user': IDL.Func([], [UserProfile], []),
    'is_admin': IDL.Func([Account], [IDL.Bool], ['query']),
    'ping': IDL.Func([], [IDL.Bool], []),
    'token_info': IDL.Func(
      [TokenId],
      [IDL.Opt(IDL.Record({
        'decimals': IDL.Nat8,
        'minting_account': Account,
        'name': IDL.Text,
        'logo_url': IDL.Opt(IDL.Text),
        'total_supply': Tokens,
        'symbol': IDL.Text,
      }))],
      ['query'],
    ),
    'total_supply': IDL.Func([TokenId], [Tokens], ['query']),
    'whoami': IDL.Func([], [IDL.Principal], ['query']),
  });
};

// Environment configuration
const getConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const network = process.env.DFX_NETWORK || (isDevelopment ? 'local' : 'ic');

  return {
    network,
    host: network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
    identityProvider: network === 'ic'
      ? 'https://identity.internetcomputer.org'
      : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943',
    backendCanisterId: network === 'ic'
      ? 'idct5-iyaaa-aaaab-ab5ya-cai' // Production canister ID from canister_ids.json
      : process.env.CANISTER_ID_PULSE_BACKEND || 'bkyz2-fmaaa-aaaaa-qaaaq-cai', // Local development canister
  };
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState({
    authClient: null,
    actor: null,
    isAuthenticated: false,
    principal: null
  });
  
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const config = getConfig();

  // Initialize auth client on component mount
  useEffect(() => {
    initializeAuthClient();
  }, []);

  const initializeAuthClient = async () => {
    try {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();

      // Create actor with current identity
      const actor = await createActor(identity);

      setAuthState({
        authClient,
        actor,
        isAuthenticated,
        principal: principal.toString()
      });

      // If already authenticated, auto-login
      if (isAuthenticated && !principal.isAnonymous()) {
        await handleSuccessfulAuth(principal.toString(), actor);
      }
    } catch (err) {
      console.error('Failed to initialize auth client:', err);
      setError('Failed to initialize authentication system');
    }
  };

  const createActor = async (identity) => {
    try {
      const agent = new HttpAgent({
        identity,
        host: config.host
      });

      // Fetch root key for local development
      if (config.network !== 'ic') {
        await agent.fetchRootKey();
      }

      return Actor.createActor(idlFactory, {
        agent,
        canisterId: config.backendCanisterId,
      });
    } catch (err) {
      console.error('Failed to create actor:', err);
      throw err;
    }
  };

  const handleSuccessfulAuth = async (principal, actor) => {
    try {
      // Test backend connection
      const whoami = await actor.whoami();
      console.log('Connected to backend as:', whoami.toString());

      // Initialize user profile in backend
      try {
        await actor.initialize_user();
        console.log('User profile initialized in backend');
      } catch (initErr) {
        console.warn('Failed to initialize user, trying ping:', initErr);
        try {
          await actor.ping();
        } catch (pingErr) {
          console.error('Ping also failed:', pingErr);
        }
      }

      // Get user's tokens to determine user type
      // whoami returns a Principal object, use it directly
      const userTokens = await actor.get_user_tokens(whoami);
      const userType = userTokens.length > 0 ? 'creator' : 'user';

      console.log('User type determined:', userType, 'Tokens:', userTokens.length);

      // Login with auth provider
      const userData = {
        id: principal,
        principal: whoami, // Store the Principal object returned from backend
        principalText: whoami.toString(), // Store string version for display
        type: userType,
        name: `User ${principal.slice(0, 8)}...`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${principal}`,
        actor: actor, // Store actor in auth context
        isConnectedToBackend: true,
        canisterId: config.backendCanisterId,
        network: config.network
      };

      console.log('Completing login:', userData);
      login(userData);
      console.log('Navigating to:', userType === 'creator' ? '/creator' : '/dashboard');

      // Navigate based on user type
      navigate(userType === 'creator' ? '/creator' : '/dashboard');
    } catch (err) {
      console.error('Error during successful auth handling:', err);
      setError('Connected to Internet Identity but failed to connect to backend');

      // Still login but without backend connection
      login({
        id: principal,
        principal: principal,
        type: 'user',
        name: `User ${principal.slice(0, 8)}...`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${principal}`,
        actor: null,
        isConnectedToBackend: false
      });
    }
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
        identityProvider: config.identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: async () => {
          try {
            // Reinitialize with new identity
            const identity = authState.authClient.getIdentity();
            const principal = identity.getPrincipal();
            
            if (principal.isAnonymous()) {
              throw new Error('Authentication failed - received anonymous principal');
            }

            // Create new actor with authenticated identity
            const actor = await createActor(identity);
            
            setAuthState(prev => ({
              ...prev,
              actor,
              isAuthenticated: true,
              principal: principal.toString()
            }));
            
            await handleSuccessfulAuth(principal.toString(), actor);
          } catch (err) {
            console.error('Post-login setup failed:', err);
            setError('Login succeeded but failed to initialize backend connection');
          } finally {
            setIsLoading(false);
          }
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
    try {
      if (authState.authClient) {
        await authState.authClient.logout();
      }
      logout();
      setAuthState({
        authClient: null,
        actor: null,
        isAuthenticated: false,
        principal: null
      });
      await initializeAuthClient();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAdminLogin = () => {
    login({
      id: 'admin-1',
      principal: 'admin-principal-12345',
      type: 'admin',
      name: 'Admin User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
      actor: null,
      isConnectedToBackend: false
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
          <p className="text-xs text-muted-foreground">
            Network: {config.network} | Backend: {config.backendCanisterId || 'Not configured'}
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
                  <p className="text-xs text-muted-foreground">
                    Backend: {authState.actor ? '✓ Connected' : '✗ Disconnected'}
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