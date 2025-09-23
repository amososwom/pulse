import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

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
            setUser(userData);
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

      // Ensure userData has required fields
      const completeUserData = {
        id: userData.id,
        principal: userData.principal || userData.id,
        type: userData.type || 'user',
        name: userData.name || `User ${userData.id.slice(0, 8)}...`,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
        actor: userData.actor || null,
        isConnectedToBackend: userData.isConnectedToBackend || false,
        loginTime: new Date().toISOString(),
        ...userData
      };

      setUser(completeUserData);
      
      // Store user data (excluding actor which can't be serialized)
      const storableData = { ...completeUserData };
      delete storableData.actor; // Remove actor before storing
      
      safeStorage.setItem('pulse-user', JSON.stringify(storableData));
      
      console.log('User logged in:', completeUserData.principal);
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

      const updatedUser = { ...user, ...updates };
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

  const updateActor = (actor) => {
    try {
      if (!user) {
        console.warn('No user to update actor for');
        return;
      }

      setUser(prev => ({
        ...prev,
        actor,
        isConnectedToBackend: !!actor
      }));
      
      console.log('User actor updated, backend connected:', !!actor);
    } catch (error) {
      console.error('Actor update error:', error);
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
    getEnvironmentInfo,
    // Computed values for easier access
    principal: user?.principal || null,
    userType: user?.type || null,
    actor: user?.actor || null,
    isConnectedToBackend: user?.isConnectedToBackend || false,
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

// Hook for checking if user has specific permissions
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.type === 'admin',
    isCreator: user?.type === 'creator',
    isUser: user?.type === 'user',
    canCreateTokens: user?.type === 'creator' || user?.type === 'admin',
    canManageMarketplace: user?.type === 'admin',
    hasBackendAccess: user?.isConnectedToBackend === true,
  };
};

// Hook for safely accessing environment variables
export const useEnvironment = () => {
  const { getEnvironmentInfo } = useAuth();
  return getEnvironmentInfo();
};