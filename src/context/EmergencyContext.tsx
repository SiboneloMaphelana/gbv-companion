import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
}

interface EmergencyContextData {
  emergencyContacts: EmergencyContact[];
  addEmergencyContact: (contact: EmergencyContact) => Promise<void>;
  removeEmergencyContact: (id: string) => Promise<void>;
  triggerEmergency: () => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextData>({} as EmergencyContextData);

const EMERGENCY_CONTACTS_KEY = 'emergencyContacts';

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const contactsString = await SecureStore.getItemAsync(EMERGENCY_CONTACTS_KEY);
      if (contactsString) {
        setEmergencyContacts(JSON.parse(contactsString));
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const addEmergencyContact = async (contact: EmergencyContact) => {
    try {
      const updatedContacts = [...emergencyContacts, contact];
      await SecureStore.setItemAsync(EMERGENCY_CONTACTS_KEY, JSON.stringify(updatedContacts));
      setEmergencyContacts(updatedContacts);
    } catch (error) {
      console.error('Error adding emergency contact:', error);
    }
  };

  const removeEmergencyContact = async (id: string) => {
    try {
      const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
      await SecureStore.setItemAsync(EMERGENCY_CONTACTS_KEY, JSON.stringify(updatedContacts));
      setEmergencyContacts(updatedContacts);
    } catch (error) {
      console.error('Error removing emergency contact:', error);
    }
  };

  const sendEmergencySMS = async () => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable && emergencyContacts.length > 0) {
        const message = "EMERGENCY: I need help. This is an automated emergency alert. Please contact me immediately.";
        const phoneNumbers = emergencyContacts.map(contact => contact.phoneNumber);
        await SMS.sendSMSAsync(phoneNumbers, message);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      return false;
    }
  };

  const callEmergencyContact = async () => {
    try {
      if (emergencyContacts.length > 0) {
        const primaryContact = emergencyContacts[0];
        const phoneNumber = primaryContact.phoneNumber.replace(/\D/g, '');
        await Linking.openURL(`tel:${phoneNumber}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error making emergency call:', error);
      return false;
    }
  };

  const triggerEmergency = async () => {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add emergency contacts in the Emergency tab first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Emergency Alert',
      'This will send an emergency SMS to all contacts and call your primary contact. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'YES',
          style: 'destructive',
          onPress: async () => {
            const results = await Promise.all([
              sendEmergencySMS(),
              callEmergencyContact()
            ]);

            if (results.some(result => result)) {
              Alert.alert('Emergency Alert Sent', 'Emergency contacts have been notified.');
            } else {
              Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencyContacts,
        addEmergencyContact,
        removeEmergencyContact,
        triggerEmergency,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}; 