import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Helper function to get user permissions based on role
const getUserPermissions = (userType) => {
  const basePermissions = {
    canViewDashboard: true,
    canViewProfile: true,
    canUpdateProfile: true,
  };

  switch (userType) {
    case 'admin':
      return {
        ...basePermissions,
        canCreateTokens: true,
        canManageTokens: true,
        canManageUsers: true,
        canManageMarketplace: true,
        canViewAnalytics: true,
        canAccessAdminPanel: true,
        canAccessCreatorDashboard: true,
        canModerateContent: true,
        canConfigurePlatform: true,
        canViewAllUsers: true,
        canSetUserRoles: true,
        maxTokensPerDay: -1, // unlimited
        role: 'admin'
      };
    
    case 'creator':
      return {
        ...basePermissions,
        canCreateTokens: true,
        canManageOwnTokens: true,
        canViewCreatorAnalytics: true,
        canAccessCreatorDashboard: true,
        canCreateListings: true,
        canManageOwnListings: true,
        canReceivePayments: true,
        canTransferTokens: true,
        maxTokensPerDay: 10,
        role: 'creator'
      };
    
    case 'user':
    default:
      return {
        ...basePermissions,
        canBuyTokens: true,
        canTradeTokens: true,
        canViewMarketplace: true,
        canTransferTokens: true,
        canCreateListings: false,
        canCreateTokens: false,
        maxTransactionsPerDay: 100,
        role: 'user'
      };
  }
};

// Safe storage utilities that work in all environments
const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
    return null;
  },
  
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
    return false;
  },
  
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from storage
    const initializeAuth = () => {
      try {
        const storedUser = safeStorage.getItem('pulse-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Validate stored data structure
          if (userData && typeof userData === 'object' && userData.id) {
            // Ensure permissions are up to date
            userData.permissions = getUserPermissions(userData.type);
            setUser(userData);
            console.log('User restored from storage:', userData.principal, 'as', userData.type);
          } else {
            // Clear invalid stored data
            safeStorage.removeItem('pulse-user');
          }
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear corrupted data
        safeStorage.removeItem('pulse-user');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    try {
      // Validate userData structure
      if (!userData || typeof userData !== 'object' || !userData.id) {
        throw new Error('Invalid user data provided to login');
      }

      // Ensure userData has required fields with enhanced role support
      const completeUserData = {
        id: userData.id,
        principal: userData.principal || userData.id,
        type: userData.type || 'user',
        name: userData.name || `User ${userData.id.slice(0, 8)}...`,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
        actor: userData.actor || null,
        isConnectedToBackend: userData.isConnectedToBackend || false,
        loginTime: new Date().toISOString(),
        // Enhanced role-based properties
        permissions: getUserPermissions(userData.type),
        roleSetAt: userData.roleSetAt || new Date().toISOString(),
        isDemo: userData.id.includes('demo') || userData.id.includes('nfid') || false,
        // Backend connection info
        canisterId: userData.canisterId || null,
        network: userData.network || 'local',
        ...userData
      };

      setUser(completeUserData);
      
      // Store user data (excluding actor which can't be serialized)
      const storableData = { ...completeUserData };
      delete storableData.actor; // Remove actor before storing
      
      safeStorage.setItem('pulse-user', JSON.stringify(storableData));
      
      console.log('User logged in:', completeUserData.principal, 'as', completeUserData.type, 
                  completeUserData.isConnectedToBackend ? '(backend connected)' : '(demo mode)');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log('User logged out:', user?.principal);
      setUser(null);
      safeStorage.removeItem('pulse-user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = (updates) => {
    try {
      if (!user) {
        console.warn('No user to update');
        return;
      }

      const updatedUser = { 
        ...user, 
        ...updates,
        // Recalculate permissions if role changed
        permissions: updates.type ? getUserPermissions(updates.type) : user.permissions,
        // Update timestamp
        lastUpdated: new Date().toISOString()
      };
      setUser(updatedUser);
      
      // Store updated data (excluding actor)
      const storableData = { ...updatedUser };
      delete storableData.actor;
      
      safeStorage.setItem('pulse-user', JSON.stringify(storableData));
      
      console.log('User profile updated');
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

const updateActor = async (actor) => {
  try {
    if (!user) {
      console.warn('No user to update actor for');
      return;
    }

    setUser(prev => ({
      ...prev,
      actor,
      isConnectedToBackend: !!actor,
      lastBackendConnection: actor ? new Date().toISOString() : null
    }));
    
    // Initialize user profile in backend after connecting
    if (actor && user.principal) {
      try {
        console.log('Initializing user profile in backend for:', user.principal);
        
        // Call the initialization function to create/update user profile
        const profile = await actor.initialize_user();
        
        console.log('User profile initialized:', profile);
        
        // Extract role from backend profile
        let backendRole = 'user';
        if (profile.role.Admin !== undefined) backendRole = 'admin';
        else if (profile.role.Creator !== undefined) backendRole = 'creator';
        else if (profile.role.User !== undefined) backendRole = 'user';
        
        // Update local user data with backend profile information
        setUser(prev => ({
          ...prev,
          type: backendRole,
          tokensCreated: Number(profile.tokensCreated),
          isVerified: profile.isVerified,
          backendInitialized: true,
          backendSyncedAt: new Date().toISOString(),
          backendProfile: profile,
          // Update permissions based on backend role
          permissions: getUserPermissions(backendRole)
        }));
        
        console.log('User profile synced with backend, role:', backendRole);
        
      } catch (initError) {
        console.error('Failed to initialize user in backend:', initError);
        
        // Try the simpler ping function as fallback
        try {
          console.log('Trying ping function as fallback...');
          await actor.ping();
          console.log('Ping successful - user should be created');
        } catch (pingError) {
          console.error('Ping also failed:', pingError);
        }
      }
    }
    
    console.log('User actor updated, backend connected:', !!actor);
  } catch (error) {
    console.error('Actor update error:', error);
  }
};
  const changeRole = async (newRole, actor) => {
    try {
      if (!user) {
        console.warn('No user to change role for');
        return false;
      }

      // If backend actor is available, update role on backend
      if (actor && user.principal) {
        try {
          const roleVariant = newRole === 'admin' ? { Admin: null } : 
                             newRole === 'creator' ? { Creator: null } : 
                             { User: null };
          
          const success = await actor.set_user_role(user.principal, roleVariant);
          if (success) {
            console.log(`Role ${newRole} successfully set in backend for:`, user.principal);
          } else {
            console.warn('Backend role update returned false');
          }
        } catch (backendError) {
          console.error('Failed to update role in backend:', backendError);
          // Continue with local update even if backend fails
        }
      }

      // Update local role
      updateProfile({ 
        type: newRole,
        roleSetAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Role change error:', error);
      return false;
    }
  };

  // Function to sync user data with backend
  const syncWithBackend = async (actor) => {
    try {
      if (!user || !actor) return false;

      // Get user profile from backend
      const backendProfile = await actor.get_user_profile(user.principal);
      if (backendProfile && backendProfile.length > 0) {
        const profile = backendProfile[0];
        
        // Extract role from backend
        let backendRole = 'user';
        if (profile.role.Admin !== undefined) backendRole = 'admin';
        else if (profile.role.Creator !== undefined) backendRole = 'creator';
        else if (profile.role.User !== undefined) backendRole = 'user';

        // Update local user data if different
        if (backendRole !== user.type) {
          console.log(`Role sync: updating from ${user.type} to ${backendRole}`);
          updateProfile({ 
            type: backendRole,
            tokensCreated: profile.tokensCreated,
            isVerified: profile.isVerified,
            backendSyncedAt: new Date().toISOString()
          });
        }

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Backend sync error:', error);
      return false;
    }
  };

  const getEnvironmentInfo = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const network = process.env.DFX_NETWORK || (isDevelopment ? 'local' : 'ic');
    
    return {
      isDevelopment,
      network,
      canisterId: network === 'ic' 
        ? process.env.REACT_APP_PULSE_BACKEND_CANISTER_ID 
        : 'uxrrr-q7777-77774-qaaaq-cai',
      host: network === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
      identityProvider: network === 'ic' 
        ? 'https://identity.ic0.app'
        : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
    };
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    login,
    logout,
    updateProfile,
    updateActor,
    changeRole,
    syncWithBackend,
    getEnvironmentInfo,
    // Computed values for easier access
    principal: user?.principal || null,
    userType: user?.type || null,
    actor: user?.actor || null,
    isConnectedToBackend: user?.isConnectedToBackend || false,
    permissions: user?.permissions || {},
    isDemo: user?.isDemo || false,
    // Helper functions
    hasBackendConnection: () => !!user?.actor && user?.isConnectedToBackend,
    canCreateTokens: () => user?.permissions?.canCreateTokens || false,
    isAdmin: () => user?.type === 'admin',
    isCreator: () => user?.type === 'creator',
    isUser: () => user?.type === 'user'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced hook for checking specific permissions
export const usePermissions = () => {
  const { user, permissions } = useAuth();
  
  return {
    // Role checks
    isAdmin: user?.type === 'admin',
    isCreator: user?.type === 'creator',
    isUser: user?.type === 'user',
    
    // Permission checks
    canCreateTokens: permissions?.canCreateTokens || false,
    canManageTokens: permissions?.canManageTokens || false,
    canManageUsers: permissions?.canManageUsers || false,
    canManageMarketplace: permissions?.canManageMarketplace || false,
    canViewAnalytics: permissions?.canViewAnalytics || false,
    canAccessAdminPanel: permissions?.canAccessAdminPanel || false,
    canAccessCreatorDashboard: permissions?.canAccessCreatorDashboard || false,
    canModerateContent: permissions?.canModerateContent || false,
    canBuyTokens: permissions?.canBuyTokens || false,
    canTradeTokens: permissions?.canTradeTokens || false,
    canCreateListings: permissions?.canCreateListings || false,
    canTransferTokens: permissions?.canTransferTokens || false,
    canViewAllUsers: permissions?.canViewAllUsers || false,
    canSetUserRoles: permissions?.canSetUserRoles || false,
    
    // Backend checks
    hasBackendAccess: user?.isConnectedToBackend === true,
    isInDemoMode: user?.isDemo === true,
    
    // Utility functions
    hasPermission: (permission) => permissions?.[permission] || false,
    hasAnyPermission: (permissionsList) => 
      permissionsList.some(permission => permissions?.[permission]),
    hasAllPermissions: (permissionsList) => 
      permissionsList.every(permission => permissions?.[permission]),
    
    // Role hierarchy check
    hasMinimumRole: (minimumRole) => {
      const roleHierarchy = { user: 1, creator: 2, admin: 3 };
      const userLevel = roleHierarchy[user?.type] || 0;
      const requiredLevel = roleHierarchy[minimumRole] || 0;
      return userLevel >= requiredLevel;
    },

    // Check if user can perform token operations
    canPerformTokenOperation: (operation) => {
      if (!user?.isConnectedToBackend && operation !== 'view') {
        return { allowed: false, reason: 'Backend connection required' };
      }
      
      switch (operation) {
        case 'create':
          return { 
            allowed: permissions?.canCreateTokens || false, 
            reason: permissions?.canCreateTokens ? null : 'Insufficient permissions to create tokens'
          };
        case 'transfer':
          return { 
            allowed: permissions?.canTransferTokens || false,
            reason: permissions?.canTransferTokens ? null : 'Insufficient permissions to transfer tokens'
          };
        case 'manage':
          return { 
            allowed: permissions?.canManageTokens || permissions?.canManageOwnTokens || false,
            reason: (permissions?.canManageTokens || permissions?.canManageOwnTokens) ? null : 'Insufficient permissions to manage tokens'
          };
        default:
          return { allowed: true, reason: null };
      }
    }
  };
};

// Hook for safely accessing environment variables
export const useEnvironment = () => {
  const { getEnvironmentInfo } = useAuth();
  return getEnvironmentInfo();
};