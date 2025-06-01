import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthContextData {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (pin: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  useBiometrics: boolean;
  toggleBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useBiometrics, setUseBiometrics] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const hasBiometrics = await SecureStore.getItemAsync('useBiometrics');
      setUseBiometrics(hasBiometrics === 'true');

      if (hasBiometrics === 'true') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access the app',
          fallbackLabel: 'Use PIN instead',
        });
        
        if (result.success) {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await SecureStore.getItemAsync('userPin');
      const isValid = storedPin === pin;
      
      if (isValid) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const setupPin = async (pin: string) => {
    try {
      await SecureStore.setItemAsync('userPin', pin);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Setup PIN error:', error);
    }
  };

  const toggleBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const newValue = !useBiometrics;
        await SecureStore.setItemAsync('useBiometrics', newValue.toString());
        setUseBiometrics(newValue);
      } else {
        throw new Error('Biometric authentication not available');
      }
    } catch (error) {
      console.error('Toggle biometrics error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        signIn,
        signOut,
        setupPin,
        useBiometrics,
        toggleBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 