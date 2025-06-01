import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function SetupPinScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const { setupPin } = useAuth();

  const handleSetupPin = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      await setupPin(pin);
    } catch (error) {
      setError('Failed to set up PIN');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Set Up PIN</Title>
      <Text style={styles.subtitle}>
        Create a PIN to secure your app. Make sure it's something you'll remember.
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

      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={confirmPin}
        onChangeText={setConfirmPin}
        placeholder="Confirm PIN"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleSetupPin}
        style={styles.button}
        disabled={!pin || !confirmPin}
      >
        Set PIN
      </Button>
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
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 10,
  },
}); 