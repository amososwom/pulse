import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useAuth } from "@/hooks/useAuth";
import { Users, Sparkles, TrendingUp, Crown } from "lucide-react";

// Layout component
import Layout from "../entities/Layout";

// Landing page components
import ContactSection from "@/components/landing/ContactSection";
import FAQSection from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import InternetIdentityModal from "@/components/landing/InternetIdentityModal";
import TokenomicsSection from "@/components/landing/TokenomicsSection";
import VideoSection from "@/components/landing/VideoSection";

// Home page components
import FeaturedCreators from "@/components/home/FeaturedCreators";
import PlatformStats from "@/components/home/PlatformStats";

// Backend canister interface - Updated to match your backend
const idlFactory = ({ IDL }) => {
  const TokenId = IDL.Nat;
  const Tokens = IDL.Nat;
  const Account = IDL.Principal;
  
  const CreateTokenError = IDL.Variant({
    'InvalidName': IDL.Null,
    'InvalidSymbol': IDL.Null,
    'InvalidSupply': IDL.Null,
    'AnonymousNotAllowed': IDL.Null,
    'InsufficientPermissions': IDL.Null,
    'RateLimitExceeded': IDL.Null,
    'InternalError': IDL.Text,
  });

  const TransferError = IDL.Variant({
    'TokenNotFound': IDL.Null,
    'InsufficientBalance': IDL.Null,
    'SelfTransfer': IDL.Null,
    'InsufficientPermissions': IDL.Null,
    'InternalError': IDL.Text,
  });

  const CreateTokenResult = IDL.Variant({
    'ok': TokenId,
    'err': CreateTokenError,
  });

  const TransferResult = IDL.Variant({
    'ok': IDL.Bool,
    'err': TransferError,
  });

  const UserRole = IDL.Variant({
    'Admin': IDL.Null,
    'Creator': IDL.Null,
    'User': IDL.Null,
  });

  const UserProfile = IDL.Record({
    'principal': Account,
    'role': UserRole,
    'createdAt': IDL.Nat64,
    'lastActive': IDL.Nat64,
    'tokensCreated': IDL.Nat,
    'isVerified': IDL.Bool,
  });
  
  return IDL.Service({
    'create_token': IDL.Func(
      [IDL.Text, IDL.Text, Tokens, IDL.Nat8, IDL.Opt(IDL.Text)],
      [CreateTokenResult],
      [],
    ),
    'transfer': IDL.Func(
      [TokenId, Account, Tokens],
      [TransferResult],
      [],
    ),
    'whoami': IDL.Func([], [IDL.Principal], ['query']),
    'get_user_tokens': IDL.Func([Account], [IDL.Vec(IDL.Tuple(TokenId, Tokens))], ['query']),
    'get_user_role': IDL.Func([Account], [IDL.Opt(UserRole)], ['query']),
    'get_user_profile': IDL.Func([Account], [IDL.Opt(UserProfile)], ['query']),
    'set_user_role': IDL.Func([Account, UserRole], [IDL.Bool], []),
    'is_admin': IDL.Func([Account], [IDL.Bool], ['query']),
    'balance_of': IDL.Func([TokenId, Account], [Tokens], ['query']),
    'total_supply': IDL.Func([TokenId], [Tokens], ['query']),
    'all_tokens': IDL.Func([], [IDL.Vec(TokenId)], ['query']),
    'get_stats': IDL.Func([], [IDL.Record({
      'total_tokens': IDL.Nat,
      'total_users': IDL.Nat,
      'admin_count': IDL.Nat,
      'creator_count': IDL.Nat,
    })], ['query']),
    'get_all_users': IDL.Func([], [IDL.Opt(IDL.Vec(UserProfile))], ['query']),
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
      ? 'https://identity.ic0.app'
      : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943',
    backendCanisterId: network === 'ic'
      ? process.env.REACT_APP_PULSE_BACKEND_CANISTER_ID
      : 'uxrrr-q7777-77774-qaaaq-cai',
  };
};

function MainLanding() {
  // Modal state management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticationMethod, setAuthenticationMethod] = useState(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [isSignUp, setIsSignUp] = useState(true);

  const navigate = useNavigate();
  const { login } = useAuth();
  const config = getConfig();

  const handleGetStarted = (signUpMode = true) => {
    setIsSignUp(signUpMode);
    setShowAuthModal(true);
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

  const determineUserRole = async (principal, actor) => {
    try {
      // Get user profile which includes role information
      const userProfile = await actor.get_user_profile(principal);
      if (userProfile && userProfile.length > 0) {
        const profile = userProfile[0];
        const role = profile.role;
        
        if (role.Admin !== undefined) return 'admin';
        if (role.Creator !== undefined) return 'creator';
        if (role.User !== undefined) return 'user';
      }

      // Check if user has created any tokens (could make them a creator)
      const userTokens = await actor.get_user_tokens(principal);
      if (userTokens.length > 0) return 'creator';

      // Check if user is admin by direct check
      const isAdmin = await actor.is_admin(principal);
      if (isAdmin) return 'admin';

      // New user - needs role selection
      return null;
    } catch (error) {
      console.error('Error determining user role:', error);
      return null;
    }
  };

  // Enhanced role-based navigation function
  const getRouteForUserType = (userType) => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'creator':
        return '/creator';
      case 'user':
      default:
        return '/dashboard';
    }
  };

  const completeLogin = (principal, actor, userType, isConnectedToBackend) => {
    // Store the user's last role for future logins
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('pulse-last-user-type', userType);
    }

    login({
      id: principal,
      principal: principal,
      type: userType,
      name: userType === 'admin' ? 'Admin User' :
            userType === 'creator' ? `Creator ${principal.slice(0, 8)}...` :
            `User ${principal.slice(0, 8)}...`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${principal}`,
      actor: actor,
      isConnectedToBackend: isConnectedToBackend
    });
    
    // Navigate to the appropriate dashboard based on role
    const route = getRouteForUserType(userType);
    navigate(route);
  };

  const handleInternetIdentity = async () => {
    setIsAuthenticating(true);
    setAuthenticationMethod('internet-identity');
    
    try {
      const authClient = await AuthClient.create();
      
      await authClient.login({
        identityProvider: config.identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: async () => {
          try {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();
            
            if (principal.isAnonymous()) {
              throw new Error('Authentication failed - received anonymous principal');
            }

            console.log('Authenticated as:', principal.toString());

            // Create actor with authenticated identity
            const actor = await createActor(identity);
            
            // Test backend connection and get whoami
            const whoami = await actor.whoami();
            console.log('Connected to backend as:', whoami.toString());

            // Determine user role
            const userRole = await determineUserRole(principal, actor);
            
            if (userRole) {
              // Existing user with role - login directly to their appropriate dashboard
              setShowAuthModal(false);
              completeLogin(principal.toString(), actor, userRole, true);
            } else if (isSignUp) {
              // New user signing up - show role selection
              setPendingAuth({
                principal: principal,
                actor: actor
              });
              setShowRoleSelection(true);
            } else {
              // User trying to sign in but no profile exists - treat as sign up
              console.log('No existing profile found, switching to sign up flow');
              setIsSignUp(true);
              setPendingAuth({
                principal: principal,
                actor: actor
              });
              setShowRoleSelection(true);
            }
          } catch (err) {
            console.error('Post-login setup failed:', err);
            // Still proceed with basic login
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();
            
            // For fallback, use the last known user type or default to user
            let fallbackType = 'user';
            if (typeof window !== 'undefined' && window.localStorage) {
              fallbackType = localStorage.getItem('pulse-last-user-type') || 'user';
            }
            
            setShowAuthModal(false);
            completeLogin(principal.toString(), null, fallbackType, false);
          } finally {
            setIsAuthenticating(false);
          }
        },
        onError: (error) => {
          console.error('Internet Identity login failed:', error);
          setIsAuthenticating(false);
          setAuthenticationMethod(null);
        }
      });
    } catch (error) {
      console.error("Internet Identity authentication failed:", error);
      setIsAuthenticating(false);
      setAuthenticationMethod(null);
    }
  };

  const handleRoleSelect = async (role) => {
    if (!pendingAuth) return;

    setIsAuthenticating(true);
    try {
      if (pendingAuth.actor && pendingAuth.principal) {
        try {
          // Set role in backend using the correct variant format
          const roleVariant = role === 'admin' ? { Admin: null } : 
                             role === 'creator' ? { Creator: null } : 
                             { User: null };
          
          const success = await pendingAuth.actor.set_user_role(pendingAuth.principal, roleVariant);
          if (success) {
            console.log(`Role ${role} successfully set for principal:`, pendingAuth.principal.toString());
          } else {
            console.warn('Failed to set role in backend, continuing with local role');
          }
        } catch (backendError) {
          console.error('Backend role setting failed:', backendError);
          // Continue with local role assignment
        }
      }
      
      setShowRoleSelection(false);
      setShowAuthModal(false);
      completeLogin(
        pendingAuth.principal.toString(), 
        pendingAuth.actor, 
        role, 
        !!pendingAuth.actor
      );
    } catch (error) {
      console.error('Failed to complete role selection:', error);
      // Still proceed with local role selection
      setShowRoleSelection(false);
      setShowAuthModal(false);
      completeLogin(
        pendingAuth.principal.toString(), 
        pendingAuth.actor, 
        role, 
        !!pendingAuth.actor
      );
    } finally {
      setIsAuthenticating(false);
      setPendingAuth(null);
    }
  };

  const handleSkipRoleSelection = () => {
    if (!pendingAuth) return;
    
    setShowRoleSelection(false);
    setShowAuthModal(false);
    completeLogin(
      pendingAuth.principal.toString(), 
      pendingAuth.actor, 
      'user', 
      !!pendingAuth.actor
    );
    setPendingAuth(null);
  };

  // NFID handlers (demo functionality)
  const handleNFID = async () => {
    setIsAuthenticating(true);
    setAuthenticationMethod('nfid');
    
    try {
      // For demo purposes, we'll simulate the NFID flow
      console.log("Starting NFID demo authentication...");
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create demo user data
      const demoUser = {
        id: `nfid-demo-${Date.now()}`,
        principal: `nfid-${Math.random().toString(36).substr(2, 9)}`,
        type: 'user',
        name: 'NFID Demo User',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=nfid-demo`,
        actor: null,
        isConnectedToBackend: false
      };
      
      setShowAuthModal(false);
      login(demoUser);
      navigate('/dashboard');
      
    } catch (error) {
      console.error("NFID demo authentication failed:", error);
    } finally {
      setIsAuthenticating(false);
      setAuthenticationMethod(null);
    }
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    setShowRoleSelection(false);
    setIsAuthenticating(false);
    setAuthenticationMethod(null);
    setPendingAuth(null);
  };

  // Role Selection Component (embedded in modal)
  const RoleSelectionContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <button 
          onClick={() => handleRoleSelect('creator')} 
          className="w-full p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-left hover:opacity-90 transition-opacity group"
          disabled={isAuthenticating}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Creator</div>
              <div className="text-sm text-white/90 mt-1">
                Launch tokens, manage communities, earn from your content
              </div>
              <div className="text-xs text-white/70 mt-1">
                • Create up to 10 tokens per day
                • Access creator dashboard & analytics
                • Manage your token communities
              </div>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleRoleSelect('user')} 
          className="w-full p-4 rounded-lg border-2 border-border bg-background text-left hover:bg-muted/50 transition-colors group"
          disabled={isAuthenticating}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Investor/Trader</div>
              <div className="text-sm text-muted-foreground mt-1">
                Discover and invest in creator tokens, build your portfolio
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                • Buy and trade creator tokens
                • View marketplace and analytics
                • Build your token portfolio
              </div>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleRoleSelect('admin')} 
          className="w-full p-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-left hover:opacity-90 transition-opacity group"
          disabled={isAuthenticating}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Platform Admin</div>
              <div className="text-sm text-white/90 mt-1">
                Manage platform, oversee operations, admin controls
              </div>
              <div className="text-xs text-white/70 mt-1">
                • Full platform management access
                • User and token administration
                • Platform configuration & moderation
              </div>
            </div>
          </div>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <button 
          onClick={handleSkipRoleSelection} 
          className="w-full p-3 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:bg-muted/30"
          disabled={isAuthenticating}
        >
          Skip for now (default to User role)
        </button>

        {isAuthenticating && (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-sm text-muted-foreground">Setting up your account...</span>
          </div>
        )}
      </div>

      {/* Role Benefits Comparison */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Role Benefits
        </h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium">Creator</div>
            <div className="text-muted-foreground mt-1">Token creation & management</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="font-medium">Trader</div>
            <div className="text-muted-foreground mt-1">Investment & trading focus</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="font-medium">Admin</div>
            <div className="text-muted-foreground mt-1">Platform oversight</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <Layout>
        {/* Landing Page Content */}
        <HeroSection 
          onGetStarted={handleGetStarted}
          onSignIn={() => handleGetStarted(false)}
        />
        <FeaturesSection />
        <HowItWorks />
        <TokenomicsSection />
        <VideoSection />
        <FAQSection />
        <ContactSection />
        
        {/* Enhanced Internet Identity Modal with Role Selection */}
        <InternetIdentityModal 
          isOpen={showAuthModal}
          onClose={handleCloseModal}
          onAuthenticate={handleInternetIdentity}
          onNFID={handleNFID}
          isLoading={isAuthenticating}
          authMethod={authenticationMethod}
          showRoleSelection={showRoleSelection}
          roleSelectionContent={<RoleSelectionContent />}
          isSignUp={isSignUp}
        />
      </Layout>
    </div>
  );
}

export default MainLanding;