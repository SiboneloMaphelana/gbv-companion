import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Text, Portal, Dialog } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/AuthContext';

export default function SetupPinScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const { setupPin, toggleBiometrics } = useAuth();

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return hasHardware && 
             isEnrolled && 
             supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    } catch (error) {
      console.error('Error checking fingerprint support:', error);
      return false;
    }
  };

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
      const hasFingerprint = await checkBiometricSupport();
      if (hasFingerprint) {
        setShowBiometricDialog(true);
      }
    } catch (error) {
      setError('Failed to set up PIN');
    }
  };

  const handleEnableBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your fingerprint',
        fallbackLabel: 'Use PIN instead',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await toggleBiometrics();
      }
    } catch (error) {
      console.error('Fingerprint setup error:', error);
    } finally {
      setShowBiometricDialog(false);
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

      <Portal>
        <Dialog
          visible={showBiometricDialog}
          onDismiss={() => setShowBiometricDialog(false)}
        >
          <Dialog.Title>Enable Fingerprint Login</Dialog.Title>
          <Dialog.Content>
            <Text>
              Would you like to enable fingerprint authentication for quicker access to the app?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBiometricDialog(false)}>Not Now</Button>
            <Button onPress={handleEnableBiometrics}>Enable</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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