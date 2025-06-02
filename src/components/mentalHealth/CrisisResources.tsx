import React from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, List } from 'react-native-paper';

type CrisisResource = {
  title: string;
  number: string;
  description: string;
  availability: string;
  whatsapp?: string;
};

const emergencyResources: CrisisResource[] = [
  {
    title: 'GBV Command Centre',
    number: '0800 428 428',
    description: "Department of Social Development's 24/7 GBV Command Centre. Professional counselors available.",
    availability: '24/7 Service',
    whatsapp: '0817 9937 28'
  },
  {
    title: 'SAPS Emergency',
    number: '10111',
    description: 'South African Police Service emergency response line.',
    availability: '24/7 Emergency Service'
  },
  {
    title: 'Ambulance',
    number: '10177',
    description: 'Emergency medical services.',
    availability: '24/7 Emergency Service'
  }
];

const supportResources: CrisisResource[] = [
  {
    title: 'People Opposing Women Abuse (POWA)',
    number: '011 642 4345',
    description: 'Counseling, legal support, and shelter services for women experiencing abuse.',
    availability: 'Mon-Fri: 8:30-16:30',
    whatsapp: '0817 9937 28'
  },
  {
    title: 'Lifeline',
    number: '0861 322 322',
    description: 'Crisis intervention, trauma counseling, and HIV counseling.',
    availability: '24/7 Service'
  },
  {
    title: 'TEARS Foundation',
    number: '*134*7355#',
    description: 'Support for survivors of rape and sexual abuse. Free USSD service.',
    availability: '24/7 Service',
    whatsapp: '010 590 5920'
  },
  {
    title: 'Childline South Africa',
    number: '0800 055 555',
    description: 'Crisis line for children and young people dealing with abuse.',
    availability: '24/7 Service'
  },
  {
    title: 'FAMSA',
    number: '011 975 7106',
    description: 'Family and relationship counseling services.',
    availability: 'Mon-Fri: 8:00-16:00'
  }
];

const CrisisResources: React.FC = () => {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/[^0-9+]/g, '')}`);
  };

  const handleWhatsApp = (number: string) => {
    Linking.openURL(`whatsapp://send?phone=27${number.replace(/[^0-9]/g, '')}`);
  };

  const renderResource = (resource: CrisisResource) => (
    <Card style={styles.resourceCard} key={resource.title}>
      <Card.Content>
        <Title style={styles.resourceTitle}>{resource.title}</Title>
        <Paragraph style={styles.availability}>{resource.availability}</Paragraph>
        <Paragraph style={styles.description}>{resource.description}</Paragraph>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleCall(resource.number)}
            style={[styles.button, styles.callButton]}
          >
            Call {resource.number}
          </Button>
          {resource.whatsapp && (
            <Button
              mode="contained"
              onPress={() => handleWhatsApp(resource.whatsapp!)}
              style={[styles.button, styles.whatsappButton]}
            >
              WhatsApp
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.emergencyCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Emergency Help</Title>
          <Paragraph style={styles.emergencyText}>
            If you are in immediate danger, call the police or emergency services immediately.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => handleCall('10111')}
            style={styles.emergencyButton}
          >
            Call Police (10111)
          </Button>
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Emergency Resources</Title>
      {emergencyResources.map(renderResource)}

      <Title style={styles.sectionTitle}>Support Services</Title>
      {supportResources.map(renderResource)}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>Safety Tips</Title>
          <List.Item
            title="Have an Emergency Plan"
            description="Keep important documents, some money, and clothes ready in case you need to leave quickly."
            left={props => <List.Icon {...props} icon="shield" />}
          />
          <List.Item
            title="Safe Location"
            description="Know a safe place you can go to in an emergency (police station, friend's house, shelter)."
            left={props => <List.Icon {...props} icon="home" />}
          />
          <List.Item
            title="Trust Your Instincts"
            description="If you feel you are in danger, seek help immediately."
            left={props => <List.Icon {...props} icon="alert" />}
          />
          <List.Item
            title="Save Emergency Numbers"
            description="Keep important numbers easily accessible or memorized."
            left={props => <List.Icon {...props} icon="phone" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  emergencyCard: {
    backgroundColor: '#ffebee',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#d32f2f',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  resourceCard: {
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  availability: {
    color: '#666',
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
  callButton: {
    backgroundColor: '#2196F3',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  infoCard: {
    marginTop: 20,
    marginBottom: 20,
  },
});

export default CrisisResources; 