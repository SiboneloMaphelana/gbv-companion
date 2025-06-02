import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Text, Card, IconButton } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { signIn, useBiometrics } = useAuth();

  const handleAuthenticationSuccess = async () => {
    try {
      const success = await signIn('');
      if (!success) {
        setError('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication success handling error:', error);
      setError('Failed to complete authentication');
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      setError('');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with fingerprint',
        fallbackLabel: 'Use PIN instead',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await handleAuthenticationSuccess();
      } else if (result.error) {
        setError('Fingerprint authentication failed');
      }
    } catch (error) {
      console.error('Fingerprint auth error:', error);
      setError('Fingerprint authentication failed');
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }

      const success = await signIn(pin);
      if (!success) {
        setError('Invalid PIN');
        setPin('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in');
      setPin('');
    }
  };

  const renderLoginOptions = () => (
    <View style={styles.optionsContainer}>
      <Title style={styles.title}>Welcome Back</Title>
      <Text style={styles.subtitle}>Choose how you'd like to sign in</Text>

      <Card style={styles.optionCard} onPress={() => setShowPinInput(true)}>
        <Card.Content style={styles.cardContent}>
          <IconButton icon="pin" size={30} />
          <Text style={styles.optionText}>Sign in with PIN</Text>
        </Card.Content>
      </Card>

      {useBiometrics && (
        <Card style={styles.optionCard} onPress={authenticateWithBiometrics}>
          <Card.Content style={styles.cardContent}>
            <IconButton icon="fingerprint" size={30} />
            <Text style={styles.optionText}>Sign in with Fingerprint</Text>
          </Card.Content>
        </Card>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  const renderPinInput = () => (
    <View style={styles.container}>
      <IconButton
        icon="arrow-left"
        size={24}
        style={styles.backButton}
        onPress={() => {
          setShowPinInput(false);
          setPin('');
          setError('');
        }}
      />
      
      <Title style={styles.title}>Enter PIN</Title>

      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter your PIN"
        autoFocus
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        disabled={!pin}
      >
        Sign In
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {showPinInput ? renderPinInput() : renderLoginOptions()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  optionsContainer: {
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
    marginBottom: 30,
    color: '#666',
  },
  optionCard: {
    marginVertical: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 10,
  },
  backButton: {
    marginLeft: -8,
    marginBottom: 16,
  },
}); 