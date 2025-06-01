import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider } from 'react-native-paper';

const legalSteps = [
  {
    title: 'Understanding Your Rights',
    content: 'Every person has the right to live free from violence. You have the right to seek protection, justice, and support services.',
    actions: ['Learn about protective orders', 'Document incidents', 'Know emergency contacts'],
  },
  {
    title: 'Immediate Safety',
    content: 'Your immediate safety is the top priority. There are resources and people ready to help you.',
    actions: ['Contact emergency services', 'Reach out to trusted support', 'Find safe accommodation'],
  },
  {
    title: 'Legal Options',
    content: 'You have several legal options available, including both civil and criminal proceedings.',
    actions: ['File a police report', 'Apply for protection order', 'Seek legal representation'],
  },
  {
    title: 'Support Services',
    content: 'Various organizations provide free and confidential support services to survivors.',
    actions: ['Contact support hotlines', 'Find local advocacy groups', 'Access counseling services'],
  },
];

export default function LegalGuidanceScreen() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.introCard}>
        <Card.Content>
          <Title>Your Legal Rights Guide</Title>
          <Paragraph>
            This guide will help you understand your legal rights and options. All information is kept private and you can access it offline.
          </Paragraph>
        </Card.Content>
      </Card>

      {legalSteps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <List.Accordion
            title={step.title}
            expanded={expandedStep === index}
            onPress={() => setExpandedStep(expandedStep === index ? null : index)}
            style={styles.accordion}
          >
            <Card style={styles.stepCard}>
              <Card.Content>
                <Paragraph>{step.content}</Paragraph>
                <Divider style={styles.divider} />
                <Title style={styles.actionsTitle}>Recommended Actions:</Title>
                {step.actions.map((action, actionIndex) => (
                  <List.Item
                    key={actionIndex}
                    title={action}
                    left={props => <List.Icon {...props} icon="chevron-right" />}
                  />
                ))}
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={styles.button}
                >
                  Learn More
                </Button>
              </Card.Content>
            </Card>
          </List.Accordion>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  introCard: {
    margin: 16,
    elevation: 4,
  },
  stepContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  accordion: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  stepCard: {
    marginTop: 1,
  },
  divider: {
    marginVertical: 16,
  },
  actionsTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
}); 