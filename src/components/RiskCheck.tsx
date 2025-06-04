import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  Surface,
  Title,
  Text,
  Button,
  List,
  Card,
  Divider,
} from 'react-native-paper';

type RootStackParamList = {
  SafetyAssistant: undefined;
};

const EMERGENCY_CONTACTS = [
  {
    name: 'Police Emergency',
    number: '10111',
    description: 'For immediate police assistance',
  },
  {
    name: 'Ambulance',
    number: '10177',
    description: 'For medical emergencies',
  },
  {
    name: 'GBV Command Centre',
    number: '0800 428 428',
    description: '24/7 support and counseling',
  },
];

const SUPPORT_ORGANIZATIONS = [
  {
    name: 'People Opposing Women Abuse (POWA)',
    contact: '011 642 4345',
    website: 'https://www.powa.co.za',
    services: 'Counseling, legal support, shelter',
  },
  {
    name: 'Lifeline',
    contact: '0861 322 322',
    website: 'http://www.lifeline.co.za',
    services: '24-hour crisis intervention',
  },
  {
    name: 'Rape Crisis Cape Town Trust',
    contact: '021 447 9762',
    website: 'https://rapecrisis.org.za',
    services: 'Counseling, support services, advocacy',
  },
];

const SAFETY_TIPS = [
  'Keep important documents and emergency money in a safe place',
  'Memorize important emergency numbers',
  'Identify safe exits from your home',
  'Create a code word with trusted friends/family',
  'Keep a packed emergency bag ready',
  'Document all incidents with dates and details',
];

export default function RiskCheck() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch((err) => {
      Alert.alert('Error', 'Could not initiate the call');
    });
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url).catch((err) => {
      Alert.alert('Error', 'Could not open the website');
    });
  };

  const navigateToSafetyAssistant = () => {
    navigation.navigate('SafetyAssistant');
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.title}>Safety Resources</Title>
        <Text style={styles.subtitle}>
          Based on your risk assessment, here are important resources and safety information
        </Text>
      </Surface>

      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Emergency Contacts</Title>
          {EMERGENCY_CONTACTS.map((contact, index) => (
            <List.Item
              key={index}
              title={contact.name}
              description={contact.description}
              right={() => (
                <Button
                  mode="contained"
                  onPress={() => handleCall(contact.number)}
                  style={styles.callButton}
                >
                  {contact.number}
                </Button>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Support Organizations</Title>
          {SUPPORT_ORGANIZATIONS.map((org, index) => (
            <View key={index}>
              <List.Item
                title={org.name}
                description={org.services}
                right={() => (
                  <Button
                    mode="contained"
                    onPress={() => handleCall(org.contact)}
                    style={styles.callButton}
                  >
                    Call
                  </Button>
                )}
              />
              <Button
                mode="outlined"
                onPress={() => handleWebsite(org.website)}
                style={styles.websiteButton}
              >
                Visit Website
              </Button>
              {index < SUPPORT_ORGANIZATIONS.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Safety Tips</Title>
          {SAFETY_TIPS.map((tip, index) => (
            <List.Item
              key={index}
              title={tip}
              left={() => <List.Icon icon="shield-check" />}
            />
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={navigateToSafetyAssistant}
        style={styles.assistantButton}
        icon="chat"
      >
        Talk to Safety Assistant
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  callButton: {
    marginLeft: 8,
  },
  websiteButton: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  assistantButton: {
    margin: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
  },
}); 