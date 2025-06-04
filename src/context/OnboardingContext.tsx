import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  currentAppIcon: 'default' | 'weather' | 'calculator';
  setOnboardingComplete: () => Promise<void>;
  setAppIcon: (icon: 'default' | 'weather' | 'calculator') => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentAppIcon, setCurrentAppIcon] = useState<'default' | 'weather' | 'calculator'>('default');

  useEffect(() => {
    loadOnboardingStatus();
    loadAppIcon();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('onboarding_complete');
      setHasCompletedOnboarding(status === 'true');
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    }
  };

  const loadAppIcon = async () => {
    try {
      const icon = await AsyncStorage.getItem('app_icon');
      if (icon) {
        setCurrentAppIcon(icon as 'default' | 'weather' | 'calculator');
      }
    } catch (error) {
      console.error('Error loading app icon preference:', error);
    }
  };

  const setOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const setAppIcon = async (icon: 'default' | 'weather' | 'calculator') => {
    try {
      await AsyncStorage.setItem('app_icon', icon);
      setCurrentAppIcon(icon);
    } catch (error) {
      console.error('Error saving app icon preference:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        currentAppIcon,
        setOnboardingComplete,
        setAppIcon,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}; 