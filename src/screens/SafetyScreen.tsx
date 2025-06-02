import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, List, IconButton } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function SafetyScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Emergency Services',
      phone: '911',
      relationship: 'Emergency',
    },
  ]);

  const handleEmergency = async () => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        
        // Call emergency number
        Linking.openURL('tel:10111');
        
        // Could implement sending location to trusted contacts here
        Alert.alert(
          'Emergency Alert Activated',
          'Emergency services have been contacted. Stay safe.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error during emergency:', error);
      // Fallback to just calling emergency services
      Linking.openURL('tel:911');
    }
  };

  const handleQuickExit = () => {
    // Implement quick exit functionality
    // This could navigate to a neutral website or close the app
    Linking.openURL('https://weather.com');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.emergencyCard}>
        <Card.Content>
          <Title style={styles.emergencyTitle}>Emergency Help</Title>
          <Button
            mode="contained"
            onPress={handleEmergency}
            style={styles.emergencyButton}
            icon="phone-alert"
          >
            Get Emergency Help Now
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.safetyCard}>
        <Card.Content>
          <Title>Quick Safety Actions</Title>
          <List.Item
            title="Quick Exit"
            description="Quickly leave this app"
            left={props => <List.Icon {...props} icon="exit-run" />}
            onPress={handleQuickExit}
          />
          <List.Item
            title="Clear History"
            description="Clear app history and cache"
            left={props => <List.Icon {...props} icon="trash-can" />}
            onPress={() => {
              // Implement clear history functionality
              Alert.alert(
                'Clear History',
                'Are you sure you want to clear all app history?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await SecureStore.deleteItemAsync('journal_entries');
                        Alert.alert('History Cleared', 'All app history has been cleared.');
                      } catch (error) {
                        console.error('Error clearing history:', error);
                      }
                    },
                  },
                ]
              );
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.contactsCard}>
        <Card.Content>
          <Title>Emergency Contacts</Title>
          <Paragraph>Quick access to important contacts</Paragraph>
          
          {contacts.map(contact => (
            <List.Item
              key={contact.id}
              title={contact.name}
              description={contact.relationship}
              left={props => <List.Icon {...props} icon="phone" />}
              right={props => (
                <IconButton
                  {...props}
                  icon="phone"
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                />
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>Safety Information</Title>
          <Paragraph>
            If you are in immediate danger, please call emergency services immediately.
            Your safety is the top priority. This app includes features to help you
            stay safe and get help quickly when needed.
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  emergencyCard: {
    margin: 16,
    backgroundColor: '#ffebee',
  },
  emergencyTitle: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  emergencyButton: {
    backgroundColor: '#d32f2f',
  },
  safetyCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  contactsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
  },
}); 