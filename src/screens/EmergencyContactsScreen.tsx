import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';
import { useEmergency } from '../context/EmergencyContext';

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
}

export default function EmergencyContactsScreen() {
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact } = useEmergency();

  const handlePickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          const contact = await Contacts.presentContactPickerAsync();
          
          if (contact) {
            const phoneNumber = contact.phoneNumbers?.[0]?.number;
            if (phoneNumber) {
              const newContact = {
                id: Date.now().toString(),
                name: contact.name || 'Unknown',
                phoneNumber: phoneNumber,
              };
              await addEmergencyContact(newContact);
              
              // Ask to call the contact immediately
              Alert.alert(
                'Call Contact Now?',
                `Would you like to call ${newContact.name} now?`,
                [
                  { text: 'No', style: 'cancel' },
                  { 
                    text: 'Yes', 
                    style: 'default',
                    onPress: () => {
                      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
                      Linking.openURL(`tel:${cleanPhoneNumber}`);
                    }
                  }
                ]
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error picking contact:', error);
    }
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <Card style={styles.contactCard}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.phoneNumber}</Paragraph>
        {emergencyContacts[0]?.id === item.id && (
          <Paragraph style={styles.primaryLabel}>Primary Emergency Contact</Paragraph>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => removeEmergencyContact(item.id)}>Remove</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Emergency Contacts</Title>
        <Paragraph style={styles.instructions}>
          Add emergency contacts who will be notified in case of emergency. The first contact added will be your primary contact for emergency calls.
        </Paragraph>
        <Paragraph style={styles.instructions}>
          A red emergency button will always be visible in the app for quick access.
        </Paragraph>
      </View>

      <FlatList
        data={emergencyContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>
                No emergency contacts added yet. Add contacts to enable the emergency feature.
              </Paragraph>
            </Card.Content>
          </Card>
        }
      />

      <Button
        mode="contained"
        onPress={handlePickContact}
        style={styles.addButton}
      >
        Pick Contact from Phone Book
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
  },
  instructions: {
    marginTop: 8,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  contactCard: {
    marginBottom: 8,
  },
  primaryLabel: {
    color: '#ff3b30',
    marginTop: 4,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 16,
  },
  emptyCard: {
    marginTop: 16,
    backgroundColor: '#fff8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
}); 