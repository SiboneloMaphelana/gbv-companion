import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SetupPinScreen from '../screens/auth/SetupPinScreen';
import * as SecureStore from 'expo-secure-store';

export type AuthStackParamList = {
  Login: undefined;
  SetupPin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const [hasPin, setHasPin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    checkPin();
  }, []);

  const checkPin = async () => {
    try {
      const pin = await SecureStore.getItemAsync('userPin');
      setHasPin(!!pin);
    } catch (error) {
      console.error('Error checking PIN:', error);
      setHasPin(false);
    }
  };

  if (hasPin === null) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {hasPin ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="SetupPin" component={SetupPinScreen} />
      )}
    </Stack.Navigator>
  );
} 