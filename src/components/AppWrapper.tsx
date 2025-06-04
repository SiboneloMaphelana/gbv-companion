import React, { useEffect } from 'react';
import { LogBox, View, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { EmergencyProvider } from '../context/EmergencyContext';
import { ThemeProvider } from '../context/ThemeContext';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import ErrorBoundary from './common/ErrorBoundary';
import { performanceMonitor } from '../utils/performance';
import { securityManager } from '../utils/security';
import { cacheManager } from '../utils/cache';
import EmergencyButton from './EmergencyButton';
import AuthNavigator from '../navigation/AuthNavigator';
import TabNavigator from '../navigation/TabNavigator';
import OnboardingScreen from './onboarding/OnboardingScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

interface Props {
  children?: React.ReactNode;
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { hasCompletedOnboarding } = useOnboarding();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <>
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
      <EmergencyButton />
    </>
  );
}

const AppWrapper: React.FC<Props> = () => {
  useEffect(() => {
    setupApp();
  }, []);

  const setupApp = async () => {
    try {
      // Initialize security session
      await securityManager.validateSession();

      // Log app start metric
      performanceMonitor.logMetric({
        type: 'app_start',
        duration: 0,
        componentName: 'AppWrapper',
      });

      // Clean up expired cache
      await cacheManager.clearAll();
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <SafeAreaProvider>
          <PaperProvider>
            <ThemeProvider>
              <EmergencyProvider>
                <AuthProvider>
                  <OnboardingProvider>
                    <AppContent />
                  </OnboardingProvider>
                </AuthProvider>
              </EmergencyProvider>
            </ThemeProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppWrapper; 