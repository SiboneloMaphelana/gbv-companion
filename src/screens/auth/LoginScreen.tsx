import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { signIn, useBiometrics } = useAuth();

  useEffect(() => {
    if (useBiometrics) {
      authenticateWithBiometrics();
    }
  }, []);

  const authenticateWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access the app',
        fallbackLabel: 'Use PIN instead',
      });

      if (result.success) {
        // The biometric authentication is handled in the AuthContext
        // This is just a fallback in case the context didn't catch it
        signIn('');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const handleLogin = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    try {
      const success = await signIn(pin);
      if (!success) {
        setError('Invalid PIN');
      }
    } catch (error) {
      setError('Failed to sign in');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome Back</Title>
      <Text style={styles.subtitle}>
        Enter your PIN to access the app
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter PIN"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        disabled={!pin}
      >
        Login
      </Button>

      {useBiometrics && (
        <Button
          mode="outlined"
          onPress={authenticateWithBiometrics}
          style={styles.biometricButton}
          icon="fingerprint"
        >
          Use Biometrics
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
  biometricButton: {
    marginTop: 10,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 10,
  },
}); 